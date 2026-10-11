package com.nidio.controller;

import com.nidio.dto.PropertyEnvironmentResponse;
import com.nidio.service.PropertyEnvironmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Entorno (ruido día/noche y seguridad) de varias propiedades de una vez:
 * {@code GET /api/properties/environment?ids=1,2,3}. Público, como el resto del
 * catálogo (cubierto por el GET /api/properties/** de SecurityConfig). Se pide
 * aparte del listado para no cambiar los DTO existentes.
 */
@RestController
@RequestMapping("/api/properties/environment")
@RequiredArgsConstructor
public class PropertyEnvironmentController {

    private final PropertyEnvironmentService service;

    @GetMapping
    public List<PropertyEnvironmentResponse> environment(@RequestParam List<Long> ids) {
        return service.getEnvironment(ids);
    }
}
