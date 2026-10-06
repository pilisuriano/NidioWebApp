package com.nidio.service;

import com.nidio.model.POICategory;
import com.nidio.model.Property;
import com.nidio.model.PropertyLifeScoreCategory;
import com.nidio.repository.PropertyLifeScoreCategoryRepository;
import com.nidio.repository.PropertyRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Calcula y guarda el puntaje de cada categoría de Life Score de una
 * propiedad, para el recomendador. Si ml-service no responde NO falla la
 * operación que lo llamó (publicar / editar): la propiedad queda sin puntajes
 * y no entra al recomendador hasta que el relleno
 * ({@link LifeScoreBackfillRunner}) los calcule.
 */
@Slf4j
@Service
public class PropertyLifeScoreService {

    private final MlServiceClient mlServiceClient;
    private final PropertyLifeScoreCategoryRepository repository;
    private final PropertyRepository propertyRepository;
    private final String datasetsVersion;

    public PropertyLifeScoreService(
            MlServiceClient mlServiceClient,
            PropertyLifeScoreCategoryRepository repository,
            PropertyRepository propertyRepository,
            @Value("${app.life-score.datasets-version:2026-10}") String datasetsVersion) {
        this.mlServiceClient = mlServiceClient;
        this.repository = repository;
        this.propertyRepository = propertyRepository;
        this.datasetsVersion = datasetsVersion;
    }

    /**
     * Reemplaza los puntajes de la propiedad por los recién calculados.
     *
     * @return true si quedaron guardados los 7 puntajes; false si ml-service no respondió
     *         o devolvió una respuesta incompleta (no se toca lo que ya hubiera guardado).
     */
    @Transactional
    public boolean computeAndStore(Property property) {
        List<PropertyLifeScoreCategory> rows;
        try {
            rows = compute(property);
        } catch (RuntimeException e) {
            log.warn("No se pudieron calcular los puntajes por categoría de la propiedad {}: {}",
                    property.getId(), e.getMessage());
            return false;
        }
        repository.deleteByPropertyId(property.getId());
        repository.flush();
        repository.saveAll(rows);
        return true;
    }

    /** Variante por id (computeAndStore), para el relleno. Devuelve false si no existe la propiedad o falla el cálculo. */
    @Transactional
    public boolean computeAndStoreById(Long propertyId) {
        return propertyRepository.findById(propertyId)
                .map(this::computeAndStore)
                .orElse(false);
    }

    private List<PropertyLifeScoreCategory> compute(Property property) {
        // El puntaje de cada categoría no depende de los pesos; se manda 1 en todas
        // porque ml-service exige el campo.
        Map<POICategory, Integer> weights = new EnumMap<>(POICategory.class);
        for (POICategory category : POICategory.values()) {
            weights.put(category, 1);
        }
        MlServiceClient.LifeScoreMlResponse response = mlServiceClient.lifeScore(
                new MlServiceClient.LifeScoreMlRequest(
                        property.getLocation().getY(), property.getLocation().getX(), weights));

        Map<POICategory, MlServiceClient.LifeScoreMlCategory> byCategory = new EnumMap<>(POICategory.class);
        for (MlServiceClient.LifeScoreMlCategory c : response.categories()) {
            byCategory.put(c.category(), c);
        }
        if (byCategory.size() != POICategory.values().length) {
            throw new IllegalStateException("ml-service devolvió " + byCategory.size() + " categorías de "
                    + POICategory.values().length);
        }
        LocalDateTime now = LocalDateTime.now();
        List<PropertyLifeScoreCategory> rows = new ArrayList<>();
        for (POICategory category : POICategory.values()) {
            MlServiceClient.LifeScoreMlCategory c = byCategory.get(category);
            rows.add(PropertyLifeScoreCategory.builder()
                    .propertyId(property.getId())
                    .category(category)
                    .score(Math.max(0, Math.min(100, c.score())))
                    .poiCount(Math.max(0, c.poiCount()))
                    .datasetsVersion(datasetsVersion)
                    .computedAt(now)
                    .build());
        }
        return rows;
    }
}
