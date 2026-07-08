package com.nidio.dto;

import com.nidio.model.OperationType;
import com.nidio.model.PropertyType;

import java.math.BigDecimal;

public record PropertySummaryResponse(
        Long id,
        String title,
        PropertyType propertyType,
        OperationType operationType,
        String neighborhoodName,
        BigDecimal price,
        BigDecimal surfaceM2,
        Integer rooms,
        String imageUrl
) {
}
