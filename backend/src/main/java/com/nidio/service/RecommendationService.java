package com.nidio.service;

import com.nidio.dto.BudgetRangeDto;
import com.nidio.dto.RecommendationRequest;
import com.nidio.dto.RecommendationResponse;
import com.nidio.dto.RecommendationResponse.RecommendationItem;
import com.nidio.model.OperationType;
import com.nidio.model.POICategory;
import com.nidio.model.Property;
import com.nidio.model.PropertyLifeScoreCategory;
import com.nidio.repository.NoiseZoneRepository;
import com.nidio.repository.PropertyLifeScoreCategoryRepository;
import com.nidio.repository.PropertyRepository;
import com.nidio.repository.SecurityZoneRepository;
import com.nidio.service.RecommendationEngine.Candidate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Arma el catálogo para el motor ({@link RecommendationEngine}) con los datos de la base:
 * propiedades activas de la operación pedida, sus 7 puntajes de Life Score por categoría
 * (tabla property_life_score_category) y el ruido y la seguridad de su barrio (capas
 * noise_zone y security_zone). Una propiedad a la que le falta alguno de esos datos no
 * entra al recomendador. No guarda las respuestas del usuario.
 */
@Slf4j
@Service
public class RecommendationService {

    private final PropertyRepository propertyRepository;
    private final PropertyLifeScoreCategoryRepository lifeScoreRepository;
    private final NoiseZoneRepository noiseZoneRepository;
    private final SecurityZoneRepository securityZoneRepository;
    private final PropertyService propertyService;
    private final RecommendationEngine engine = new RecommendationEngine();

    public RecommendationService(
            PropertyRepository propertyRepository,
            PropertyLifeScoreCategoryRepository lifeScoreRepository,
            NoiseZoneRepository noiseZoneRepository,
            SecurityZoneRepository securityZoneRepository,
            PropertyService propertyService) {
        this.propertyRepository = propertyRepository;
        this.lifeScoreRepository = lifeScoreRepository;
        this.noiseZoneRepository = noiseZoneRepository;
        this.securityZoneRepository = securityZoneRepository;
        this.propertyService = propertyService;
    }

    private record Catalog(List<Candidate> candidates, Map<Long, Property> propertiesById) {
    }

    @Transactional(readOnly = true)
    public RecommendationResponse recommend(RecommendationRequest request) {
        Catalog catalog = buildCatalog(request.getOperationType(), request.getBlueRate());
        RecommendationEngine.Result result = engine.recommend(request, catalog.candidates());

        List<RecommendationItem> items = new ArrayList<>();
        for (RecommendationEngine.Scored scored : result.items()) {
            Property property = catalog.propertiesById().get(scored.candidate().id());
            Double workKm = null;
            if (request.getWorkLat() != null && request.getWorkLon() != null
                    && scored.candidate().lat() != null && scored.candidate().lon() != null) {
                workKm = BigDecimal.valueOf(RecommendationEngine.distanceKm(
                        scored.candidate().lat(), scored.candidate().lon(), request.getWorkLat(), request.getWorkLon()))
                        .setScale(2, RoundingMode.HALF_UP).doubleValue();
            }
            items.add(new RecommendationItem(
                    propertyService.toSummary(property),
                    scored.score(),
                    scored.priceStatus().name(),
                    scored.reasons(),
                    scored.tradeoff(),
                    scored.explanation(),
                    workKm));
        }
        return new RecommendationResponse(items, result.broadened(), result.message());
    }

    /**
     * Precios reales (ordenados de menor a mayor) de las propiedades activas de la operación: con ellos la
     * pantalla arma la barra de presupuesto y cuenta cuántas propiedades entran en cada tope, sin inventar montos.
     */
    @Transactional(readOnly = true)
    public List<BigDecimal> budgetPrices(OperationType operationType) {
        List<BigDecimal> prices = new ArrayList<>();
        for (Property p : propertyRepository.findActiveByOperationType(operationType)) {
            prices.add(p.getPrice());
        }
        prices.sort(Comparator.naturalOrder());
        return prices;
    }

    /**
     * Cuatro tramos de presupuesto a partir de los cuartiles de los precios reales del catálogo
     * de la operación (no se inventan montos). Si hay pocos precios distintos, hay menos tramos.
     */
    @Transactional(readOnly = true)
    public List<BudgetRangeDto> budgetRanges(OperationType operationType) {
        List<BigDecimal> prices = new ArrayList<>();
        for (Property p : propertyRepository.findActiveByOperationType(operationType)) {
            prices.add(p.getPrice());
        }
        prices.sort(Comparator.naturalOrder());
        List<BudgetRangeDto> ranges = new ArrayList<>();
        if (prices.isEmpty()) {
            ranges.add(new BudgetRangeDto(null, null));
            return ranges;
        }
        List<BigDecimal> cuts = new ArrayList<>();
        for (double q : new double[]{25, 50, 75}) {
            BigDecimal cut = prices.get(nearestRankIndex(q, prices.size()));
            if (cuts.isEmpty() || cuts.get(cuts.size() - 1).compareTo(cut) != 0) {
                cuts.add(cut);
            }
        }
        BigDecimal previous = null;
        for (BigDecimal cut : cuts) {
            ranges.add(new BudgetRangeDto(previous, cut));
            previous = cut;
        }
        ranges.add(new BudgetRangeDto(previous, null));
        return ranges;
    }

    // ----------------------------------------------------------- catálogo

    private Catalog buildCatalog(OperationType operationType, BigDecimal blueRate) {
        List<Property> properties = propertyRepository.findActiveByOperationType(operationType);
        if (properties.isEmpty()) {
            return new Catalog(List.of(), Map.of());
        }
        List<Long> ids = new ArrayList<>();
        for (Property p : properties) {
            ids.add(p.getId());
        }

        Map<Long, Map<POICategory, Integer>> scoresByProperty = new HashMap<>();
        for (PropertyLifeScoreCategory row : lifeScoreRepository.findByPropertyIdIn(ids)) {
            scoresByProperty
                    .computeIfAbsent(row.getPropertyId(), k -> new EnumMap<>(POICategory.class))
                    .put(row.getCategory(), row.getScore());
        }
        Map<Long, Double> noiseByNeighborhood = averageByNeighborhood(noiseZoneRepository.findNoiseLevelsByNeighborhood());
        Map<Long, Double> securityByNeighborhood =
                averageByNeighborhood(securityZoneRepository.findSecurityIndexByNeighborhood());

        List<Property> usable = new ArrayList<>();
        for (Property p : properties) {
            Long neighborhoodId = p.getNeighborhood().getId();
            Map<POICategory, Integer> scores = scoresByProperty.get(p.getId());
            if (scores != null && scores.size() == POICategory.values().length
                    && noiseByNeighborhood.containsKey(neighborhoodId)
                    && securityByNeighborhood.containsKey(neighborhoodId)) {
                usable.add(p);
            }
        }
        if (usable.size() < properties.size()) {
            log.info("Recomendador: {} de {} propiedades quedan afuera por no tener Life Score por categoría, "
                    + "ruido o seguridad del barrio.", properties.size() - usable.size(), properties.size());
        }

        // Posición de cada barrio entre los barrios del catálogo (100 = más seguro / más silencioso).
        Map<Long, Double> securityValues = new LinkedHashMap<>();
        Map<Long, Double> quietValues = new LinkedHashMap<>(); // dB negativo: menos ruido, más puntaje
        for (Property p : usable) {
            Long n = p.getNeighborhood().getId();
            securityValues.put(n, securityByNeighborhood.get(n));
            quietValues.put(n, -noiseByNeighborhood.get(n));
        }
        List<Double> sortedSecurity = sortedValues(securityValues);
        List<Double> sortedQuiet = sortedValues(quietValues);

        List<Candidate> candidates = new ArrayList<>();
        Map<Long, Property> byId = new HashMap<>();
        for (Property p : usable) {
            Long n = p.getNeighborhood().getId();
            Double lat = p.getLocation() == null ? null : p.getLocation().getY();
            Double lon = p.getLocation() == null ? null : p.getLocation().getX();
            candidates.add(new Candidate(
                    p.getId(), p.getPropertyType(), p.getPrice(), priceInUsd(p, operationType, blueRate), p.getRooms(),
                    p.getValuationRangeMin(), p.getValuationRangeMax(),
                    scoresByProperty.get(p.getId()),
                    percentRank(securityValues.get(n), sortedSecurity),
                    percentRank(quietValues.get(n), sortedQuiet),
                    lat, lon,
                    Boolean.TRUE.equals(p.getBright()),
                    Boolean.TRUE.equals(p.getHasGarage()),
                    Boolean.TRUE.equals(p.getHasPool()) || Boolean.TRUE.equals(p.getBuildingAmenities()),
                    Boolean.TRUE.equals(p.getFurnished()),
                    Boolean.TRUE.equals(p.getAptoCredito()),
                    n));
            byId.put(p.getId(), p);
        }
        return new Catalog(candidates, byId);
    }

    /**
     * Precio en dólares para compararlo con el rango de valuación (que está en USD): en venta ya está
     * en USD; en alquiler está en pesos y se convierte con la cotización del pedido (la misma que usa
     * la ficha de la propiedad). Sin cotización válida devuelve null (el precio no se evalúa).
     */
    static BigDecimal priceInUsd(Property property, OperationType operationType, BigDecimal blueRate) {
        if (operationType == OperationType.SALE) {
            return property.getPrice();
        }
        if (blueRate == null || blueRate.signum() <= 0) {
            return null;
        }
        return property.getPrice().divide(blueRate, 2, java.math.RoundingMode.HALF_UP);
    }

    /** Promedio por barrio (normalmente hay una zona por barrio; si hubiera más, se promedian). */
    private static Map<Long, Double> averageByNeighborhood(List<Object[]> rows) {
        Map<Long, double[]> acc = new HashMap<>(); // [suma, cantidad]
        for (Object[] row : rows) {
            Long id = (Long) row[0];
            double value = ((BigDecimal) row[1]).doubleValue();
            double[] a = acc.computeIfAbsent(id, k -> new double[2]);
            a[0] += value;
            a[1] += 1;
        }
        Map<Long, Double> out = new HashMap<>();
        for (Map.Entry<Long, double[]> e : acc.entrySet()) {
            out.put(e.getKey(), e.getValue()[0] / e.getValue()[1]);
        }
        return out;
    }

    private static List<Double> sortedValues(Map<Long, Double> byNeighborhood) {
        List<Double> sorted = new ArrayList<>(byNeighborhood.values());
        sorted.sort(Double::compare);
        return sorted;
    }

    /** 0-100: proporción de barrios con valor menor, contando los empates como medio punto. */
    static double percentRank(double value, List<Double> sorted) {
        if (sorted.isEmpty()) {
            return 50;
        }
        int less = 0;
        int equal = 0;
        for (double v : sorted) {
            if (v < value) {
                less++;
            } else if (v == value) {
                equal++;
            }
        }
        return 100.0 * (less + 0.5 * equal) / sorted.size();
    }

    static int nearestRankIndex(double percentile, int size) {
        int index = (int) Math.ceil(percentile / 100.0 * size) - 1;
        return Math.max(0, Math.min(size - 1, index));
    }
}
