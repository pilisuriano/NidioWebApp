package com.nidio.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record LifeScoreSummaryResponse(
        Long id,
        String address,
        BigDecimal totalScore,
        Instant createdAt
) {
}
