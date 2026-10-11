package com.nidio.service;

import com.nidio.model.AccountType;
import com.nidio.model.AddonType;
import com.nidio.model.SubscriptionKind;

import java.math.BigDecimal;

/**
 * Catálogo de lo que se puede comprar (precios en USD, supuestos del modelo de negocio:
 * ver "Planes y precios en USD" en la documentación). El código es el nombre del enum
 * y es lo que viaja entre el frontend y el backend. Los precios están acá, en un solo
 * lugar, para que cambiarlos no toque ninguna otra regla.
 */
public enum BillingItem {

    ANALYSIS_PASS("Pase de análisis", "30 días: 30 tasaciones, 30 recomendaciones y 30 Life Score, y ver más resultados en el Recomendador.",
            BillingCategory.SUBSCRIPTION, "6.00", 30, SubscriptionKind.ANALYSIS_PASS, null, null),
    OWNER_4("Dueño: 4 publicaciones", "30 días con hasta 4 publicaciones activas (las primeras 3 son gratis).",
            BillingCategory.SUBSCRIPTION, "5.00", 30, SubscriptionKind.OWNER_4, null, AccountType.PERSONAL),
    OWNER_5("Dueño: 5 publicaciones", "30 días con hasta 5 publicaciones activas.",
            BillingCategory.SUBSCRIPTION, "8.00", 30, SubscriptionKind.OWNER_5, null, AccountType.PERSONAL),
    OWNER_6("Dueño: 6 publicaciones", "30 días con hasta 6 publicaciones activas (máximo para dueños particulares).",
            BillingCategory.SUBSCRIPTION, "10.00", 30, SubscriptionKind.OWNER_6, null, AccountType.PERSONAL),
    PRO_INMOBILIARIA("Inmobiliaria", "30 días: hasta 30 publicaciones activas, 1 destacado incluido, 30 tasaciones y 30 Life Score.",
            BillingCategory.SUBSCRIPTION, "20.00", 30, SubscriptionKind.PRO_INMOBILIARIA, null, AccountType.PROFESSIONAL),
    PRO_PLUS("Inmobiliaria Plus", "30 días: hasta 150 publicaciones activas, 3 destacados incluidos, 30 tasaciones y 30 Life Score.",
            BillingCategory.SUBSCRIPTION, "50.00", 30, SubscriptionKind.PRO_PLUS, null, AccountType.PROFESSIONAL),

    USES_VALUATION_10("+10 tasaciones", "10 tasaciones más, hasta que venza tu pase o plan.",
            BillingCategory.ADDON, "2.00", 0, null, AddonType.USES_VALUATION, null),
    USES_RECOMMENDATION_10("+10 recomendaciones", "10 recomendaciones más, hasta que venza tu pase o plan.",
            BillingCategory.ADDON, "2.00", 0, null, AddonType.USES_RECOMMENDATION, AccountType.PERSONAL),
    USES_LIFE_SCORE_10("+10 Life Score", "10 cálculos de Life Score más, hasta que venza tu pase o plan.",
            BillingCategory.ADDON, "2.00", 0, null, AddonType.USES_LIFE_SCORE, null),
    PUBLICATIONS_50("+50 publicaciones", "50 publicaciones activas más para el plan Inmobiliaria Plus, hasta que venza.",
            BillingCategory.ADDON, "20.00", 0, null, AddonType.PUBLICATIONS_50, AccountType.PROFESSIONAL),
    FEATURED_PACK_5("Pack de 5 destacados", "5 destacados de 7 días (USD 6,40 cada uno), válidos por 60 días.",
            BillingCategory.ADDON, "32.00", 60, null, AddonType.FEATURED_PACK_5, AccountType.PROFESSIONAL),

    FEATURED_SINGLE("Destacado de 7 días", "Tu publicación en las primeras posiciones, rotulada \"Destacada\", por 7 días.",
            BillingCategory.FEATURED, "8.00", 7, null, null, null);

    private final String label;
    private final String description;
    private final BillingCategory category;
    private final BigDecimal priceUsd;
    private final int validityDays;
    private final SubscriptionKind subscriptionKind;
    private final AddonType addonType;
    // null = sirve para cualquier cuenta no admin.
    private final AccountType audience;

    BillingItem(String label, String description, BillingCategory category, String priceUsd, int validityDays,
                SubscriptionKind subscriptionKind, AddonType addonType, AccountType audience) {
        this.label = label;
        this.description = description;
        this.category = category;
        this.priceUsd = new BigDecimal(priceUsd);
        this.validityDays = validityDays;
        this.subscriptionKind = subscriptionKind;
        this.addonType = addonType;
        this.audience = audience;
    }

    public String label() { return label; }
    public String description() { return description; }
    public BillingCategory category() { return category; }
    public BigDecimal priceUsd() { return priceUsd; }
    public int validityDays() { return validityDays; }
    public SubscriptionKind subscriptionKind() { return subscriptionKind; }
    public AddonType addonType() { return addonType; }
    public AccountType audience() { return audience; }

    /** Busca un ítem por su código (nombre del enum); null si no existe. */
    public static BillingItem fromCode(String code) {
        if (code == null) {
            return null;
        }
        for (BillingItem item : values()) {
            if (item.name().equals(code)) {
                return item;
            }
        }
        return null;
    }
}
