package com.nidio.service;

import com.nidio.dto.AdminMetricsResponse;
import com.nidio.dto.AdminUserResponse;
import com.nidio.dto.PagedResponse;
import com.nidio.exception.AdminOperationException;
import com.nidio.exception.ResourceNotFoundException;
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

    @Transactional(readOnly = true)
    public PagedResponse<AdminUserResponse> listUsers(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> result = (query == null || query.isBlank())
                ? userRepository.findAll(pageable)
                : userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query, pageable);
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
                user.isEmailVerified(), user.isActive(), user.getCreatedAt());
    }
}
