package com.nidio.service;

import com.nidio.dto.PoiDto;
import com.nidio.exception.MlServiceException;
import com.nidio.model.OperationType;
import com.nidio.model.POICategory;
import com.nidio.model.PropertyType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Cliente HTTP hacia ml-service (POST /predict y POST /life-score).
 * Cualquier error de red o respuesta inválida se traduce a {@link MlServiceException} (502).
 */
@Component
public class MlServiceClient {

    private final RestClient restClient;

    public MlServiceClient(@Value("${app.ml-service.base-url}") String baseUrl) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(2));
        // 100s (antes 30s, antes 8s -- Ronda 6, 13/08/2026): /life-score
        // consulta Overpass/OSM de verdad (ver
        // ml-service/src/geo/life_score.py), y ese lado ahora: (a) tiene su
        // propio timeout por intento en 45s (ox.settings.requests_timeout,
        // confirmado insuficiente en 25s con un caso real de Pili -- una
        // consulta fría en zona densa tardó y falló), y (b) reintenta
        // automáticamente una vez si el primer intento falla
        // (_MAX_FETCH_ATTEMPTS). Peor caso teórico del lado Python: ~90s
        // (dos intentos de 45s). 100s acá le da margen para que sea
        // ml-service quien corte primero con un error explicado, en vez de
        // que este cliente corte a mitad del reintento y tire un timeout
        // igual aunque el segundo intento hubiera funcionado. Es un peor
        // caso, no lo típico -- la mayoría de las consultas (sobre todo ya
        // con caché tibio) responden en pocos segundos. /predict (XGBoost)
        // sigue siendo rápido, así que compartir este timeout más generoso
        // no le cuesta nada.
        requestFactory.setReadTimeout(Duration.ofSeconds(100));
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
    }

    public record PredictRequest(
            OperationType operationType,
            PropertyType propertyType,
            String neighborhood,
            BigDecimal surfaceM2,
            Integer rooms,
            BigDecimal totalSurfaceM2,
            Integer bathrooms,
            String propertyCondition,
            BigDecimal expensesUsd,
            Boolean hasPool,
            Boolean hasGarage,
            Boolean buildingAmenities,
            Boolean security24h,
            Boolean bright,
            Boolean aptoCredito,
            Boolean furnished,
            BigDecimal declaredPrice
    ) {
    }

    public record ExplanationFactor(String factor, BigDecimal contribution, String direction) {
    }

    public record PredictResponse(BigDecimal min, BigDecimal max, List<ExplanationFactor> explanation, String explanationText) {
    }

    public record LifeScoreMlRequest(double lat, double lon, Map<POICategory, Integer> weights) {
    }

    // score: 0-100, densidad de esta categoría sola (ver ml-service/src/geo/life_score.py).
    public record LifeScoreMlCategory(POICategory category, int poiCount, List<PoiDto> pois, int score) {
    }

    public record LifeScoreMlResponse(BigDecimal totalScore, List<LifeScoreMlCategory> categories) {
    }

    public PredictResponse predict(PredictRequest request) {
        try {
            PredictResponse response = restClient.post()
                    .uri("/predict")
                    .body(request)
                    .retrieve()
                    .body(PredictResponse.class);
            if (response == null || response.min() == null || response.max() == null) {
                throw new MlServiceException("ml-service devolvió una respuesta inválida para /predict");
            }
            return response;
        } catch (RestClientException e) {
            throw new MlServiceException("ml-service no responde (/predict): " + e.getMessage());
        }
    }

    public LifeScoreMlResponse lifeScore(LifeScoreMlRequest request) {
        try {
            LifeScoreMlResponse response = restClient.post()
                    .uri("/life-score")
                    .body(request)
                    .retrieve()
                    .body(LifeScoreMlResponse.class);
            if (response == null || response.totalScore() == null || response.categories() == null) {
                throw new MlServiceException("ml-service devolvió una respuesta inválida para /life-score");
            }
            return response;
        } catch (RestClientException e) {
            throw new MlServiceException("ml-service no responde (/life-score): " + e.getMessage());
        }
    }
}
