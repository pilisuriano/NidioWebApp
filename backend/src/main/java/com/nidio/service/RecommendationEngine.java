package com.nidio.service;

import com.nidio.dto.RecommendationRequest;
import com.nidio.dto.RecommendationRequest.Dealbreaker;
import com.nidio.dto.RecommendationRequest.Household;
import com.nidio.dto.RecommendationRequest.Importance;
import com.nidio.dto.RecommendationRequest.NoisePreference;
import com.nidio.dto.RecommendationRequest.OverpricedPolicy;
import com.nidio.model.POICategory;
import com.nidio.model.PropertyType;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

/**
 * Motor del recomendador: filtros duros + promedio ponderado por criterio, sin
 * machine learning y sin acceso a base de datos (recibe el catálogo ya cargado,
 * lo que lo hace fácil de probar). Diseño y justificación en
 * nidio-recomendador-diseno-test.md; los pesos y umbrales son decisiones de
 * diseño sin calibración empírica y se prueban con casos de sensibilidad.
 */
public class RecommendationEngine {

    public static final int RESULTS = 3;
    /** Lista ampliada para quien tiene pase de análisis o plan: las mismas primeras 3 y hasta 7 más. */
    public static final int EXTENDED_RESULTS = 10;

    // Criterio de descarte: se quitan las propiedades en el cuartil inferior del catálogo.
    // Si quedan menos de RESULTS se baja el umbral al decil inferior y, si no alcanza, se
    // quita el filtro (se avisa con "Ampliamos un poco la búsqueda").
    static final double DEALBREAKER_PERCENTILE = 25;
    static final double DEALBREAKER_PERCENTILE_RELAXED = 10;

    // Distancia al trabajo: 100 puntos hasta 0,5 km en línea recta, 0 puntos desde 8 km.
    static final double WORK_NEAR_KM = 0.5;
    static final double WORK_FAR_KM = 8.0;
    // Peso de la cercanía al trabajo según lo que elija la persona (el resto de los criterios pesa entre 1 y 5).
    static final double WORK_WEIGHT_LOW = 1.0;
    static final double WORK_WEIGHT_IMPORTANT = 2.0;
    static final double WORK_WEIGHT_KEY = 6.0;

    // Diversidad: como máximo 2 de los 3 resultados pueden ser del mismo barrio. Se agregó después de la
    // validación con el catálogo real (alquiler: 8 barrios distintos en 82 perfiles, Palermo en 57 casos);
    // ver nidio-recomendador-validacion-resultados.md. Si no alcanzan propiedades de otros barrios, se
    // completa igual con las siguientes del ranking (la regla nunca reduce la cantidad de resultados).
    static final int MAX_PER_NEIGHBORHOOD = 2;

    public enum Criterion {
        TRANSPORT, COMMERCE, GREEN_SPACE, HEALTH, GASTRONOMY, NIGHTLIFE, EDUCATION,
        SECURITY, QUIET, PRICE,
        BRIGHT, GARAGE, POOL_AMENITIES, FURNISHED, APTO_CREDITO,
        WORK
    }

    public enum PriceStatus { IN_RANGE, BELOW, ABOVE, UNKNOWN }

    /**
     * Una propiedad del catálogo con todo lo que el motor necesita.
     * price está en la moneda del aviso (USD en venta, ARS en alquiler) y sirve para el presupuesto;
     * priceUsd es el mismo precio en dólares (en alquiler, convertido con la cotización del pedido) y es
     * lo que se compara con el rango de valuación, que está en USD; null si no se puede convertir.
     * securityScore y quietScore ya vienen en escala 0-100 (posición de su barrio entre los
     * barrios del catálogo; 100 = más seguro / más silencioso).
     */
    public record Candidate(
            Long id,
            PropertyType type,
            BigDecimal price,
            BigDecimal priceUsd,
            Integer rooms,
            BigDecimal valuationMin,
            BigDecimal valuationMax,
            Map<POICategory, Integer> categoryScores,
            double securityScore,
            double quietScore,
            Double lat,
            Double lon,
            boolean bright,
            boolean garage,
            boolean poolOrAmenities,
            boolean furnished,
            boolean aptoCredito,
            Long neighborhoodId,
            BigDecimal expensesUsd
    ) {
        /** Sin expensas cargadas (null): la propiedad nunca se descarta por el tope de expensas. */
        public Candidate(Long id, PropertyType type, BigDecimal price, BigDecimal priceUsd, Integer rooms,
                         BigDecimal valuationMin, BigDecimal valuationMax,
                         Map<POICategory, Integer> categoryScores, double securityScore, double quietScore,
                         Double lat, Double lon, boolean bright, boolean garage, boolean poolOrAmenities,
                         boolean furnished, boolean aptoCredito, Long neighborhoodId) {
            this(id, type, price, priceUsd, rooms, valuationMin, valuationMax, categoryScores,
                    securityScore, quietScore, lat, lon, bright, garage, poolOrAmenities, furnished,
                    aptoCredito, neighborhoodId, null);
        }

        /** Sin barrio (null): la propiedad nunca cuenta para el tope por barrio. */
        public Candidate(Long id, PropertyType type, BigDecimal price, BigDecimal priceUsd, Integer rooms,
                         BigDecimal valuationMin, BigDecimal valuationMax,
                         Map<POICategory, Integer> categoryScores, double securityScore, double quietScore,
                         Double lat, Double lon, boolean bright, boolean garage, boolean poolOrAmenities,
                         boolean furnished, boolean aptoCredito) {
            this(id, type, price, priceUsd, rooms, valuationMin, valuationMax, categoryScores,
                    securityScore, quietScore, lat, lon, bright, garage, poolOrAmenities, furnished,
                    aptoCredito, null, null);
        }
    }

    public record Scored(
            Candidate candidate,
            int score,
            PriceStatus priceStatus,
            List<String> reasons,
            String tradeoff,
            String explanation
    ) {
    }

    /** Cuántas propiedades quedaban después de cada filtro (code: CATALOG, TYPE, BUDGET, EXPENSES, ROOMS, PRICE, DEALBREAKER). */
    public record FunnelStep(String code, int remaining) {
    }

    /** totalMatches: cuántas propiedades quedaron en el ranking (las que encajan), se muestren o no. */
    public record Result(List<Scored> items, boolean broadened, String message, List<FunnelStep> funnel,
                         int totalMatches) {
    }

    private record Entry(Criterion criterion, double weight, double score) {
    }

    // ---------------------------------------------------------------- API

    /** @param catalog todas las propiedades activas de la operación pedida, con sus puntajes completos. */
    public Result recommend(RecommendationRequest request, List<Candidate> catalog) {
        return recommend(request, catalog, RESULTS);
    }

    /**
     * @param limit cuántos resultados devolver (RESULTS o EXTENDED_RESULTS). Las primeras RESULTS son siempre las mismas
     *              sin importar el límite: ampliar la lista nunca cambia el orden ni las que ya se veían.
     */
    public Result recommend(RecommendationRequest request, List<Candidate> catalog, int limit) {
        // Filtros duros uno detrás del otro; se guarda cuántas quedan en cada paso para poder mostrar cómo se llegó al resultado.
        List<Candidate> afterType = keep(catalog, c -> passesType(request, c));
        List<Candidate> afterBudget = keep(afterType, c -> passesBudget(request, c));
        List<Candidate> afterExpenses = keep(afterBudget, c -> passesExpenses(request, c));
        List<Candidate> afterRooms = keep(afterExpenses, c -> passesRooms(request, c));
        List<Candidate> base = keep(afterRooms, c -> passesPrice(request, c));

        Criterion dealbreaker = dealbreakerCriterion(request.getDealbreaker());
        List<Candidate> pool = aboveThreshold(base, dealbreaker,
                percentile(scores(catalog, dealbreaker), DEALBREAKER_PERCENTILE));
        boolean broadened = false;
        if (pool.size() < RESULTS) {
            List<Candidate> relaxed = aboveThreshold(base, dealbreaker,
                    percentile(scores(catalog, dealbreaker), DEALBREAKER_PERCENTILE_RELAXED));
            if (relaxed.size() > pool.size()) {
                pool = relaxed;
                broadened = true;
            }
            if (pool.size() < RESULTS && base.size() > pool.size()) {
                pool = base;
                broadened = true;
            }
        }

        Map<Criterion, Double> weights = weights(request);
        List<Scored> scored = new ArrayList<>();
        for (Candidate c : pool) {
            scored.add(score(request, c, weights));
        }
        Comparator<Scored> order = Comparator
                .comparingInt((Scored s) -> request.getOverpricedPolicy() == OverpricedPolicy.LAST
                        && s.priceStatus() == PriceStatus.ABOVE ? 1 : 0)
                .thenComparing(Comparator.<Scored>comparingInt(Scored::score).reversed())
                .thenComparing(s -> s.candidate().id());
        scored.sort(order);
        List<Scored> top = pickDiverse(scored, limit);

        String message = null;
        if (broadened) {
            message = "Ampliamos un poco la búsqueda: había pocas propiedades que cumplieran "
                    + "lo que más te haría descartar una zona.";
        }
        if (top.size() < RESULTS) {
            String few = top.isEmpty()
                    ? "No encontramos propiedades con el tipo, el presupuesto y los ambientes que elegiste."
                    : "Encontramos solo " + top.size() + (top.size() == 1 ? " propiedad" : " propiedades")
                    + " con el tipo, el presupuesto y los ambientes que elegiste.";
            message = message == null ? few : message + " " + few;
        }
        List<FunnelStep> funnel = List.of(
                new FunnelStep("CATALOG", catalog.size()),
                new FunnelStep("TYPE", afterType.size()),
                new FunnelStep("BUDGET", afterBudget.size()),
                new FunnelStep("EXPENSES", afterExpenses.size()),
                new FunnelStep("ROOMS", afterRooms.size()),
                new FunnelStep("PRICE", base.size()),
                new FunnelStep("DEALBREAKER", pool.size()));
        return new Result(top, broadened, message, funnel, scored.size());
    }

    /**
     * Toma los primeros RESULTS del ranking respetando el tope por barrio; si no alcanzan, completa con
     * las que quedaron afuera, en el orden del ranking. Los resultados salen ordenados como el ranking.
     */
    static List<Scored> pickDiverse(List<Scored> ranked) {
        return pickDiverse(ranked, RESULTS);
    }

    /** Tope por barrio de una lista ampliada: el 40 % (con 10 resultados, 4 por barrio). */
    static int maxPerNeighborhood(int limit) {
        return limit <= RESULTS ? MAX_PER_NEIGHBORHOOD : (int) Math.ceil(limit * 0.4);
    }

    /**
     * Las primeras RESULTS se eligen exactamente igual que sin ampliar; el resto (hasta limit) sigue el orden del
     * ranking con el tope por barrio de la lista ampliada, y si no alcanza se completa con lo que quedó.
     */
    static List<Scored> pickDiverse(List<Scored> ranked, int limit) {
        List<Scored> chosen = pickTopDiverse(ranked);
        if (limit <= RESULTS) {
            return chosen;
        }
        int cap = maxPerNeighborhood(limit);
        Map<Long, Integer> perNeighborhood = new HashMap<>();
        for (Scored s : chosen) {
            if (s.candidate().neighborhoodId() != null) {
                perNeighborhood.merge(s.candidate().neighborhoodId(), 1, Integer::sum);
            }
        }
        for (boolean strict : new boolean[]{true, false}) {
            for (Scored s : ranked) {
                if (chosen.size() >= limit) {
                    return chosen;
                }
                if (chosen.contains(s)) {
                    continue;
                }
                Long n = s.candidate().neighborhoodId();
                if (strict && n != null && perNeighborhood.getOrDefault(n, 0) >= cap) {
                    continue;
                }
                chosen.add(s);
                if (n != null) {
                    perNeighborhood.merge(n, 1, Integer::sum);
                }
            }
        }
        return chosen;
    }

    private static List<Scored> pickTopDiverse(List<Scored> ranked) {
        List<Scored> chosen = new ArrayList<>();
        Map<Long, Integer> perNeighborhood = new HashMap<>();
        for (Scored s : ranked) {
            if (chosen.size() == RESULTS) {
                break;
            }
            Long n = s.candidate().neighborhoodId();
            if (n != null && perNeighborhood.getOrDefault(n, 0) >= MAX_PER_NEIGHBORHOOD) {
                continue;
            }
            chosen.add(s);
            if (n != null) {
                perNeighborhood.merge(n, 1, Integer::sum);
            }
        }
        if (chosen.size() < RESULTS) {
            for (Scored s : ranked) {
                if (chosen.size() == RESULTS) {
                    break;
                }
                if (!chosen.contains(s)) {
                    chosen.add(s);
                }
            }
            chosen.sort(Comparator.comparingInt(ranked::indexOf));
        }
        return chosen;
    }

    // ------------------------------------------------------- filtros duros

    static int minRooms(Household household) {
        return switch (household) {
            case SOLO -> 1;
            case COUPLE -> 2;
            case FAMILY, SHARED -> 3;
        };
    }

    /** Ambientes mínimos del pedido: lo que eligió la persona o, si no eligió, el que sugiere la convivencia. */
    static int requiredRooms(RecommendationRequest r) {
        return r.getMinRooms() != null ? r.getMinRooms() : minRooms(r.getHousehold());
    }

    private static List<Candidate> keep(List<Candidate> candidates, Predicate<Candidate> test) {
        List<Candidate> kept = new ArrayList<>();
        for (Candidate c : candidates) {
            if (test.test(c)) {
                kept.add(c);
            }
        }
        return kept;
    }

    private static boolean passesType(RecommendationRequest r, Candidate c) {
        return r.getPropertyTypes() == null || r.getPropertyTypes().isEmpty() || r.getPropertyTypes().contains(c.type());
    }

    private static boolean passesBudget(RecommendationRequest r, Candidate c) {
        if (r.getBudgetMin() != null && c.price().compareTo(r.getBudgetMin()) < 0) {
            return false;
        }
        return r.getBudgetMax() == null || c.price().compareTo(r.getBudgetMax()) <= 0;
    }

    /** Tope de expensas: sin tope pasa todo; una propiedad sin expensas cargadas nunca se descarta (no se sabe). */
    private static boolean passesExpenses(RecommendationRequest r, Candidate c) {
        return r.getExpensesMaxUsd() == null || c.expensesUsd() == null
                || c.expensesUsd().compareTo(r.getExpensesMaxUsd()) <= 0;
    }

    /** Opción de ambientes que significa "esa cantidad o más" (la última del filtro de la pantalla). */
    static final int ROOMS_OPEN_ENDED = 5;

    private static boolean passesRooms(RecommendationRequest r, Candidate c) {
        if (c.rooms() == null) {
            return false;
        }
        List<Integer> options = r.getRoomsOptions();
        if (options != null && !options.isEmpty()) {
            return options.stream().anyMatch(o -> o >= ROOMS_OPEN_ENDED ? c.rooms() >= ROOMS_OPEN_ENDED : c.rooms() == o.intValue());
        }
        return c.rooms() >= requiredRooms(r);
    }

    private static boolean passesPrice(RecommendationRequest r, Candidate c) {
        return !(r.getOverpricedPolicy() == OverpricedPolicy.HIDE && priceStatus(c) == PriceStatus.ABOVE);
    }

    static Criterion dealbreakerCriterion(Dealbreaker d) {
        return switch (d) {
            case UNSAFE -> Criterion.SECURITY;
            case LOW_TRANSPORT -> Criterion.TRANSPORT;
            case NOISY -> Criterion.QUIET;
            case FEW_SHOPS -> Criterion.COMMERCE;
        };
    }

    private List<Candidate> aboveThreshold(List<Candidate> list, Criterion criterion, double threshold) {
        List<Candidate> out = new ArrayList<>();
        for (Candidate c : list) {
            if (criterionScore(c, criterion) >= threshold) {
                out.add(c);
            }
        }
        return out;
    }

    private List<Double> scores(List<Candidate> catalog, Criterion criterion) {
        List<Double> values = new ArrayList<>();
        for (Candidate c : catalog) {
            values.add(criterionScore(c, criterion));
        }
        return values;
    }

    /** Percentil por rango más cercano; 0 si la lista está vacía (no descarta nada). */
    static double percentile(List<Double> values, double p) {
        if (values.isEmpty()) {
            return 0;
        }
        List<Double> sorted = new ArrayList<>(values);
        sorted.sort(Double::compare);
        int index = (int) Math.ceil(p / 100.0 * sorted.size()) - 1;
        return sorted.get(Math.max(0, Math.min(sorted.size() - 1, index)));
    }

    // -------------------------------------------------------------- pesos

    /** Peso de cada criterio según las respuestas. Un criterio con peso 0 no entra al promedio. */
    Map<Criterion, Double> weights(RecommendationRequest r) {
        Map<Criterion, Double> w = new EnumMap<>(Criterion.class);

        for (POICategory category : POICategory.values()) {
            Importance importance = r.getProximity() == null ? null : r.getProximity().get(category);
            double base = switch (importance == null ? Importance.IMPORTANT : importance) {
                case NOT_IMPORTANT -> 0;
                case IMPORTANT -> 1;
                case KEY -> 3;
            };
            Criterion criterion = Criterion.valueOf(category.name());
            // Ajustes por convivencia: solo si la persona no dijo que no le importa.
            if (base > 0) {
                if (r.getHousehold() == Household.FAMILY
                        && (criterion == Criterion.GREEN_SPACE || criterion == Criterion.EDUCATION)) {
                    base *= 1.5;
                }
                if (r.getHousehold() == Household.SHARED && criterion == Criterion.TRANSPORT) {
                    base *= 1.5;
                }
            }
            w.put(criterion, base);
        }

        // Seguridad: es el motivo de descarte más frecuente en la encuesta; pesa en todos los perfiles.
        w.put(Criterion.SECURITY, 2.0);
        w.put(Criterion.QUIET, switch (r.getNoisePreference()) {
            case QUIET -> 3.0;
            case TOLERANT -> 1.0;
            case LIVELY -> 0.0;
        });
        // Lo que la persona dijo que más la haría descartar una zona pesa 2 más.
        Criterion dealbreaker = dealbreakerCriterion(r.getDealbreaker());
        w.put(dealbreaker, w.get(dealbreaker) + 2.0);

        w.put(Criterion.PRICE, r.getOverpricedPolicy() == OverpricedPolicy.SHOW ? 1.0 : 2.0);

        RecommendationRequest.Details d = r.getDetails();
        w.put(Criterion.BRIGHT, d != null && Boolean.TRUE.equals(d.getBright()) ? 1.0 : 0.0);
        w.put(Criterion.GARAGE, d != null && Boolean.TRUE.equals(d.getGarage()) ? 1.0 : 0.0);
        w.put(Criterion.POOL_AMENITIES, d != null && Boolean.TRUE.equals(d.getPoolOrAmenities()) ? 1.0 : 0.0);
        w.put(Criterion.FURNISHED, d != null && Boolean.TRUE.equals(d.getFurnished()) ? 1.0 : 0.0);
        w.put(Criterion.APTO_CREDITO, d != null && Boolean.TRUE.equals(d.getAptoCredito()) ? 1.0 : 0.0);

        w.put(Criterion.WORK, r.getWorkLat() != null && r.getWorkLon() != null ? workWeight(r) : 0.0);
        return w;
    }

    // ------------------------------------------------------------ puntajes

    /** Puntaje 0-100 de la propiedad en un criterio; NaN si no se puede calcular (se omite). */
    double criterionScore(Candidate c, Criterion criterion) {
        return switch (criterion) {
            case TRANSPORT, COMMERCE, GREEN_SPACE, HEALTH, GASTRONOMY, NIGHTLIFE, EDUCATION ->
                    c.categoryScores().getOrDefault(POICategory.valueOf(criterion.name()), 0);
            case SECURITY -> c.securityScore();
            case QUIET -> c.quietScore();
            case PRICE -> priceScore(c);
            case BRIGHT -> c.bright() ? 100 : 0;
            case GARAGE -> c.garage() ? 100 : 0;
            case POOL_AMENITIES -> c.poolOrAmenities() ? 100 : 0;
            case FURNISHED -> c.furnished() ? 100 : 0;
            case APTO_CREDITO -> c.aptoCredito() ? 100 : 0;
            case WORK -> 0; // se calcula con la ubicación del pedido, ver workScore
        };
    }

    static PriceStatus priceStatus(Candidate c) {
        if (c.valuationMin() == null || c.valuationMax() == null || c.priceUsd() == null) {
            return PriceStatus.UNKNOWN;
        }
        if (c.priceUsd().compareTo(c.valuationMax()) > 0) {
            return PriceStatus.ABOVE;
        }
        if (c.priceUsd().compareTo(c.valuationMin()) < 0) {
            return PriceStatus.BELOW;
        }
        return PriceStatus.IN_RANGE;
    }

    /**
     * Debajo del rango: 100. Dentro: de 100 (en el mínimo) a 80 (en el máximo). Por encima: baja desde 60,
     * 2 puntos por cada 1 % por encima del máximo (a +30 % ya es 0). Sin rango: NaN (no se evalúa).
     */
    static double priceScore(Candidate c) {
        switch (priceStatus(c)) {
            case BELOW:
                return 100;
            case IN_RANGE: {
                double min = c.valuationMin().doubleValue();
                double max = c.valuationMax().doubleValue();
                if (max <= min) {
                    return 90;
                }
                return 80 + 20 * (max - c.priceUsd().doubleValue()) / (max - min);
            }
            case ABOVE: {
                double over = c.priceUsd().doubleValue() / c.valuationMax().doubleValue() - 1.0;
                return Math.max(0, 60 - 200 * over);
            }
            default:
                return Double.NaN;
        }
    }

    static double workWeight(RecommendationRequest r) {
        if (r.getWorkImportance() == null) {
            return WORK_WEIGHT_IMPORTANT;
        }
        return switch (r.getWorkImportance()) {
            case LOW -> WORK_WEIGHT_LOW;
            case IMPORTANT -> WORK_WEIGHT_IMPORTANT;
            case KEY -> WORK_WEIGHT_KEY;
        };
    }

    static double workScore(Candidate c, double workLat, double workLon) {
        if (c.lat() == null || c.lon() == null) {
            return Double.NaN;
        }
        double km = distanceKm(c.lat(), c.lon(), workLat, workLon);
        if (km <= WORK_NEAR_KM) {
            return 100;
        }
        if (km >= WORK_FAR_KM) {
            return 0;
        }
        return 100 * (WORK_FAR_KM - km) / (WORK_FAR_KM - WORK_NEAR_KM);
    }

    static double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        double r = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * r * Math.asin(Math.sqrt(a));
    }

    private Scored score(RecommendationRequest r, Candidate c, Map<Criterion, Double> weights) {
        List<Entry> entries = new ArrayList<>();
        for (Criterion criterion : Criterion.values()) {
            double weight = weights.getOrDefault(criterion, 0.0);
            if (weight <= 0) {
                continue;
            }
            double s = criterion == Criterion.WORK
                    ? workScore(c, r.getWorkLat(), r.getWorkLon())
                    : criterionScore(c, criterion);
            if (Double.isNaN(s)) {
                continue; // dato no disponible para esta propiedad: el criterio no la favorece ni la castiga
            }
            entries.add(new Entry(criterion, weight, s));
        }
        double weightSum = 0;
        double total = 0;
        for (Entry e : entries) {
            weightSum += e.weight();
            total += e.weight() * e.score();
        }
        int finalScore = weightSum == 0 ? 0 : (int) Math.round(total / weightSum);

        PriceStatus status = priceStatus(c);
        List<String> reasons = reasons(entries, status);
        String tradeoff = tradeoff(entries, status);
        return new Scored(c, finalScore, status, reasons, tradeoff, explanation(reasons, tradeoff));
    }

    // -------------------------------------------------------- explicación

    private static final double GOOD = 60;
    private static final double WEAK = 40;

    private List<String> reasons(List<Entry> entries, PriceStatus status) {
        List<Entry> good = new ArrayList<>();
        for (Entry e : entries) {
            if (e.score() >= GOOD) {
                good.add(e);
            }
        }
        good.sort(Comparator.comparingDouble((Entry e) -> e.weight() * e.score()).reversed());
        List<String> out = new ArrayList<>();
        for (Entry e : good) {
            out.add(positiveText(e.criterion(), status));
            if (out.size() == 3) {
                break;
            }
        }
        return out;
    }

    private String tradeoff(List<Entry> entries, PriceStatus status) {
        Entry worst = null;
        for (Entry e : entries) {
            if (e.score() >= WEAK) {
                continue;
            }
            if (worst == null || e.weight() > worst.weight()
                    || (e.weight() == worst.weight() && e.score() < worst.score())) {
                worst = e;
            }
        }
        return worst == null ? null : negativeText(worst.criterion(), status);
    }

    private String explanation(List<String> reasons, String tradeoff) {
        StringBuilder sb = new StringBuilder();
        if (reasons.isEmpty()) {
            sb.append("Es la que mejor encaja con lo que elegiste.");
        } else {
            sb.append("Te la recomendamos porque ").append(joinNatural(reasons)).append(".");
        }
        if (tradeoff != null) {
            sb.append(" A cambio, ").append(tradeoff).append(".");
        }
        return sb.toString();
    }

    static String joinNatural(List<String> parts) {
        if (parts.size() == 1) {
            return parts.get(0);
        }
        return String.join(", ", parts.subList(0, parts.size() - 1)) + " y " + parts.get(parts.size() - 1);
    }

    private String positiveText(Criterion criterion, PriceStatus status) {
        return switch (criterion) {
            case TRANSPORT -> "tiene mucho transporte público cerca";
            case COMMERCE -> "tiene comercios para el día a día a pasos";
            case GREEN_SPACE -> "tiene espacios verdes cerca";
            case HEALTH -> "tiene centros de salud cerca";
            case GASTRONOMY -> "tiene mucha oferta gastronómica cerca";
            case NIGHTLIFE -> "tiene vida nocturna cerca";
            case EDUCATION -> "tiene escuelas y universidades cerca";
            case SECURITY -> "el barrio tiene buenos indicadores de seguridad";
            case QUIET -> "es una zona tranquila";
            case PRICE -> status == PriceStatus.BELOW
                    ? "el precio está por debajo de lo que estima Nidio"
                    : "el precio está dentro de lo que estima Nidio";
            case BRIGHT -> "es luminosa";
            case GARAGE -> "tiene cochera";
            case POOL_AMENITIES -> "tiene pileta o amenities";
            case FURNISHED -> "está amoblada";
            case APTO_CREDITO -> "es apta crédito";
            case WORK -> "queda cerca de tu trabajo o estudio";
        };
    }

    private String negativeText(Criterion criterion, PriceStatus status) {
        return switch (criterion) {
            case TRANSPORT -> "tiene poco transporte público cerca";
            case COMMERCE -> "hay pocos comercios cerca";
            case GREEN_SPACE -> "tiene pocos espacios verdes cerca";
            case HEALTH -> "hay pocos centros de salud cerca";
            case GASTRONOMY -> "hay poca oferta gastronómica cerca";
            case NIGHTLIFE -> "hay poca vida nocturna cerca";
            case EDUCATION -> "hay pocas escuelas y universidades cerca";
            case SECURITY -> "el barrio tiene indicadores de seguridad más bajos que otras zonas";
            case QUIET -> "es una zona más ruidosa que otras";
            case PRICE -> "el precio está por encima de lo que estima Nidio";
            case BRIGHT -> "no figura como luminosa";
            case GARAGE -> "no tiene cochera";
            case POOL_AMENITIES -> "no tiene pileta ni amenities";
            case FURNISHED -> "no está amoblada";
            case APTO_CREDITO -> "no figura como apta crédito";
            case WORK -> "queda lejos de tu trabajo o estudio";
        };
    }
}
