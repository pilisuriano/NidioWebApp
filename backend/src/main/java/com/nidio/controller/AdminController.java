package com.nidio.controller;

import com.nidio.dto.AdminMetricsResponse;
import com.nidio.dto.AdminPropertyResponse;
import com.nidio.dto.AdminUserResponse;
import com.nidio.dto.CreatePropertyRequest;
import com.nidio.dto.PagedResponse;
import com.nidio.dto.PropertyDetailResponse;
import com.nidio.dto.UpdatePropertyActiveRequest;
import com.nidio.dto.UpdateUserActiveRequest;
import com.nidio.dto.UpdateUserRoleRequest;
import com.nidio.model.AccountType;
import com.nidio.model.OperationType;
import com.nidio.service.AdminService;
import com.nidio.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Protegido a nivel de ruta con hasRole("ADMIN") en SecurityConfig, no acá:
// mismo criterio que el resto de la app (autorización centralizada).
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final PropertyService propertyService;

    @GetMapping("/users")
    public PagedResponse<AdminUserResponse> listUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) AccountType accountType,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return adminService.listUsers(query, accountType, sortBy, sortDir, page, size);
    }

    @PatchMapping("/users/{id}/active")
    public AdminUserResponse setActive(
            @PathVariable Long id, @Valid @RequestBody UpdateUserActiveRequest request, Authentication authentication
    ) {
        return adminService.setActive(id, request.isActive(), authentication.getName());
    }

    @PatchMapping("/users/{id}/role")
    public AdminUserResponse setRole(
            @PathVariable Long id, @Valid @RequestBody UpdateUserRoleRequest request, Authentication authentication
    ) {
        return adminService.setRole(id, request.getRole(), authentication.getName());
    }

    @PostMapping("/users/{id}/resend-verification")
    public void resendVerification(@PathVariable Long id) {
        adminService.resendVerification(id);
    }

    @GetMapping("/metrics")
    public AdminMetricsResponse metrics() {
        return adminService.metrics();
    }

    // --- ABM de propiedades --------------------------------------------

    @GetMapping("/properties/{id}")
    public PropertyDetailResponse getProperty(@PathVariable Long id) {
        return propertyService.getPropertyForAdmin(id);
    }

    @GetMapping("/properties")
    public PagedResponse<AdminPropertyResponse> listProperties(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) OperationType operationType,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return propertyService.listPropertiesForAdmin(query, active, operationType, sortBy, sortDir, page, size);
    }

    @PatchMapping("/properties/{id}/active")
    public AdminPropertyResponse setPropertyActive(@PathVariable Long id, @Valid @RequestBody UpdatePropertyActiveRequest request) {
        return propertyService.setPropertyActive(id, request.isActive());
    }

    @PutMapping("/properties/{id}")
    public AdminPropertyResponse updateProperty(@PathVariable Long id, @Valid @RequestBody CreatePropertyRequest request) {
        return propertyService.updateProperty(id, request);
    }

    @DeleteMapping("/properties/{id}")
    public void deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
    }
}
