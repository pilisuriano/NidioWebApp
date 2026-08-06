package com.nidio.controller;

import com.nidio.dto.ValuationCreateRequest;
import com.nidio.dto.ValuationResponse;
import com.nidio.dto.ValuationSummaryResponse;
import com.nidio.service.ValuationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/valuations")
@RequiredArgsConstructor
public class ValuationController {

    private final ValuationService valuationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ValuationResponse create(@Valid @RequestBody ValuationCreateRequest request, Authentication authentication) {
        return valuationService.createValuation(request, authentication.getName());
    }

    @GetMapping("/{id}")
    public ValuationResponse get(@PathVariable Long id, Authentication authentication) {
        return valuationService.getValuation(id, authentication.getName());
    }

    @GetMapping
    public List<ValuationSummaryResponse> list(Authentication authentication) {
        return valuationService.listValuations(authentication.getName());
    }
}
