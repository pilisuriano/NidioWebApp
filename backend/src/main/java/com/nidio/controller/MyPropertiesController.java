package com.nidio.controller;

import com.nidio.dto.CreatePropertyRequest;
import com.nidio.dto.MyPropertiesStatsResponse;
import com.nidio.dto.MyPropertyResponse;
import com.nidio.dto.PagedResponse;
import com.nidio.dto.PropertyDetailResponse;
import com.nidio.dto.UpdatePropertyActiveRequest;
import com.nidio.service.EntitlementService;
import com.nidio.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// "Mis publicaciones": requiere sesión (no está en permitAll de
// SecurityConfig, cae en anyRequest().authenticated()), igual que /publicar.
// A diferencia de /api/admin/properties (rol ADMIN, ve/edita todo), acá cada
// usuario solo ve y gestiona SUS propias propiedades — el ownership se
// resuelve siempre a partir de Authentication, nunca de un parámetro que
// pueda mandar el cliente.
@RestController
@RequestMapping("/api/my-properties")
@RequiredArgsConstructor
public class MyPropertiesController {

    private final PropertyService propertyService;
    private final EntitlementService entitlementService;

    @GetMapping
    public PagedResponse<MyPropertyResponse> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return propertyService.listMyProperties(authentication.getName(), query, active, featured, sortBy, sortDir, page, size);
    }

    @GetMapping("/stats")
    public MyPropertiesStatsResponse stats(Authentication authentication) {
        return propertyService.getMyPropertiesStats(authentication.getName());
    }

    // Datos de la propia publicación para precargar el formulario de edición.
    @GetMapping("/{id}")
    public PropertyDetailResponse get(@PathVariable Long id, Authentication authentication) {
        return propertyService.getMyProperty(id, authentication.getName());
    }

    // El dueño edita su publicación (datos, precio, fotos). Si cambia algo que usa
    // el modelo de tasación, el rango se recalcula; si ml-service no responde, falla (502).
    @PutMapping("/{id}")
    public PropertyDetailResponse update(
            @PathVariable Long id, @Valid @RequestBody CreatePropertyRequest request, Authentication authentication
    ) {
        return propertyService.updateMyProperty(id, authentication.getName(), request);
    }

    @PatchMapping("/{id}/active")
    public MyPropertyResponse setActive(
            @PathVariable Long id, @Valid @RequestBody UpdatePropertyActiveRequest request, Authentication authentication
    ) {
        if (request.isActive()) {
            // Reactivar una publicación pausada también cuenta contra el límite del plan.
            entitlementService.assertCanPublish(authentication.getName());
        }
        return propertyService.setMyPropertyActive(id, authentication.getName(), request.isActive());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Authentication authentication) {
        propertyService.deleteMyProperty(id, authentication.getName());
    }
}
