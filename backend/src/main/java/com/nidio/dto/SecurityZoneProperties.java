package com.nidio.dto;

import java.math.BigDecimal;

public record SecurityZoneProperties(Long id, Integer crimeCount, BigDecimal securityIndex, String neighborhoodName) {
}
