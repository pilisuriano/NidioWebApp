package com.nidio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "neighborhood_price_m2")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NeighborhoodPriceM2 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "neighborhood_id", nullable = false)
    private Neighborhood neighborhood;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 20)
    private OperationType operationType;

    /** Cantidad de ambientes del segmento (1-3). IDECBA publica una serie real por cada uno. */
    @Column(nullable = false)
    private Integer rooms;

    /** Usado vs. a estrenar (IDECBA). Alquiler solo tiene serie "USED". */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PriceCondition condition;

    @Column(name = "avg_price_m2", nullable = false)
    private BigDecimal avgPriceM2;

    @Column(nullable = false)
    private LocalDate period;
}
