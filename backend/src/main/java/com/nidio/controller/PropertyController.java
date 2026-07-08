package com.nidio.controller;

import com.nidio.dto.PagedResponse;
import com.nidio.dto.PropertyDetailResponse;
import com.nidio.dto.PropertySummaryResponse;
import com.nidio.model.OperationType;
import com.nidio.model.PropertyType;
import com.nidio.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    public PagedResponse<PropertySummaryResponse> list(
            @RequestParam(required = false) PropertyType propertyType,
            @RequestParam(required = false) Long neighborhood,
            @RequestParam(required = false) OperationType operationType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return propertyService.listProperties(propertyType, neighborhood, operationType, minPrice, maxPrice, page, size);
    }

    @GetMapping("/{id}")
    public PropertyDetailResponse get(@PathVariable Long id) {
        return propertyService.getProperty(id);
    }

    @GetMapping("/nearby")
    public PagedResponse<PropertySummaryResponse> nearby(
            @RequestParam String address,
            @RequestParam(defaultValue = "2") double radiusKm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return propertyService.nearby(address, radiusKm, page, size);
    }
}
