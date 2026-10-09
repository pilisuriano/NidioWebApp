package com.nidio.service;

import com.nidio.dto.UsageResponse;
import com.nidio.dto.UsageStatusDto;
import com.nidio.exception.QuotaExceededException;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.AccountType;
import com.nidio.model.FeatureUsage;
import com.nidio.model.QuotaFeature;
import com.nidio.model.Role;
import com.nidio.model.User;
import com.nidio.repository.FeatureUsageRepository;
import com.nidio.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Cuota gratuita mensual del modelo de negocio: cada usuario tiene una cantidad
 * de usos gratis por mes calendario de Tasación y del Recomendador (cada función
 * cuenta por separado). Cuentas particulares: 3 por mes; cuentas profesionales
 * (inmobiliarias, corredores, desarrolladores): 6 por mes. Los admins no tienen
 * límite. Los números se configuran en application.properties (app.quota.*).
 *
 * Uso desde los controllers: checkAvailable() antes de calcular y register()
 * solo si el cálculo salió bien, así un error del ml-service no descuenta un uso.
 */
@Service
public class UsageQuotaService {

    // Los meses se cuentan con la hora de Argentina (no UTC): si no, el día 1
    // a la noche todavía contaría como el mes anterior.
    static final ZoneId ZONE = ZoneId.of("America/Argentina/Buenos_Aires");
    private static final DateTimeFormatter RESET_DATE = DateTimeFormatter.ofPattern("d/M");

    private final FeatureUsageRepository featureUsageRepository;
    private final UserRepository userRepository;
    private final int personalMonthlyLimit;
    private final int professionalMonthlyLimit;
    private final Clock clock;

    @Autowired
    public UsageQuotaService(
            FeatureUsageRepository featureUsageRepository,
            UserRepository userRepository,
            @Value("${app.quota.personal-monthly:3}") int personalMonthlyLimit,
            @Value("${app.quota.professional-monthly:6}") int professionalMonthlyLimit) {
        this(featureUsageRepository, userRepository, personalMonthlyLimit, professionalMonthlyLimit, Clock.system(ZONE));
    }

    // Constructor con reloj fijo para los tests (cambio de mes, etc.).
    UsageQuotaService(
            FeatureUsageRepository featureUsageRepository,
            UserRepository userRepository,
            int personalMonthlyLimit,
            int professionalMonthlyLimit,
            Clock clock) {
        this.featureUsageRepository = featureUsageRepository;
        this.userRepository = userRepository;
        this.personalMonthlyLimit = personalMonthlyLimit;
        this.professionalMonthlyLimit = professionalMonthlyLimit;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public UsageResponse getUsage(String userEmail) {
        User user = findUser(userEmail);
        return new UsageResponse(status(user, QuotaFeature.VALUATION), status(user, QuotaFeature.RECOMMENDATION));
    }

    /** Corta con 429 si el usuario ya no tiene usos gratis de esta función en el mes. */
    @Transactional(readOnly = true)
    public void checkAvailable(String userEmail, QuotaFeature feature) {
        User user = findUser(userEmail);
        UsageStatusDto status = status(user, feature);
        if (!status.unlimited() && status.remaining() <= 0) {
            String resetDate = status.resetsAt().atZone(ZONE).format(RESET_DATE);
            throw new QuotaExceededException(String.format(
                    "Usaste tus %d %s gratis de este mes. Se renuevan el %s. Con el plan pago podés seguir usándolo sin esperar.",
                    status.limit(), featureLabel(feature, status.limit()), resetDate));
        }
    }

    /** Registra un uso exitoso (no hace nada para los admins, que no tienen límite). */
    @Transactional
    public void register(String userEmail, QuotaFeature feature) {
        User user = findUser(userEmail);
        if (isUnlimited(user)) {
            return;
        }
        featureUsageRepository.save(FeatureUsage.builder()
                .user(user)
                .feature(feature)
                .usedAt(Instant.now(clock))
                .build());
    }

    UsageStatusDto status(User user, QuotaFeature feature) {
        Instant resetsAt = startOfNextMonth();
        if (isUnlimited(user)) {
            return new UsageStatusDto(feature, 0, null, null, true, resetsAt);
        }
        int limit = monthlyLimit(user);
        long used = featureUsageRepository.countByUserIdAndFeatureAndUsedAtGreaterThanEqual(
                user.getId(), feature, startOfMonth());
        int remaining = (int) Math.max(0, limit - used);
        return new UsageStatusDto(feature, used, limit, remaining, false, resetsAt);
    }

    int monthlyLimit(User user) {
        return user.getAccountType() == AccountType.PROFESSIONAL ? professionalMonthlyLimit : personalMonthlyLimit;
    }

    private static boolean isUnlimited(User user) {
        return user.getRole() == Role.ADMIN;
    }

    private Instant startOfMonth() {
        return LocalDate.now(clock.withZone(ZONE)).withDayOfMonth(1).atStartOfDay(ZONE).toInstant();
    }

    private Instant startOfNextMonth() {
        return LocalDate.now(clock.withZone(ZONE)).withDayOfMonth(1).plusMonths(1).atStartOfDay(ZONE).toInstant();
    }

    private static String featureLabel(QuotaFeature feature, int limit) {
        boolean plural = limit != 1;
        return switch (feature) {
            case VALUATION -> plural ? "tasaciones" : "tasación";
            case RECOMMENDATION -> plural ? "recomendaciones" : "recomendación";
        };
    }

    private User findUser(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
