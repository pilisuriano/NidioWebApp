package com.nidio.service;

import com.nidio.dto.BillingSummaryDto;
import com.nidio.dto.PropertySummaryResponse;
import com.nidio.exception.BillingConflictException;
import com.nidio.exception.PaymentRequiredException;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.Addon;
import com.nidio.model.AddonType;
import com.nidio.model.FeaturedListing;
import com.nidio.model.FeaturedSource;
import com.nidio.model.Property;
import com.nidio.model.Role;
import com.nidio.model.Subscription;
import com.nidio.model.SubscriptionKind;
import com.nidio.model.User;
import com.nidio.repository.AddonRepository;
import com.nidio.repository.FeaturedListingRepository;
import com.nidio.repository.PropertyRepository;
import com.nidio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Destacados de 7 días. Reglas del modelo: cupo global de 15 simultáneos, tope simultáneo por
 * cuenta (2 / 4 / 5 según el plan). Si hoy no hay lugar se puede RESERVAR para la primera fecha en que se
 * libere uno (hasta 14 días adelante): el destacado queda con starts_at en el futuro y no cuenta como
 * activo hasta que arranca. De dónde sale cada uno: incluido en el plan del período,
 * pack de 5, destacado de bienvenida (uno por cuenta, único) o pago suelto de USD 8.
 * Destacar compra visibilidad: no cambia la valuación ni el análisis de la propiedad.
 */
@Service
@RequiredArgsConstructor
public class FeaturedService {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("d/M").withZone(UsageQuotaService.ZONE);

    private final FeaturedListingRepository featuredRepository;
    private final AddonRepository addonRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final EntitlementService entitlementService;
    private final PropertyService propertyService;

    /** Cuándo puede arrancar un destacado nuevo de esta propiedad (ahora, o la fecha de reserva si hoy no hay lugar). */
    public record Availability(boolean startsNow, Instant startsAt, Instant endsAt, String blockedBy) {
    }

    /**
     * Si hoy hay lugar, arranca ahora. Si no, devuelve la primera fecha en que se libera uno para que el
     * usuario decida si reserva (blockedBy: ACCOUNT = llegó al máximo de su cuenta, GLOBAL = la plataforma
     * está llena). Si ni en los próximos días hay lugar, 409.
     */
    @Transactional(readOnly = true)
    public Availability availability(String userEmail, Long propertyId) {
        Instant now = Instant.now();
        User user = findUser(userEmail);
        assertFeaturable(user, propertyId, now);
        Instant start = earliestStart(user, now)
                .orElseThrow(() -> new BillingConflictException(noRoomMessage()));
        Instant end = start.plus(BillingRules.FEATURED_DAYS, ChronoUnit.DAYS);
        boolean startsNow = !start.isAfter(now);
        return new Availability(startsNow, start, end, startsNow ? null : blockedBy(user, now));
    }

    /**
     * Destaca una propiedad usando un crédito (incluido, pack o bienvenida); si no hay, 402 para ir a pagar.
     * startsAt = null arranca ahora; con una fecha futura es una reserva (el crédito se descuenta igual).
     */
    @Transactional
    public FeaturedListing activateWithCredit(String userEmail, Long propertyId, Instant startsAt) {
        Instant now = Instant.now();
        User user = findUser(userEmail);
        Instant start = assertCanFeature(user, propertyId, startsAt, now);

        Optional<Subscription> plan = entitlementService.activePublisherSubscription(user.getId(), now);
        FeaturedSource source;
        Long addonId = null;
        if (includedRemaining(user, plan, now) > 0) {
            source = FeaturedSource.INCLUDED;
        } else {
            Optional<Addon> pack = packWithCredit(user.getId(), now);
            if (pack.isPresent()) {
                source = FeaturedSource.PACK;
                addonId = pack.get().getId();
            } else if (!featuredRepository.existsByUserIdAndSource(user.getId(), FeaturedSource.WELCOME)) {
                source = FeaturedSource.WELCOME;
            } else {
                throw new PaymentRequiredException(
                        "Ya usaste tus destacados incluidos. Podés destacar esta publicación por USD 8 durante 7 días.");
            }
        }
        return save(user, propertyId, source, addonId, null, start);
    }

    /** Destaca una propiedad cuyo pago suelto acaba de aprobarse (lo llama BillingService). */
    @Transactional
    public FeaturedListing activatePaid(User user, Long propertyId, Long paymentId, Instant startsAt, Instant now) {
        Instant start = assertCanFeature(user, propertyId, startsAt, now);
        return save(user, propertyId, FeaturedSource.PAID, null, paymentId, start);
    }

    /**
     * Valida dueño, estado y cupos para un destacado que arranca en startsAt (null o pasado = ahora) y
     * devuelve la fecha de inicio efectiva. 409 si no entra, con la primera fecha disponible.
     */
    @Transactional(readOnly = true)
    public Instant assertCanFeature(User user, Long propertyId, Instant startsAt, Instant now) {
        assertFeaturable(user, propertyId, now);
        Instant start = (startsAt == null || !startsAt.isAfter(now)) ? now : startsAt;
        Instant limit = now.plus(BillingRules.FEATURED_MAX_LEAD_DAYS, ChronoUnit.DAYS);
        if (start.isAfter(limit)) {
            throw new BillingConflictException("Solo se puede reservar un destacado dentro de los próximos "
                    + BillingRules.FEATURED_MAX_LEAD_DAYS + " días.");
        }
        Instant end = start.plus(BillingRules.FEATURED_DAYS, ChronoUnit.DAYS);
        if (!fits(user, now, start, end)) {
            if (start.equals(now)) {
                Optional<Instant> next = earliestStart(user, now);
                throw new BillingConflictException(next
                        .map(date -> String.format("Hoy no hay lugar para destacar: %s El primer lugar disponible es el %s.",
                                blockedMessage(user, now), DATE.format(date)))
                        .orElse(noRoomMessage()));
            }
            throw new BillingConflictException(
                    "El lugar que se te ofreció para el " + DATE.format(start) + " ya no está disponible. Volvé a intentarlo.");
        }
        return start;
    }

    // Dueño de la propiedad, publicación activa y sin otro destacado vigente o reservado.
    private Property assertFeaturable(User user, Long propertyId, Instant now) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la propiedad " + propertyId));
        if (property.getCreatedBy() == null || !user.getId().equals(property.getCreatedBy().getId())) {
            throw new ResourceNotFoundException("No existe la propiedad " + propertyId);
        }
        if (!property.isActive()) {
            throw new BillingConflictException("Solo se pueden destacar publicaciones activas.");
        }
        if (featuredRepository.existsByPropertyIdAndEndsAtAfter(propertyId, now)) {
            throw new BillingConflictException("Esta publicación ya está destacada o tiene un destacado reservado.");
        }
        return property;
    }

    // --- cupos ---------------------------------------------------------------

    private List<FeaturedScheduler.Slot> ownSlots(User user, Instant now) {
        return slots(featuredRepository.findByUserIdAndEndsAtAfterOrderByEndsAtAsc(user.getId(), now));
    }

    private List<FeaturedScheduler.Slot> allSlots(Instant now) {
        return slots(featuredRepository.findByEndsAtAfterOrderByEndsAtAsc(now));
    }

    private static List<FeaturedScheduler.Slot> slots(List<FeaturedListing> listings) {
        return listings.stream().map(f -> new FeaturedScheduler.Slot(f.getStartsAt(), f.getEndsAt())).toList();
    }

    private int ownCap(User user, Instant now) {
        return accountCap(user, entitlementService.activePublisherSubscription(user.getId(), now));
    }

    private boolean fits(User user, Instant now, Instant start, Instant end) {
        return FeaturedScheduler.fits(ownSlots(user, now), ownCap(user, now), start, end)
                && FeaturedScheduler.fits(allSlots(now), BillingRules.FEATURED_GLOBAL_CAP, start, end);
    }

    private Optional<Instant> earliestStart(User user, Instant now) {
        return FeaturedScheduler.earliestStart(ownSlots(user, now), ownCap(user, now), allSlots(now),
                BillingRules.FEATURED_GLOBAL_CAP, now, BillingRules.FEATURED_DAYS, BillingRules.FEATURED_MAX_LEAD_DAYS);
    }

    // Qué tope frena a esta cuenta hoy: el propio (ACCOUNT) o el de toda la plataforma (GLOBAL).
    private String blockedBy(User user, Instant now) {
        Instant end = now.plus(BillingRules.FEATURED_DAYS, ChronoUnit.DAYS);
        boolean ownFull = !FeaturedScheduler.fits(ownSlots(user, now), ownCap(user, now), now, end);
        return ownFull ? "ACCOUNT" : "GLOBAL";
    }

    private String blockedMessage(User user, Instant now) {
        return "ACCOUNT".equals(blockedBy(user, now))
                ? String.format("llegaste al máximo de %d destacados a la vez de tu cuenta.", ownCap(user, now))
                : String.format("los %d lugares de la plataforma están ocupados.", BillingRules.FEATURED_GLOBAL_CAP);
    }

    private static String noRoomMessage() {
        return "No hay lugar para destacar en los próximos " + BillingRules.FEATURED_MAX_LEAD_DAYS
                + " días. Probá de nuevo más adelante.";
    }

    private FeaturedListing save(User user, Long propertyId, FeaturedSource source, Long addonId, Long paymentId, Instant start) {
        return featuredRepository.save(FeaturedListing.builder()
                .propertyId(propertyId)
                .userId(user.getId())
                .source(source)
                .startsAt(start)
                .endsAt(start.plus(BillingRules.FEATURED_DAYS, ChronoUnit.DAYS))
                .addonId(addonId)
                .paymentId(paymentId)
                .build());
    }

    /** Ids de las propiedades destacadas hoy (para rotular las tarjetas del catálogo). */
    @Transactional(readOnly = true)
    public List<Long> activePropertyIds() {
        return featuredRepository.findActive(Instant.now()).stream()
                .map(FeaturedListing::getPropertyId)
                .distinct()
                .toList();
    }

    /** Resumen del catálogo de las propiedades destacadas hoy (solo las que siguen activas). */
    @Transactional(readOnly = true)
    public List<PropertySummaryResponse> activeSummaries() {
        List<Long> ids = activePropertyIds();
        if (ids.isEmpty()) {
            return List.of();
        }
        Map<Long, Property> byId = new HashMap<>();
        for (Property p : propertyRepository.findAllById(ids)) {
            byId.put(p.getId(), p);
        }
        return ids.stream()
                .map(byId::get)
                .filter(p -> p != null && p.isActive())
                .map(propertyService::toSummary)
                .toList();
    }

    /** Estado de destacados de la cuenta para "Mi suscripción". */
    @Transactional(readOnly = true)
    public BillingSummaryDto.Featured summary(User user, Instant now) {
        Optional<Subscription> plan = entitlementService.activePublisherSubscription(user.getId(), now);
        // all = en curso en toda la plataforma (para el cupo global); own = en curso + reservados de esta cuenta.
        List<FeaturedListing> all = featuredRepository.findActive(now);
        List<FeaturedListing> own = featuredRepository.findByUserIdAndEndsAtAfterOrderByEndsAtAsc(user.getId(), now);
        long ownActive = own.stream().filter(f -> !f.getStartsAt().isAfter(now)).count();

        Set<Long> ownPropertyIds = own.stream().map(FeaturedListing::getPropertyId).collect(Collectors.toSet());
        Map<Long, String> titles = new HashMap<>();
        for (Property p : propertyRepository.findAllById(ownPropertyIds)) {
            titles.put(p.getId(), p.getTitle());
        }
        List<BillingSummaryDto.FeaturedItem> items = own.stream()
                .map(f -> new BillingSummaryDto.FeaturedItem(
                        f.getPropertyId(), titles.get(f.getPropertyId()), f.getSource().name(), f.getStartsAt(), f.getEndsAt()))
                .toList();

        SubscriptionKind kind = plan.map(Subscription::getKind).orElse(null);
        return new BillingSummaryDto.Featured(
                (int) ownActive,
                accountCap(user, plan),
                all.size(),
                BillingRules.FEATURED_GLOBAL_CAP,
                BillingRules.includedFeatured(kind),
                includedRemaining(user, plan, now),
                !featuredRepository.existsByUserIdAndSource(user.getId(), FeaturedSource.WELCOME),
                packRemaining(user.getId(), now),
                all.size() >= BillingRules.FEATURED_GLOBAL_CAP ? all.get(0).getEndsAt() : null,
                items);
    }

    // --- créditos -----------------------------------------------------------

    private int accountCap(User user, Optional<Subscription> plan) {
        if (user.getRole() == Role.ADMIN) {
            return 5;
        }
        return BillingRules.featuredCap(plan.map(Subscription::getKind).orElse(null));
    }

    // Incluidos del período del plan que todavía no se usaron (no se acumulan al período siguiente).
    private int includedRemaining(User user, Optional<Subscription> plan, Instant now) {
        if (plan.isEmpty()) {
            return 0;
        }
        int included = BillingRules.includedFeatured(plan.get().getKind());
        if (included == 0) {
            return 0;
        }
        long used = featuredRepository.countByUserIdAndSourceAndStartsAtGreaterThanEqual(
                user.getId(), FeaturedSource.INCLUDED, plan.get().getStartsAt());
        return (int) Math.max(0, included - used);
    }

    private Optional<Addon> packWithCredit(Long userId, Instant now) {
        return entitlementService.activeAddons(userId, now).stream()
                .filter(a -> a.getType() == AddonType.FEATURED_PACK_5)
                .filter(a -> featuredRepository.countByAddonId(a.getId()) < a.getQuantity())
                .findFirst();
    }

    private int packRemaining(Long userId, Instant now) {
        int remaining = 0;
        for (Addon a : entitlementService.activeAddons(userId, now)) {
            if (a.getType() == AddonType.FEATURED_PACK_5) {
                remaining += (int) Math.max(0, a.getQuantity() - featuredRepository.countByAddonId(a.getId()));
            }
        }
        return remaining;
    }

    private User findUser(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
