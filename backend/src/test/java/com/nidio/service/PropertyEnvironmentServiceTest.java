package com.nidio.service;

import com.nidio.dto.PropertyEnvironmentResponse;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

/** Escalas de las etiquetas: nivel 1 siempre es el mejor (ruido Tranquilo, seguridad Alta). */
class PropertyEnvironmentServiceTest {

    @Test
    void securityLevelsUseFixedQuartilesOfTheIndex() {
        assertThat(PropertyEnvironmentService.securityOf(new BigDecimal("100")).label()).isEqualTo("Alta");
        assertThat(PropertyEnvironmentService.securityOf(new BigDecimal("75.0")).level()).isEqualTo(1);
        assertThat(PropertyEnvironmentService.securityOf(new BigDecimal("74.9")).level()).isEqualTo(2);
        assertThat(PropertyEnvironmentService.securityOf(new BigDecimal("50")).level()).isEqualTo(2);
        assertThat(PropertyEnvironmentService.securityOf(new BigDecimal("49.9")).label()).isEqualTo("Media-baja");
        assertThat(PropertyEnvironmentService.securityOf(new BigDecimal("25")).level()).isEqualTo(3);
        assertThat(PropertyEnvironmentService.securityOf(new BigDecimal("24.9")).label()).isEqualTo("Baja");
        assertThat(PropertyEnvironmentService.securityOf(new BigDecimal("2.1")).level()).isEqualTo(4);
    }

    @Test
    void missingSecurityIndexMeansNoData() {
        assertThat(PropertyEnvironmentService.securityOf(null)).isNull();
    }

    @Test
    void noiseLevelsMapToLabelsAndInvalidLevelsMeanNoData() {
        PropertyEnvironmentResponse.Noise noise = PropertyEnvironmentService.noiseOf(4, 75, 80, "2025");
        assertThat(noise.label()).isEqualTo("Muy ruidoso");
        assertThat(noise.dbLow()).isEqualTo(75);
        assertThat(PropertyEnvironmentService.noiseOf(1, 60, 65, "2018").label()).isEqualTo("Tranquilo");
        assertThat(PropertyEnvironmentService.noiseOf(null, null, null, null)).isNull();
        assertThat(PropertyEnvironmentService.noiseOf(5, 90, 95, "2025")).isNull();
    }
}
