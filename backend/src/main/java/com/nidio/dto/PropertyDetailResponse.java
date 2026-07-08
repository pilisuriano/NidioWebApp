package com.nidio.dto;

import com.nidio.model.OperationType;
import com.nidio.model.PropertyType;

import java.math.BigDecimal;

public record PropertyDetailResponse(
        Long id,
        String title,
        PropertyType propertyType,
        OperationType operationType,
        NeighborhoodRef neighborhood,
        String address,
        LocationDto location,
        BigDecimal surfaceM2,
        Integer rooms,
        BigDecimal price,
        String imageUrl,
        ValuationRangeDto valuation,
        BigDecimal lifeScore
) {
}
