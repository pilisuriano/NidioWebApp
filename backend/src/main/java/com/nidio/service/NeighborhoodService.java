package com.nidio.service;

import com.nidio.dto.GeoJsonGeometry;
import com.nidio.dto.NeighborhoodPriceResponse;
import com.nidio.dto.NeighborhoodRef;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.NeighborhoodPriceM2;
import com.nidio.model.OperationType;
import com.nidio.model.PriceCondition;
import com.nidio.repository.CityBoundaryRepository;
import com.nidio.repository.NeighborhoodPriceM2Repository;
import com.nidio.repository.NeighborhoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NeighborhoodService {

    private static final DateTimeFormatter PERIOD_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");

    private final NeighborhoodRepository neighborhoodRepository;
    private final NeighborhoodPriceM2Repository neighborhoodPriceM2Repository;
    private final CityBoundaryRepository cityBoundaryRepository;

    @Transactional(readOnly = true)
    public List<NeighborhoodRef> listNeighborhoods() {
        return neighborhoodRepository.findAll(Sort.by("name")).stream()
                .map(n -> new NeighborhoodRef(n.getId(), n.getName()))
                .toList();
    }

    // Segmento "representativo" para lugares que solo necesitan un precio de
    // referencia por barrio (no el mapa de calor, que sí deja elegir ambientes
    // y usado/a estrenar): 2 ambientes usados, el más publicado en IDECBA.
    private static final int DEFAULT_ROOMS = 2;
    private static final PriceCondition DEFAULT_CONDITION = PriceCondition.USED;

    @Transactional(readOnly = true)
    public NeighborhoodPriceResponse getPrice(Long neighborhoodId, OperationType operationType) {
        NeighborhoodPriceM2 price = neighborhoodPriceM2Repository
                .findFirstByNeighborhoodIdAndOperationTypeAndRoomsAndConditionOrderByPeriodDesc(
                        neighborhoodId, operationType, DEFAULT_ROOMS, DEFAULT_CONDITION)
                .orElseThrow(() -> new ResourceNotFoundException("No hay precio para el barrio " + neighborhoodId));

        return new NeighborhoodPriceResponse(
                price.getNeighborhood().getId(),
                price.getNeighborhood().getName(),
                price.getAvgPriceM2(),
                PERIOD_FORMAT.format(price.getPeriod()));
    }

    // Contorno de toda CABA para el mapa (Explorar propiedades). Antes se
    // armaba en el momento uniendo el boundary de los ~48 barrios (unión
    // geométrica con JTS, con buffer/dissolve para intentar cerrar costuras)
    // pero eso nunca terminó de andar bien: al venir de una digitalización
    // barrio por barrio, los bordes compartidos entre vecinos no coinciden
    // coordenada por coordenada, y la unión en vivo dejaba "rayas" (costuras
    // sueltas) por dentro del área, no solo en el perímetro -- ni siquiera
    // buffer(eps)+union+buffer(-eps) lo resolvía del todo. La fuente correcta
    // es un polígono oficial de perímetro de ciudad, no una unión de barrios:
    // Buenos Aires Data publica justamente eso, "Perímetro"
    // (https://data.buenosaires.gob.ar/dataset/perimetro), aparte del
    // dataset de "Barrios". Se carga una única vez vía
    // ml-service/scripts/generate_caba_perimeter.py (misma mecánica que
    // generate_barrio_boundaries.py) en la tabla city_boundary
    // (V28__add_city_boundary.sql) y acá simplemente se lee esa fila.
    @Transactional(readOnly = true)
    public GeoJsonGeometry getCabaBoundary() {
        return cityBoundaryRepository.findAll().stream()
                .findFirst()
                .map(cb -> GeoJsonMapper.toGeometry(cb.getBoundary()))
                .orElse(null);
    }
}
