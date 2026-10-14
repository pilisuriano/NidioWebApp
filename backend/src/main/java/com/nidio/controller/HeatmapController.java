package com.nidio.controller;

import com.nidio.dto.GeoJsonFeatureCollection;
import com.nidio.dto.NeighborhoodNoPriceProperties;
import com.nidio.dto.NeighborhoodPriceProperties;
import com.nidio.dto.NoiseZoneProperties;
import com.nidio.dto.SecurityZoneProperties;
import com.nidio.model.OperationType;
import com.nidio.model.PriceCondition;
import com.nidio.service.HeatmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/heatmaps")
@RequiredArgsConstructor
public class HeatmapController {

    private final HeatmapService heatmapService;

    @GetMapping("/price")
    public GeoJsonFeatureCollection<NeighborhoodPriceProperties> price(
            @RequestParam OperationType operationType,
            @RequestParam(defaultValue = "2") Integer rooms,
            @RequestParam(defaultValue = "USED") PriceCondition condition) {
        return heatmapService.getPriceHeatmap(operationType, rooms, condition);
    }

    // Barrios sin precio propio de IDECBA para ese segmento (se dibujan en gris).
    @GetMapping("/price/no-data")
    public GeoJsonFeatureCollection<NeighborhoodNoPriceProperties> priceNoData(
            @RequestParam OperationType operationType,
            @RequestParam(defaultValue = "2") Integer rooms,
            @RequestParam(defaultValue = "USED") PriceCondition condition) {
        return heatmapService.getPriceHeatmapNoData(operationType, rooms, condition);
    }

    @GetMapping("/noise")
    public GeoJsonFeatureCollection<NoiseZoneProperties> noise() {
        return heatmapService.getNoiseHeatmap();
    }

    @GetMapping("/security")
    public GeoJsonFeatureCollection<SecurityZoneProperties> security() {
        return heatmapService.getSecurityHeatmap();
    }
}
