package com.nidio.dto;

import com.nidio.model.QuotaFeature;

import java.time.Instant;

/**
 * Estado de la cuota gratuita mensual de una función para el usuario logueado.
 * Si unlimited es true (cuenta admin), limit y remaining vienen en null.
 * resetsAt es el primer instante del mes siguiente (hora de Argentina).
 */
public record UsageStatusDto(
        QuotaFeature feature,
        long used,
        Integer limit,
        Integer remaining,
        boolean unlimited,
        Instant resetsAt
) {
}
