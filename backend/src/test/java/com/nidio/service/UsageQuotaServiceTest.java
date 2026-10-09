package com.nidio.service;

import com.nidio.dto.UsageStatusDto;
import com.nidio.exception.QuotaExceededException;
import com.nidio.model.AccountType;
import com.nidio.model.FeatureUsage;
import com.nidio.model.QuotaFeature;
import com.nidio.model.Role;
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
 */
class UsageQuotaServiceTest {

    // 15 de octubre de 2026, 12:00 hora de Argentina.
    private static final Instant NOW = ZonedDateTime.of(2026, 10, 15, 12, 0, 0, 0, UsageQuotaService.ZONE).toInstant();
    private static final Instant START_OF_OCTOBER = ZonedDateTime.of(2026, 10, 1, 0, 0, 0, 0, UsageQuotaService.ZONE).toInstant();
    private static final Instant START_OF_NOVEMBER = ZonedDateTime.of(2026, 11, 1, 0, 0, 0, 0, UsageQuotaService.ZONE).toInstant();

    private FeatureUsageRepository featureUsageRepository;
    private UserRepository userRepository;
    private UsageQuotaService service;

    @BeforeEach
    void setUp() {
        featureUsageRepository = Mockito.mock(FeatureUsageRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        service = new UsageQuotaService(featureUsageRepository, userRepository, 3, 6, Clock.fixed(NOW, UsageQuotaService.ZONE));
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
}
