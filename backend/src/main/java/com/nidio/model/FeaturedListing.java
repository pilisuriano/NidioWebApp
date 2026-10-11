package com.nidio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

// Un destacado activo (o vencido) de una propiedad: 7 días en las primeras posiciones,
// rotulado "Destacada". No altera la valuación ni el análisis de la propiedad.
@Entity
@Table(name = "featured_listing")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeaturedListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FeaturedSource source;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "ends_at", nullable = false)
    private Instant endsAt;

    // Pack del que salió el destacado (solo source = PACK) y pago (solo source = PAID).
    @Column(name = "addon_id")
    private Long addonId;

    @Column(name = "payment_id")
    private Long paymentId;
}
