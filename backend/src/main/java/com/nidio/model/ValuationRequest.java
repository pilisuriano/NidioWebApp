package com.nidio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "valuation_request")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValuationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 20)
    private OperationType operationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", nullable = false, length = 20)
    private PropertyType propertyType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "neighborhood_id", nullable = false)
    private Neighborhood neighborhood;

    @Column(name = "surface_m2", nullable = false)
    private BigDecimal surfaceM2;

    @Column(nullable = false)
    private Integer rooms;

    @Column(name = "declared_price")
    private BigDecimal declaredPrice;

    @Column(name = "estimated_min", nullable = false)
    private BigDecimal estimatedMin;

    @Column(name = "estimated_max", nullable = false)
    private BigDecimal estimatedMax;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ValuationResult result;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
