package com.nidio.service;

import com.nidio.model.AccountType;
import com.nidio.model.SubscriptionKind;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Números del modelo de negocio: publicaciones por plan, destacados simultáneos e incluidos,
 * y que el dueño particular nunca paga más que el plan Inmobiliaria (no conviene disfrazarse).
 */
class BillingRulesTest {

    @Test
    void sinPlanSeTienen3PublicacionesGratis() {
        assertEquals(3, BillingRules.publicationLimit(AccountType.PERSONAL, null, 0));
        assertEquals(3, BillingRules.publicationLimit(AccountType.PROFESSIONAL, null, 0));
    }

    @Test
    void losPlanesDeDuenoLlegan_Hasta6() {
        assertEquals(4, BillingRules.publicationLimit(AccountType.PERSONAL, SubscriptionKind.OWNER_4, 0));
        assertEquals(5, BillingRules.publicationLimit(AccountType.PERSONAL, SubscriptionKind.OWNER_5, 0));
        assertEquals(6, BillingRules.publicationLimit(AccountType.PERSONAL, SubscriptionKind.OWNER_6, 0));
    }

    @Test
    void losPlanesProfesionalesYElPackDe50() {
        assertEquals(30, BillingRules.publicationLimit(AccountType.PROFESSIONAL, SubscriptionKind.PRO_INMOBILIARIA, 3));
        assertEquals(150, BillingRules.publicationLimit(AccountType.PROFESSIONAL, SubscriptionKind.PRO_PLUS, 0));
        assertEquals(200, BillingRules.publicationLimit(AccountType.PROFESSIONAL, SubscriptionKind.PRO_PLUS, 1));
    }

    @Test
    void destacadosSimultaneosEIncluidosPorPlan() {
        assertEquals(2, BillingRules.featuredCap(null));
        assertEquals(4, BillingRules.featuredCap(SubscriptionKind.PRO_INMOBILIARIA));
        assertEquals(5, BillingRules.featuredCap(SubscriptionKind.PRO_PLUS));
        assertEquals(0, BillingRules.includedFeatured(null));
        assertEquals(1, BillingRules.includedFeatured(SubscriptionKind.PRO_INMOBILIARIA));
        assertEquals(3, BillingRules.includedFeatured(SubscriptionKind.PRO_PLUS));
        assertEquals(15, BillingRules.FEATURED_GLOBAL_CAP);
    }

    @Test
    void soloElPaseYLosPlanesProfesionalesDanLos30UsosDeAnalisis() {
        assertTrue(BillingRules.givesAnalysisAllowance(SubscriptionKind.ANALYSIS_PASS));
        assertTrue(BillingRules.givesAnalysisAllowance(SubscriptionKind.PRO_PLUS));
        assertFalse(BillingRules.givesAnalysisAllowance(SubscriptionKind.OWNER_6));
    }

    @Test
    void elPlanDeDuenoMasCaroNoSuperaAlPlanInmobiliaria() {
        assertTrue(BillingItem.OWNER_6.priceUsd().compareTo(BillingItem.PRO_INMOBILIARIA.priceUsd()) < 0);
        assertTrue(BillingItem.OWNER_4.priceUsd().compareTo(BillingItem.OWNER_5.priceUsd()) < 0);
        assertTrue(BillingItem.OWNER_5.priceUsd().compareTo(BillingItem.OWNER_6.priceUsd()) < 0);
    }

    @Test
    void elCatalogoTienePreciosEnUsdYSePuedeBuscarPorCodigo() {
        assertEquals("6.00", BillingItem.ANALYSIS_PASS.priceUsd().toPlainString());
        assertEquals("8.00", BillingItem.FEATURED_SINGLE.priceUsd().toPlainString());
        assertEquals("32.00", BillingItem.FEATURED_PACK_5.priceUsd().toPlainString());
        assertNotNull(BillingItem.fromCode("PRO_PLUS"));
        assertNull(BillingItem.fromCode("NO_EXISTE"));
    }
}
