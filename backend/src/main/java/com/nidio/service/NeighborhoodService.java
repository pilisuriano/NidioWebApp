package com.nidio.service;

import com.nidio.dto.NeighborhoodPriceResponse;
import com.nidio.dto.NeighborhoodRef;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.NeighborhoodPriceM2;
import com.nidio.model.OperationType;
import com.nidio.model.PriceCondition;
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
}
