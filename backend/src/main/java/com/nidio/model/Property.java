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

    // Expensas mensuales en USD (misma unidad que usa el modelo de
    // valuacion como feature, ver ml-service). NULL = dato desconocido O
    // propiedad sin consorcio (Casa/PH) -- NUNCA usar 0, ver bitacora del
    // modelo 6.40. Se muestra al usuario convertido a ARS en vivo (ver
    // PropertyDetail.jsx / useBlueRate), nunca en USD directo -- en
    // Argentina las expensas siempre se cotizan en pesos.
    // OJO: columna agregada en V24__extend_valuation_fields.sql.
    @Column(name = "expenses_usd")
    private BigDecimal expensesUsd;

    // Resto de las caracteristicas de V24 que el modelo usa como feature y
    // que ahora tambien se muestran en la ficha de detalle (PropertyDetail.jsx).
    // Todas nullable: el catalogo sintetico viejo y lo publicado a mano desde
    // "Publicar" (que todavia no tiene estos campos en su formulario, ver
    // CreatePropertyRequest/Publicar.jsx) pueden no traerlas -- el front
    // simplemente no muestra el item si viene null.
    //
    // String en vez de enum a proposito, para ser consistente con
    // ValuationCreateRequest.propertyCondition (mismo dato, en el flujo de
    // tasacion en vivo): valores validos por el CHECK de V24 -- 'NEW',
    // 'USED_GOOD_CONDITION', 'NEEDS_RENOVATION', 'NOT_SPECIFIED'.
    @Column(name = "property_condition", length = 30)
    private String propertyCondition;

    @Column(name = "has_pool")
    private Boolean hasPool;

    @Column(name = "has_garage")
    private Boolean hasGarage;

    @Column(name = "building_amenities")
    private Boolean buildingAmenities;

    @Column(name = "security_24h")
    private Boolean security24h;

    private Boolean bright;

    @Column(name = "apto_credito")
    private Boolean aptoCredito;

    // Amoblado: solo tiene sentido para alquiler (ver dataset de
    // entrenamiento) -- el front lo oculta para propiedades en venta aunque
    // el dato venga cargado, a pedido.
    private Boolean furnished;

    // valuation_explanation_text/json (V24) TODAVIA no estan mapeados aca --
    // son el texto/factores de la tasacion (TreeSHAP), un feature distinto
    // de las caracteristicas de arriba; wire-earlos cuando se necesiten
    // mostrar (ver Paso 2 de las 200 propiedades).

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
