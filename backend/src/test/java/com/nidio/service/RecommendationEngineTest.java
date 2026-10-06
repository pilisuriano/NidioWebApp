package com.nidio.service;

import com.nidio.dto.RecommendationRequest;
import com.nidio.dto.RecommendationRequest.Dealbreaker;
import com.nidio.dto.RecommendationRequest.Household;
import com.nidio.dto.RecommendationRequest.Importance;
import com.nidio.dto.RecommendationRequest.NoisePreference;
import com.nidio.dto.RecommendationRequest.OverpricedPolicy;
import com.nidio.model.OperationType;
import com.nidio.model.POICategory;
import com.nidio.model.PropertyType;
import com.nidio.service.RecommendationEngine.Candidate;
import com.nidio.service.RecommendationEngine.PriceStatus;
import com.nidio.service.RecommendationEngine.Result;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Pruebas del motor del recomendador con catálogos chicos armados a mano: cada caso
 * escribe el resultado esperado a partir de la regla de diseño, no de lo que el
 * código devuelve. Sin base de datos ni Spring.
 */
class RecommendationEngineTest {

    private final RecommendationEngine engine = new RecommendationEngine();

    // ---------------------------------------------------------- ayudantes

    /** Categorías en el orden de POICategory: TRANSPORT, COMMERCE, GREEN_SPACE, HEALTH, GASTRONOMY, NIGHTLIFE, EDUCATION. */
    private static Map<POICategory, Integer> cats(int... values) {
        Map<POICategory, Integer> map = new EnumMap<>(POICategory.class);
        POICategory[] all = POICategory.values();
        for (int i = 0; i < all.length; i++) {
            map.put(all[i], values[i]);
        }
        return map;
    }

    private static int[] flat(int value) {
        return new int[]{value, value, value, value, value, value, value};
    }

    /** Propiedad "neutra": departamento, 3 ambientes, precio 1000 dentro del rango 900-1100, todo en 50. */
    private static Candidate cand(long id, PropertyType type, long price, int rooms,
                                  Long valMin, Long valMax, int[] categories,
                                  double security, double quiet, Double lat, Double lon) {
        return new Candidate(id, type, BigDecimal.valueOf(price), BigDecimal.valueOf(price), rooms,
                valMin == null ? null : BigDecimal.valueOf(valMin),
                valMax == null ? null : BigDecimal.valueOf(valMax),
                cats(categories), security, quiet, lat, lon, false, false, false, false, false);
    }

    private static Candidate neutral(long id) {
        return cand(id, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(50), 50, 50, null, null);
    }

    private static RecommendationRequest request() {
        RecommendationRequest r = new RecommendationRequest();
        r.setOperationType(OperationType.RENT);
        r.setHousehold(Household.COUPLE);
        r.setDealbreaker(Dealbreaker.FEW_SHOPS);
        r.setNoisePreference(NoisePreference.TOLERANT);
        r.setOverpricedPolicy(OverpricedPolicy.SHOW);
        return r;
    }

    private static List<Long> ids(Result result) {
        List<Long> ids = new ArrayList<>();
        result.items().forEach(s -> ids.add(s.candidate().id()));
        return ids;
    }

    // ------------------------------------------------------------ pruebas

    @Test
    void hardFiltersTypeBudgetAndRooms() {
        List<Candidate> catalog = List.of(
                cand(1, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(50), 50, 50, null, null),
                cand(2, PropertyType.HOUSE, 1000, 3, 900L, 1100L, flat(50), 50, 50, null, null),
                cand(3, PropertyType.APARTMENT, 5000, 3, 4500L, 5500L, flat(50), 50, 50, null, null),
                cand(4, PropertyType.APARTMENT, 1000, 1, 900L, 1100L, flat(50), 50, 50, null, null));
        RecommendationRequest r = request();
        r.setPropertyTypes(List.of(PropertyType.APARTMENT));
        r.setBudgetMin(BigDecimal.valueOf(500));
        r.setBudgetMax(BigDecimal.valueOf(2000));
        r.setHousehold(Household.FAMILY); // mínimo 3 ambientes

        Result result = engine.recommend(r, catalog);

        assertEquals(List.of(1L), ids(result));
        assertFalse(result.broadened());
        assertNotNull(result.message()); // avisa que encontró solo 1
    }

    @Test
    void chosenMinRoomsOverridesTheHouseholdSuggestion() {
        List<Candidate> catalog = List.of(
                cand(1, PropertyType.APARTMENT, 1000, 1, 900L, 1100L, flat(50), 50, 50, null, null),
                cand(2, PropertyType.APARTMENT, 1000, 2, 900L, 1100L, flat(50), 50, 50, null, null),
                cand(3, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(50), 50, 50, null, null),
                cand(4, PropertyType.APARTMENT, 1000, 4, 900L, 1100L, flat(50), 50, 50, null, null));

        // Sin elegir: en pareja sugiere 2 ambientes como mínimo (ids 2, 3 y 4).
        RecommendationRequest suggested = request();
        assertEquals(List.of(2L, 3L, 4L), ids(engine.recommend(suggested, catalog)));

        // Eligiendo 4: solo la de 4 ambientes, aunque sea una pareja.
        RecommendationRequest four = request();
        four.setMinRooms(4);
        assertEquals(List.of(4L), ids(engine.recommend(four, catalog)));

        // Eligiendo 1 estando en familia (sugiere 3): se aceptan las de 1 ambiente.
        RecommendationRequest family = request();
        family.setHousehold(Household.FAMILY);
        family.setMinRooms(1);
        assertTrue(ids(engine.recommend(family, catalog)).containsAll(List.of(1L, 2L, 3L)));
    }

    @Test
    void distanceIsMeasuredInKilometersInAStraightLine() {
        // 0,1 grado de latitud son unos 11,12 km (1 grado = 111,19 km), sin importar la longitud.
        assertEquals(11.12, RecommendationEngine.distanceKm(-34.6, -58.4, -34.5, -58.4), 0.02);
        assertEquals(0.0, RecommendationEngine.distanceKm(-34.6, -58.4, -34.6, -58.4), 0.0001);
    }

    @Test
    void workImportanceDecidesHowMuchTheDistanceCounts() {
        // Trabajo en (-34,6000; -58,4000). A queda a 2 km y tiene mejor seguridad (80); B queda a 0,6 km
        // (50). Puntaje de trabajo: A 80, B 98,7. Sin contar el trabajo, A le gana a B por 2 x 30 = 60
        // sobre el peso total; el trabajo le da a B 18,7 x peso. Con peso 2 gana A (60 > 37), con peso 1 también,
        // con peso 6 gana B (60 < 112).
        Candidate a = cand(1, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(50), 80, 50, -34.582013, -58.4);
        Candidate b = cand(2, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(50), 50, 50, -34.594604, -58.4);
        List<Candidate> catalog = List.of(a, b);

        RecommendationRequest usual = request();
        usual.setWorkLat(-34.6);
        usual.setWorkLon(-58.4);
        assertEquals(List.of(1L, 2L), ids(engine.recommend(usual, catalog))); // sin elegir = IMPORTANT

        RecommendationRequest low = request();
        low.setWorkLat(-34.6);
        low.setWorkLon(-58.4);
        low.setWorkImportance(RecommendationRequest.WorkImportance.LOW);
        assertEquals(List.of(1L, 2L), ids(engine.recommend(low, catalog)));

        RecommendationRequest key = request();
        key.setWorkLat(-34.6);
        key.setWorkLon(-58.4);
        key.setWorkImportance(RecommendationRequest.WorkImportance.KEY);
        assertEquals(List.of(2L, 1L), ids(engine.recommend(key, catalog)));
    }

    @Test
    void overpricedPolicyHideLastShow() {
        // A: muy bien de entorno pero 36 % por encima del rango; B: entorno flojo pero precio en rango.
        Candidate a = cand(1, PropertyType.APARTMENT, 1500, 3, 900L, 1100L, flat(100), 50, 50, null, null);
        Candidate b = cand(2, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(30), 50, 50, null, null);
        List<Candidate> catalog = List.of(a, b);

        RecommendationRequest hide = request();
        hide.setOverpricedPolicy(OverpricedPolicy.HIDE);
        assertEquals(List.of(2L), ids(engine.recommend(hide, catalog)));

        RecommendationRequest last = request();
        last.setOverpricedPolicy(OverpricedPolicy.LAST);
        assertEquals(List.of(2L, 1L), ids(engine.recommend(last, catalog)));

        RecommendationRequest show = request();
        show.setOverpricedPolicy(OverpricedPolicy.SHOW);
        assertEquals(List.of(1L, 2L), ids(engine.recommend(show, catalog)));
    }

    @Test
    void dealbreakerDropsWorstQuartileAndBroadensWhenTooFew() {
        // Seguridad 8, 16, ..., 96 (ids 1 a 12). Percentil 25 = 24: se descartan los ids 1 y 2.
        List<Candidate> catalog = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            long price = i <= 2 ? 900 : 3000;
            catalog.add(cand(i, PropertyType.APARTMENT, price, 3, price - 100, price + 100,
                    flat(50), 8.0 * i, 50, null, null));
        }
        RecommendationRequest r = request();
        r.setDealbreaker(Dealbreaker.UNSAFE);

        Result wide = engine.recommend(r, catalog);
        assertFalse(wide.broadened());
        assertEquals(List.of(12L, 11L, 10L), ids(wide)); // más seguridad, más puntaje

        // Con presupuesto que deja solo a los ids 1 y 2 (ambos bajo el umbral) se amplía la búsqueda.
        r.setBudgetMax(BigDecimal.valueOf(1000));
        Result narrow = engine.recommend(r, catalog);
        assertTrue(narrow.broadened());
        assertEquals(List.of(2L, 1L), ids(narrow));
        assertTrue(narrow.message().contains("Ampliamos"));
    }

    @Test
    void changingAnImportanceChangesTheWinner() {
        // A fuerte en espacios verdes y nula en vida nocturna; B al revés.
        Candidate a = cand(1, PropertyType.APARTMENT, 1000, 3, 900L, 1100L,
                new int[]{50, 50, 100, 50, 50, 0, 50}, 50, 50, null, null);
        Candidate b = cand(2, PropertyType.APARTMENT, 1000, 3, 900L, 1100L,
                new int[]{50, 50, 0, 50, 50, 100, 50}, 50, 50, null, null);

        RecommendationRequest green = request();
        Map<POICategory, Importance> greenKey = new EnumMap<>(POICategory.class);
        greenKey.put(POICategory.GREEN_SPACE, Importance.KEY);
        greenKey.put(POICategory.NIGHTLIFE, Importance.NOT_IMPORTANT);
        green.setProximity(greenKey);
        assertEquals(List.of(1L), ids(engine.recommend(green, List.of(a, b))).subList(0, 1));

        RecommendationRequest night = request();
        Map<POICategory, Importance> nightKey = new EnumMap<>(POICategory.class);
        nightKey.put(POICategory.GREEN_SPACE, Importance.NOT_IMPORTANT);
        nightKey.put(POICategory.NIGHTLIFE, Importance.KEY);
        night.setProximity(nightKey);
        assertEquals(List.of(2L), ids(engine.recommend(night, List.of(a, b))).subList(0, 1));
    }

    @Test
    void explanationHasReasonsAndTradeoff() {
        Candidate strongTransportWeakGreen = cand(1, PropertyType.APARTMENT, 1000, 3, 900L, 1100L,
                new int[]{100, 50, 10, 50, 50, 50, 50}, 50, 50, null, null);

        Result result = engine.recommend(request(), List.of(strongTransportWeakGreen));
        RecommendationEngine.Scored s = result.items().get(0);

        assertTrue(s.explanation().startsWith("Te la recomendamos porque "));
        assertTrue(s.explanation().contains("transporte"));
        assertNotNull(s.tradeoff());
        assertTrue(s.tradeoff().contains("espacios verdes"));
        assertTrue(s.explanation().contains("A cambio, "));
        assertTrue(s.reasons().size() <= 3);
        assertEquals(PriceStatus.IN_RANGE, s.priceStatus());
    }

    @Test
    void notImportantCategoriesNeverAppearInTheExplanation() {
        Candidate weakGreen = cand(1, PropertyType.APARTMENT, 1000, 3, 900L, 1100L,
                new int[]{50, 50, 0, 50, 50, 50, 50}, 50, 50, null, null);
        RecommendationRequest r = request();
        Map<POICategory, Importance> imp = new EnumMap<>(POICategory.class);
        imp.put(POICategory.GREEN_SPACE, Importance.NOT_IMPORTANT);
        r.setProximity(imp);

        RecommendationEngine.Scored s = engine.recommend(r, List.of(weakGreen)).items().get(0);

        assertNull(s.tradeoff()); // lo único flojo es lo que la persona dijo que no le importa
    }

    @Test
    void workAddressFavoursTheCloserProperty() {
        Candidate near = cand(1, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(50), 50, 50, -34.60, -58.40);
        Candidate far = cand(2, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(50), 50, 50, -34.70, -58.40);
        RecommendationRequest r = request();
        r.setWorkLat(-34.60);
        r.setWorkLon(-58.40);

        Result result = engine.recommend(r, List.of(far, near));

        assertEquals(List.of(1L, 2L), ids(result));
        assertTrue(result.items().get(0).score() > result.items().get(1).score());
        // Sin dirección de trabajo, empatan y se ordenan por id.
        assertEquals(List.of(1L, 2L), ids(engine.recommend(request(), List.of(far, near))));
    }

    @Test
    void propertyWithoutValuationRangeIsNotHiddenNorPenalised() {
        Candidate noRange = cand(1, PropertyType.APARTMENT, 1000, 3, null, null, flat(50), 50, 50, null, null);
        RecommendationRequest r = request();
        r.setOverpricedPolicy(OverpricedPolicy.HIDE);

        Result result = engine.recommend(r, List.of(noRange));

        assertEquals(List.of(1L), ids(result));
        assertEquals(PriceStatus.UNKNOWN, result.items().get(0).priceStatus());
    }

    @Test
    void rentalPriceWithoutDollarRateIsNotComparedAgainstTheRange() {
        // Alquiler: precio en pesos, rango en dólares. Sin cotización (priceUsd null) no se compara.
        Candidate rentNoRate = new Candidate(1L, PropertyType.APARTMENT, BigDecimal.valueOf(900000), null, 3,
                BigDecimal.valueOf(500), BigDecimal.valueOf(700), cats(flat(50)), 50, 50, null, null,
                false, false, false, false, false);
        RecommendationRequest r = request();
        r.setOverpricedPolicy(OverpricedPolicy.HIDE);

        Result result = engine.recommend(r, List.of(rentNoRate));

        assertEquals(List.of(1L), ids(result)); // no se oculta como "sobre el rango"
        assertEquals(PriceStatus.UNKNOWN, result.items().get(0).priceStatus());
    }

    /** Misma propiedad pero con barrio, para probar el tope por barrio. */
    private static Candidate inNeighborhood(Candidate c, long neighborhoodId) {
        return new Candidate(c.id(), c.type(), c.price(), c.priceUsd(), c.rooms(), c.valuationMin(),
                c.valuationMax(), c.categoryScores(), c.securityScore(), c.quietScore(), c.lat(), c.lon(),
                c.bright(), c.garage(), c.poolOrAmenities(), c.furnished(), c.aptoCredito(), neighborhoodId);
    }

    @Test
    void atMostTwoOfTheThreeResultsShareANeighborhood() {
        // Las tres mejores (ids 1 a 3, transporte 90, 80 y 70) son del barrio 10; la cuarta y la quinta, del barrio 20.
        List<Candidate> catalog = List.of(
                inNeighborhood(cand(1, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(90), 50, 50, null, null), 10),
                inNeighborhood(cand(2, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(80), 50, 50, null, null), 10),
                inNeighborhood(cand(3, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(70), 50, 50, null, null), 10),
                inNeighborhood(cand(4, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(60), 50, 50, null, null), 20),
                inNeighborhood(cand(5, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(50), 50, 50, null, null), 20));

        Result result = engine.recommend(request(), catalog);

        // Sin la regla saldrían 1, 2 y 3; con la regla, el tercero se cambia por la mejor de otro barrio.
        assertEquals(List.of(1L, 2L, 4L), ids(result));
    }

    @Test
    void diversityRuleNeverReducesTheNumberOfResults() {
        // Todas del mismo barrio: la regla no puede dejar al usuario con 2 resultados habiendo 3.
        List<Candidate> catalog = List.of(
                inNeighborhood(cand(1, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(90), 50, 50, null, null), 10),
                inNeighborhood(cand(2, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(80), 50, 50, null, null), 10),
                inNeighborhood(cand(3, PropertyType.APARTMENT, 1000, 3, 900L, 1100L, flat(70), 50, 50, null, null), 10));

        assertEquals(List.of(1L, 2L, 3L), ids(engine.recommend(request(), catalog)));
    }

    @Test
    void propertiesWithoutNeighborhoodAreNotLimited() {
        List<Candidate> catalog = List.of(neutral(1), neutral(2), neutral(3), neutral(4));

        assertEquals(3, engine.recommend(request(), catalog).items().size());
    }

    @Test
    void percentileAndDistanceHelpers() {
        List<Double> values = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            values.add((double) i);
        }
        assertEquals(3.0, RecommendationEngine.percentile(values, 25));
        assertEquals(2.0, RecommendationEngine.percentile(values, 10));
        assertEquals(0.0, RecommendationEngine.percentile(new ArrayList<>(), 25));
        // 0,1 grado de latitud son unos 11,1 km
        assertEquals(11.1, RecommendationEngine.distanceKm(-34.60, -58.40, -34.70, -58.40), 0.1);
    }
}
