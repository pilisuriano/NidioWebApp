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
        // 150s (antes 100s, antes 30s, antes 8s -- Ronda 16, 18/08/2026):
        // /life-score consulta Overpass/OSM de verdad (ver
        // ml-service/src/geo/life_score.py), y ese lado tiene: (a) su propio
        // timeout por intento en 45s (ox.settings.requests_timeout,
        // confirmado insuficiente en 25s con un caso real de Pili -- una
        // consulta fría en zona densa tardó y falló), y (b) reintenta contra
        // un segundo endpoint (mirror) si el primero falla
        // (_OVERPASS_ENDPOINTS). Peor caso teórico del lado Python: ~90s
        // (dos intentos de 45s), sin contar el resto del procesamiento
        // (parseo de OSMnx, cálculo de "Mis lugares", serialización). 100s
        // resultó insuficiente en la práctica: Pili confirmó un caso real
        // (18/08/2026) con los dos endpoints de Overpass lentos ese día --
        // no caídos, solo lentos -- donde este cliente cortaba la conexión
        // ANTES de que ml-service terminara de responder, lo que produce
        // exactamente el error "Error while extracting response ... content
        // type [application/octet-stream]" (Spring intentando parsear una
        // conexión cortada a mitad de camino como si fuera la respuesta).
        // 150s le da margen real por encima del peor caso de 90s del lado
        // Python. Sigue siendo un peor caso, no lo típico -- la mayoría de
        // las consultas (sobre todo con caché tibio) responden en pocos
        // segundos. /predict (XGBoost) sigue siendo rápido, así que
        // compartir este timeout más generoso no le cuesta nada.
        requestFactory.setReadTimeout(Duration.ofSeconds(150));
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
            // Timeout real de red (conexión o lectura) contra ml-service --
            // el caso ya documentado de "ambos endpoints de Overpass lentos
            // ese día" (ver el comentario del readTimeout más arriba):
            // ml-service sigue esperando su propio timeout (hasta ~90s) y
            // este cliente corta antes de que llegue a responder. Mensaje
            // separado del genérico de abajo porque acá SÍ sabemos la causa
            // real (timeout, no una respuesta rota) y podemos explicarla en
            // términos que un usuario final entienda, en vez de exponer el
            // texto técnico crudo de la excepción.
            throw new MlServiceException(
                    "El cálculo del Life Score está tardando más de lo esperado porque depende de un "
                            + "servicio externo (OpenStreetMap). Probá de nuevo en unos segundos.");
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
