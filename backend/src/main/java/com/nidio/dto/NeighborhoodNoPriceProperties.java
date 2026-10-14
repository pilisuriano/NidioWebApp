package com.nidio.dto;

// Barrio que no tiene dato de precio propio en IDECBA para el segmento
// pedido (ver HeatmapService#getPriceHeatmapNoData).
public record NeighborhoodNoPriceProperties(Long neighborhoodId, String neighborhoodName) {
}
