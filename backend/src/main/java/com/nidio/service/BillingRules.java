package com.nidio.service;

import com.nidio.model.AccountType;
import com.nidio.model.SubscriptionKind;

/**
 * Reglas del modelo de negocio sin base de datos: límites de publicaciones, de destacados
 * y de usos por plan. Están separadas para poder probarlas sin Spring y para que los
 * números del modelo vivan en un único lugar.
 */
public final class BillingRules {

    private BillingRules() {
    }

    /** Usos por función que trae el pase o el plan profesional (reemplazan la cuota gratis, no se suman). */
    public static final int ANALYSIS_ALLOWANCE = 30;
    /** Usos que trae cada pack adicional. */
    public static final int USES_PACK = 10;
    /** Publicaciones activas gratis de cualquier cuenta sin plan. */
    public static final int FREE_PUBLICATIONS = 3;
    public static final int PRO_INMOBILIARIA_PUBLICATIONS = 30;
    public static final int PRO_PLUS_PUBLICATIONS = 150;
    public static final int PUBLICATIONS_PACK = 50;
    /** Cupo global de destacados simultáneos en toda la plataforma. */
    public static final int FEATURED_GLOBAL_CAP = 15;
    public static final int FEATURED_DAYS = 7;
    /** Hasta cuántos días adelante se ofrece reservar un destacado cuando hoy no hay lugar. */
    public static final int FEATURED_MAX_LEAD_DAYS = 14;
    public static final int FEATURED_PACK_UNITS = 5;
    public static final int SUBSCRIPTION_DAYS = 30;

    /** Publicaciones activas permitidas según la cuenta, su plan vigente y los packs de +50. */
    public static int publicationLimit(AccountType accountType, SubscriptionKind publisherKind, int publicationPacks) {
        if (publisherKind != null) {
            switch (publisherKind) {
                case OWNER_4:
                    return 4;
                case OWNER_5:
                    return 5;
                case OWNER_6:
                    return 6;
                case PRO_INMOBILIARIA:
                    return PRO_INMOBILIARIA_PUBLICATIONS;
                case PRO_PLUS:
                    return PRO_PLUS_PUBLICATIONS + PUBLICATIONS_PACK * Math.max(0, publicationPacks);
                default:
                    break;
            }
        }
        return FREE_PUBLICATIONS;
    }

    /** Destacados simultáneos que puede tener una cuenta (no es un tope mensual). */
    public static int featuredCap(SubscriptionKind publisherKind) {
        if (publisherKind == SubscriptionKind.PRO_PLUS) {
            return 5;
        }
        if (publisherKind == SubscriptionKind.PRO_INMOBILIARIA) {
            return 4;
        }
        return 2;
    }

    /** Destacados incluidos por período de 30 días del plan (no se acumulan). */
    public static int includedFeatured(SubscriptionKind publisherKind) {
        if (publisherKind == SubscriptionKind.PRO_PLUS) {
            return 3;
        }
        if (publisherKind == SubscriptionKind.PRO_INMOBILIARIA) {
            return 1;
        }
        return 0;
    }

    /** Escalón dentro de los planes de publicación (0 si no es un plan de publicación). */
    public static int publisherRank(SubscriptionKind kind) {
        if (kind == null) {
            return 0;
        }
        switch (kind) {
            case OWNER_4:
            case PRO_INMOBILIARIA:
                return 1;
            case OWNER_5:
            case PRO_PLUS:
                return 2;
            case OWNER_6:
                return 3;
            default:
                return 0;
        }
    }

    public static boolean isPublisherPlan(SubscriptionKind kind) {
        return publisherRank(kind) > 0;
    }

    /** true si la suscripción da los 30 usos de análisis: el pase y los planes profesionales. */
    public static boolean givesAnalysisAllowance(SubscriptionKind kind) {
        return kind == SubscriptionKind.ANALYSIS_PASS
                || kind == SubscriptionKind.PRO_INMOBILIARIA
                || kind == SubscriptionKind.PRO_PLUS;
    }
}
