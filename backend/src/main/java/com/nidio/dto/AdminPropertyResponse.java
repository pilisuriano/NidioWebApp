package com.nidio.dto;

import com.nidio.model.OperationType;
import com.nidio.model.PropertyType;
import com.nidio.model.PublisherType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminPropertyResponse(
        Long id,
        String title,
        PropertyType propertyType,
        OperationType operationType,
        String neighborhoodName,
        String address,
        BigDecimal price,
        BigDecimal surfaceM2,
        BigDecimal totalSurfaceM2,
        Integer rooms,
        Integer bathrooms,
        Integer ageYears,
        String orientation,
        List<String> imageUrls,
        String description,
        boolean active,
        String createdByName,
        PublisherType publisherType,
        Instant createdAt
) {
}
