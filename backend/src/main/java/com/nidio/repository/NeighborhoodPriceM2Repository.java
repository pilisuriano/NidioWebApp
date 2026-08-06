package com.nidio.repository;

import com.nidio.model.NeighborhoodPriceM2;
import com.nidio.model.OperationType;
import com.nidio.model.PriceCondition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NeighborhoodPriceM2Repository extends JpaRepository<NeighborhoodPriceM2, Long> {

    List<NeighborhoodPriceM2> findByOperationTypeAndRoomsAndCondition(
            OperationType operationType, Integer rooms, PriceCondition condition);

    Optional<NeighborhoodPriceM2> findFirstByNeighborhoodIdAndOperationTypeAndRoomsAndConditionOrderByPeriodDesc(
            Long neighborhoodId, OperationType operationType, Integer rooms, PriceCondition condition);
}
