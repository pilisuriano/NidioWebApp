package com.nidio.dto;

import java.time.Instant;
import java.util.List;

/**
 * Todo lo de "Mi suscripción" en el perfil, en una sola respuesta (GET /api/billing/summary).
 * Los usos del mes por función vienen aparte en GET /api/usage.
 */
public record BillingSummaryDto(
        String accountType,
        boolean admin,
        List<SubscriptionItem> subscriptions,
        List<AddonItem> addons,
        Publications publications,
        Featured featured
) {

    public record SubscriptionItem(String kind, String name, Instant startsAt, Instant expiresAt) {
    }

    // quantity es lo que trajo el pack (+10 usos, +50 publicaciones, 5 destacados); cuántos destacados
    // quedan sin usar está en Featured.packRemaining.
    public record AddonItem(String type, String name, int quantity, Instant expiresAt) {
    }

    // limit en null = sin límite (admin).
    public record Publications(long active, Integer limit) {
    }

    public record Featured(
            int activeCount,
            int accountCap,
            int globalActive,
            int globalCap,
            int includedPerPeriod,
            int includedRemaining,
            boolean welcomeAvailable,
            int packRemaining,
            Instant nextSlotAt,
            List<FeaturedItem> active
    ) {
    }

    // startsAt en el futuro = destacado reservado que todavía no arrancó.
    public record FeaturedItem(Long propertyId, String title, String source, Instant startsAt, Instant endsAt) {
    }
}
