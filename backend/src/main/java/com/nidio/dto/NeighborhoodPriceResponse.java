package com.nidio.dto;

import java.math.BigDecimal;

public record NeighborhoodPriceResponse(
        Long neighborhoodId, String neighborhoodName, BigDecimal avgPriceM2, String period
) {
}
