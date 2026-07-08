package com.nidio.service;

import com.nidio.dto.NeighborhoodPriceResponse;
import com.nidio.dto.NeighborhoodRef;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.NeighborhoodPriceM2;
import com.nidio.model.OperationType;
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

    @Transactional(readOnly = true)
    public NeighborhoodPriceResponse getPrice(Long neighborhoodId, OperationType operationType) {
        NeighborhoodPriceM2 price = neighborhoodPriceM2Repository
                .findFirstByNeighborhoodIdAndOperationTypeOrderByPeriodDesc(neighborhoodId, operationType)
                .orElseThrow(() -> new ResourceNotFoundException("No hay precio para el barrio " + neighborhoodId));

        return new NeighborhoodPriceResponse(
                price.getNeighborhood().getId(),
                price.getNeighborhood().getName(),
                price.getAvgPriceM2(),
                PERIOD_FORMAT.format(price.getPeriod()));
    }
}
