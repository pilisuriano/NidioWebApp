package com.nidio.controller;

import com.nidio.dto.LifeScoreRequest;
import com.nidio.dto.LifeScoreResponse;
import com.nidio.dto.LifeScoreSummaryResponse;
import com.nidio.service.LifeScoreService;
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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LifeScoreResponse calculate(@Valid @RequestBody LifeScoreRequest request, Authentication authentication) {
        return lifeScoreService.calculateLifeScore(request, authentication.getName());
    }

    @GetMapping
    public List<LifeScoreSummaryResponse> list(Authentication authentication) {
        return lifeScoreService.listQueries(authentication.getName());
    }
}
