package com.nidio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

// Un adicional comprado (pack de usos, de publicaciones o de destacados).
// quantity es cuántas unidades trae; los adicionales vencen y no se acumulan.
@Entity
@Table(name = "addon")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Addon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AddonType type;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "purchased_at", nullable = false)
    private Instant purchasedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "payment_id")
    private Long paymentId;
}
