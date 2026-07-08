package com.nidio.repository;

import com.nidio.model.NeighborhoodPriceM2;
import com.nidio.model.OperationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NeighborhoodPriceM2Repository extends JpaRepository<NeighborhoodPriceM2, Long> {

    List<NeighborhoodPriceM2> findByOperationType(OperationType operationType);

    Optional<NeighborhoodPriceM2> findFirstByNeighborhoodIdAndOperationTypeOrderByPeriodDesc(
            Long neighborhoodId, OperationType operationType);
}
