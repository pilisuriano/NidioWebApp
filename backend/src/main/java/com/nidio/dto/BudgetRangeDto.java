package com.nidio.dto;

import java.math.BigDecimal;

/** Un tramo de presupuesto; min o max null = sin tope en ese extremo. */
public record BudgetRangeDto(BigDecimal min, BigDecimal max) {
}
