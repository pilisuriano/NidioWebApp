package com.nidio.model;

// Condición fiscal ante AFIP, para la cuenta profesional. Solo aplica cuando
// User.accountType = PROFESSIONAL.
public enum TaxCondition {
    RESPONSABLE_INSCRIPTO,
    MONOTRIBUTO,
    EXENTO,
    CONSUMIDOR_FINAL
}
