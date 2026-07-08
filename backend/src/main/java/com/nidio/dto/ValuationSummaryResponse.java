package com.nidio.dto;

import com.nidio.model.OperationType;
import com.nidio.model.PropertyType;
import com.nidio.model.ValuationResult;

import java.math.BigDecimal;
import java.time.Instant;

public record ValuationSummaryResponse(
        Long id,
        OperationType operationType,
        PropertyType propertyType,
        String neighborhoodName,
        BigDecimal surfaceM2,
        Integer rooms,
        BigDecimal declaredPrice,
        BigDecimal estimatedMin,
        BigDecimal estimatedMax,
        ValuationResult result,
        Instant createdAt
) {
}
