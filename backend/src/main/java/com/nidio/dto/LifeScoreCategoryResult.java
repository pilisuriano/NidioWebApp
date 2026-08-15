package com.nidio.dto;

import com.nidio.model.POICategory;

import java.util.List;

public record LifeScoreCategoryResult(
        POICategory category, int weight, int poiCount, List<PoiDto> pois,
        // Score 0-100 de esta categoría sola (densidad de POIs encontrados
        // respecto de lo esperado en una zona bien servida -- ver
        // ml-service/src/geo/life_score.py). Se usa para armar la explicación
        // en texto del puntaje total (LifeScoreService.buildExplanation), no
        // se muestra como número crudo en el frontend.
        int score
) {
}
