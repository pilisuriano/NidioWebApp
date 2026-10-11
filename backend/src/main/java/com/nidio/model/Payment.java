package com.nidio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

// Pago de la pasarela SIMULADA. No guarda datos de tarjeta ni de ningún medio de pago:
// solo qué se compró, cuánto (en USD) y cómo lo resolvió el usuario.
@Entity
@Table(name = "payment")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // Código del BillingItem (por ejemplo "ANALYSIS_PASS").
    @Column(name = "item_code", nullable = false, length = 40)
    private String itemCode;

    @Column(nullable = false)
    private String description;

    @Column(name = "amount_usd", nullable = false)
    private BigDecimal amountUsd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    // Solo para destacados sueltos: la propiedad que se quiere destacar.
    @Column(name = "property_id")
    private Long propertyId;

    // Solo para destacados sueltos reservados: desde cuándo arranca (null = apenas se aprueba el pago).
    @Column(name = "featured_starts_at")
    private Instant featuredStartsAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;
}
