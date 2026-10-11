package com.nidio.controller;

import com.nidio.dto.LifeScoreRequest;
import com.nidio.dto.LifeScoreResponse;
import com.nidio.dto.LifeScoreSummaryResponse;
import com.nidio.model.QuotaFeature;
import com.nidio.service.LifeScoreService;
import com.nidio.service.UsageQuotaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/life-score")
@RequiredArgsConstructor
public class LifeScoreController {

    private final LifeScoreService lifeScoreService;
    private final UsageQuotaService usageQuotaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LifeScoreResponse calculate(@Valid @RequestBody LifeScoreRequest request, Authentication authentication) {
        // Cuota de uso (gratis del mes, pase o plan): se chequea antes y se registra solo si el cálculo salió bien.
        usageQuotaService.checkAvailable(authentication.getName(), QuotaFeature.LIFE_SCORE);
        LifeScoreResponse response = lifeScoreService.calculateLifeScore(request, authentication.getName());
        usageQuotaService.register(authentication.getName(), QuotaFeature.LIFE_SCORE);
        return response;
    }

    @GetMapping
    public List<LifeScoreSummaryResponse> list(Authentication authentication) {
        return lifeScoreService.listQueries(authentication.getName());
    }
}
