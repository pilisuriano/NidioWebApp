package com.nidio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.locationtech.jts.geom.Polygon;

// Límite de toda CABA (una sola fila): ver V28__add_city_boundary.sql y
// ml-service/scripts/generate_caba_perimeter.py, que carga el polígono real
// (dataset "Perímetro" de Buenos Aires Data) en vez de calcularse en el
// momento uniendo los barrios.
@Entity
@Table(name = "city_boundary")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CityBoundary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "geometry(Polygon,4326)")
    private Polygon boundary;
}
