package com.nidio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

// Una suscripción contratada (pase de análisis, plan de dueño o plan profesional).
// Está vigente si no fue reemplazada por una mejor y todavía no venció.
@Entity
@Table(name = "subscription")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SubscriptionKind kind;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    // true cuando el usuario pasó a un plan superior: la anterior deja de contar.
    @Column(nullable = false)
    @Builder.Default
    private boolean replaced = false;

    @Column(name = "payment_id")
    private Long paymentId;
}
