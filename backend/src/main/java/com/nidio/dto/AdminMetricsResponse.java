package com.nidio.dto;

public record AdminMetricsResponse(
        long totalUsers,
        long verifiedUsers,
        long activeUsers,
        long adminUsers,
        long totalProperties,
        long totalValuations,
        long totalLifeScoreQueries
) {
}
