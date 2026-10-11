package com.nidio.service;

import com.nidio.service.FeaturedScheduler.Slot;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class FeaturedSchedulerTest {

    private static final Instant NOW = Instant.parse("2026-10-12T12:00:00Z");
    private static final int DAYS = 7;
    private static final int LEAD = 14;

    private static Instant day(int offset) {
        return NOW.plus(offset, ChronoUnit.DAYS);
    }

    private static Slot slot(int startDay, int endDay) {
        return new Slot(day(startDay), day(endDay));
    }

    /** n destacados ya en curso (arrancaron hace 6 días) que terminan en días distintos: el primero en el día 1. */
    private static List<Slot> running(int n) {
        List<Slot> slots = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            slots.add(slot(-6, i + 1));
        }
        return slots;
    }

    @Test
    void conLugarArrancaAhora() {
        assertThat(FeaturedScheduler.earliestStart(List.of(), 2, running(3), 15, NOW, DAYS, LEAD)).contains(NOW);
    }

    @Test
    void conElCupoGlobalLlenoEsperaAQueTermineElPrimero() {
        // 15 en curso; el primero termina en el día 1.
        assertThat(FeaturedScheduler.earliestStart(List.of(), 2, running(15), 15, NOW, DAYS, LEAD)).contains(day(1));
    }

    @Test
    void conElTopeDeLaCuentaLlenoEsperaAQueTermineUnoPropio() {
        List<Slot> own = List.of(slot(-3, 4), slot(-1, 6));
        List<Slot> all = new ArrayList<>(own);
        all.addAll(running(3));
        assertThat(FeaturedScheduler.earliestStart(own, 2, all, 15, NOW, DAYS, LEAD)).contains(day(4));
    }

    @Test
    void unaReservaYaTomadaEmpujaLaFechaSiguiente() {
        // 15 en curso y alguien ya reservó el lugar que se libera en el día 1 (arranca el día 1, dura 7 días).
        List<Slot> all = new ArrayList<>(running(15));
        all.add(slot(1, 8));
        // El lugar del día 1 está tomado; el próximo que se libera es el del día 2.
        assertThat(FeaturedScheduler.earliestStart(List.of(), 2, all, 15, NOW, DAYS, LEAD)).contains(day(2));
    }

    @Test
    void noEntraSiMasAdelanteArrancaOtraReservaQueLlenaElTope() {
        // Tope 2. Hoy hay 1 en curso hasta el día 10 y otra reserva arranca el día 3 y dura hasta el 10:
        // arrancar hoy dejaría 3 simultáneos entre los días 3 y 7, así que no entra hoy.
        List<Slot> all = List.of(slot(-2, 10), slot(3, 10));
        assertThat(FeaturedScheduler.fits(all, 2, NOW, day(7))).isFalse();
        assertThat(FeaturedScheduler.earliestStart(all, 2, all, 2, NOW, DAYS, LEAD)).contains(day(10));
    }

    @Test
    void sinLugarEnElPlazoMaximoNoDevuelveNada() {
        // Todo ocupado por más de 14 días.
        List<Slot> all = List.of(slot(-1, 20), slot(-1, 21));
        assertThat(FeaturedScheduler.earliestStart(all, 2, all, 2, NOW, DAYS, LEAD)).isEmpty();
    }

    @Test
    void unaReservaFuturaNoOcupaLugarHoy() {
        // Una reserva que arranca en el día 5 no cuenta hoy: con tope 1 y esa reserva, hoy tampoco entra
        // porque la ventana de 7 días llega al día 5.
        List<Slot> all = List.of(slot(5, 12));
        assertThat(FeaturedScheduler.fits(all, 1, NOW, day(7))).isFalse();
        assertThat(FeaturedScheduler.fits(all, 1, day(12), day(19))).isTrue();
    }
}
