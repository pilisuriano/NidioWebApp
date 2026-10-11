package com.nidio.model;

// Tipos de suscripción simulada (ver BillingItem para los precios). Todas duran
// 30 días y NO se renuevan solas: al vencer hay que volver a contratarlas.
//   ANALYSIS_PASS     -> "Pase de análisis" del buscador (comprador / inquilino)
//   OWNER_4/5/6       -> dueño particular con 4, 5 o 6 publicaciones activas
//   PRO_INMOBILIARIA  -> cuenta profesional, hasta 30 publicaciones
//   PRO_PLUS          -> cuenta profesional, hasta 150 publicaciones (+ packs de 50)
public enum SubscriptionKind {
    ANALYSIS_PASS,
    OWNER_4,
    OWNER_5,
    OWNER_6,
    PRO_INMOBILIARIA,
    PRO_PLUS
}
