package com.nidio.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.TreeSet;

/**
 * Cuándo puede empezar un destacado nuevo. Un destacado dura {@code days} días y hay dos topes
 * simultáneos: el de la cuenta y el global de la plataforma. Si hoy no hay lugar, se busca la primera
 * fecha en la que entra (cuando termina alguno de los que están en curso o reservados) para ofrecérsela
 * al usuario como reserva. Sin Spring ni base de datos, para poder probarlo solo.
 */
final class FeaturedScheduler {

    private FeaturedScheduler() {
    }

    /** Un destacado en curso o reservado: [start, end). */
    record Slot(Instant start, Instant end) {
    }

    /**
     * ¿Entra un destacado en [start, end) sin pasar el tope en ningún momento de esa ventana? Se mira en el
     * inicio y en cada fecha en la que arranca otra reserva dentro de la ventana, porque ahí sube la ocupación.
     */
    static boolean fits(List<Slot> existing, int cap, Instant start, Instant end) {
        if (occupancyAt(existing, start) >= cap) {
            return false;
        }
        for (Slot slot : existing) {
            if (slot.start().isAfter(start) && slot.start().isBefore(end) && occupancyAt(existing, slot.start()) >= cap) {
                return false;
            }
        }
        return true;
    }

    /**
     * Primera fecha (desde ahora y hasta {@code maxLeadDays} días) en la que entra un destacado de {@code days}
     * días respetando los dos topes. Vacío si en ese plazo no hay lugar.
     */
    static Optional<Instant> earliestStart(List<Slot> own, int ownCap, List<Slot> all, int globalCap,
                                           Instant now, int days, int maxLeadDays) {
        Instant limit = now.plus(maxLeadDays, ChronoUnit.DAYS);
        TreeSet<Instant> candidates = new TreeSet<>();
        candidates.add(now);
        for (Slot slot : all) {
            addIfInRange(candidates, slot.end(), now, limit);
        }
        for (Slot slot : own) {
            addIfInRange(candidates, slot.end(), now, limit);
        }
        for (Instant start : candidates) {
            Instant end = start.plus(days, ChronoUnit.DAYS);
            if (fits(own, ownCap, start, end) && fits(all, globalCap, start, end)) {
                return Optional.of(start);
            }
        }
        return Optional.empty();
    }

    private static void addIfInRange(TreeSet<Instant> candidates, Instant at, Instant now, Instant limit) {
        if (at.isAfter(now) && !at.isAfter(limit)) {
            candidates.add(at);
        }
    }

    private static long occupancyAt(List<Slot> slots, Instant at) {
        return slots.stream().filter(s -> !s.start().isAfter(at) && s.end().isAfter(at)).count();
    }
}
