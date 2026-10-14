package com.nidio.dto;

import java.math.BigDecimal;

// Barrio que no tiene dato de precio propio en IDECBA para el segmento pedido
// (ver HeatmapService#getPriceHeatmapNoData). Si su comuna sí tiene dato, viene
// en avgPriceM2/period (valor de la comuna); si no, ambos son null y el barrio
// se dibuja en gris.
public record NeighborhoodNoPriceProperties(
        Long neighborhoodId, String neighborhoodName, Integer comuna, BigDecimal avgPriceM2, String period
) {
}
