package com.nidio.dto;

import com.nidio.model.ValuationResult;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@AllArgsConstructor
public class ValuationResponse {

    private Long id;
    private BigDecimal estimatedMin;
    private BigDecimal estimatedMax;
    private ValuationResult result;
    private Instant createdAt;
    private String explanationText;
    // Factores con su valor numérico (para graficarlos). Solo viene al calcular una tasación nueva; las del
    // historial guardan únicamente el texto, así que acá llega null.
    private List<ExplanationFactorDto> explanation;
}
