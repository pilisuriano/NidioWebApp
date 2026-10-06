package com.nidio.controller;

import com.nidio.dto.BudgetRangeDto;
import com.nidio.dto.RecommendationRequest;
import com.nidio.dto.RecommendationResponse;
import com.nidio.model.OperationType;
import com.nidio.service.RecommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

/**
 * "Recomendador con Nidi". Requiere sesión (cae en anyRequest().authenticated() de SecurityConfig).
 * No guarda las respuestas del usuario. La cuota gratuita mensual del modelo de negocio todavía
 * no está implementada en el backend, por lo que no se controla acá.
 */
@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostMapping
    public RecommendationResponse recommend(@Valid @RequestBody RecommendationRequest request) {
        return recommendationService.recommend(request);
    }

    @GetMapping("/budget-prices")
    public List<BigDecimal> budgetPrices(@RequestParam OperationType operationType) {
        return recommendationService.budgetPrices(operationType);
    }

    @GetMapping("/budget-ranges")
    public List<BudgetRangeDto> budgetRanges(@RequestParam OperationType operationType) {
        return recommendationService.budgetRanges(operationType);
    }
}
