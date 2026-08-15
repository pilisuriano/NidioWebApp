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
    // "Mis lugares": lugares personales del usuario con su distancia y score
    // individual. Lista vacía si no tiene ninguno cargado (ver CustomPlaceController).
    private List<CustomPlaceScoreDto> customPlaces;
    // Explicación en una o dos oraciones de por qué dio ese puntaje (qué
    // categorías más ayudaron/bajaron, y si se usaron lugares personales) —
    // ver LifeScoreService.buildExplanation. Deliberadamente texto, no un
    // desglose numérico tipo SHAP: acá el cálculo es una fórmula transparente
    // (promedio ponderado), no un modelo opaco, así que no hace falta una
    // técnica de atribución aproximada — alcanza con explicar la cuenta ya
    // exacta en palabras simples.
    private String explanation;
}
