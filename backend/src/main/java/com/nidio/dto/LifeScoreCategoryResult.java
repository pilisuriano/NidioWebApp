package com.nidio.dto;

import com.nidio.model.POICategory;

import java.util.List;

public record LifeScoreCategoryResult(
        POICategory category, int weight, int poiCount, List<PoiDto> pois
) {
}
