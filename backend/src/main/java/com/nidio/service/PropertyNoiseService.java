package com.nidio.service;

import com.nidio.model.Property;
import com.nidio.model.PropertyNoise;
import com.nidio.repository.PropertyNoiseRepository;
import com.nidio.repository.PropertyRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Calcula y guarda el ruido (día y noche) de una propiedad consultando a
 * ml-service. Igual que {@link PropertyLifeScoreService}: si ml-service no
 * responde NO falla la operación que lo llamó (publicar / editar); la propiedad
 * queda sin ruido y el relleno ({@link PropertyNoiseBackfillRunner}) lo calcula
 * después. Si ml-service responde pero la ubicación no tiene dato, se guarda la
 * fila con los períodos en null ("sin dato").
 */
@Slf4j
@Service
public class PropertyNoiseService {

    private final MlServiceClient mlServiceClient;
    private final PropertyNoiseRepository repository;
    private final PropertyRepository propertyRepository;
    private final String datasetsVersion;

    public PropertyNoiseService(
            MlServiceClient mlServiceClient,
            PropertyNoiseRepository repository,
            PropertyRepository propertyRepository,
            @Value("${app.noise.datasets-version:2026-10}") String datasetsVersion) {
        this.mlServiceClient = mlServiceClient;
        this.repository = repository;
        this.propertyRepository = propertyRepository;
        this.datasetsVersion = datasetsVersion;
    }

    public String getDatasetsVersion() {
        return datasetsVersion;
    }

    /** @return true si quedó guardado el ruido; false si ml-service no respondió (no se toca lo anterior). */
    @Transactional
    public boolean computeAndStore(Property property) {
        MlServiceClient.NoiseMlResponse response;
        try {
            response = mlServiceClient.noise(property.getLocation().getY(), property.getLocation().getX());
            if (response == null) {
                throw new IllegalStateException("respuesta vacía de ml-service");
            }
        } catch (RuntimeException e) {
            log.warn("No se pudo calcular el ruido de la propiedad {}: {}", property.getId(), e.getMessage());
            return false;
        }
        MlServiceClient.NoiseMlLevel day = response.day();
        MlServiceClient.NoiseMlLevel night = response.night();
        repository.deleteByPropertyId(property.getId());
        repository.flush();
        repository.save(PropertyNoise.builder()
                .propertyId(property.getId())
                .dayLevel(day != null ? day.level() : null)
                .dayDbLow(day != null ? day.dbLow() : null)
                .dayDbHigh(day != null ? day.dbHigh() : null)
                .daySrc(day != null ? day.source() : null)
                .nightLevel(night != null ? night.level() : null)
                .nightDbLow(night != null ? night.dbLow() : null)
                .nightDbHigh(night != null ? night.dbHigh() : null)
                .nightSrc(night != null ? night.source() : null)
                .datasetsVersion(datasetsVersion)
                .computedAt(LocalDateTime.now())
                .build());
        return true;
    }

    /** Variante por id, para el relleno. Devuelve false si no existe la propiedad o falla el cálculo. */
    @Transactional
    public boolean computeAndStoreById(Long propertyId) {
        return propertyRepository.findById(propertyId)
                .map(this::computeAndStore)
                .orElse(false);
    }
}
