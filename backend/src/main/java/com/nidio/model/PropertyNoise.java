package com.nidio.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Ruido de una propiedad, de día y de noche (nivel 1-4 relativo a CABA, más la
 * franja de dBA de origen). Los campos de un período quedan en null si la
 * ubicación no tiene dato. Ver V40__property_noise.sql.
 */
@Entity
@Table(name = "property_noise")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyNoise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    // SMALLINT en la tabla (V40): sin @JdbcTypeCode, ddl-auto=validate espera INTEGER y no arranca.
    @JdbcTypeCode(SqlTypes.SMALLINT)
    @Column(name = "day_level")
    private Integer dayLevel;

    @Column(name = "day_db_low")
    private Integer dayDbLow;

    @Column(name = "day_db_high")
    private Integer dayDbHigh;

    @Column(name = "day_src", length = 8)
    private String daySrc;

    @JdbcTypeCode(SqlTypes.SMALLINT)
    @Column(name = "night_level")
    private Integer nightLevel;

    @Column(name = "night_db_low")
    private Integer nightDbLow;

    @Column(name = "night_db_high")
    private Integer nightDbHigh;

    @Column(name = "night_src", length = 8)
    private String nightSrc;

    @Column(name = "datasets_version", nullable = false, length = 40)
    private String datasetsVersion;

    @Column(name = "computed_at", nullable = false)
    private LocalDateTime computedAt;
}
