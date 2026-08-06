package com.nidio.dto;

import java.math.BigDecimal;

public record NoiseZoneProperties(Long id, BigDecimal noiseLevel, String neighborhoodName) {
}
