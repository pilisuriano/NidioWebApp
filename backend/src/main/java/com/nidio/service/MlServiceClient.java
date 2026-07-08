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
        requestFactory.setReadTimeout(Duration.ofSeconds(8));
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
            Integer rooms
    ) {
    }

    public record PredictResponse(BigDecimal min, BigDecimal max) {
    }

    public record LifeScoreMlRequest(double lat, double lon, Map<POICategory, Integer> weights) {
    }

    public record LifeScoreMlCategory(POICategory category, int poiCount, List<PoiDto> pois) {
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
