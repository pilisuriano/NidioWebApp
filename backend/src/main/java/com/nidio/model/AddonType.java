package com.nidio.model;

// Adicionales que se compran aparte de una suscripción (ver BillingItem).
//   USES_*             -> +10 usos de una función de análisis (vencen con el pase o plan)
//   PUBLICATIONS_50    -> +50 publicaciones activas para el plan Inmobiliaria Plus
//   FEATURED_PACK_5    -> 5 destacados de 7 días, válidos 60 días (cuentas profesionales)
public enum AddonType {
    USES_VALUATION,
    USES_RECOMMENDATION,
    USES_LIFE_SCORE,
    PUBLICATIONS_50,
    FEATURED_PACK_5
}
