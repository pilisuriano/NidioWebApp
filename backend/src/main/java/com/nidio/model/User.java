package com.nidio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "\"user\"")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String dni;

    private String phone;

    // Cuenta profesional (inmobiliaria, corredor/martillero, desarrollador):
    // accountType distingue el tipo de cuenta, el resto de los campos solo
    // se completan cuando accountType = PROFESSIONAL (ver "Crear cuenta
    // profesional" en el registro).
    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 20)
    @Builder.Default
    private AccountType accountType = AccountType.PERSONAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "professional_type", length = 20)
    private ProfessionalType professionalType;

    @Column(name = "business_name")
    private String businessName;

    @Enumerated(EnumType.STRING)
    @Column(name = "tax_condition", length = 30)
    private TaxCondition taxCondition;

    private String cuit;

    @Column(name = "mobile_phone")
    private String mobilePhone;

    // Logo de la cuenta profesional, mostrado junto al check de verificado
    // en el cartel "Publicado por" del detalle de propiedad (solo tiene
    // sentido para accountType = PROFESSIONAL, pero no se restringe a nivel
    // de columna).
    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    // Se manda un mail de verificación al registrarse (HU nueva) y el login
    // queda bloqueado hasta que se confirme. Los usuarios cargados antes de
    // este cambio quedan verificados por la migración V11.
    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    // Rol de la cuenta (panel de administración) y baja lógica: un admin
    // puede desactivar una cuenta sin borrarla (active=false bloquea el login).
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
