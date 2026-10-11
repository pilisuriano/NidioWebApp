package com.nidio.service;

import com.nidio.repository.PropertyRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Al arrancar, tasa en segundo plano las publicaciones que no tienen rango de tasación guardado
 * (los avisos demo antiguos o los publicados con ml-service caído). Sin ese rango el mapa y la
 * ficha no pueden mostrar la etiqueta EN RANGO / SUBVALUADA / SOBREVALUADA. No demora el arranque;
 * reintenta unas veces por si ml-service todavía está despertando.
 */
@Slf4j
@Component
public class PropertyValuationBackfillRunner implements ApplicationRunner {

    private static final int MAX_ATTEMPTS = 6;
    private static final long WAIT_BETWEEN_ATTEMPTS_MS = 20_000;

    private final PropertyRepository repository;
    private final PropertyService service;
    private final boolean enabled;

    public PropertyValuationBackfillRunner(
            PropertyRepository repository,
            PropertyService service,
            @Value("${app.valuation.backfill-on-startup:true}") boolean enabled) {
        this.repository = repository;
        this.service = service;
        this.enabled = enabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }
        Thread worker = new Thread(this::backfill, "property-valuation-backfill");
        worker.setDaemon(true);
        worker.start();
    }

    void backfill() {
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            List<Long> missing = repository.findIdsMissingValuation();
            if (missing.isEmpty()) {
                log.info("Tasación por propiedad: todas las publicaciones tienen su rango.");
                return;
            }
            log.info("Tasación por propiedad: faltan {} publicaciones (intento {}/{}).",
                    missing.size(), attempt, MAX_ATTEMPTS);
            for (Long id : missing) {
                if (!service.backfillValuation(id)) {
                    break; // ml-service no responde: no insistir con cada publicación
                }
            }
            if (repository.findIdsMissingValuation().isEmpty()) {
                log.info("Tasación por propiedad: relleno completo.");
                return;
            }
            try {
                Thread.sleep(WAIT_BETWEEN_ATTEMPTS_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
        log.warn("Tasación por propiedad: quedaron publicaciones sin tasar; se reintenta en el próximo arranque.");
    }
}
