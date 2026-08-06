package com.nidio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.locationtech.jts.geom.Polygon;

import java.math.BigDecimal;

@Entity
@Table(name = "security_zone")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "geometry(Polygon,4326)")
    private Polygon area;

    @Column(name = "crime_count", nullable = false)
    private Integer crimeCount;

    @Column(name = "security_index", nullable = false)
    private BigDecimal securityIndex;

    /** Barrio al que corresponde la zona (nullable: linkeado por match espacial en V9). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "neighborhood_id")
    private Neighborhood neighborhood;
}
