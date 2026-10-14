package com.nidio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Precio de referencia por comuna (IDECBA). Solo se usa para completar el mapa de precios en los
 * barrios que IDECBA no publica por separado; no reemplaza el dato propio del barrio.
 */
@Entity
@Table(name = "comuna_price_m2")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComunaPriceM2 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer comuna;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 20)
    private OperationType operationType;

    @Column(nullable = false)
    private Integer rooms;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PriceCondition condition;

    @Column(name = "avg_price_m2", nullable = false)
    private BigDecimal avgPriceM2;

    @Column(nullable = false)
    private LocalDate period;
}
