package com.nidio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Puntaje (0-100) de una categoría de Life Score para una propiedad. Se usa en
 * el recomendador; no reemplaza a {@code property.life_score}. Ver
 * V36__property_life_score_category.sql.
 */
@Entity
@Table(name = "property_life_score_category")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyLifeScoreCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private POICategory category;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "poi_count", nullable = false)
    private Integer poiCount;

    @Column(name = "datasets_version", nullable = false, length = 40)
    private String datasetsVersion;

    @Column(name = "computed_at", nullable = false)
    private LocalDateTime computedAt;
}
