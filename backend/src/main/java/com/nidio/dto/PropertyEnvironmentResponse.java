package com.nidio.dto;

import java.math.BigDecimal;

/**
 * Entorno de una propiedad para las etiquetas de tarjetas y ficha: ruido de día
 * y de noche, y seguridad del barrio. Cada dato en null = sin dato.
 *
 * <p>Los niveles (1-4) son relativos a CABA y 1 es siempre el mejor (ruido
 * "Tranquilo", seguridad "Alta"), para que el color del chip sea el mismo en
 * los dos. No se muestran decibeles como dato principal: la gente no los
 * interpreta.
 */
public record PropertyEnvironmentResponse(
        Long propertyId,
        Noise noiseDay,
        Noise noiseNight,
        Security security
) {

    /** Nivel de ruido: 1 Tranquilo, 2 Moderado, 3 Ruidoso, 4 Muy ruidoso. {@code source}: año del dato. */
    public record Noise(int level, String label, int dbLow, int dbHigh, String source) {
    }

    /** Seguridad del barrio: 1 Alta, 2 Media-alta, 3 Media-baja, 4 Baja. */
    public record Security(int level, String label, BigDecimal index) {
    }
}
