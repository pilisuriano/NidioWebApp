package com.nidio.service;

import com.nidio.dto.PoiDto;
import com.nidio.exception.MlServiceException;
import com.nidio.model.OperationType;
import com.nidio.model.POICategory;
import com.nidio.model.PropertyType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
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
        // 30s. Con la versión anterior de /life-score (Overpass/OSM en vivo) este
        // timeout llegó a 150s para tolerar consultas lentas a un servicio externo.
        // Desde octubre de 2026 el Life Score se calcula con datasets locales dentro
        // de ml-service (ver ml-service/data/README.md) y responde en milisegundos,
        // así que ya no hay una espera externa que cubrir: 30s alcanza para el
        // arranque en frío de ml-service y para /predict (XGBoost).
        requestFactory.setReadTimeout(Duration.ofSeconds(30));
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
        } catch (ResourceAccessException e) {
            // Timeout real de red (conexión o lectura) contra ml-service. El
            // Life Score ya no depende de ningún servicio externo, así que el
            // motivo probable es que ml-service esté reiniciando o caído.
            throw new MlServiceException(
                    "El servicio de cálculo del Life Score no respondió a tiempo. "
                            + "Probá de nuevo en unos segundos.");
        } catch (RestClientException e) {
            // Incluye UnknownContentTypeException ("Error while extracting
            // response ... content type [application/octet-stream]"): pasa
            // cuando la conexión se corta a mitad de camino (mismo
            // escenario del catch de arriba, pero detectado más tarde, del
            // lado de la deserialización en vez del lado del socket) y lo
            // que llega no es el JSON esperado. Se mantiene el mensaje
            // técnico acá porque es un caso menos frecuente y más útil de
            // loguear tal cual para diagnosticar si vuelve a pasar.
            throw new MlServiceException("ml-service no responde (/life-score): " + e.getMessage());
        }
    }
}
