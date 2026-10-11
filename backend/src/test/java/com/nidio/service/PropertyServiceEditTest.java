package com.nidio.service;

import com.nidio.dto.CreatePropertyRequest;
import com.nidio.dto.PropertyDetailResponse;
import com.nidio.exception.AddressValidationException;
import com.nidio.exception.MlServiceException;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.Neighborhood;
import com.nidio.model.OperationType;
import com.nidio.model.Property;
import com.nidio.model.PropertyType;
import com.nidio.model.PublisherType;
import com.nidio.model.User;
import com.nidio.repository.FavoriteRepository;
import com.nidio.repository.NeighborhoodRepository;
import com.nidio.repository.PropertyRepository;
import com.nidio.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.mockito.Mockito;
import org.springframework.mail.javamail.JavaMailSender;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Edición de una publicación por su dueño: cuándo se re-tasa (solo si cambia algo que usa
 * el modelo), que un fallo de ml-service corta la edición sin tocar nada, y la validación
 * de ownership y de dirección. Sin base ni ml-service.
 */
class PropertyServiceEditTest {

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);
    private static final String OWNER = "duena@example.com";

    private PropertyRepository propertyRepository;
    private NeighborhoodRepository neighborhoodRepository;
    private MlServiceClient mlServiceClient;
    private PropertyLifeScoreService lifeScoreService;
    private PropertyNoiseService noiseService;
    private PropertyService service;
    private Property property;

    @BeforeEach
    void setUp() {
        propertyRepository = Mockito.mock(PropertyRepository.class);
        neighborhoodRepository = Mockito.mock(NeighborhoodRepository.class);
        mlServiceClient = Mockito.mock(MlServiceClient.class);
        lifeScoreService = Mockito.mock(PropertyLifeScoreService.class);
        noiseService = Mockito.mock(PropertyNoiseService.class);
        service = new PropertyService(
                propertyRepository,
                neighborhoodRepository,
                Mockito.mock(UserRepository.class),
                Mockito.mock(FavoriteRepository.class),
                Mockito.mock(GeocodingService.class),
                Mockito.mock(JavaMailSender.class),
                "no-reply@example.com",
                mlServiceClient,
                lifeScoreService,
                noiseService);

        Neighborhood palermo = Neighborhood.builder().id(1L).name("Palermo").build();
        User owner = User.builder().id(9L).name("Dueña").email(OWNER).build();
        property = Property.builder()
                .id(5L)
                .title("Departamento en venta en Palermo")
                .propertyType(PropertyType.APARTMENT)
                .operationType(OperationType.SALE)
                .neighborhood(palermo)
                .address("Av. Santa Fe 3253")
                .location(GEOMETRY_FACTORY.createPoint(new Coordinate(-58.41, -34.58)))
                .surfaceM2(new BigDecimal("45.00"))
                .rooms(2)
                .price(new BigDecimal("150000"))
                .publisherType(PublisherType.OWNER)
                .createdBy(owner)
                .valuationRangeMin(new BigDecimal("100000"))
                .valuationRangeMax(new BigDecimal("120000"))
                .build();
        when(propertyRepository.findById(5L)).thenReturn(Optional.of(property));
        when(neighborhoodRepository.findById(1L)).thenReturn(Optional.of(palermo));
        when(propertyRepository.save(any(Property.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(mlServiceClient.predict(any())).thenReturn(new MlServiceClient.PredictResponse(
                new BigDecimal("180000"), new BigDecimal("210000"), List.of(), null));
    }

    /** Pedido de edición idéntico a la propiedad actual: cada test cambia solo lo que quiere probar. */
    private CreatePropertyRequest unchangedRequest() {
        CreatePropertyRequest r = new CreatePropertyRequest();
        r.setPropertyType(PropertyType.APARTMENT);
        r.setOperationType(OperationType.SALE);
        r.setNeighborhoodId(1L);
        r.setAddress("Av. Santa Fe 3253");
        r.setSurfaceM2(new BigDecimal("45"));
        r.setRooms(2);
        r.setPrice(new BigDecimal("150000"));
        r.setPublisherType(PublisherType.OWNER);
        return r;
    }

    @Test
    void changingOnlyThePriceDoesNotRetasar() {
        CreatePropertyRequest r = unchangedRequest();
        r.setPrice(new BigDecimal("170000"));
        r.setDescription("Nueva descripción");

        PropertyDetailResponse result = service.updateMyProperty(5L, OWNER, r);

        verify(mlServiceClient, never()).predict(any());
        assertThat(result.price()).isEqualByComparingTo("170000");
        assertThat(result.valuation().min()).isEqualByComparingTo("100000");
        assertThat(result.valuation().max()).isEqualByComparingTo("120000");
        verify(lifeScoreService, never()).computeAndStore(any());
        verify(noiseService, never()).computeAndStore(any());
    }

    @Test
    void changingSurfaceRetasarAndStoresTheNewRange() {
        CreatePropertyRequest r = unchangedRequest();
        r.setSurfaceM2(new BigDecimal("60"));

        PropertyDetailResponse result = service.updateMyProperty(5L, OWNER, r);

        verify(mlServiceClient).predict(any());
        assertThat(result.valuation().min()).isEqualByComparingTo("180000");
        assertThat(result.valuation().max()).isEqualByComparingTo("210000");
        assertThat(result.surfaceM2()).isEqualByComparingTo("60");
    }

    @Test
    void changingAnAmenityRetasar() {
        CreatePropertyRequest r = unchangedRequest();
        r.setHasPool(true);

        service.updateMyProperty(5L, OWNER, r);

        verify(mlServiceClient).predict(any());
        assertThat(property.getHasPool()).isTrue();
    }

    @Test
    void aPropertyThatNeverHadARangeIsTasadaOnEdit() {
        property.setValuationRangeMin(null);
        property.setValuationRangeMax(null);

        service.updateMyProperty(5L, OWNER, unchangedRequest());

        verify(mlServiceClient).predict(any());
        assertThat(property.getValuationRangeMin()).isEqualByComparingTo("180000");
    }

    @Test
    void ifMlServiceFailsTheEditFailsAndNothingIsChanged() {
        when(mlServiceClient.predict(any())).thenThrow(new MlServiceException("caído"));
        CreatePropertyRequest r = unchangedRequest();
        r.setSurfaceM2(new BigDecimal("60"));
        r.setPrice(new BigDecimal("999999"));

        assertThatThrownBy(() -> service.updateMyProperty(5L, OWNER, r)).isInstanceOf(MlServiceException.class);

        verify(propertyRepository, never()).save(any(Property.class));
        assertThat(property.getSurfaceM2()).isEqualByComparingTo("45");
        assertThat(property.getPrice()).isEqualByComparingTo("150000");
        assertThat(property.getValuationRangeMin()).isEqualByComparingTo("100000");
    }

    @Test
    void anotherUserCannotEditTheProperty() {
        assertThatThrownBy(() -> service.updateMyProperty(5L, "otra@example.com", unchangedRequest()))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(propertyRepository, never()).save(any(Property.class));
    }

    @Test
    void changingTheAddressRequiresAPickedSuggestion() {
        CreatePropertyRequest r = unchangedRequest();
        r.setAddress("Av. Cabildo 2000");

        assertThatThrownBy(() -> service.updateMyProperty(5L, OWNER, r)).isInstanceOf(AddressValidationException.class);
        verify(propertyRepository, never()).save(any(Property.class));
    }
}
