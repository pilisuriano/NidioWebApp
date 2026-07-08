package com.nidio.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class LifeScoreResponse {

    private Long id;
    private BigDecimal totalScore;
    private LocationDto location;
    private List<LifeScoreCategoryResult> categories;
}
