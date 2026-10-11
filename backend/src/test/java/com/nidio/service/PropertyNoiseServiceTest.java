package com.nidio.service;

import com.nidio.exception.MlServiceException;
import com.nidio.model.Property;
import com.nidio.model.PropertyNoise;
import com.nidio.repository.PropertyNoiseRepository;
import com.nidio.repository.PropertyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Prueba unitaria (sin base ni ml-service) del cálculo y guardado del ruido de una propiedad. */
class PropertyNoiseServiceTest {

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    private MlServiceClient mlServiceClient;
    private PropertyNoiseRepository repository;
    private PropertyNoiseService service;
    private Property property;

    @BeforeEach
    void setUp() {
        mlServiceClient = Mockito.mock(MlServiceClient.class);
        repository = Mockito.mock(PropertyNoiseRepository.class);
        service = new PropertyNoiseService(mlServiceClient, repository, Mockito.mock(PropertyRepository.class), "test-version");
        property = Property.builder()
                .id(7L)
                .location(GEOMETRY_FACTORY.createPoint(new Coordinate(-58.46, -34.57)))
                .build();
    }

    private PropertyNoise saved() {
        ArgumentCaptor<PropertyNoise> row = ArgumentCaptor.forClass(PropertyNoise.class);
        verify(repository).save(row.capture());
        return row.getValue();
    }

    @Test
    void storesDayAndNightAndSendsLatLonInTheRightOrder() {
        when(mlServiceClient.noise(anyDouble(), anyDouble())).thenReturn(new MlServiceClient.NoiseMlResponse(
                new MlServiceClient.NoiseMlLevel(70, 75, 3, "Ruidoso", "2018", 0.0),
                new MlServiceClient.NoiseMlLevel(55, 60, 1, "Tranquilo", "2025", 12.0)));

        assertThat(service.computeAndStore(property)).isTrue();

        verify(mlServiceClient).noise(-34.57, -58.46); // lat, lon (x = longitud, y = latitud)
        verify(repository).deleteByPropertyId(7L);
        PropertyNoise row = saved();
        assertThat(row.getPropertyId()).isEqualTo(7L);
        assertThat(row.getDayLevel()).isEqualTo(3);
        assertThat(row.getDaySrc()).isEqualTo("2018");
        assertThat(row.getNightLevel()).isEqualTo(1);
        assertThat(row.getNightDbLow()).isEqualTo(55);
        assertThat(row.getDatasetsVersion()).isEqualTo("test-version");
    }

    @Test
    void storesARowWithNullsWhenThereIsNoData() {
        when(mlServiceClient.noise(anyDouble(), anyDouble()))
                .thenReturn(new MlServiceClient.NoiseMlResponse(null, null));

        assertThat(service.computeAndStore(property)).isTrue();

        PropertyNoise row = saved();
        assertThat(row.getDayLevel()).isNull();
        assertThat(row.getNightLevel()).isNull();
    }

    @Test
    void doesNotFailNorTouchExistingRowsWhenMlServiceIsDown() {
        when(mlServiceClient.noise(anyDouble(), anyDouble())).thenThrow(new MlServiceException("caído"));

        assertThat(service.computeAndStore(property)).isFalse();

        verify(repository, never()).deleteByPropertyId(Mockito.anyLong());
        verify(repository, never()).save(Mockito.any());
    }
}
