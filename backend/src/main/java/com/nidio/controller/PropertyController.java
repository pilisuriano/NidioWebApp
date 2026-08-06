package com.nidio.controller;

import com.nidio.dto.ContactPropertyRequest;
import com.nidio.dto.CreatePropertyRequest;
import com.nidio.dto.PagedResponse;
import com.nidio.dto.PropertyDetailResponse;
import com.nidio.dto.PropertySummaryResponse;
import com.nidio.model.OperationType;
import com.nidio.model.PropertyType;
import com.nidio.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    public PagedResponse<PropertySummaryResponse> list(
            @RequestParam(required = false) PropertyType propertyType,
            @RequestParam(required = false) Long neighborhood,
            @RequestParam(required = false) OperationType operationType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return propertyService.listProperties(propertyType, neighborhood, operationType, minPrice, maxPrice, page, size);
    }

    @GetMapping("/{id}")
    public PropertyDetailResponse get(@PathVariable Long id) {
        return propertyService.getProperty(id);
    }

    // HU "Publicar": requiere sesión (no está en la lista de permitAll de
    // SecurityConfig, así que cae en anyRequest().authenticated()).
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PropertyDetailResponse create(@Valid @RequestBody CreatePropertyRequest request, Authentication authentication) {
        return propertyService.createProperty(request, authentication.getName());
    }

    // Requiere sesión (no está en permitAll de SecurityConfig): así el mail
    // siempre trae un remitente real de la plataforma, no un formulario
    // anónimo abierto a spam.
    @PostMapping("/{id}/contact")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void contact(@PathVariable Long id, @Valid @RequestBody ContactPropertyRequest request, Authentication authentication) {
        propertyService.contactOwner(id, authentication.getName(), request.getMessage());
    }

    @GetMapping("/nearby")
    public PagedResponse<PropertySummaryResponse> nearby(
            @RequestParam String address,
            @RequestParam(defaultValue = "2") double radiusKm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return propertyService.nearby(address, radiusKm, page, size);
    }

    // "Mis favoritos": requiere sesión (no está en permitAll de
    // SecurityConfig, cae en anyRequest().authenticated()), igual que
    // /contact y el POST de creación.
    @PostMapping("/{id}/favorite")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addFavorite(@PathVariable Long id, Authentication authentication) {
        propertyService.addFavorite(id, authentication.getName());
    }

    @DeleteMapping("/{id}/favorite")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFavorite(@PathVariable Long id, Authentication authentication) {
        propertyService.removeFavorite(id, authentication.getName());
    }
}
