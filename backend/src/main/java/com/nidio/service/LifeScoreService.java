package com.nidio.service;

import com.nidio.dto.CustomPlaceScoreDto;
import com.nidio.dto.LifeScoreCategoryResult;
import com.nidio.dto.LifeScoreRequest;
import com.nidio.dto.LifeScoreResponse;
import com.nidio.dto.LifeScoreSummaryResponse;
import com.nidio.dto.LocationDto;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.CustomPlace;
import com.nidio.model.LifeScoreCategoryWeight;
import com.nidio.model.LifeScoreQuery;
import com.nidio.model.POICategory;
import com.nidio.model.User;
import com.nidio.repository.CustomPlaceRepository;
import com.nidio.repository.LifeScoreCategoryWeightRepository;
import com.nidio.repository.LifeScoreQueryRepository;
import com.nidio.repository.UserRepository;
import com.nidio.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class LifeScoreService {

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    // "Mis lugares": a partir de esta distancia el score de un lugar
    // personal es 100 (rango caminable); decae linealmente hasta 0 al llegar
    // al radio de "cercanía aceptable" que eligió el usuario (ver decayScore).
    private static final double CUSTOM_PLACE_FULL_SCORE_M = 400;
    private static final double DEFAULT_CUSTOM_PLACE_RADIUS_KM = 2.0;
    private static final double MIN_CUSTOM_PLACE_RADIUS_KM = 1.0;
    private static final double MAX_CUSTOM_PLACE_RADIUS_KM = 3.0;

    // Solo se señala una categoría como "lo que más baja el puntaje" si al
    // usuario realmente le importa (peso alto) y encima está floja (score
    // bajo) -- si le puso peso 1, no tiene sentido decirle que "le bajó el
    // puntaje", porque casi no cuenta en el promedio.
    private static final int NEGATIVE_DRIVER_MIN_WEIGHT = 3;
    private static final int NEGATIVE_DRIVER_MAX_SCORE = 50;

    private static final Map<POICategory, String> CATEGORY_LABEL_ES = Map.of(
            POICategory.TRANSPORT, "Transporte",
            POICategory.COMMERCE, "Comercios",
            POICategory.GREEN_SPACE, "Espacios verdes",
            POICategory.HEALTH, "Salud",
            POICategory.GASTRONOMY, "Gastronomía",
            POICategory.NIGHTLIFE, "Vida nocturna",
            POICategory.EDUCATION, "Educación"
    );

    private final LifeScoreQueryRepository lifeScoreQueryRepository;
    private final LifeScoreCategoryWeightRepository lifeScoreCategoryWeightRepository;
    private final CustomPlaceRepository customPlaceRepository;
    private final UserRepository userRepository;
    private final MlServiceClient mlServiceClient;

    @Transactional
    public LifeScoreResponse calculateLifeScore(LifeScoreRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // lat/lon vienen resueltos del frontend (sugerencia real de
        // /api/addresses/search -- georef.ar -- o de una propiedad favorita
        // ya geocodificada), no del geocoder sintético de GeocodingService.
        LocationDto location = new LocationDto(request.getLat(), request.getLon());

        MlServiceClient.LifeScoreMlResponse mlResponse = mlServiceClient.lifeScore(
                new MlServiceClient.LifeScoreMlRequest(location.lat(), location.lon(), request.getWeights()));

        List<CustomPlaceScoreDto> customPlaceScores =
                scoreCustomPlaces(location, userEmail, request.getCustomPlaceRadiusKm(), request.getCustomPlaceIds());

        BigDecimal totalScore = blendTotalScore(
                mlResponse.totalScore(), request.getWeights(), customPlaceScores, request.getCustomPlaceWeight());

        LifeScoreQuery query = LifeScoreQuery.builder()
                .user(user)
                .address(request.getAddress())
                .location(GEOMETRY_FACTORY.createPoint(new Coordinate(location.lon(), location.lat())))
                .totalScore(totalScore)
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
                    return new LifeScoreCategoryResult(c.category(), weight, c.poiCount(), c.pois(), c.score());
                })
                .toList();

        String explanation = buildExplanation(totalScore, categories, customPlaceScores, request.getCustomPlaceWeight());

        return new LifeScoreResponse(query.getId(), totalScore, location, categories, customPlaceScores, explanation);
    }

    @Transactional(readOnly = true)
    public List<LifeScoreSummaryResponse> listQueries(String userEmail) {
        return lifeScoreQueryRepository.findTop20ByUserEmailOrderByCreatedAtDesc(userEmail).stream()
                .map(q -> new LifeScoreSummaryResponse(
                        q.getId(), q.getAddress(), q.getTotalScore(), q.getCreatedAt()))
                .toList();
    }

    // Se calcula acá (Java), no en ml-service: son puntos propios del
    // usuario, sin ninguna consulta a OSM/Overpass de por medio, así que no
    // tiene sentido cruzar el servicio Python para un simple Haversine.
    // findByUserEmailOrderByCreatedAtDesc siempre trae TODOS los lugares del
    // usuario -- el filtro por cuáles usar en esta consulta puntual
    // (selectedIds) se aplica acá, en memoria, y no en la query, porque el
    // tope de 15 lugares (CustomPlaceService.MAX_PLACES_PER_USER) hace que el
    // costo de traerlos todos sea insignificante. selectedIds == null
    // significa "no se mandó selección" -> se usan todos (compatibilidad
    // hacia atrás, ver LifeScoreRequest.customPlaceIds); una lista vacía
    // significa "el usuario destildó todos" -> no se usa ninguno. Los IDs que
    // no le pertenezcan al usuario autenticado (ej. alguien mandando un ID
    // ajeno a mano) se ignoran en silencio, porque el filtro es contra la
    // lista que YA viene scopeada por userEmail, nunca contra la tabla entera.
    private List<CustomPlaceScoreDto> scoreCustomPlaces(
            LocationDto location, String userEmail, Double requestedRadiusKm, List<Long> selectedIds) {
        double radiusKm = requestedRadiusKm == null
                ? DEFAULT_CUSTOM_PLACE_RADIUS_KM
                : Math.min(MAX_CUSTOM_PLACE_RADIUS_KM, Math.max(MIN_CUSTOM_PLACE_RADIUS_KM, requestedRadiusKm));
        double radiusM = radiusKm * 1000;

        List<CustomPlace> places = customPlaceRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
        if (selectedIds != null) {
            Set<Long> selected = new HashSet<>(selectedIds);
            places = places.stream().filter(p -> selected.contains(p.getId())).toList();
        }

        return places.stream()
                .map(place -> {
                    double placeLat = Double.parseDouble(place.getLat());
                    double placeLon = Double.parseDouble(place.getLon());
                    double distanceM = GeoUtils.haversineMeters(location.lat(), location.lon(), placeLat, placeLon);
                    return new CustomPlaceScoreDto(
                            place.getId(),
                            place.getLabel(),
                            place.getAddress(),
                            placeLat,
                            placeLon,
                            Math.round(distanceM),
                            decayScore(distanceM, radiusM));
                })
                .toList();
    }

    private static int decayScore(double distanceM, double radiusM) {
        if (distanceM <= CUSTOM_PLACE_FULL_SCORE_M) return 100;
        if (distanceM >= radiusM) return 0;
        double fraction = (radiusM - distanceM) / (radiusM - CUSTOM_PLACE_FULL_SCORE_M);
        return (int) Math.round(fraction * 100);
    }

    // Combina el subtotal de las 7 categorías fijas (ya viene ponderado desde
    // ml-service, es el índice "objetivo" del entorno) con "mis lugares"
    // tratados como una categoría más (la capa "personalizada"), pesando el
    // subtotal por la SUMA de los pesos que ya representa -- es la
    // generalización exacta de un promedio ponderado de promedios
    // ponderados, no una aproximación:
    //   total = (categoriesTotal * Σweights_1..7 + customAvg * customWeight)
    //           / (Σweights_1..7 + customWeight)
    // Si el usuario no cargó lugares personales, o no les puso peso, el total
    // queda exactamente igual al de las 7 categorías (compatibilidad).
    private static BigDecimal blendTotalScore(
            BigDecimal categoriesTotal, Map<POICategory, Integer> weights,
            List<CustomPlaceScoreDto> customPlaceScores, Integer customPlaceWeight) {
        if (customPlaceScores.isEmpty() || customPlaceWeight == null || customPlaceWeight <= 0) {
            return categoriesTotal;
        }
        double categoriesWeightSum = weights.values().stream().mapToInt(Integer::intValue).sum();
        double customAvg = customPlaceScores.stream().mapToInt(CustomPlaceScoreDto::score).average().orElse(0);
        double blended = (categoriesTotal.doubleValue() * categoriesWeightSum + customAvg * customPlaceWeight)
                / (categoriesWeightSum + customPlaceWeight);
        return BigDecimal.valueOf(blended).setScale(2, RoundingMode.HALF_UP);
    }

    // Explicación en texto plano, no un desglose numérico: el cálculo es una
    // fórmula transparente (promedio ponderado), a diferencia del XGBoost de
    // tasación (una caja negra que sí necesita SHAP para estimar
    // contribuciones). Acá la contribución de cada categoría ya es exacta
    // (peso × score de esa categoría, ver ml-service/src/geo/life_score.py),
    // así que alcanza con contarla en palabras en vez de mostrar la cuenta.
    private static String buildExplanation(
            BigDecimal totalScore, List<LifeScoreCategoryResult> categories,
            List<CustomPlaceScoreDto> customPlaceScores, Integer customPlaceWeight) {
        List<LifeScoreCategoryResult> weighted = categories.stream()
                .filter(c -> c.weight() > 0 && c.score() > 0)
                .toList();
        // Cuántas categorías empatan en el primer puesto (weight*score máximo).
        // Caso real (Pili, 13/08/2026): puso el mismo peso mínimo a las 7
        // categorías, y las 7 dieron 100 -- empate séxtuple/séptuple total.
        // Elegir 2 "ganadoras" con .limit(2) sobre un sort estable en ese
        // caso no elige nada: devuelve las 2 primeras en el orden fijo en
        // que vienen de ml-service (TRANSPORT, COMMERCE, ...), dando la
        // falsa impresión de que esas dos importan más que las demás,
        // cuando en realidad las 7 están exactamente empatadas.
        int maxWeightedScore = weighted.stream().mapToInt(c -> c.weight() * c.score()).max().orElse(0);
        List<LifeScoreCategoryResult> topTied = weighted.stream()
                .filter(c -> c.weight() * c.score() == maxWeightedScore)
                .toList();
        LifeScoreCategoryResult negative = categories.stream()
                .filter(c -> c.weight() >= NEGATIVE_DRIVER_MIN_WEIGHT && c.score() < NEGATIVE_DRIVER_MAX_SCORE)
                .min(Comparator.comparingInt(LifeScoreCategoryResult::score))
                .orElse(null);

        StringBuilder sb = new StringBuilder("Tu puntaje de ")
                .append(totalScore.setScale(0, RoundingMode.HALF_UP));
        if (weighted.isEmpty()) {
            sb.append(" no tiene ninguna categoría que se destaque especialmente");
        } else if (topTied.size() > 2) {
            sb.append(" refleja una cobertura pareja en todas las categorías a las que le diste peso");
        } else {
            List<LifeScoreCategoryResult> positives = weighted.stream()
                    .sorted(Comparator.comparingInt((LifeScoreCategoryResult c) -> c.weight() * c.score()).reversed())
                    .limit(2)
                    .toList();
            sb.append(" se apoya principalmente en ").append(joinLabels(positives));
        }
        if (negative != null) {
            sb.append(". ").append(CATEGORY_LABEL_ES.get(negative.category()))
                    .append(" es lo que más lo baja: hay pocos lugares de ese tipo cerca, aunque le diste bastante peso");
        }
        sb.append(".");

        if (customPlaceWeight != null && customPlaceWeight > 0 && !customPlaceScores.isEmpty()) {
            double avgDistanceM = customPlaceScores.stream()
                    .mapToLong(CustomPlaceScoreDto::distanceM)
                    .average()
                    .orElse(0);
            // "Mis lugares" como posible driver negativo, con el mismo
            // criterio que una categoría fija (peso relevante + score
            // bajo, ver "negative" arriba) -- sin esto, un caso real (Pili,
            // 13/08/2026: las 7 categorías en 100 pero un lugar personal a
            // ~4.8km, fuera del radio de "cercanía aceptable" elegido)
            // mostraba "tu puntaje de 88 se apoya en X e Y" sin explicar
            // por qué no era 100 si todo sonaba perfecto -- el texto
            // omitía justo la única razón real de la diferencia.
            double avgCustomScore = customPlaceScores.stream()
                    .mapToInt(CustomPlaceScoreDto::score)
                    .average()
                    .orElse(0);
            boolean customPlacesHurt = customPlaceWeight >= NEGATIVE_DRIVER_MIN_WEIGHT
                    && avgCustomScore < NEGATIVE_DRIVER_MAX_SCORE;
            sb.append(" También se tuvieron en cuenta tus ").append(customPlaceScores.size())
                    .append(customPlaceScores.size() == 1 ? " lugar personal" : " lugares personales")
                    .append(", a un promedio de ").append(Math.round(avgDistanceM)).append(" m");
            if (customPlacesHurt) {
                sb.append(" — bastante lejos del radio de \"cercanía aceptable\" que elegiste, así que le restan puntos al promedio final");
            }
            sb.append(" — son datos privados y cifrados, solo vos podés verlos.");
        }
        return sb.toString();
    }

    private static String joinLabels(List<LifeScoreCategoryResult> items) {
        List<String> labels = items.stream().map(c -> CATEGORY_LABEL_ES.get(c.category())).toList();
        return labels.size() == 1 ? labels.get(0) : String.join(" y ", labels);
    }
}
