package com.nidio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "life_score_category_weight")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LifeScoreCategoryWeight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "life_score_query_id", nullable = false)
    private LifeScoreQuery lifeScoreQuery;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private POICategory category;

    @Column(nullable = false)
    private Integer weight;

    @Column(name = "poi_count", nullable = false)
    private Integer poiCount;
}
