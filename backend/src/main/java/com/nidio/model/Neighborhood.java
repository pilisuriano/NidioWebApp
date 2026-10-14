package com.nidio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.locationtech.jts.geom.Polygon;

@Entity
@Table(name = "neighborhood")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Neighborhood {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, columnDefinition = "geometry(Polygon,4326)")
    private Polygon boundary;

    /** Comuna (1-15) a la que pertenece el barrio; se usa para completar el mapa de precios (V44). */
    private Integer comuna;
}
