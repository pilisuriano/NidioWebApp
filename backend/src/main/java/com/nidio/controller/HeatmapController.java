package com.nidio.controller;

import com.nidio.dto.GeoJsonFeatureCollection;
import com.nidio.dto.NeighborhoodPriceProperties;
import com.nidio.dto.NoiseZoneProperties;
import com.nidio.dto.SecurityZoneProperties;
import com.nidio.model.OperationType;
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
    public GeoJsonFeatureCollection<NeighborhoodPriceProperties> price(@RequestParam OperationType operationType) {
        return heatmapService.getPriceHeatmap(operationType);
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
