package com.nidio.service;

import com.nidio.dto.GeoJsonFeature;
import com.nidio.dto.GeoJsonFeatureCollection;
import com.nidio.dto.NeighborhoodPriceProperties;
import com.nidio.dto.NoiseZoneProperties;
import com.nidio.dto.SecurityZoneProperties;
import com.nidio.model.NeighborhoodPriceM2;
import com.nidio.model.OperationType;
import com.nidio.model.PriceCondition;
import com.nidio.repository.NeighborhoodPriceM2Repository;
import com.nidio.repository.NoiseZoneRepository;
import com.nidio.repository.SecurityZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.BinaryOperator;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HeatmapService {

    private static final DateTimeFormatter PERIOD_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");

    private final NeighborhoodPriceM2Repository neighborhoodPriceM2Repository;
    private final NoiseZoneRepository noiseZoneRepository;
    private final SecurityZoneRepository securityZoneRepository;

    @Transactional(readOnly = true)
    public GeoJsonFeatureCollection<NeighborhoodPriceProperties> getPriceHeatmap(
            OperationType operationType, Integer rooms, PriceCondition condition) {
        // Último período disponible por barrio, para el segmento elegido
        // (ambientes + usado/a estrenar) (HU-08, HU-09).
        Map<Long, NeighborhoodPriceM2> latestByNeighborhood = neighborhoodPriceM2Repository
                .findByOperationTypeAndRoomsAndCondition(operationType, rooms, condition).stream()
                .collect(Collectors.toMap(
                        p -> p.getNeighborhood().getId(),
                        p -> p,
                        BinaryOperator.maxBy(Comparator.comparing(NeighborhoodPriceM2::getPeriod))));

        List<GeoJsonFeature<NeighborhoodPriceProperties>> features = latestByNeighborhood.values().stream()
                .sorted(Comparator.comparing(p -> p.getNeighborhood().getId()))
                .map(p -> new GeoJsonFeature<>(
                        GeoJsonMapper.toGeometry(p.getNeighborhood().getBoundary()),
                        new NeighborhoodPriceProperties(
                                p.getNeighborhood().getId(),
                                p.getNeighborhood().getName(),
                                p.getAvgPriceM2(),
                                PERIOD_FORMAT.format(p.getPeriod()))))
                .toList();

        return new GeoJsonFeatureCollection<>(features);
    }

    @Transactional(readOnly = true)
    public GeoJsonFeatureCollection<NoiseZoneProperties> getNoiseHeatmap() {
        return new GeoJsonFeatureCollection<>(noiseZoneRepository.findAll().stream()
                .map(z -> new GeoJsonFeature<>(
                        GeoJsonMapper.toGeometry(z.getArea()),
                        new NoiseZoneProperties(
                                z.getId(),
                                z.getNoiseLevel(),
                                z.getNeighborhood() != null ? z.getNeighborhood().getName() : null)))
                .toList());
    }

    @Transactional(readOnly = true)
    public GeoJsonFeatureCollection<SecurityZoneProperties> getSecurityHeatmap() {
        return new GeoJsonFeatureCollection<>(securityZoneRepository.findAll().stream()
                .map(z -> new GeoJsonFeature<>(
                        GeoJsonMapper.toGeometry(z.getArea()),
                        new SecurityZoneProperties(
                                z.getId(),
                                z.getCrimeCount(),
                                z.getSecurityIndex(),
                                z.getNeighborhood() != null ? z.getNeighborhood().getName() : null)))
                .toList());
    }
}
