package com.nidio.service;

import com.nidio.dto.AdminMetricsResponse;
import com.nidio.dto.AdminUserResponse;
import com.nidio.dto.PagedResponse;
import com.nidio.exception.AdminOperationException;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.AccountType;
import com.nidio.model.Role;
import com.nidio.model.User;
import com.nidio.repository.LifeScoreQueryRepository;
import com.nidio.repository.PropertyRepository;
import com.nidio.repository.UserRepository;
import com.nidio.repository.ValuationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final ValuationRequestRepository valuationRequestRepository;
    private final LifeScoreQueryRepository lifeScoreQueryRepository;
    private final AuthService authService;

    // Campos de orden permitidos desde el panel admin (whitelist, mismo
    // criterio que PropertyService.ADMIN_SORT_FIELDS).
    private static final java.util.Map<String, String> ADMIN_USER_SORT_FIELDS = java.util.Map.of(
            "createdAt", "createdAt",
            "name", "name",
            "email", "email",
            "accountType", "accountType");

    @Transactional(readOnly = true)
    public PagedResponse<AdminUserResponse> listUsers(
            String query, AccountType accountType, String sortBy, String sortDir, int page, int size
    ) {
        String field = ADMIN_USER_SORT_FIELDS.getOrDefault(sortBy, "createdAt");
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, field));
        Page<User> result = userRepository.findAllForAdmin(query, accountType, pageable);
        return new PagedResponse<>(
                result.getContent().stream().map(this::toAdminUserResponse).toList(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Transactional
    public AdminUserResponse setActive(Long userId, boolean active, String actingAdminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (!active && user.getEmail().equalsIgnoreCase(actingAdminEmail)) {
            throw new AdminOperationException("No podés desactivar tu propia cuenta");
        }

        user.setActive(active);
        user = userRepository.save(user);
        return toAdminUserResponse(user);
    }

    @Transactional
    public AdminUserResponse setRole(Long userId, String roleValue, String actingAdminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Role role = Role.valueOf(roleValue);

        if (role != Role.ADMIN && user.getEmail().equalsIgnoreCase(actingAdminEmail)) {
            throw new AdminOperationException("No podés quitarte tu propio rol de administrador");
        }

        user.setRole(role);
        user = userRepository.save(user);
        return toAdminUserResponse(user);
    }

    // Reenvío manual del mail de verificación (HU nueva: por si el envío
    // original falló, ej. mientras estuvo mal configurado MAIL_PASSWORD, el
    // admin puede volver a dispararlo sin que el usuario tenga que pedirlo
    // de nuevo desde afuera).
    @Transactional
    public void resendVerification(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (user.isEmailVerified()) {
            throw new AdminOperationException("Este usuario ya tiene el email verificado");
        }

        authService.resendVerificationForUser(user);
    }

    @Transactional(readOnly = true)
    public AdminMetricsResponse metrics() {
        return new AdminMetricsResponse(
                userRepository.count(),
                userRepository.countByEmailVerifiedTrue(),
                userRepository.countByActiveTrue(),
                userRepository.countByRole(Role.ADMIN),
                propertyRepository.count(),
                valuationRequestRepository.count(),
                lifeScoreQueryRepository.count());
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        return new AdminUserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getRole().name(),
                user.isEmailVerified(), user.isActive(),
                user.getAccountType().name(),
                user.getProfessionalType() != null ? user.getProfessionalType().name() : null,
                user.getCreatedAt());
    }
}
