package com.nidio.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Hasta 3 propiedades recomendadas. {@code broadened} indica que se relajó el
 * umbral de la pregunta de descarte porque quedaban muy pocas propiedades;
 * {@code message} es el aviso para mostrar al usuario (null si no hay nada que avisar).
 */
public record RecommendationResponse(List<RecommendationItem> items, boolean broadened, String message,
                                     List<FunnelStep> funnel, int totalMatches, boolean moreUnlocked) {

    /**
     * Cuántas propiedades quedaban después de cada filtro, en orden: CATALOG (publicadas), TYPE, BUDGET,
     * EXPENSES (solo si se pidió tope de expensas), ROOMS, PRICE (sin las muy por encima del precio estimado, solo si se pidió) y DEALBREAKER (después
     * de dejar de lado las zonas que la persona descartaría). La pantalla lo usa para explicar cómo se llegó al resultado.
     * {@code totalMatches} es cuántas propiedades encajan en total (se muestren o no); {@code moreUnlocked} dice si la
     * cuenta tiene pase o plan vigente y por eso {@code items} trae hasta 10 en vez de 3 (el límite lo decide el
     * backend; las primeras 3 son siempre las mismas).
     */
    public record FunnelStep(String code, int remaining) {
    }


    /**
     * @param matchScore  0-100, para pruebas y validación; la pantalla NO lo muestra (decisión de
     *                    diseño: explicación en lenguaje llano, sin números).
     * @param priceStatus IN_RANGE, BELOW, ABOVE o UNKNOWN respecto del rango estimado por Nidio.
     * @param reasons     hasta 3 razones breves, en minúscula, para armar la explicación.
     * @param tradeoff    el punto débil más relevante, o null si no hay ninguno.
     * @param explanation texto completo: "Te la recomendamos porque ... A cambio, ...".
     * @param workDistanceKm distancia en línea recta, en km (2 decimales), entre la propiedad y la
     *                    dirección de trabajo o estudio; null si no se pidió o la propiedad no tiene coordenadas.
     * @param expensesUsd expensas mensuales en USD (misma unidad que Property.expensesUsd; la pantalla las pasa a
     *                    pesos con el dólar blue); null si no están cargadas (casa, PH o dato desconocido).
     */
    public record RecommendationItem(
            PropertySummaryResponse property,
            int matchScore,
            String priceStatus,
            List<String> reasons,
            String tradeoff,
            String explanation,
            Double workDistanceKm,
            BigDecimal expensesUsd
    ) {
    }
}
