package com.nidio.service;

import com.nidio.dto.UsageStatusDto;
import com.nidio.exception.QuotaExceededException;
import com.nidio.model.AccountType;
import com.nidio.model.FeatureUsage;
import com.nidio.model.QuotaFeature;
import com.nidio.model.Role;
import com.nidio.model.Subscription;
import com.nidio.model.SubscriptionKind;
import com.nidio.model.User;
import com.nidio.repository.FeatureUsageRepository;
import com.nidio.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.time.Clock;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Cuota gratuita mensual: 3 usos por mes para cuentas particulares, 6 para
 * profesionales, sin límite para admins, y el mes se cuenta con hora de Argentina.
 * Con un pase o plan vigente se usan sus 30 usos (más los packs) en lugar de la cuota gratis.
 */
class UsageQuotaServiceTest {

    // 15 de octubre de 2026, 12:00 hora de Argentina.
    private static final Instant NOW = ZonedDateTime.of(2026, 10, 15, 12, 0, 0, 0, UsageQuotaService.ZONE).toInstant();
    private static final Instant START_OF_OCTOBER = ZonedDateTime.of(2026, 10, 1, 0, 0, 0, 0, UsageQuotaService.ZONE).toInstant();
    private static final Instant START_OF_NOVEMBER = ZonedDateTime.of(2026, 11, 1, 0, 0, 0, 0, UsageQuotaService.ZONE).toInstant();

    private FeatureUsageRepository featureUsageRepository;
    private UserRepository userRepository;
    private EntitlementService entitlementService;
    private UsageQuotaService service;

    @BeforeEach
    void setUp() {
        featureUsageRepository = Mockito.mock(FeatureUsageRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        entitlementService = Mockito.mock(EntitlementService.class);
        service = new UsageQuotaService(featureUsageRepository, userRepository, entitlementService, 3, 6,
                Clock.fixed(NOW, UsageQuotaService.ZONE));
    }

    private User user(long id, AccountType accountType, Role role) {
        User user = User.builder().id(id).email("u" + id + "@nidio.app").name("U").passwordHash("x")
                .accountType(accountType).role(role).build();
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        return user;
    }

    private void usedThisMonth(long userId, QuotaFeature feature, long count) {
        when(featureUsageRepository.countByUserIdAndFeatureAndUsedAtGreaterThanEqual(userId, feature, START_OF_OCTOBER))
                .thenReturn(count);
    }

    @Test
    void cuentaParticularTiene3UsosPorMes() {
        User user = user(1, AccountType.PERSONAL, Role.USER);
        usedThisMonth(1, QuotaFeature.VALUATION, 1);

        UsageStatusDto status = service.status(user, QuotaFeature.VALUATION);

        assertEquals(3, status.limit());
        assertEquals(1, status.used());
        assertEquals(2, status.remaining());
        assertEquals(START_OF_NOVEMBER, status.resetsAt());
    }

    @Test
    void cuentaProfesionalTiene6UsosPorMes() {
        User user = user(2, AccountType.PROFESSIONAL, Role.USER);
        usedThisMonth(2, QuotaFeature.VALUATION, 3);

        UsageStatusDto status = service.status(user, QuotaFeature.VALUATION);

        assertEquals(6, status.limit());
        assertEquals(3, status.remaining());
        assertDoesNotThrow(() -> service.checkAvailable(user.getEmail(), QuotaFeature.VALUATION));
    }

    @Test
    void alLlegarAlLimiteSeBloqueaConMensajeYFechaDeRenovacion() {
        User user = user(3, AccountType.PERSONAL, Role.USER);
        usedThisMonth(3, QuotaFeature.RECOMMENDATION, 3);

        QuotaExceededException ex = assertThrows(QuotaExceededException.class,
                () -> service.checkAvailable(user.getEmail(), QuotaFeature.RECOMMENDATION));

        assertTrue(ex.getMessage().contains("3 recomendaciones"), ex.getMessage());
        assertTrue(ex.getMessage().contains("1/11"), ex.getMessage());
        assertTrue(ex.getMessage().contains("plan pago"), ex.getMessage());
    }

    @Test
    void cadaFuncionCuentaPorSeparado() {
        User user = user(4, AccountType.PERSONAL, Role.USER);
        usedThisMonth(4, QuotaFeature.VALUATION, 3);
        usedThisMonth(4, QuotaFeature.RECOMMENDATION, 0);

        assertThrows(QuotaExceededException.class, () -> service.checkAvailable(user.getEmail(), QuotaFeature.VALUATION));
        assertDoesNotThrow(() -> service.checkAvailable(user.getEmail(), QuotaFeature.RECOMMENDATION));
    }

    @Test
    void elMesSeCuentaDesdeElDia1HoraArgentina() {
        User user = user(5, AccountType.PERSONAL, Role.USER);

        service.status(user, QuotaFeature.VALUATION);

        verify(featureUsageRepository).countByUserIdAndFeatureAndUsedAtGreaterThanEqual(
                eq(5L), eq(QuotaFeature.VALUATION), eq(START_OF_OCTOBER));
    }

    @Test
    void adminNoTieneLimiteNiRegistraUsos() {
        User admin = user(6, AccountType.PERSONAL, Role.ADMIN);

        UsageStatusDto status = service.status(admin, QuotaFeature.VALUATION);
        service.register(admin.getEmail(), QuotaFeature.VALUATION);

        assertTrue(status.unlimited());
        assertNull(status.limit());
        assertDoesNotThrow(() -> service.checkAvailable(admin.getEmail(), QuotaFeature.VALUATION));
        verify(featureUsageRepository, never()).save(any());
    }

    @Test
    void registrarGuardaElUsoConLaFechaActual() {
        User user = user(7, AccountType.PERSONAL, Role.USER);

        service.register(user.getEmail(), QuotaFeature.RECOMMENDATION);

        ArgumentCaptor<FeatureUsage> captor = ArgumentCaptor.forClass(FeatureUsage.class);
        verify(featureUsageRepository).save(captor.capture());
        assertEquals(QuotaFeature.RECOMMENDATION, captor.getValue().getFeature());
        assertEquals(NOW, captor.getValue().getUsedAt());
        assertEquals(user, captor.getValue().getUser());
    }

    // 10 de octubre de 2026: el pase empezó hace 5 días y dura 30.
    private static final Instant PASS_START = ZonedDateTime.of(2026, 10, 10, 9, 0, 0, 0, UsageQuotaService.ZONE).toInstant();
    private static final Instant PASS_END = ZonedDateTime.of(2026, 11, 9, 9, 0, 0, 0, UsageQuotaService.ZONE).toInstant();

    private void withPass(User user, SubscriptionKind kind) {
        Subscription pass = Subscription.builder().id(1L).userId(user.getId()).kind(kind)
                .startsAt(PASS_START).expiresAt(PASS_END).build();
        when(entitlementService.activeAnalysisEntitlement(user.getId(), NOW)).thenReturn(Optional.of(pass));
    }

    @Test
    void listaAmpliadaDelRecomendadorSoloConPaseOPlanOAdmin() {
        User sinPase = user(1, AccountType.PERSONAL, Role.USER);
        User conPase = user(2, AccountType.PERSONAL, Role.USER);
        withPass(conPase, SubscriptionKind.ANALYSIS_PASS);
        User admin = user(3, AccountType.PERSONAL, Role.ADMIN);

        assertEquals(false, service.hasExtendedResults(sinPase.getEmail()));
        assertEquals(true, service.hasExtendedResults(conPase.getEmail()));
        assertEquals(true, service.hasExtendedResults(admin.getEmail()));
    }

    @Test
    void conPaseTiene30UsosQueReemplazanLaCuotaGratisYSeCuentanDesdeElInicioDelPase() {
        User user = user(8, AccountType.PERSONAL, Role.USER);
        withPass(user, SubscriptionKind.ANALYSIS_PASS);
        when(featureUsageRepository.countByUserIdAndFeatureAndUsedAtGreaterThanEqual(8L, QuotaFeature.LIFE_SCORE, PASS_START))
                .thenReturn(5L);

        UsageStatusDto status = service.status(user, QuotaFeature.LIFE_SCORE);

        assertEquals(30, status.limit());
        assertEquals(5, status.used());
        assertEquals(25, status.remaining());
        assertEquals("PASS", status.source());
        assertEquals(PASS_END, status.resetsAt());
        assertEquals(PASS_START, status.periodStart());
    }

    @Test
    void losPacksVigentesAmplianElLimiteDelPase() {
        User user = user(9, AccountType.PERSONAL, Role.USER);
        withPass(user, SubscriptionKind.ANALYSIS_PASS);
        when(entitlementService.extraUses(9L, QuotaFeature.VALUATION, NOW)).thenReturn(10);
        when(featureUsageRepository.countByUserIdAndFeatureAndUsedAtGreaterThanEqual(9L, QuotaFeature.VALUATION, PASS_START))
                .thenReturn(30L);

        UsageStatusDto status = service.status(user, QuotaFeature.VALUATION);

        assertEquals(40, status.limit());
        assertEquals(10, status.remaining());
        assertEquals(10, status.extraUses());
        assertDoesNotThrow(() -> service.checkAvailable(user.getEmail(), QuotaFeature.VALUATION));
    }

    @Test
    void conPlanProfesionalAlTerminarLos30SeBloqueaYOfreceElPack() {
        User user = user(10, AccountType.PROFESSIONAL, Role.USER);
        withPass(user, SubscriptionKind.PRO_INMOBILIARIA);
        when(featureUsageRepository.countByUserIdAndFeatureAndUsedAtGreaterThanEqual(10L, QuotaFeature.VALUATION, PASS_START))
                .thenReturn(30L);

        UsageStatusDto status = service.status(user, QuotaFeature.VALUATION);
        QuotaExceededException ex = assertThrows(QuotaExceededException.class,
                () -> service.checkAvailable(user.getEmail(), QuotaFeature.VALUATION));

        assertEquals("PLAN", status.source());
        assertTrue(ex.getMessage().contains("30 tasaciones"), ex.getMessage());
        assertTrue(ex.getMessage().contains("9/11"), ex.getMessage());
        assertTrue(ex.getMessage().contains("pack adicional"), ex.getMessage());
    }

    @Test
    void lifeScoreTambienTieneCuotaGratisDe3ParaParticulares() {
        User user = user(11, AccountType.PERSONAL, Role.USER);
        usedThisMonth(11, QuotaFeature.LIFE_SCORE, 3);

        QuotaExceededException ex = assertThrows(QuotaExceededException.class,
                () -> service.checkAvailable(user.getEmail(), QuotaFeature.LIFE_SCORE));

        assertEquals("FREE", service.status(user, QuotaFeature.LIFE_SCORE).source());
        assertTrue(ex.getMessage().contains("3 cálculos de Life Score"), ex.getMessage());
    }
}
