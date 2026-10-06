package com.nidio.service;

import com.nidio.exception.MlServiceException;
import com.nidio.model.POICategory;
import com.nidio.model.Property;
import com.nidio.model.PropertyLifeScoreCategory;
import com.nidio.repository.PropertyLifeScoreCategoryRepository;
import com.nidio.repository.PropertyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Prueba unitaria (sin base ni ml-service): qué se guarda cuando ml-service
 * responde bien, y que un fallo o una respuesta incompleta no rompen la
 * publicación ni borran lo que ya había.
 */
class PropertyLifeScoreServiceTest {

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    private MlServiceClient mlServiceClient;
    private PropertyLifeScoreCategoryRepository repository;
    private PropertyLifeScoreService service;
    private Property property;

    @BeforeEach
    void setUp() {
        mlServiceClient = Mockito.mock(MlServiceClient.class);
        repository = Mockito.mock(PropertyLifeScoreCategoryRepository.class);
        PropertyRepository propertyRepository = Mockito.mock(PropertyRepository.class);
        service = new PropertyLifeScoreService(mlServiceClient, repository, propertyRepository, "test-version");
        property = Property.builder()
                .id(7L)
                // x = longitud, y = latitud
                .location(GEOMETRY_FACTORY.createPoint(new Coordinate(-58.46, -34.57)))
                .build();
    }

    private static List<MlServiceClient.LifeScoreMlCategory> categories(int score, int skip) {
        List<MlServiceClient.LifeScoreMlCategory> list = new ArrayList<>();
        POICategory[] all = POICategory.values();
        for (int i = 0; i < all.length - skip; i++) {
            list.add(new MlServiceClient.LifeScoreMlCategory(all[i], 10 + i, List.of(), score));
        }
        return list;
    }

    @Test
    void storesOneRowPerCategoryAndSendsLatLonInTheRightOrder() {
        when(mlServiceClient.lifeScore(any())).thenReturn(
                new MlServiceClient.LifeScoreMlResponse(new BigDecimal("50.0"), categories(42, 0)));

        boolean stored = service.computeAndStore(property);

        assertThat(stored).isTrue();
        ArgumentCaptor<MlServiceClient.LifeScoreMlRequest> request =
                ArgumentCaptor.forClass(MlServiceClient.LifeScoreMlRequest.class);
        verify(mlServiceClient).lifeScore(request.capture());
        assertThat(request.getValue().lat()).isEqualTo(-34.57);
        assertThat(request.getValue().lon()).isEqualTo(-58.46);
        verify(repository).deleteByPropertyId(7L);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<PropertyLifeScoreCategory>> rows = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(rows.capture());
        assertThat(rows.getValue()).hasSize(POICategory.values().length);
        assertThat(rows.getValue()).allSatisfy(row -> {
            assertThat(row.getPropertyId()).isEqualTo(7L);
            assertThat(row.getScore()).isEqualTo(42);
            assertThat(row.getDatasetsVersion()).isEqualTo("test-version");
        });
        assertThat(rows.getValue().stream().map(PropertyLifeScoreCategory::getCategory))
                .containsExactlyInAnyOrder(POICategory.values());
    }

    @Test
    void clampsScoresToZeroHundred() {
        List<MlServiceClient.LifeScoreMlCategory> list = new ArrayList<>(categories(0, 1));
        list.add(new MlServiceClient.LifeScoreMlCategory(
                POICategory.values()[POICategory.values().length - 1], 5, List.of(), 140));
        when(mlServiceClient.lifeScore(any())).thenReturn(
                new MlServiceClient.LifeScoreMlResponse(new BigDecimal("10.0"), list));

        assertThat(service.computeAndStore(property)).isTrue();

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<PropertyLifeScoreCategory>> rows = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(rows.capture());
        assertThat(rows.getValue().stream().mapToInt(PropertyLifeScoreCategory::getScore).max().orElseThrow())
                .isEqualTo(100);
    }

    @Test
    void mlServiceDownDoesNotThrowAndKeepsExistingRows() {
        when(mlServiceClient.lifeScore(any())).thenThrow(new MlServiceException("caído"));

        boolean stored = service.computeAndStore(property);

        assertThat(stored).isFalse();
        verify(repository, never()).deleteByPropertyId(any());
        verify(repository, never()).saveAll(any());
    }

    @Test
    void incompleteResponseIsRejected() {
        when(mlServiceClient.lifeScore(any())).thenReturn(
                new MlServiceClient.LifeScoreMlResponse(new BigDecimal("50.0"), categories(30, 1)));

        assertThat(service.computeAndStore(property)).isFalse();
        verify(repository, never()).saveAll(any());
    }
}
