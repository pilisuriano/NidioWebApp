package com.nidio.controller;

import com.nidio.dto.UsageResponse;
import com.nidio.service.UsageQuotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Cuántos usos gratis de Tasación y del Recomendador le quedan este mes al usuario
 * logueado (para mostrarlo en pantalla). Requiere sesión (anyRequest().authenticated()).
 */
@RestController
@RequestMapping("/api/usage")
@RequiredArgsConstructor
public class UsageController {

    private final UsageQuotaService usageQuotaService;

    @GetMapping
    public UsageResponse get(Authentication authentication) {
        return usageQuotaService.getUsage(authentication.getName());
    }
}
