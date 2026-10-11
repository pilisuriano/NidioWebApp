package com.nidio.dto;

import java.math.BigDecimal;
import java.time.Instant;

// Un pago de la pasarela simulada (status: PENDING, APPROVED o REJECTED).
public record PaymentDto(
        Long id,
        String itemCode,
        String description,
        BigDecimal amountUsd,
        String status,
        Long propertyId,
        Instant featuredStartsAt,
        Instant createdAt,
        Instant resolvedAt
) {
}
