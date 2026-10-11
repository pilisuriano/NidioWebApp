package com.nidio.dto;

import java.math.BigDecimal;

/**
 * Un factor de la explicación SHAP de una tasación: cuánto empuja ese dato el resultado hacia arriba
 * (contribution > 0) o hacia abajo (< 0) respecto del valor base del modelo. La unidad es la misma que la
 * del modelo: USD/m² en venta, USD/mes en alquiler.
 */
public record ExplanationFactorDto(String factor, BigDecimal contribution, String direction) {
}
