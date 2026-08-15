package com.nidio.model;

import com.nidio.security.EncryptedStringConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

// Lugar personal agregado a mano por el usuario (ej. "casa de mis papás",
// "gimnasio") para sumarlo al cálculo del Life Score además de las 7
// categorías fijas de POIs (ver LifeScoreService.scoreCustomPlaces). No tiene
// relación con Neighborhood/Property: es un punto libre dentro de CABA.
//
// address/lat/lon se guardan CIFRADOS a nivel de aplicación (AES-256-GCM,
// ver EncryptedStringConverter) -- a diferencia de la dirección de una
// propiedad publicada (pública por diseño, no cifrada), esto es información
// personal del usuario (dónde vive, dónde trabaja, dónde vive su familia).
// Por eso lat/lon quedan como texto cifrado en vez de un `geometry(Point)`
// nativo de PostGIS: el cálculo de distancia ya se hace en Java
// (GeoUtils.haversineMeters dentro de LifeScoreService), nunca con una
// consulta espacial SQL contra esta tabla, así que no se pierde ninguna
// funcionalidad real al no tener un tipo espacial acá.
@Entity
@Table(name = "custom_place")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 120)
    private String label;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(nullable = false, columnDefinition = "text")
    private String address;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(nullable = false, columnDefinition = "text")
    private String lat;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(nullable = false, columnDefinition = "text")
    private String lon;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
