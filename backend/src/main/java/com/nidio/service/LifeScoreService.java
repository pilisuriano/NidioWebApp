package com.nidio.service;

import com.nidio.dto.LifeScoreCategoryResult;
import com.nidio.dto.LifeScoreRequest;
import com.nidio.dto.LifeScoreResponse;
import com.nidio.dto.LifeScoreSummaryResponse;
import com.nidio.dto.LocationDto;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.LifeScoreCategoryWeight;
import com.nidio.model.LifeScoreQuery;
import com.nidio.model.User;
import com.nidio.repository.LifeScoreCategoryWeightRepository;
import com.nidio.repository.LifeScoreQueryRepository;
import com.nidio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LifeScoreService {

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    private final LifeScoreQueryRepository lifeScoreQueryRepository;
    private final LifeScoreCategoryWeightRepository lifeScoreCategoryWeightRepository;
    private final UserRepository userRepository;
    private final GeocodingService geocodingService;
    private final MlServiceClient mlServiceClient;

    @Transactional
    public LifeScoreResponse calculateLifeScore(LifeScoreRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        LocationDto location = geocodingService.geocode(request.getAddress());

        MlServiceClient.LifeScoreMlResponse mlResponse = mlServiceClient.lifeScore(
                new MlServiceClient.LifeScoreMlRequest(location.lat(), location.lon(), request.getWeights()));

        LifeScoreQuery query = LifeScoreQuery.builder()
                .user(user)
                .address(request.getAddress())
                .location(GEOMETRY_FACTORY.createPoint(new Coordinate(location.lon(), location.lat())))
                .totalScore(mlResponse.totalScore())
                .build();
        query = lifeScoreQueryRepository.save(query);

        final LifeScoreQuery savedQuery = query;
        List<LifeScoreCategoryResult> categories = mlResponse.categories().stream()
                .map(c -> {
                    int weight = request.getWeights().getOrDefault(c.category(), 0);
                    // Se guarda el conteo por categoría, no cada POI individual (decisión de endpoints.md).
                    lifeScoreCategoryWeightRepository.save(LifeScoreCategoryWeight.builder()
                            .lifeScoreQuery(savedQuery)
                            .category(c.category())
                            .weight(weight)
                            .poiCount(c.poiCount())
                            .build());
                    return new LifeScoreCategoryResult(c.category(), weight, c.poiCount(), c.pois());
                })
                .toList();

        return new LifeScoreResponse(query.getId(), mlResponse.totalScore(), location, categories);
    }

    @Transactional(readOnly = true)
    public List<LifeScoreSummaryResponse> listQueries(String userEmail) {
        return lifeScoreQueryRepository.findTop20ByUserEmailOrderByCreatedAtDesc(userEmail).stream()
                .map(q -> new LifeScoreSummaryResponse(
                        q.getId(), q.getAddress(), q.getTotalScore(), q.getCreatedAt()))
                .toList();
    }
}
