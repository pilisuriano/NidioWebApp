package com.nidio.controller;

import com.nidio.dto.PropertySummaryResponse;
import com.nidio.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

// "Mis favoritos": reemplaza a "Mis búsquedas" (que mostraba historial de
// valuaciones/Life Score). Requiere sesión — no está en permitAll de
// SecurityConfig, cae en anyRequest().authenticated().
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final PropertyService propertyService;

    @GetMapping
    public List<PropertySummaryResponse> list(Authentication authentication) {
        return propertyService.listFavorites(authentication.getName());
    }

    // IDs livianos: el frontend los pide una vez y los usa para pintar el
    // corazón lleno/vacío en cualquier tarjeta (mapa, listado, detalle) sin
    // tener que consultar de a una.
    @GetMapping("/ids")
    public Set<Long> ids(Authentication authentication) {
        return propertyService.listFavoriteIds(authentication.getName());
    }
}
