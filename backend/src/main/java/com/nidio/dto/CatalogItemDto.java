package com.nidio.dto;

import java.math.BigDecimal;

// Un ítem del catálogo de planes y adicionales (precio en USD; los pesos se calculan en pantalla).
// audience: "PERSONAL", "PROFESSIONAL" o null si sirve para cualquier cuenta.
public record CatalogItemDto(
        String code,
        String name,
        String description,
        String category,
        BigDecimal priceUsd,
        int validityDays,
        String audience
) {
}
