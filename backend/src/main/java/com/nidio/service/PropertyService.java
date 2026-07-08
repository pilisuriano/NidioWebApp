package com.nidio.service;

import com.nidio.dto.LocationDto;
import com.nidio.dto.NeighborhoodRef;
import com.nidio.dto.PagedResponse;
import com.nidio.dto.PropertyDetailResponse;
import com.nidio.dto.PropertySummaryResponse;
import com.nidio.dto.ValuationRangeDto;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.OperationType;
import com.nidio.model.Property;
import com.nidio.model.PropertyType;
import com.nidio.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final GeocodingService geocodingService;

    @Transactional(readOnly = true)
    public PagedResponse<PropertySummaryResponse> listProperties(
            PropertyType propertyType,
            Long neighborhoodId,
            OperationType operationType,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id"));
        Page<Property> result = propertyRepository.findByFilters(
                propertyType, neighborhoodId, operationType, minPrice, maxPrice, pageable);
        return toPagedResponse(result);
    }

    @Transactional(readOnly = true)
    public PropertyDetailResponse getProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la propiedad " + id));

        ValuationRangeDto valuation = null;
        if (property.getValuationRangeMin() != null && property.getValuationRangeMax() != null) {
            valuation = new ValuationRangeDto(property.getValuationRangeMin(), property.getValuationRangeMax());
        }

        return new PropertyDetailResponse(
                property.getId(),
                property.getTitle(),
                property.getPropertyType(),
                property.getOperationType(),
                new NeighborhoodRef(property.getNeighborhood().getId(), property.getNeighborhood().getName()),
                property.getAddress(),
                GeoJsonMapper.toLocation(property.getLocation()),
                property.getSurfaceM2(),
                property.getRooms(),
                property.getPrice(),
                property.getImageUrl(),
                valuation,
                property.getLifeScore());
    }

    @Transactional(readOnly = true)
    public PagedResponse<PropertySummaryResponse> nearby(String address, double radiusKm, int page, int size) {
        LocationDto location = geocodingService.geocode(address);
        Page<Property> result = propertyRepository.findWithinRadius(
                location.lat(), location.lon(), radiusKm * 1000, PageRequest.of(page, size));
        return toPagedResponse(result);
    }

    private PagedResponse<PropertySummaryResponse> toPagedResponse(Page<Property> result) {
        return new PagedResponse<>(
                result.getContent().stream().map(this::toSummary).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages());
    }

    private PropertySummaryResponse toSummary(Property property) {
        return new PropertySummaryResponse(
                property.getId(),
                property.getTitle(),
                property.getPropertyType(),
                property.getOperationType(),
                property.getNeighborhood().getName(),
                property.getPrice(),
                property.getSurfaceM2(),
                property.getRooms(),
                property.getImageUrl());
    }
}
