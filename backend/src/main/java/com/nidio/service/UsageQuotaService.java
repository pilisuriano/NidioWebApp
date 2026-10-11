package com.nidio.service;

import com.nidio.dto.UsageResponse;
import com.nidio.dto.UsageStatusDto;
import com.nidio.exception.QuotaExceededException;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.AccountType;
import com.nidio.model.FeatureUsage;
import com.nidio.model.QuotaFeature;
import com.nidio.model.Role;
import com.nidio.model.Subscription;
import com.nidio.model.SubscriptionKind;
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
import java.util.Optional;

/**
 * Cuota gratuita mensual del modelo de negocio: cada usuario tiene una cantidad
 * de usos gratis por mes calendario de Tasación, Recomendador y Life Score (cada función
 * cuenta por separado). Cuentas particulares: 3 por mes; cuentas profesionales
 * (inmobiliarias, corredores, desarrolladores): 6 por mes. Los admins no tienen
 * límite. Los números se configuran en application.properties (app.quota.*).
 *
 * Con un Pase de análisis o un plan profesional vigente, los 30 usos por función de ese
 * período REEMPLAZAN la cuota gratis (no se suman) y se cuentan desde que empezó el pase;
 * los packs de +10 vigentes los amplían (ver EntitlementService).
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
    private final EntitlementService entitlementService;
    private final int personalMonthlyLimit;
    private final int professionalMonthlyLimit;
    private final Clock clock;

    @Autowired
    public UsageQuotaService(
            FeatureUsageRepository featureUsageRepository,
            UserRepository userRepository,
            EntitlementService entitlementService,
            @Value("${app.quota.personal-monthly:3}") int personalMonthlyLimit,
            @Value("${app.quota.professional-monthly:6}") int professionalMonthlyLimit) {
        this(featureUsageRepository, userRepository, entitlementService, personalMonthlyLimit, professionalMonthlyLimit,
                Clock.system(ZONE));
    }

    // Constructor con reloj fijo para los tests (cambio de mes, etc.).
    UsageQuotaService(
            FeatureUsageRepository featureUsageRepository,
            UserRepository userRepository,
            EntitlementService entitlementService,
            int personalMonthlyLimit,
            int professionalMonthlyLimit,
            Clock clock) {
        this.featureUsageRepository = featureUsageRepository;
        this.userRepository = userRepository;
        this.entitlementService = entitlementService;
        this.personalMonthlyLimit = personalMonthlyLimit;
        this.professionalMonthlyLimit = professionalMonthlyLimit;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public UsageResponse getUsage(String userEmail) {
        User user = findUser(userEmail);
        return new UsageResponse(
                status(user, QuotaFeature.VALUATION),
                status(user, QuotaFeature.RECOMMENDATION),
                status(user, QuotaFeature.LIFE_SCORE));
    }

    /** Corta con 429 si el usuario ya no tiene usos gratis de esta función en el mes. */
    @Transactional(readOnly = true)
    public void checkAvailable(String userEmail, QuotaFeature feature) {
        User user = findUser(userEmail);
        UsageStatusDto status = status(user, feature);
        if (!status.unlimited() && status.remaining() <= 0) {
            String resetDate = status.resetsAt().atZone(ZONE).format(RESET_DATE);
            if ("FREE".equals(status.source())) {
                throw new QuotaExceededException(String.format(
                        "Usaste tus %d %s gratis de este mes. Se renuevan el %s. Con el plan pago podés seguir usándolo sin esperar.",
                        status.limit(), featureLabel(feature, status.limit()), resetDate));
            }
            throw new QuotaExceededException(String.format(
                    "Usaste los %d %s de tu %s. Vence el %s. Podés comprar un pack adicional de +10 usos para seguir.",
                    status.limit(), featureLabel(feature, status.limit()),
                    "PASS".equals(status.source()) ? "pase" : "plan", resetDate));
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
        Instant now = Instant.now(clock);
        if (isUnlimited(user)) {
            return new UsageStatusDto(feature, 0, null, null, true, startOfNextMonth(), "ADMIN", startOfMonth(), 0);
        }
        // Pase o plan profesional vigente: sus 30 usos (más los packs) reemplazan la cuota gratis.
        Optional<Subscription> entitlement = entitlementService.activeAnalysisEntitlement(user.getId(), now);
        if (entitlement.isPresent()) {
            Subscription sub = entitlement.get();
            int extra = entitlementService.extraUses(user.getId(), feature, now);
            int limit = BillingRules.ANALYSIS_ALLOWANCE + extra;
            long used = featureUsageRepository.countByUserIdAndFeatureAndUsedAtGreaterThanEqual(
                    user.getId(), feature, sub.getStartsAt());
            int remaining = (int) Math.max(0, limit - used);
            String source = sub.getKind() == SubscriptionKind.ANALYSIS_PASS ? "PASS" : "PLAN";
            return new UsageStatusDto(feature, used, limit, remaining, false, sub.getExpiresAt(), source,
                    sub.getStartsAt(), extra);
        }
        int limit = monthlyLimit(user);
        long used = featureUsageRepository.countByUserIdAndFeatureAndUsedAtGreaterThanEqual(
                user.getId(), feature, startOfMonth());
        int remaining = (int) Math.max(0, limit - used);
        return new UsageStatusDto(feature, used, limit, remaining, false, startOfNextMonth(), "FREE", startOfMonth(), 0);
    }

    int monthlyLimit(User user) {
        return user.getAccountType() == AccountType.PROFESSIONAL ? professionalMonthlyLimit : personalMonthlyLimit;
    }

    /**
     * Si la cuenta puede ver la lista ampliada del recomendador: tiene pase de análisis o plan vigente (o es admin).
     * Es lo que el Pase de análisis incluye además de los 30 usos (ver nidio-modelo-negocio-planes-usd).
     */
    @Transactional(readOnly = true)
    public boolean hasExtendedResults(String userEmail) {
        User user = findUser(userEmail);
        return isUnlimited(user)
                || entitlementService.activeAnalysisEntitlement(user.getId(), Instant.now(clock)).isPresent();
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
            case LIFE_SCORE -> plural ? "cálculos de Life Score" : "cálculo de Life Score";
        };
    }

    private User findUser(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
