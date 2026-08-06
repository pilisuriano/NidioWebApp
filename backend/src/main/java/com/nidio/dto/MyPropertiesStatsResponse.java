package com.nidio.dto;

import java.math.BigDecimal;

// Estadísticas de "Mis publicaciones" (ver PropertyService.getMyPropertiesStats).
// avgPriceSale/avgPriceRent van separados porque se manejan en monedas
// distintas por convención de la app (venta en USD, alquiler en ARS) — no
// tiene sentido promediarlos juntos. Pueden venir null si el dueño no tiene
// ninguna propiedad de ese tipo de operación publicada todavía.
public record MyPropertiesStatsResponse(
        long totalProperties,
        long activeCount,
        long inactiveCount,
        long saleCount,
        long rentCount,
        long totalFavorites,
        BigDecimal avgPriceSale,
        BigDecimal avgPriceRent
) {
}
