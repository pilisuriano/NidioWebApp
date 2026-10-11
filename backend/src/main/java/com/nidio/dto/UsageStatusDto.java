package com.nidio.dto;

import com.nidio.model.QuotaFeature;

import java.time.Instant;

/**
 * Estado de la cuota de una función para el usuario logueado.
 * Si unlimited es true (cuenta admin), limit y remaining vienen en null.
 * source dice de dónde sale el cupo: "FREE" (cuota gratis del mes calendario), "PASS"
 * (Pase de análisis), "PLAN" (plan profesional) o "ADMIN". resetsAt es cuándo se renueva o
 * vence: el primer instante del mes siguiente (hora de Argentina) o el vencimiento del
 * pase / plan. periodStart es desde cuándo se cuentan los usos. extraUses son los usos
 * que sumaron los packs de +10 vigentes (ya están incluidos en limit).
 */
public record UsageStatusDto(
        QuotaFeature feature,
        long used,
        Integer limit,
        Integer remaining,
        boolean unlimited,
        Instant resetsAt,
        String source,
        Instant periodStart,
        int extraUses
) {
}
