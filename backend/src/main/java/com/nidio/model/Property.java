package com.nidio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.locationtech.jts.geom.Point;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "property")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", nullable = false, length = 20)
    private PropertyType propertyType;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 20)
    private OperationType operationType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "neighborhood_id", nullable = false)
    private Neighborhood neighborhood;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, columnDefinition = "geometry(Point,4326)")
    private Point location;

    // Superficie cubierta (la que ya existía). total_surface_m2 es opcional
    // y, cuando está cargada, es la superficie total (cubierta + no
    // cubierta: balcón, patio, etc.), como en el dataset de entrenamiento.
    @Column(name = "surface_m2", nullable = false)
    private BigDecimal surfaceM2;

    @Column(name = "total_surface_m2")
    private BigDecimal totalSurfaceM2;

    @Column(nullable = false)
    private Integer rooms;

    private Integer bathrooms;

    @Column(name = "age_years")
    private Integer ageYears;

    // Texto libre (Frente / Contrafrente / Interno / Lateral), igual que en
    // los portales de referencia.
    private String orientation;

    @Column(nullable = false)
    private BigDecimal price;

    // Varias fotos por propiedad (HU "Publicar"), guardadas en orden en la
    // tabla hija property_image. La primera es la foto de portada que se
    // usa en tarjetas/mapa (ver PropertySummaryResponse).
    @ElementCollection
    @CollectionTable(name = "property_image", joinColumns = @JoinColumn(name = "property_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "url", nullable = false)
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @Column(columnDefinition = "text")
    private String description;

    // Nullable: el catálogo sintético original no tiene dueño. Se completa
    // cuando la propiedad se crea desde el flujo de "Publicar".
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    // Cartel "Inmobiliaria" / "Dueño directo" en la ficha de detalle.
    @Enumerated(EnumType.STRING)
    @Column(name = "publisher_type", nullable = false, length = 20)
    @Builder.Default
    private PublisherType publisherType = PublisherType.OWNER;

    // Baja lógica (ABM de propiedades en el panel admin): una propiedad
    // inactiva no aparece en el catálogo público pero no se borra.
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    // true solo cuando fue un ADMIN quien la desactivó desde el panel (no
    // cuando el propio dueño la desactiva desde "Mis publicaciones"): eso
    // dispara el mail de aviso al dueño y bloquea que la reactive por su
    // cuenta — solo un admin puede reactivarla (ver
    // PropertyService.setPropertyActive / setMyPropertyActive).
    @Column(name = "deactivated_by_admin", nullable = false)
    @Builder.Default
    private boolean deactivatedByAdmin = false;

    @Column(name = "valuation_range_min")
    private BigDecimal valuationRangeMin;

    @Column(name = "valuation_range_max")
    private BigDecimal valuationRangeMax;

    @Column(name = "life_score")
    private BigDecimal lifeScore;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
