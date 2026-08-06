package com.nidio.dto;

import com.nidio.model.ValuationResult;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@AllArgsConstructor
public class ValuationResponse {

    private Long id;
    private BigDecimal estimatedMin;
    private BigDecimal estimatedMax;
    private ValuationResult result;
    private Instant createdAt;
    private String explanationText;
}
