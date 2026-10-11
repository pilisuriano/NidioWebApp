package com.nidio.service;

import com.nidio.dto.BudgetRangeDto;
import com.nidio.dto.PropertySummaryResponse;
import com.nidio.dto.RecommendationRequest;
import com.nidio.dto.RecommendationRequest.Dealbreaker;
import com.nidio.dto.RecommendationRequest.Household;
import com.nidio.dto.RecommendationRequest.NoisePreference;
import com.nidio.dto.RecommendationRequest.OverpricedPolicy;
import com.nidio.dto.RecommendationResponse;
import com.nidio.model.Neighborhood;
import com.nidio.model.OperationType;
import com.nidio.model.POICategory;
import com.nidio.model.Property;
import com.nidio.model.PropertyLifeScoreCategory;
import com.nidio.model.PropertyType;
import com.nidio.repository.NoiseZoneRepository;
import com.nidio.repository.PropertyLifeScoreCategoryRepository;
import com.nidio.repository.PropertyRepository;
import com.nidio.repository.SecurityZoneRepository;
import org.junit.jupiter.api.BeforeEach;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Prueba del servicio con repositorios simulados: que lea bien la dirección de cada
 * dato (ruido: menos dB es mejor; seguridad: índice más alto es mejor) y que los tramos
 * de presupuesto salgan de los precios reales del catálogo.
 */
class RecommendationServiceTest {

    private PropertyRepository propertyRepository;
    private PropertyLifeScoreCategoryRepository lifeScoreRepository;
    private NoiseZoneRepository noiseZoneRepository;
    private SecurityZoneRepository securityZoneRepository;
    private PropertyService propertyService;
    private RecommendationService service;

    @BeforeEach
    void setUp() {
        propertyRepository = Mockito.mock(PropertyRepository.class);
        lifeScoreRepository = Mockito.mock(PropertyLifeScoreCategoryRepository.class);
        noiseZoneRepository = Mockito.mock(NoiseZoneRepository.class);
        securityZoneRepository = Mockito.mock(SecurityZoneRepository.class);
        propertyService = Mockito.mock(PropertyService.class);
        service = new RecommendationService(
                propertyRepository, lifeScoreRepository, noiseZoneRepository, securityZoneRepository, propertyService);
        when(propertyService.toSummary(any(Property.class))).thenAnswer(invocation -> {
            Property p = invocation.getArgument(0);
            return new PropertySummaryResponse(p.getId(), null, null, null, null, null, null, null, null,
                    null, null, null, null, null, null, null, null, true);
        });
    }

    private static Property property(long id, long neighborhoodId, long price) {
        return Property.builder()
                .id(id)
                .neighborhood(Neighborhood.builder().id(neighborhoodId).name("Barrio " + neighborhoodId).build())
                .propertyType(PropertyType.APARTMENT)
                .operationType(OperationType.RENT)
                .price(BigDecimal.valueOf(price))
                .rooms(3)
                .valuationRangeMin(BigDecimal.valueOf(price - 100))
                .valuationRangeMax(BigDecimal.valueOf(price + 100))
                .build();
    }

    private static List<PropertyLifeScoreCategory> allCategories(long propertyId, int score) {
        List<PropertyLifeScoreCategory> rows = new ArrayList<>();
        for (POICategory category : POICategory.values()) {
            rows.add(PropertyLifeScoreCategory.builder()
                    .propertyId(propertyId).category(category).score(score).poiCount(10)
                    .datasetsVersion("test").computedAt(LocalDateTime.now()).build());
        }
        return rows;
    }

    private static RecommendationRequest request(Dealbreaker dealbreaker, NoisePreference noise) {
        RecommendationRequest r = new RecommendationRequest();
        r.setOperationType(OperationType.RENT);
        r.setHousehold(Household.COUPLE);
        r.setDealbreaker(dealbreaker);
        r.setNoisePreference(noise);
        r.setOverpricedPolicy(OverpricedPolicy.SHOW);
        return r;
    }

    private void twoNeighborhoods(double noise1, double noise2, double security1, double security2) {
        List<Property> properties = List.of(property(1, 1, 1000), property(2, 2, 1000));
        when(propertyRepository.findActiveByOperationType(OperationType.RENT)).thenReturn(properties);
        List<PropertyLifeScoreCategory> rows = new ArrayList<>(allCategories(1, 50));
        rows.addAll(allCategories(2, 50));
        when(lifeScoreRepository.findByPropertyIdIn(any())).thenReturn(rows);
        when(noiseZoneRepository.findNoiseLevelsByNeighborhood()).thenReturn(List.of(
                new Object[]{1L, BigDecimal.valueOf(noise1)}, new Object[]{2L, BigDecimal.valueOf(noise2)}));
        when(securityZoneRepository.findSecurityIndexByNeighborhood()).thenReturn(List.of(
                new Object[]{1L, BigDecimal.valueOf(security1)}, new Object[]{2L, BigDecimal.valueOf(security2)}));
    }

    @Test
    void quieterNeighborhoodWinsWhenTheUserWantsQuiet() {
        // Mismo índice de seguridad; el barrio 1 tiene menos decibeles (más silencioso).
        twoNeighborhoods(55, 70, 50, 50);

        RecommendationResponse response = service.recommend(request(Dealbreaker.FEW_SHOPS, NoisePreference.QUIET));

        assertEquals(1L, response.items().get(0).property().id().longValue());
        assertEquals(2, response.items().size());
        // El resumen de filtros viaja en la respuesta: 2 publicadas y 2 que llegan hasta el final.
        assertEquals("CATALOG", response.funnel().get(0).code());
        assertEquals(2, response.funnel().get(0).remaining());
        assertEquals(2, response.funnel().get(response.funnel().size() - 1).remaining());
    }

    @Test
    void saferNeighborhoodWinsWhenSecurityIsTheDealbreaker() {
        // Barrio 1 más silencioso pero menos seguro (índice más bajo = menos seguro); barrio 2 al revés.
        twoNeighborhoods(55, 70, 30, 80);

        RecommendationResponse response = service.recommend(request(Dealbreaker.UNSAFE, NoisePreference.TOLERANT));

        assertEquals(2L, response.items().get(0).property().id().longValue());
    }

    @Test
    void rentalPriceIsConvertedToDollarsBeforeComparingWithTheRange() {
        // Precio 1.000.000 ARS con el dólar a 1.000 = 1.000 USD, dentro del rango 900-1.100 USD.
        Property p = property(1, 1, 1_000_000);
        p.setValuationRangeMin(BigDecimal.valueOf(900));
        p.setValuationRangeMax(BigDecimal.valueOf(1100));
        when(propertyRepository.findActiveByOperationType(OperationType.RENT)).thenReturn(List.of(p));
        when(lifeScoreRepository.findByPropertyIdIn(any())).thenReturn(allCategories(1, 50));
        when(noiseZoneRepository.findNoiseLevelsByNeighborhood()).thenReturn(List.<Object[]>of(
                new Object[]{1L, BigDecimal.valueOf(60)}));
        when(securityZoneRepository.findSecurityIndexByNeighborhood()).thenReturn(List.<Object[]>of(
                new Object[]{1L, BigDecimal.valueOf(50)}));

        RecommendationRequest withRate = request(Dealbreaker.FEW_SHOPS, NoisePreference.TOLERANT);
        withRate.setBlueRate(BigDecimal.valueOf(1000));
        assertEquals("IN_RANGE", service.recommend(withRate).items().get(0).priceStatus());

        // Sin cotización no se compara pesos contra dólares.
        RecommendationRequest withoutRate = request(Dealbreaker.FEW_SHOPS, NoisePreference.TOLERANT);
        assertEquals("UNKNOWN", service.recommend(withoutRate).items().get(0).priceStatus());
    }

    @Test
    void listIsLimitedToThreeUnlessTheAccountHasAPassOrPlan() {
        List<Property> properties = new ArrayList<>();
        List<PropertyLifeScoreCategory> rows = new ArrayList<>();
        List<Object[]> noise = new ArrayList<>();
        List<Object[]> security = new ArrayList<>();
        for (int i = 1; i <= 16; i++) {
            properties.add(property(i, i, 1000));
            rows.addAll(allCategories(i, 50 + i));
            noise.add(new Object[]{(long) i, BigDecimal.valueOf(55)});
            security.add(new Object[]{(long) i, BigDecimal.valueOf(50)});
        }
        when(propertyRepository.findActiveByOperationType(OperationType.RENT)).thenReturn(properties);
        when(lifeScoreRepository.findByPropertyIdIn(any())).thenReturn(rows);
        when(noiseZoneRepository.findNoiseLevelsByNeighborhood()).thenReturn(noise);
        when(securityZoneRepository.findSecurityIndexByNeighborhood()).thenReturn(security);
        RecommendationRequest r = request(Dealbreaker.FEW_SHOPS, NoisePreference.TOLERANT);

        RecommendationResponse free = service.recommend(r);
        RecommendationResponse unlocked = service.recommend(r, true);

        assertEquals(3, free.items().size());
        assertFalse(free.moreUnlocked());
        assertEquals(10, unlocked.items().size());
        assertTrue(unlocked.moreUnlocked());
        // Las 3 primeras son las mismas, y el total de propiedades que encajan viaja en las dos respuestas.
        assertEquals(free.items().stream().map(i -> i.property().id()).toList(),
                unlocked.items().stream().limit(3).map(i -> i.property().id()).toList());
        assertTrue(free.totalMatches() > 3);
        assertEquals(free.totalMatches(), unlocked.totalMatches());
    }

    @Test
    void propertyWithoutCategoryScoresIsLeftOut() {
        List<Property> properties = List.of(property(1, 1, 1000), property(2, 2, 1000));
        when(propertyRepository.findActiveByOperationType(OperationType.RENT)).thenReturn(properties);
        when(lifeScoreRepository.findByPropertyIdIn(any())).thenReturn(allCategories(1, 50)); // falta la 2
        when(noiseZoneRepository.findNoiseLevelsByNeighborhood()).thenReturn(List.of(
                new Object[]{1L, BigDecimal.valueOf(55)}, new Object[]{2L, BigDecimal.valueOf(60)}));
        when(securityZoneRepository.findSecurityIndexByNeighborhood()).thenReturn(List.of(
                new Object[]{1L, BigDecimal.valueOf(50)}, new Object[]{2L, BigDecimal.valueOf(50)}));

        RecommendationResponse response = service.recommend(request(Dealbreaker.FEW_SHOPS, NoisePreference.TOLERANT));

        assertEquals(1, response.items().size());
        assertEquals(1L, response.items().get(0).property().id().longValue());
    }

    @Test
    void budgetRangesComeFromCatalogQuartiles() {
        List<Property> properties = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            properties.add(property(i, 1, 1000L * i));
        }
        when(propertyRepository.findActiveByOperationType(OperationType.RENT)).thenReturn(properties);

        List<BudgetRangeDto> ranges = service.budgetRanges(OperationType.RENT);

        assertEquals(4, ranges.size());
        assertNull(ranges.get(0).min());
        assertEquals(0, BigDecimal.valueOf(3000).compareTo(ranges.get(0).max()));
        assertEquals(0, BigDecimal.valueOf(3000).compareTo(ranges.get(1).min()));
        assertEquals(0, BigDecimal.valueOf(5000).compareTo(ranges.get(1).max()));
        assertEquals(0, BigDecimal.valueOf(8000).compareTo(ranges.get(2).max()));
        assertEquals(0, BigDecimal.valueOf(8000).compareTo(ranges.get(3).min()));
        assertNull(ranges.get(3).max());
    }

    @Test
    void budgetPricesAreTheSortedCatalogPrices() {
        List<Property> properties = List.of(property(1, 1, 3000), property(2, 1, 1000), property(3, 1, 2000));
        when(propertyRepository.findActiveByOperationType(OperationType.RENT)).thenReturn(properties);

        List<BigDecimal> prices = service.budgetPrices(OperationType.RENT);

        assertEquals(3, prices.size());
        assertEquals(0, BigDecimal.valueOf(1000).compareTo(prices.get(0)));
        assertEquals(0, BigDecimal.valueOf(2000).compareTo(prices.get(1)));
        assertEquals(0, BigDecimal.valueOf(3000).compareTo(prices.get(2)));
    }

    @Test
    void resultsCarryTheStraightLineDistanceToTheWorkAddress() {
        // Propiedad 1 a unos 2 km al norte del trabajo; la 2 no tiene coordenadas.
        Property near = property(1, 1, 1000);
        near.setLocation(new GeometryFactory().createPoint(new Coordinate(-58.4, -34.582013)));
        Property withoutCoordinates = property(2, 1, 1000);
        when(propertyRepository.findActiveByOperationType(OperationType.RENT)).thenReturn(List.of(near, withoutCoordinates));
        List<PropertyLifeScoreCategory> rows = new ArrayList<>(allCategories(1, 50));
        rows.addAll(allCategories(2, 50));
        when(lifeScoreRepository.findByPropertyIdIn(any())).thenReturn(rows);
        when(noiseZoneRepository.findNoiseLevelsByNeighborhood()).thenReturn(List.<Object[]>of(
                new Object[]{1L, BigDecimal.valueOf(60)}));
        when(securityZoneRepository.findSecurityIndexByNeighborhood()).thenReturn(List.<Object[]>of(
                new Object[]{1L, BigDecimal.valueOf(50)}));

        RecommendationRequest withWork = request(Dealbreaker.FEW_SHOPS, NoisePreference.TOLERANT);
        withWork.setWorkLat(-34.6);
        withWork.setWorkLon(-58.4);
        RecommendationResponse response = service.recommend(withWork);
        for (RecommendationResponse.RecommendationItem item : response.items()) {
            if (item.property().id() == 1L) {
                assertEquals(2.0, item.workDistanceKm(), 0.02);
            } else {
                assertNull(item.workDistanceKm());
            }
        }

        // Sin dirección de trabajo no hay distancia.
        RecommendationResponse without = service.recommend(request(Dealbreaker.FEW_SHOPS, NoisePreference.TOLERANT));
        without.items().forEach(item -> assertNull(item.workDistanceKm()));
    }

    @Test
    void budgetRangesCollapseWhenAllPricesAreEqual() {
        List<Property> properties = List.of(property(1, 1, 1000), property(2, 1, 1000), property(3, 1, 1000));
        when(propertyRepository.findActiveByOperationType(OperationType.RENT)).thenReturn(properties);

        List<BudgetRangeDto> ranges = service.budgetRanges(OperationType.RENT);

        assertEquals(2, ranges.size());
    }

    @Test
    void percentRankAndNearestRankHelpers() {
        List<Double> sorted = List.of(10.0, 20.0, 30.0);
        assertEquals(50.0, RecommendationService.percentRank(20.0, sorted), 0.001);
        assertEquals(100.0 * 0.5 / 3, RecommendationService.percentRank(10.0, sorted), 0.001);
        assertEquals(100.0 * 2.5 / 3, RecommendationService.percentRank(30.0, sorted), 0.001);
        assertEquals(0, RecommendationService.nearestRankIndex(25, 4));
        assertEquals(1, RecommendationService.nearestRankIndex(50, 4));
        assertEquals(2, RecommendationService.nearestRankIndex(75, 4));
    }
}
