package com.nidio.controller;

import com.nidio.dto.GeoJsonGeometry;
import com.nidio.dto.NeighborhoodPriceResponse;
import com.nidio.dto.NeighborhoodRef;
import com.nidio.model.OperationType;
import com.nidio.service.NeighborhoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/neighborhoods")
@RequiredArgsConstructor
public class NeighborhoodController {

    private final NeighborhoodService neighborhoodService;

    @GetMapping
    public List<NeighborhoodRef> list() {
        return neighborhoodService.listNeighborhoods();
    }

    @GetMapping("/{id}/price")
    public NeighborhoodPriceResponse price(@PathVariable Long id, @RequestParam OperationType operationType) {
        return neighborhoodService.getPrice(id, operationType);
    }

    // Contorno de toda CABA (unión de los barrios), para dibujar el límite
    // de la ciudad en el mapa de Explorar propiedades.
    @GetMapping("/boundary")
    public GeoJsonGeometry boundary() {
        return neighborhoodService.getCabaBoundary();
    }
}
