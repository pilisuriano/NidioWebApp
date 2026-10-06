package com.nidio.service;

import com.nidio.repository.PropertyLifeScoreCategoryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Al arrancar, calcula en segundo plano los puntajes por categoría de las
 * propiedades que no los tienen (las del catálogo inicial, o las publicadas
 * mientras ml-service estaba caído). No demora el arranque. Si ml-service
 * todavía no responde (arranque en frío conjunto en Render) reintenta unas
 * veces y después se rinde: el próximo arranque lo vuelve a intentar.
 */
@Slf4j
@Component
public class LifeScoreBackfillRunner implements ApplicationRunner {

    private static final int MAX_ATTEMPTS = 6;
    private static final long WAIT_BETWEEN_ATTEMPTS_MS = 20_000;

    private final PropertyLifeScoreCategoryRepository repository;
    private final PropertyLifeScoreService service;
    private final boolean enabled;

    public LifeScoreBackfillRunner(
            PropertyLifeScoreCategoryRepository repository,
            PropertyLifeScoreService service,
            @Value("${app.life-score.backfill-on-startup:true}") boolean enabled) {
        this.repository = repository;
        this.service = service;
        this.enabled = enabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }
        Thread worker = new Thread(this::backfill, "life-score-backfill");
        worker.setDaemon(true);
        worker.start();
    }

    void backfill() {
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            List<Long> missing = repository.findPropertyIdsMissingScores();
            if (missing.isEmpty()) {
                log.info("Life Score por categoría: todas las propiedades tienen sus puntajes.");
                return;
            }
            log.info("Life Score por categoría: faltan {} propiedades (intento {}/{}).",
                    missing.size(), attempt, MAX_ATTEMPTS);
            for (Long id : missing) {
                if (!service.computeAndStoreById(id)) {
                    break; // ml-service no responde: no insistir con cada propiedad
                }
            }
            if (repository.findPropertyIdsMissingScores().isEmpty()) {
                log.info("Life Score por categoría: relleno completo.");
                return;
            }
            try {
                Thread.sleep(WAIT_BETWEEN_ATTEMPTS_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
        log.warn("Life Score por categoría: quedaron propiedades sin puntajes; se reintenta en el próximo arranque.");
    }
}
