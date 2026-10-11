package com.nidio.service;

import com.nidio.dto.BillingSummaryDto;
import com.nidio.dto.CatalogItemDto;
import com.nidio.dto.PaymentDto;
import com.nidio.exception.BillingConflictException;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.AccountType;
import com.nidio.model.Addon;
import com.nidio.model.AddonType;
import com.nidio.model.Payment;
import com.nidio.model.PaymentStatus;
import com.nidio.model.Role;
import com.nidio.model.Subscription;
import com.nidio.model.SubscriptionKind;
import com.nidio.model.User;
import com.nidio.repository.AddonRepository;
import com.nidio.repository.PaymentRepository;
import com.nidio.repository.PropertyRepository;
import com.nidio.repository.SubscriptionRepository;
import com.nidio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Pasarela de pagos SIMULADA (pedida por la cátedra). El flujo imita una pasarela real pero
 * sin datos de tarjeta: 1) createCheckout crea un pago PENDING; 2) el usuario lo resuelve con
 * "simular pago aprobado / rechazado" (resolvePayment); 3) solo si se aprueba se activa lo
 * comprado. Los montos son en USD. Para producción faltaría integrar un proveedor real,
 * validar el pago por webhook firmado y emitir comprobantes fiscales.
 */
@Service
@RequiredArgsConstructor
public class BillingService {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("d/M").withZone(UsageQuotaService.ZONE);

    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final AddonRepository addonRepository;
    private final PropertyRepository propertyRepository;
    private final EntitlementService entitlementService;
    private final FeaturedService featuredService;

    public List<CatalogItemDto> catalog() {
        return Arrays.stream(BillingItem.values())
                .map(item -> new CatalogItemDto(
                        item.name(),
                        item.label(),
                        item.description(),
                        item.category().name(),
                        item.priceUsd(),
                        item.validityDays(),
                        item.audience() == null ? null : item.audience().name()))
                .toList();
    }

    /** Paso 1: valida que se pueda comprar y deja el pago PENDING (todavía no se activa nada). */
    @Transactional
    public PaymentDto createCheckout(String userEmail, String itemCode, Long propertyId, Instant featuredStartsAt) {
        User user = findUser(userEmail);
        BillingItem item = BillingItem.fromCode(itemCode);
        if (item == null) {
            throw new ResourceNotFoundException("No existe el ítem " + itemCode);
        }
        Instant now = Instant.now();
        validatePurchase(user, item, propertyId, featuredStartsAt, now);

        Payment payment = paymentRepository.save(Payment.builder()
                .userId(user.getId())
                .itemCode(item.name())
                .description(item.label())
                .amountUsd(item.priceUsd())
                .status(PaymentStatus.PENDING)
                .propertyId(item.category() == BillingCategory.FEATURED ? propertyId : null)
                .featuredStartsAt(item.category() == BillingCategory.FEATURED ? featuredStartsAt : null)
                .createdAt(now)
                .build());
        return toDto(payment);
    }

    /** Paso 2: el usuario aprueba o rechaza el pago simulado. Aprobado, se activa lo comprado. */
    @Transactional
    public PaymentDto resolvePayment(String userEmail, Long paymentId, boolean approved) {
        User user = findUser(userEmail);
        Payment payment = paymentRepository.findByIdAndUserId(paymentId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No existe el pago " + paymentId));
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new BillingConflictException("Este pago ya fue resuelto.");
        }
        Instant now = Instant.now();
        if (!approved) {
            payment.setStatus(PaymentStatus.REJECTED);
            payment.setResolvedAt(now);
            return toDto(paymentRepository.save(payment));
        }

        BillingItem item = BillingItem.fromCode(payment.getItemCode());
        // Se vuelve a validar: entre el checkout y la aprobación pudo cambiar algo (otro plan, un cupo ocupado).
        validatePurchase(user, item, payment.getPropertyId(), payment.getFeaturedStartsAt(), now);
        activate(user, item, payment, now);
        payment.setStatus(PaymentStatus.APPROVED);
        payment.setResolvedAt(now);
        return toDto(paymentRepository.save(payment));
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> listPayments(String userEmail) {
        User user = findUser(userEmail);
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public BillingSummaryDto summary(String userEmail) {
        User user = findUser(userEmail);
        Instant now = Instant.now();
        List<BillingSummaryDto.SubscriptionItem> subscriptions = entitlementService.activeSubscriptions(user.getId(), now).stream()
                .map(s -> new BillingSummaryDto.SubscriptionItem(
                        s.getKind().name(), labelFor(s.getKind()), s.getStartsAt(), s.getExpiresAt()))
                .toList();
        List<BillingSummaryDto.AddonItem> addons = entitlementService.activeAddons(user.getId(), now).stream()
                .map(a -> new BillingSummaryDto.AddonItem(
                        a.getType().name(), labelFor(a.getType()), a.getQuantity(), a.getExpiresAt()))
                .toList();
        boolean admin = user.getRole() == Role.ADMIN;
        int limit = entitlementService.publicationLimit(user, now);
        BillingSummaryDto.Publications publications = new BillingSummaryDto.Publications(
                propertyRepository.countByCreatedByIdAndActiveTrue(user.getId()),
                admin ? null : Integer.valueOf(limit));
        return new BillingSummaryDto(
                user.getAccountType().name(),
                admin,
                subscriptions,
                addons,
                publications,
                featuredService.summary(user, now));
    }

    // --- reglas de compra ---------------------------------------------------

    private void validatePurchase(User user, BillingItem item, Long propertyId, Instant featuredStartsAt, Instant now) {
        if (user.getRole() == Role.ADMIN) {
            throw new BillingConflictException("Las cuentas de administración no necesitan planes ni packs.");
        }
        if (item.audience() != null && item.audience() != user.getAccountType()) {
            throw new BillingConflictException(item.audience() == AccountType.PROFESSIONAL
                    ? "Este ítem es solo para cuentas profesionales."
                    : "Este ítem es solo para cuentas particulares.");
        }
        switch (item.category()) {
            case SUBSCRIPTION:
                validateSubscription(user, item.subscriptionKind(), now);
                break;
            case ADDON:
                validateAddon(user, item.addonType(), now);
                break;
            default:
                if (propertyId == null) {
                    throw new BillingConflictException("Elegí la publicación que querés destacar.");
                }
                featuredService.assertCanFeature(user, propertyId, featuredStartsAt, now);
                break;
        }
    }

    private void validateSubscription(User user, SubscriptionKind kind, Instant now) {
        if (kind == SubscriptionKind.ANALYSIS_PASS) {
            Optional<Subscription> current = entitlementService.activeAnalysisEntitlement(user.getId(), now);
            if (current.isPresent()) {
                throw new BillingConflictException(String.format(
                        "Ya tenés un pase o plan con usos vigente, que vence el %s. Podés contratar otro cuando venza.",
                        DATE.format(current.get().getExpiresAt())));
            }
            return;
        }
        Optional<Subscription> current = entitlementService.activePublisherSubscription(user.getId(), now);
        if (current.isPresent() && BillingRules.publisherRank(current.get().getKind()) >= BillingRules.publisherRank(kind)) {
            throw new BillingConflictException(String.format(
                    "Ya tenés un plan igual o superior vigente, que vence el %s. Podés cambiarlo a uno mayor o contratar de nuevo cuando venza.",
                    DATE.format(current.get().getExpiresAt())));
        }
    }

    private void validateAddon(User user, AddonType type, Instant now) {
        switch (type) {
            case USES_VALUATION:
            case USES_RECOMMENDATION:
            case USES_LIFE_SCORE:
                if (entitlementService.activeAnalysisEntitlement(user.getId(), now).isEmpty()) {
                    throw new BillingConflictException(
                            "Los packs de usos son para quienes ya tienen un Pase de análisis o un plan vigente. Primero contratá el pase.");
                }
                break;
            case PUBLICATIONS_50:
                Optional<Subscription> plan = entitlementService.activePublisherSubscription(user.getId(), now);
                if (plan.isEmpty() || plan.get().getKind() != SubscriptionKind.PRO_PLUS) {
                    throw new BillingConflictException("El pack de +50 publicaciones es para el plan Inmobiliaria Plus vigente.");
                }
                break;
            default:
                break;
        }
    }

    // --- activación ---------------------------------------------------------

    private void activate(User user, BillingItem item, Payment payment, Instant now) {
        switch (item.category()) {
            case SUBSCRIPTION:
                activateSubscription(user, item, payment, now);
                break;
            case ADDON:
                activateAddon(user, item, payment, now);
                break;
            default:
                featuredService.activatePaid(user, payment.getPropertyId(), payment.getId(), payment.getFeaturedStartsAt(), now);
                break;
        }
    }

    private void activateSubscription(User user, BillingItem item, Payment payment, Instant now) {
        SubscriptionKind kind = item.subscriptionKind();
        if (BillingRules.isPublisherPlan(kind)) {
            // Al pasar a un plan superior, el anterior deja de contar (sin prorrateo: es una simulación).
            entitlementService.activePublisherSubscription(user.getId(), now).ifPresent(old -> {
                old.setReplaced(true);
                subscriptionRepository.save(old);
            });
        }
        subscriptionRepository.save(Subscription.builder()
                .userId(user.getId())
                .kind(kind)
                .startsAt(now)
                .expiresAt(now.plus(BillingRules.SUBSCRIPTION_DAYS, ChronoUnit.DAYS))
                .paymentId(payment.getId())
                .build());
    }

    private void activateAddon(User user, BillingItem item, Payment payment, Instant now) {
        AddonType type = item.addonType();
        Instant expiresAt;
        int quantity;
        switch (type) {
            case FEATURED_PACK_5:
                expiresAt = now.plus(item.validityDays(), ChronoUnit.DAYS);
                quantity = BillingRules.FEATURED_PACK_UNITS;
                break;
            case PUBLICATIONS_50:
                // Vale mientras dure el plan Plus vigente.
                expiresAt = entitlementService.activePublisherSubscription(user.getId(), now)
                        .map(Subscription::getExpiresAt).orElse(now);
                quantity = BillingRules.PUBLICATIONS_PACK;
                break;
            default:
                // Packs de usos: valen mientras dure el pase o plan vigente.
                expiresAt = entitlementService.activeAnalysisEntitlement(user.getId(), now)
                        .map(Subscription::getExpiresAt).orElse(now);
                quantity = BillingRules.USES_PACK;
                break;
        }
        addonRepository.save(Addon.builder()
                .userId(user.getId())
                .type(type)
                .quantity(quantity)
                .purchasedAt(now)
                .expiresAt(expiresAt)
                .paymentId(payment.getId())
                .build());
    }

    // --- helpers ------------------------------------------------------------

    private static String labelFor(SubscriptionKind kind) {
        for (BillingItem item : BillingItem.values()) {
            if (item.subscriptionKind() == kind) {
                return item.label();
            }
        }
        return kind.name();
    }

    private static String labelFor(AddonType type) {
        for (BillingItem item : BillingItem.values()) {
            if (item.addonType() == type) {
                return item.label();
            }
        }
        return type.name();
    }

    private PaymentDto toDto(Payment payment) {
        return new PaymentDto(
                payment.getId(),
                payment.getItemCode(),
                payment.getDescription(),
                payment.getAmountUsd(),
                payment.getStatus().name(),
                payment.getPropertyId(),
                payment.getFeaturedStartsAt(),
                payment.getCreatedAt(),
                payment.getResolvedAt());
    }

    private User findUser(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
