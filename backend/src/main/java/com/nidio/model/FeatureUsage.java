package com.nidio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

// Un uso exitoso de una función con cuota gratuita (tasación o recomendador).
// Se guarda uno por uso para poder contar cuántos lleva el usuario en el mes.
@Entity
@Table(name = "feature_usage")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeatureUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private QuotaFeature feature;

    @Column(name = "used_at", nullable = false, updatable = false)
    private Instant usedAt;

    @PrePersist
    void onCreate() {
        if (this.usedAt == null) {
            this.usedAt = Instant.now();
        }
    }
}
