package com.nidio.service;

import com.nidio.dto.AddressCheckResponse;
import com.nidio.dto.AdminPropertyResponse;
import com.nidio.dto.CreatePropertyRequest;
import com.nidio.dto.LocationDto;
import com.nidio.dto.MyPropertiesStatsResponse;
import com.nidio.dto.MyPropertyResponse;
import com.nidio.dto.NeighborhoodRef;
import com.nidio.dto.PagedResponse;
import com.nidio.dto.PropertyDetailResponse;
import com.nidio.dto.PropertySummaryResponse;
import com.nidio.dto.ValuationRangeDto;
import com.nidio.exception.AddressValidationException;
import com.nidio.exception.PropertyDeactivatedByAdminException;
import com.nidio.exception.PropertyNotContactableException;
import com.nidio.exception.PropertyNotFavoritableException;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.Favorite;
import com.nidio.model.Neighborhood;
import com.nidio.model.OperationType;
import com.nidio.model.Property;
import com.nidio.model.PropertyType;
import com.nidio.model.User;
import com.nidio.repository.FavoriteRepository;
import com.nidio.repository.NeighborhoodRepository;
import com.nidio.repository.PropertyRepository;
import com.nidio.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Slf4j
@Service
public class PropertyService {

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    private static final java.util.Map<PropertyType, String> PROPERTY_TYPE_LABEL = java.util.Map.of(
            PropertyType.APARTMENT, "Departamento",
            PropertyType.HOUSE, "Casa",
            PropertyType.PH, "PH");

    private final PropertyRepository propertyRepository;
    private final NeighborhoodRepository neighborhoodRepository;
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;
    private final GeocodingService geocodingService;
    private final JavaMailSender mailSender;
    private final String mailFrom;
    // Para la tasación automática al publicar (ver createProperty) -- mismo
    // cliente que ya usa ValuationService para /predict.
    private final MlServiceClient mlServiceClient;
    // Puntajes de Life Score por categoría para el recomendador (se calculan al
    // publicar y al cambiar la dirección; ver PropertyLifeScoreService).
    private final PropertyLifeScoreService propertyLifeScoreService;
    // Ruido día/noche de la propiedad para las etiquetas (se calcula en los mismos
    // momentos que el Life Score por categoría; ver PropertyNoiseService).
    private final PropertyNoiseService propertyNoiseService;

    public PropertyService(
            PropertyRepository propertyRepository,
            NeighborhoodRepository neighborhoodRepository,
            UserRepository userRepository,
            FavoriteRepository favoriteRepository,
            GeocodingService geocodingService,
            JavaMailSender mailSender,
            @Value("${app.mail.from}") String mailFrom,
            MlServiceClient mlServiceClient,
            PropertyLifeScoreService propertyLifeScoreService,
            PropertyNoiseService propertyNoiseService
    ) {
        this.propertyRepository = propertyRepository;
        this.neighborhoodRepository = neighborhoodRepository;
        this.userRepository = userRepository;
        this.favoriteRepository = favoriteRepository;
        this.geocodingService = geocodingService;
        this.mailSender = mailSender;
        this.mailFrom = mailFrom;
        this.mlServiceClient = mlServiceClient;
        this.propertyLifeScoreService = propertyLifeScoreService;
        this.propertyNoiseService = propertyNoiseService;
    }

    @Transactional(readOnly = true)
    public PagedResponse<PropertySummaryResponse> listProperties(
            PropertyType propertyType,
            Long neighborhoodId,
            OperationType operationType,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Property> result = propertyRepository.findByFilters(
                propertyType, neighborhoodId, operationType, minPrice, maxPrice, pageable);
        return toPagedResponse(result);
    }

    // Endpoint público: una propiedad dada de baja por un admin se trata
    // como si no existiera (no se filtra el motivo, igual que el resto de
    // los "no encontrado" de la app).
    @Transactional(readOnly = true)
    public PropertyDetailResponse getProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .filter(Property::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la propiedad " + id));
        return toDetail(property);
    }

    // HU "Publicar": un usuario logueado carga su propia propiedad. A
    // diferencia del resto de la app, acá NO se usa el geocoder sintético
    // (ver GeocodingService): el frontend hace elegir la dirección de un
    // listado de sugerencias reales de georef.ar (ver AddressController), y
    // acá se verifica que esas coordenadas realmente caigan dentro del
    // barrio elegido (point-in-polygon contra el boundary de Neighborhood)
    // antes de guardarlas como ubicación de la propiedad.
    //
    // Tasación automática al publicar (agregado 15/08/2026, a pedido de
    // Pili: "quiero que ya esté el rango medido por Nidio... como las demás
    // del dataset de muestra"). Antes de este cambio, createProperty NUNCA
    // llamaba al ml-service -- el precio lo define el usuario, pero el
    // RANGO ESTIMADO de Nidio (para poder mostrar el mismo cartel
    // sobre/sub/en-rango que ya tienen las 200 propiedades de muestra) no se
    // calculaba para nada en este flujo, quedaba silenciosamente sin tasar.
    // Se llama a mlServiceClient.predict() con el mismo contrato que ya usa
    // ValuationService (mismo /predict), ANTES de construir/guardar la
    // Property: si el ml-service no responde, la publicación falla entera
    // (nada queda guardado a medias) -- decisión explícita de Pili, para
    // garantizar que ninguna propiedad quede publicada sin su rango de
    // Nidio, aceptando que la publicación depende de que el ml-service esté
    // arriba en ese momento (ver ítem de Render/spin-down en el roadmap).
    //
    // declaredPrice se manda en null a propósito, igual que hace
    // generar_200_propiedades_paso2.py al sembrar las 200 de muestra: ese
    // campo del modelo está documentado como "USD only" y mezclar un precio
    // de alquiler en ARS (property.price, ver convención de moneda) sería
    // un error de unidades -- no hace falta de todos modos, ese campo solo
    // sirve para la comparación EN_RANGO/SUB/SOBRE de la pantalla de
    // Tasación en vivo, que acá se calcula del lado del frontend
    // (PropertyDetail.jsx / ValuationBadge) comparando property.price
    // contra el rango, no en este punto.
    @Transactional
    public PropertyDetailResponse createProperty(CreatePropertyRequest request, String userEmail) {
        Neighborhood neighborhood = neighborhoodRepository.findById(request.getNeighborhoodId())
                .orElseThrow(() -> new ResourceNotFoundException("No existe el barrio " + request.getNeighborhoodId()));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (request.getLat() == null || request.getLon() == null) {
            throw new AddressValidationException(
                    "Elegí una dirección de la lista de sugerencias para poder publicar.");
        }
        Point addressPoint = GEOMETRY_FACTORY.createPoint(new Coordinate(request.getLon(), request.getLat()));
        ensurePointInNeighborhood(addressPoint, neighborhood);

        MlServiceClient.PredictResponse prediction = predictValuation(
                request.getOperationType(),
                request.getPropertyType(),
                neighborhood,
                request.getSurfaceM2(),
                request.getRooms(),
                request.getTotalSurfaceM2(),
                request.getBathrooms(),
                request.getPropertyCondition(),
                request.getExpensesUsd(),
                request.getHasPool(),
                request.getHasGarage(),
                request.getBuildingAmenities(),
                request.getSecurity24h(),
                request.getBright(),
                request.getAptoCredito(),
                request.getFurnished());

        Property property = Property.builder()
                .title(buildTitle(request.getPropertyType(), request.getOperationType(), neighborhood.getName()))
                .propertyType(request.getPropertyType())
                .operationType(request.getOperationType())
                .neighborhood(neighborhood)
                .address(request.getAddress())
                .location(addressPoint)
                .surfaceM2(request.getSurfaceM2())
                .totalSurfaceM2(request.getTotalSurfaceM2())
                .rooms(request.getRooms())
                .bathrooms(request.getBathrooms())
                .ageYears(request.getAgeYears())
                .orientation(request.getOrientation())
                .price(request.getPrice())
                .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : List.of())
                .description(request.getDescription())
                .createdBy(user)
                .publisherType(request.getPublisherType())
                .propertyCondition(request.getPropertyCondition())
                .expensesUsd(request.getExpensesUsd())
                .hasPool(request.getHasPool())
                .hasGarage(request.getHasGarage())
                .buildingAmenities(request.getBuildingAmenities())
                .security24h(request.getSecurity24h())
                .bright(request.getBright())
                .aptoCredito(request.getAptoCredito())
                .furnished(request.getFurnished())
                .valuationRangeMin(prediction.min())
                .valuationRangeMax(prediction.max())
                .build();
        property = propertyRepository.save(property);

        // Si ml-service no responde, la publicación sigue: la propiedad queda sin
        // puntajes por categoría y el relleno de arranque los calcula después.
        propertyLifeScoreService.computeAndStore(property);
        propertyNoiseService.computeAndStore(property);

        return toDetail(property);
    }

    // --- ABM de propiedades (panel admin) -----------------------------------

    // A diferencia de getProperty(id) (público), acá una propiedad
    // desactivada SÍ se devuelve: el admin necesita poder verla/editarla
    // para reactivarla o corregirla.
    @Transactional(readOnly = true)
    public PropertyDetailResponse getPropertyForAdmin(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la propiedad " + id));
        return toDetail(property);
    }

    // Campos de orden permitidos desde el panel admin (whitelist: nunca se
    // pasa el "sortBy" del request directo a Sort.by, para no exponer
    // nombres de campos/relaciones arbitrarios).
    private static final java.util.Map<String, String> ADMIN_SORT_FIELDS = java.util.Map.of(
            "createdAt", "createdAt",
            "price", "price",
            "surfaceM2", "surfaceM2",
            "title", "title");

    @Transactional(readOnly = true)
    public PagedResponse<AdminPropertyResponse> listPropertiesForAdmin(
            String query, Boolean active, OperationType operationType, String sortBy, String sortDir, int page, int size
    ) {
        String field = ADMIN_SORT_FIELDS.getOrDefault(sortBy, "createdAt");
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, field));
        Page<Property> result = propertyRepository.findAllForAdmin(query, active, operationType, pageable);
        return new PagedResponse<>(
                result.getContent().stream().map(this::toAdminResponse).toList(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    // Al desactivar desde el panel admin (a diferencia de que lo haga el
    // propio dueño desde "Mis publicaciones"): se marca deactivatedByAdmin
    // (bloquea que el dueño la reactive solo) y se le manda un mail de
    // aviso. Al reactivar, se limpia la marca — solo un admin puede hacerlo.
    @Transactional
    public AdminPropertyResponse setPropertyActive(Long id, boolean active) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la propiedad " + id));
        property.setActive(active);
        property.setDeactivatedByAdmin(!active);
        property = propertyRepository.save(property);
        if (!active) {
            sendDeactivationEmail(property);
        }
        return toAdminResponse(property);
    }

    // No se relanza si falla el mail: la desactivación en sí ya se guardó, un
    // problema de SMTP no debería revertir una acción de moderación. No hay
    // nada que mandar si la propiedad es del catálogo sintético (sin dueño real).
    private void sendDeactivationEmail(Property property) {
        User owner = property.getCreatedBy();
        if (owner == null) {
            return;
        }
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(mailFrom);
            mail.setTo(owner.getEmail());
            mail.setSubject("Nidio: tu publicación fue desactivada — " + property.getTitle());
            mail.setText(
                    "Hola " + owner.getName() + ",\n\n"
                            + "Un administrador desactivó tu publicación \"" + property.getTitle() + "\" ("
                            + property.getAddress() + "). Ya no es visible para el resto de los usuarios de Nidio.\n\n"
                            + "Para más información, escribinos a soporte.nidio@gmail.com.");
            mailSender.send(mail);
        } catch (MailException e) {
            log.warn("No se pudo enviar el mail de desactivación para la propiedad {}", property.getId(), e);
        }
    }

    // Edición desde el panel admin. Igual que cuando edita el dueño (ver
    // updateMyProperty), si cambia algo que usa el modelo de tasación el rango
    // se recalcula en el momento y, si ml-service no responde, la edición falla
    // entera (no queda un precio nuevo con un rango viejo). La dirección acá se
    // sigue resolviendo con el geocoder interno: el panel no usa el autocomplete.
    // Las características opcionales que el panel no manda (null) se conservan.
    @Transactional
    public AdminPropertyResponse updateProperty(Long id, CreatePropertyRequest request) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la propiedad " + id));
        Neighborhood neighborhood = neighborhoodRepository.findById(request.getNeighborhoodId())
                .orElseThrow(() -> new ResourceNotFoundException("No existe el barrio " + request.getNeighborhoodId()));

        // Solo re-geocodifica si la dirección cambió: evita mover el pin en
        // el mapa por una edición que no toca la ubicación.
        Point newLocation = null;
        if (!property.getAddress().equals(request.getAddress())) {
            LocationDto location = geocodingService.geocode(request.getAddress(), neighborhood);
            newLocation = GEOMETRY_FACTORY.createPoint(new Coordinate(location.lon(), location.lat()));
        }
        return toAdminResponse(applyEdit(property, neighborhood, request, newLocation, false));
    }

    // --- Edición por el dueño -------------------------------------------------

    /** Datos de la propia publicación para precargar el formulario de edición (también si está desactivada). */
    @Transactional(readOnly = true)
    public PropertyDetailResponse getMyProperty(Long id, String ownerEmail) {
        return toDetail(getOwnedProperty(id, ownerEmail));
    }

    /**
     * El dueño edita su publicación: datos, precio y fotos. La tasación de Nidio no se
     * edita: si cambia algo que usa el modelo (operación, tipo, barrio, superficies,
     * ambientes, baños, estado, expensas o amenities) el rango se recalcula acá mismo, y
     * si ml-service no responde la edición falla entera y no se guarda nada. Cambiar solo
     * el precio, la descripción, las fotos, la orientación, la antigüedad o el tipo de
     * publicador no re-tasa.
     *
     * Si cambia la dirección, el frontend manda las coordenadas de la sugerencia elegida
     * (igual que al publicar) y se valida que caigan dentro del barrio; si cambia solo el
     * barrio, se valida que la ubicación guardada caiga dentro del barrio nuevo.
     */
    @Transactional
    public PropertyDetailResponse updateMyProperty(Long id, String ownerEmail, CreatePropertyRequest request) {
        Property property = getOwnedProperty(id, ownerEmail);
        Neighborhood neighborhood = neighborhoodRepository.findById(request.getNeighborhoodId())
                .orElseThrow(() -> new ResourceNotFoundException("No existe el barrio " + request.getNeighborhoodId()));

        Point newLocation = null;
        if (!property.getAddress().equals(request.getAddress())) {
            if (request.getLat() == null || request.getLon() == null) {
                throw new AddressValidationException(
                        "Elegí una dirección de la lista de sugerencias para poder guardar el cambio.");
            }
            newLocation = GEOMETRY_FACTORY.createPoint(new Coordinate(request.getLon(), request.getLat()));
            ensurePointInNeighborhood(newLocation, neighborhood);
        } else if (!neighborhood.getId().equals(property.getNeighborhood().getId())) {
            ensurePointInNeighborhood(property.getLocation(), neighborhood);
        }
        return toDetail(applyEdit(property, neighborhood, request, newLocation, true));
    }

    /**
     * Aplica la edición y re-tasa si hace falta. La tasación se pide ANTES de tocar la
     * propiedad: si ml-service falla, la excepción corta la transacción y no queda nada
     * guardado.
     *
     * @param newLocation       null si la dirección no cambió
     * @param replaceExtras     true: las características opcionales se reemplazan tal como vienen
     *                          (null = el dueño las borró); false: las que vienen en null se conservan
     *                          (el panel admin no las muestra)
     */
    private Property applyEdit(Property property, Neighborhood neighborhood, CreatePropertyRequest r,
                               Point newLocation, boolean replaceExtras) {
        String condition = extra(replaceExtras, r.getPropertyCondition(), property.getPropertyCondition());
        BigDecimal expenses = extra(replaceExtras, r.getExpensesUsd(), property.getExpensesUsd());
        Boolean pool = extra(replaceExtras, r.getHasPool(), property.getHasPool());
        Boolean garage = extra(replaceExtras, r.getHasGarage(), property.getHasGarage());
        Boolean amenities = extra(replaceExtras, r.getBuildingAmenities(), property.getBuildingAmenities());
        Boolean security = extra(replaceExtras, r.getSecurity24h(), property.getSecurity24h());
        Boolean bright = extra(replaceExtras, r.getBright(), property.getBright());
        Boolean apto = extra(replaceExtras, r.getAptoCredito(), property.getAptoCredito());
        Boolean furnished = extra(replaceExtras, r.getFurnished(), property.getFurnished());

        boolean needsValuation = property.getValuationRangeMin() == null
                || property.getValuationRangeMax() == null
                || property.getOperationType() != r.getOperationType()
                || property.getPropertyType() != r.getPropertyType()
                || !neighborhood.getId().equals(property.getNeighborhood().getId())
                || differs(property.getSurfaceM2(), r.getSurfaceM2())
                || differs(property.getTotalSurfaceM2(), r.getTotalSurfaceM2())
                || !Objects.equals(property.getRooms(), r.getRooms())
                || !Objects.equals(property.getBathrooms(), r.getBathrooms())
                || !Objects.equals(property.getPropertyCondition(), condition)
                || differs(property.getExpensesUsd(), expenses)
                || !Objects.equals(property.getHasPool(), pool)
                || !Objects.equals(property.getHasGarage(), garage)
                || !Objects.equals(property.getBuildingAmenities(), amenities)
                || !Objects.equals(property.getSecurity24h(), security)
                || !Objects.equals(property.getBright(), bright)
                || !Objects.equals(property.getAptoCredito(), apto)
                || !Objects.equals(property.getFurnished(), furnished);

        MlServiceClient.PredictResponse prediction = needsValuation
                ? predictValuation(r.getOperationType(), r.getPropertyType(), neighborhood, r.getSurfaceM2(),
                        r.getRooms(), r.getTotalSurfaceM2(), r.getBathrooms(), condition, expenses, pool, garage,
                        amenities, security, bright, apto, furnished)
                : null;

        property.setTitle(buildTitle(r.getPropertyType(), r.getOperationType(), neighborhood.getName()));
        property.setPropertyType(r.getPropertyType());
        property.setOperationType(r.getOperationType());
        property.setNeighborhood(neighborhood);
        property.setAddress(r.getAddress());
        if (newLocation != null) {
            property.setLocation(newLocation);
        }
        property.setSurfaceM2(r.getSurfaceM2());
        property.setTotalSurfaceM2(r.getTotalSurfaceM2());
        property.setRooms(r.getRooms());
        property.setBathrooms(r.getBathrooms());
        property.setAgeYears(r.getAgeYears());
        property.setOrientation(r.getOrientation());
        property.setPrice(r.getPrice());
        property.setImageUrls(r.getImageUrls() != null ? r.getImageUrls() : List.of());
        property.setDescription(r.getDescription());
        property.setPublisherType(r.getPublisherType());
        property.setPropertyCondition(condition);
        property.setExpensesUsd(expenses);
        property.setHasPool(pool);
        property.setHasGarage(garage);
        property.setBuildingAmenities(amenities);
        property.setSecurity24h(security);
        property.setBright(bright);
        property.setAptoCredito(apto);
        property.setFurnished(furnished);
        if (prediction != null) {
            property.setValuationRangeMin(prediction.min());
            property.setValuationRangeMax(prediction.max());
        }

        property = propertyRepository.save(property);
        if (newLocation != null) {
            // Cambió la ubicación: se recalculan los datos que dependen de ella. Si
            // ml-service no responde acá no se corta la edición; el relleno de
            // arranque los completa después.
            propertyLifeScoreService.computeAndStore(property);
            propertyNoiseService.computeAndStore(property);
        }
        return property;
    }

    private static <T> T extra(boolean replace, T requested, T current) {
        return replace || requested != null ? requested : current;
    }

    private static boolean differs(BigDecimal a, BigDecimal b) {
        if (a == null || b == null) {
            return a != b;
        }
        return a.compareTo(b) != 0;
    }

    private void ensurePointInNeighborhood(Point point, Neighborhood neighborhood) {
        AddressCheckResponse check = checkPointInNeighborhood(point, neighborhood);
        if (!check.valid()) {
            String suggestion = check.actualNeighborhoodName() != null
                    ? " Según la dirección ingresada, parecería estar en " + check.actualNeighborhoodName() + "."
                    : " Probá con otra dirección o confirmá que sea correcta.";
            throw new AddressValidationException(
                    "La dirección ingresada no está dentro de " + neighborhood.getName() + "." + suggestion);
        }
    }

    // declaredPrice va en null a propósito (ver createProperty).
    private MlServiceClient.PredictResponse predictValuation(
            OperationType operationType, PropertyType propertyType, Neighborhood neighborhood,
            BigDecimal surfaceM2, Integer rooms, BigDecimal totalSurfaceM2, Integer bathrooms,
            String propertyCondition, BigDecimal expensesUsd, Boolean hasPool, Boolean hasGarage,
            Boolean buildingAmenities, Boolean security24h, Boolean bright, Boolean aptoCredito,
            Boolean furnished) {
        return mlServiceClient.predict(new MlServiceClient.PredictRequest(
                operationType, propertyType, neighborhood.getName(), surfaceM2, rooms, totalSurfaceM2,
                bathrooms, propertyCondition, expensesUsd, hasPool, hasGarage, buildingAmenities,
                security24h, bright, aptoCredito, furnished, null));
    }

    /**
     * Completa el rango de tasación de una publicación que no lo tiene (el modelo es el mismo de
     * /predict, sin precio declarado). Devuelve false si ml-service no responde, para que el
     * relleno de arranque corte y reintente más tarde.
     */
    @Transactional
    public boolean backfillValuation(Long id) {
        Property property = propertyRepository.findById(id).orElse(null);
        if (property == null
                || (property.getValuationRangeMin() != null && property.getValuationRangeMax() != null)) {
            return true;
        }
        try {
            MlServiceClient.PredictResponse prediction = predictValuation(
                    property.getOperationType(), property.getPropertyType(), property.getNeighborhood(),
                    property.getSurfaceM2(), property.getRooms(), property.getTotalSurfaceM2(),
                    property.getBathrooms(), property.getPropertyCondition(), property.getExpensesUsd(),
                    property.getHasPool(), property.getHasGarage(), property.getBuildingAmenities(),
                    property.getSecurity24h(), property.getBright(), property.getAptoCredito(),
                    property.getFurnished());
            property.setValuationRangeMin(prediction.min());
            property.setValuationRangeMax(prediction.max());
            propertyRepository.save(property);
            return true;
        } catch (RuntimeException e) {
            log.warn("No se pudo tasar la propiedad {}: {}", id, e.getMessage());
            return false;
        }
    }

    @Transactional
    public void deleteProperty(Long id) {
        if (!propertyRepository.existsById(id)) {
            throw new ResourceNotFoundException("No existe la propiedad " + id);
        }
        propertyRepository.deleteById(id);
    }

    private AdminPropertyResponse toAdminResponse(Property property) {
        return new AdminPropertyResponse(
                property.getId(),
                property.getTitle(),
                property.getPropertyType(),
                property.getOperationType(),
                property.getNeighborhood().getName(),
                property.getAddress(),
                property.getPrice(),
                property.getSurfaceM2(),
                property.getTotalSurfaceM2(),
                property.getRooms(),
                property.getBathrooms(),
                property.getAgeYears(),
                property.getOrientation(),
                property.getImageUrls(),
                property.getDescription(),
                property.isActive(),
                property.getCreatedBy() != null ? property.getCreatedBy().getName() : null,
                property.getPublisherType(),
                property.getCreatedAt());
    }

    // --- "Mis publicaciones" (el dueño ve/gestiona SUS propias propiedades;
    // a diferencia del panel admin, acá se verifica ownership antes de tocar
    // nada — ver getOwnedProperty) ------------------------------------------

    @Transactional(readOnly = true)
    public PagedResponse<MyPropertyResponse> listMyProperties(
            String ownerEmail, String query, Boolean active, Boolean featured, String sortBy, String sortDir, int page, int size
    ) {
        String field = ADMIN_SORT_FIELDS.getOrDefault(sortBy, "createdAt");
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, field));
        // featured = true: solo las que tienen hoy un destacado en curso.
        Page<Property> result = Boolean.TRUE.equals(featured)
                ? propertyRepository.findFeaturedForOwner(ownerEmail, query, active, java.time.Instant.now(), pageable)
                : propertyRepository.findAllForOwner(ownerEmail, query, active, pageable);
        return new PagedResponse<>(
                result.getContent().stream().map(this::toMyPropertyResponse).toList(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public MyPropertiesStatsResponse getMyPropertiesStats(String ownerEmail) {
        List<Property> properties = propertyRepository
                .findAllForOwner(ownerEmail, null, null, Pageable.unpaged())
                .getContent();

        long total = properties.size();
        long activeCount = properties.stream().filter(Property::isActive).count();
        long saleCount = properties.stream().filter(p -> p.getOperationType() == OperationType.SALE).count();
        BigDecimal avgPriceSale = averagePrice(properties, OperationType.SALE);
        BigDecimal avgPriceRent = averagePrice(properties, OperationType.RENT);

        List<Long> ids = properties.stream().map(Property::getId).toList();
        long totalFavorites = ids.isEmpty() ? 0 : favoriteRepository.countByPropertyIdIn(ids);

        return new MyPropertiesStatsResponse(
                total, activeCount, total - activeCount, saleCount, total - saleCount, totalFavorites,
                avgPriceSale, avgPriceRent);
    }

    private static BigDecimal averagePrice(List<Property> properties, OperationType operationType) {
        List<BigDecimal> prices = properties.stream()
                .filter(p -> p.getOperationType() == operationType)
                .map(Property::getPrice)
                .toList();
        if (prices.isEmpty()) {
            return null;
        }
        BigDecimal sum = prices.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(prices.size()), 0, RoundingMode.HALF_UP);
    }

    @Transactional
    public MyPropertyResponse setMyPropertyActive(Long id, String ownerEmail, boolean active) {
        Property property = getOwnedProperty(id, ownerEmail);
        if (active && property.isDeactivatedByAdmin()) {
            throw new PropertyDeactivatedByAdminException(
                    "Esta publicación fue desactivada por un administrador y no se puede reactivar sola. "
                            + "Escribinos a soporte.nidio@gmail.com para más información.");
        }
        property.setActive(active);
        property = propertyRepository.save(property);
        return toMyPropertyResponse(property);
    }

    @Transactional
    public void deleteMyProperty(Long id, String ownerEmail) {
        Property property = getOwnedProperty(id, ownerEmail);
        propertyRepository.delete(property);
    }

    // 404 (no 403) a propósito, mismo criterio que el resto de la app: no
    // hace falta distinguir "no existe" de "no es tuya" del lado del cliente.
    private Property getOwnedProperty(Long id, String ownerEmail) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la propiedad " + id));
        if (property.getCreatedBy() == null || !property.getCreatedBy().getEmail().equalsIgnoreCase(ownerEmail)) {
            throw new ResourceNotFoundException("No existe la propiedad " + id);
        }
        return property;
    }

    private MyPropertyResponse toMyPropertyResponse(Property property) {
        long favoriteCount = favoriteRepository.countByPropertyId(property.getId());
        return new MyPropertyResponse(
                property.getId(),
                property.getTitle(),
                property.getPropertyType(),
                property.getOperationType(),
                property.getNeighborhood().getName(),
                property.getAddress(),
                property.getPrice(),
                property.getSurfaceM2(),
                property.getTotalSurfaceM2(),
                property.getRooms(),
                property.getBathrooms(),
                property.getAgeYears(),
                property.getOrientation(),
                property.getImageUrls(),
                property.getDescription(),
                property.isActive(),
                property.isDeactivatedByAdmin(),
                property.getPublisherType(),
                property.getCreatedAt(),
                favoriteCount);
    }

    private static String buildTitle(PropertyType propertyType, OperationType operationType, String neighborhoodName) {
        String operationLabel = operationType == OperationType.SALE ? "en venta" : "en alquiler";
        return "%s %s en %s".formatted(PROPERTY_TYPE_LABEL.get(propertyType), operationLabel, neighborhoodName);
    }

    // Usado solo para armar un mensaje de error más útil cuando la dirección
    // elegida no cae dentro del barrio seleccionado (ver createProperty):
    // barre todos los barrios buscando cuál sí la contiene.
    private String findNeighborhoodContaining(Point point) {
        for (Neighborhood n : neighborhoodRepository.findAll()) {
            if (n.getBoundary().contains(point)) {
                return n.getName();
            }
        }
        return null;
    }

    private AddressCheckResponse checkPointInNeighborhood(Point point, Neighborhood neighborhood) {
        if (neighborhood.getBoundary().contains(point)) {
            return new AddressCheckResponse(true, null);
        }
        return new AddressCheckResponse(false, findNeighborhoodContaining(point));
    }

    // HU "Publicar": chequeo "en vivo" desde el formulario, apenas se elige
    // una dirección de la lista de sugerencias — así el usuario ve el error
    // de "no está dentro de tu barrio" ahí mismo, sin tener que llegar al
    // final del wizard y hacer click en "Publicar aviso" para enterarse (ver
    // AddressController). Usa la misma lógica que createProperty, para que
    // el chequeo en vivo y el que de verdad bloquea la publicación nunca
    // diverjan.
    @Transactional(readOnly = true)
    public AddressCheckResponse checkAddressInNeighborhood(double lat, double lon, Long neighborhoodId) {
        Neighborhood neighborhood = neighborhoodRepository.findById(neighborhoodId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el barrio " + neighborhoodId));
        Point point = GEOMETRY_FACTORY.createPoint(new Coordinate(lon, lat));
        return checkPointInNeighborhood(point, neighborhood);
    }

    private PropertyDetailResponse toDetail(Property property) {
        ValuationRangeDto valuation = null;
        if (property.getValuationRangeMin() != null && property.getValuationRangeMax() != null) {
            valuation = new ValuationRangeDto(property.getValuationRangeMin(), property.getValuationRangeMax());
        }

        return new PropertyDetailResponse(
                property.getId(),
                property.getTitle(),
                property.getPropertyType(),
                property.getOperationType(),
                new NeighborhoodRef(property.getNeighborhood().getId(), property.getNeighborhood().getName()),
                property.getAddress(),
                GeoJsonMapper.toLocation(property.getLocation()),
                property.getSurfaceM2(),
                property.getTotalSurfaceM2(),
                property.getRooms(),
                property.getBathrooms(),
                property.getAgeYears(),
                property.getOrientation(),
                property.getPrice(),
                property.getImageUrls(),
                property.getDescription(),
                valuation,
                property.getLifeScore(),
                property.getExpensesUsd(),
                property.getPropertyCondition(),
                property.getHasPool(),
                property.getHasGarage(),
                property.getBuildingAmenities(),
                property.getSecurity24h(),
                property.getBright(),
                property.getAptoCredito(),
                property.getFurnished(),
                property.getCreatedBy() != null ? property.getCreatedBy().getName() : null,
                property.getCreatedBy() != null ? property.getCreatedBy().getEmail() : null,
                property.getCreatedBy() != null ? property.getCreatedBy().getPhone() : null,
                property.getCreatedBy() != null ? property.getCreatedBy().getLogoUrl() : null,
                property.getPublisherType());
    }

    // HU "detalle de propiedad": manda un mail al publicador con el mensaje
    // del interesado, sin exponerle el email a nadie del lado público — solo
    // funciona si la propiedad tiene dueño real (no el catálogo sintético).
    @Transactional(readOnly = true)
    public void contactOwner(Long propertyId, String requesterEmail, String message) {
        Property property = propertyRepository.findById(propertyId)
                .filter(Property::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la propiedad " + propertyId));
        User owner = property.getCreatedBy();
        if (owner == null) {
            throw new PropertyNotContactableException(
                    "Esta propiedad es parte del catálogo sintético de demostración y no tiene un publicador real para contactar");
        }
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(mailFrom);
            mail.setTo(owner.getEmail());
            mail.setReplyTo(requester.getEmail());
            mail.setSubject("Nidio: alguien está interesado en tu propiedad — " + property.getTitle());
            String contactLine = requester.getPhone() != null && !requester.getPhone().isBlank()
                    ? "%s (%s) — tel. %s".formatted(requester.getName(), requester.getEmail(), requester.getPhone())
                    : "%s (%s)".formatted(requester.getName(), requester.getEmail());
            mail.setText(
                    "Recibiste un mensaje por tu aviso \"" + property.getTitle() + "\" en " + property.getAddress()
                            + ".\n\nDe: " + contactLine
                            + "\n\nMensaje:\n" + message
                            + "\n\nPodés responder directamente a este mail.");
            mailSender.send(mail);
        } catch (MailException e) {
            log.warn("No se pudo enviar el mail de contacto para la propiedad {}", propertyId, e);
            throw new PropertyNotContactableException("No se pudo enviar el mensaje, intentá de nuevo más tarde");
        }
    }

    // --- Favoritos ("Mis favoritos", reemplaza al historial de valuaciones
    // /Life Score que antes se mostraba en "Mis búsquedas") ------------------

    // Idempotente: si ya estaba marcada, no hace nada (no rompe si el
    // usuario toca el corazón dos veces por una carrera entre pestañas).
    @Transactional
    public void addFavorite(Long propertyId, String userEmail) {
        if (favoriteRepository.existsByUserEmailAndPropertyId(userEmail, propertyId)) {
            return;
        }
        Property property = propertyRepository.findById(propertyId)
                .filter(Property::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la propiedad " + propertyId));
        if (property.getCreatedBy() != null && property.getCreatedBy().getEmail().equalsIgnoreCase(userEmail)) {
            throw new PropertyNotFavoritableException("No podés marcar como favorita tu propia publicación");
        }
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        favoriteRepository.save(Favorite.builder().user(user).property(property).build());
    }

    // También idempotente: si no estaba marcada, no hace nada.
    @Transactional
    public void removeFavorite(Long propertyId, String userEmail) {
        favoriteRepository.deleteByUserEmailAndPropertyId(userEmail, propertyId);
    }

    // IDs livianos (sin traer toda la propiedad) para que el frontend pinte
    // el corazón lleno/vacío en cualquier tarjeta sin pedir de a una.
    @Transactional(readOnly = true)
    public Set<Long> listFavoriteIds(String userEmail) {
        return favoriteRepository.findByUserEmailOrderByCreatedAtDesc(userEmail).stream()
                .map(f -> f.getProperty().getId())
                .collect(java.util.stream.Collectors.toSet());
    }

    @Transactional(readOnly = true)
    public List<PropertySummaryResponse> listFavorites(String userEmail) {
        return favoriteRepository.findByUserEmailOrderByCreatedAtDesc(userEmail).stream()
                .map(Favorite::getProperty)
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<PropertySummaryResponse> nearby(String address, double radiusKm, int page, int size) {
        LocationDto location = geocodingService.geocode(address);
        Page<Property> result = propertyRepository.findWithinRadius(
                location.lat(), location.lon(), radiusKm * 1000, PageRequest.of(page, size));
        return toPagedResponse(result);
    }

    private PagedResponse<PropertySummaryResponse> toPagedResponse(Page<Property> result) {
        return new PagedResponse<>(
                result.getContent().stream().map(this::toSummary).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages());
    }

    // Visibilidad de paquete: la usa RecommendationService para devolver el mismo resumen del catálogo.
    PropertySummaryResponse toSummary(Property property) {
        ValuationRangeDto valuation = null;
        if (property.getValuationRangeMin() != null && property.getValuationRangeMax() != null) {
            valuation = new ValuationRangeDto(property.getValuationRangeMin(), property.getValuationRangeMax());
        }
        LocationDto location = property.getLocation() == null
                ? null
                : new LocationDto(property.getLocation().getY(), property.getLocation().getX());
        return new PropertySummaryResponse(
                property.getId(),
                property.getTitle(),
                property.getPropertyType(),
                property.getOperationType(),
                property.getNeighborhood().getName(),
                property.getAddress(),
                property.getDescription(),
                property.getPrice(),
                property.getSurfaceM2(),
                property.getRooms(),
                property.getBathrooms(),
                property.getAgeYears(),
                property.getOrientation(),
                property.getPublisherType(),
                property.getImageUrls().isEmpty() ? null : property.getImageUrls().get(0),
                valuation,
                location,
                property.isActive(),
                property.getHasPool(),
                property.getHasGarage(),
                property.getBuildingAmenities(),
                property.getSecurity24h(),
                property.getBright(),
                property.getAptoCredito(),
                property.getFurnished());
    }
}
