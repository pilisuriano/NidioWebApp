package com.nidio.service;

import com.nidio.exception.PaymentRequiredException;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.AccountType;
import com.nidio.model.Addon;
import com.nidio.model.AddonType;
import com.nidio.model.QuotaFeature;
import com.nidio.model.Role;
import com.nidio.model.Subscription;
import com.nidio.model.User;
import com.nidio.repository.AddonRepository;
import com.nidio.repository.PropertyRepository;
import com.nidio.repository.SubscriptionRepository;
import com.nidio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Qué tiene vigente una cuenta (pase, planes, packs) y qué le permite. Lo usan la cuota
 * de uso (UsageQuotaService), el límite de publicaciones y los destacados. Las cifras
 * viven en BillingRules; acá solo se consulta la base.
 */
@Service
@RequiredArgsConstructor
public class EntitlementService {

    private final SubscriptionRepository subscriptionRepository;
    private final AddonRepository addonRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    @Transactional(readOnly = true)
    public List<Subscription> activeSubscriptions(Long userId, Instant now) {
        return subscriptionRepository.findByUserIdAndReplacedFalseAndExpiresAtAfter(userId, now);
    }

    @Transactional(readOnly = true)
    public List<Addon> activeAddons(Long userId, Instant now) {
        return addonRepository.findByUserIdAndExpiresAtAfterOrderByExpiresAtAsc(userId, now);
    }

    /** Pase o plan profesional vigente que da los 30 usos por función (el que vence más tarde). */
    @Transactional(readOnly = true)
    public Optional<Subscription> activeAnalysisEntitlement(Long userId, Instant now) {
        return activeSubscriptions(userId, now).stream()
                .filter(s -> BillingRules.givesAnalysisAllowance(s.getKind()))
                .max(Comparator.comparing(Subscription::getExpiresAt));
    }

    /** Plan de publicación vigente (dueño o profesional): el de mayor escalón. */
    @Transactional(readOnly = true)
    public Optional<Subscription> activePublisherSubscription(Long userId, Instant now) {
        return activeSubscriptions(userId, now).stream()
                .filter(s -> BillingRules.isPublisherPlan(s.getKind()))
                .max(Comparator.comparingInt((Subscription s) -> BillingRules.publisherRank(s.getKind())));
    }

    /** Usos extra de una función comprados con packs de +10 y todavía vigentes. */
    @Transactional(readOnly = true)
    public int extraUses(Long userId, QuotaFeature feature, Instant now) {
        AddonType type = usesAddonType(feature);
        return activeAddons(userId, now).stream()
                .filter(a -> a.getType() == type)
                .mapToInt(Addon::getQuantity)
                .sum();
    }

    /** Cantidad de packs de +50 publicaciones vigentes. */
    @Transactional(readOnly = true)
    public int publicationPacks(Long userId, Instant now) {
        int units = activeAddons(userId, now).stream()
                .filter(a -> a.getType() == AddonType.PUBLICATIONS_50)
                .mapToInt(Addon::getQuantity)
                .sum();
        return units / BillingRules.PUBLICATIONS_PACK;
    }

    /** Publicaciones activas que puede tener la cuenta hoy. Los admins no tienen límite. */
    @Transactional(readOnly = true)
    public int publicationLimit(User user, Instant now) {
        if (user.getRole() == Role.ADMIN) {
            return Integer.MAX_VALUE;
        }
        Optional<Subscription> plan = activePublisherSubscription(user.getId(), now);
        return BillingRules.publicationLimit(
                user.getAccountType(),
                plan.map(Subscription::getKind).orElse(null),
                publicationPacks(user.getId(), now));
    }

    /**
     * Corta con 402 si la cuenta ya tiene tantas publicaciones activas como su plan permite.
     * Se llama antes de publicar una propiedad nueva y antes de reactivar una pausada.
     */
    @Transactional(readOnly = true)
    public void assertCanPublish(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Instant now = Instant.now();
        int limit = publicationLimit(user, now);
        long active = propertyRepository.countByCreatedByIdAndActiveTrue(user.getId());
        if (active < limit) {
            return;
        }
        String message;
        if (user.getAccountType() == AccountType.PROFESSIONAL) {
            message = String.format(
                    "Llegaste a las %d publicaciones activas de tu plan. Contratá o mejorá tu plan para publicar más.", limit);
        } else if (limit >= 6) {
            message = "Llegaste al máximo de 6 publicaciones activas para un dueño particular. "
                    + "Para publicar más necesitás una cuenta profesional.";
        } else {
            message = String.format(
                    "Llegaste a tus %d publicaciones activas. Contratá un plan de dueño para publicar más.", limit);
        }
        throw new PaymentRequiredException(message);
    }

    static AddonType usesAddonType(QuotaFeature feature) {
        switch (feature) {
            case VALUATION:
                return AddonType.USES_VALUATION;
            case RECOMMENDATION:
                return AddonType.USES_RECOMMENDATION;
            default:
                return AddonType.USES_LIFE_SCORE;
        }
    }
}
