package com.nidio.controller;

import com.nidio.dto.BudgetRangeDto;
import com.nidio.dto.RecommendationRequest;
import com.nidio.dto.RecommendationResponse;
import com.nidio.model.OperationType;
import com.nidio.model.QuotaFeature;
import com.nidio.service.RecommendationService;
import com.nidio.service.UsageQuotaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
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
 * No guarda las respuestas del usuario. Cada recomendación descuenta un uso de la cuota
 * gratuita mensual del modelo de negocio (ver UsageQuotaService).
 */
@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UsageQuotaService usageQuotaService;

    @PostMapping
    public RecommendationResponse recommend(@Valid @RequestBody RecommendationRequest request, Authentication authentication) {
        usageQuotaService.checkAvailable(authentication.getName(), QuotaFeature.RECOMMENDATION);
        // El límite de resultados lo decide el backend según el pase o plan de la cuenta, nunca el pedido.
        boolean moreUnlocked = usageQuotaService.hasExtendedResults(authentication.getName());
        RecommendationResponse response = recommendationService.recommend(request, moreUnlocked);
        usageQuotaService.register(authentication.getName(), QuotaFeature.RECOMMENDATION);
        return response;
    }

    @GetMapping("/budget-prices")
    public List<BigDecimal> budgetPrices(@RequestParam OperationType operationType) {
        return recommendationService.budgetPrices(operationType);
    }

    @GetMapping("/budget-expenses")
    public List<BigDecimal> budgetExpenses(@RequestParam OperationType operationType) {
        return recommendationService.expensesValues(operationType);
    }

    @GetMapping("/budget-ranges")
    public List<BudgetRangeDto> budgetRanges(@RequestParam OperationType operationType) {
        return recommendationService.budgetRanges(operationType);
    }
}
