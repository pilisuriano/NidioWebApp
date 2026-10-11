package com.nidio.service;

import com.nidio.repository.PropertyNoiseRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Al arrancar, calcula en segundo plano el ruido de las propiedades que no lo
 * tienen con la versión de datasets vigente (el catálogo inicial, las
 * publicadas con ml-service caído o las calculadas con datos anteriores). No
 * demora el arranque; reintenta unas veces por si ml-service todavía está
 * despertando (arranque en frío conjunto en Render).
 */
@Slf4j
@Component
public class PropertyNoiseBackfillRunner implements ApplicationRunner {

    private static final int MAX_ATTEMPTS = 6;
    private static final long WAIT_BETWEEN_ATTEMPTS_MS = 20_000;

    private final PropertyNoiseRepository repository;
    private final PropertyNoiseService service;
    private final boolean enabled;

    public PropertyNoiseBackfillRunner(
            PropertyNoiseRepository repository,
            PropertyNoiseService service,
            @Value("${app.noise.backfill-on-startup:true}") boolean enabled) {
        this.repository = repository;
        this.service = service;
        this.enabled = enabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }
        Thread worker = new Thread(this::backfill, "property-noise-backfill");
        worker.setDaemon(true);
        worker.start();
    }

    void backfill() {
        String version = service.getDatasetsVersion();
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            List<Long> missing = repository.findPropertyIdsMissingNoise(version);
            if (missing.isEmpty()) {
                log.info("Ruido por propiedad: todas las propiedades tienen su ruido calculado.");
                return;
            }
            log.info("Ruido por propiedad: faltan {} propiedades (intento {}/{}).",
                    missing.size(), attempt, MAX_ATTEMPTS);
            for (Long id : missing) {
                if (!service.computeAndStoreById(id)) {
                    break; // ml-service no responde: no insistir con cada propiedad
                }
            }
            if (repository.findPropertyIdsMissingNoise(version).isEmpty()) {
                log.info("Ruido por propiedad: relleno completo.");
                return;
            }
            try {
                Thread.sleep(WAIT_BETWEEN_ATTEMPTS_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
        log.warn("Ruido por propiedad: quedaron propiedades sin calcular; se reintenta en el próximo arranque.");
    }
}
