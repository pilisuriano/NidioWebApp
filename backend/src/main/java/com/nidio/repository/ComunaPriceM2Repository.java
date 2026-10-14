package com.nidio.repository;

import com.nidio.model.ComunaPriceM2;
import com.nidio.model.OperationType;
import com.nidio.model.PriceCondition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComunaPriceM2Repository extends JpaRepository<ComunaPriceM2, Long> {

    List<ComunaPriceM2> findByOperationTypeAndRoomsAndCondition(
            OperationType operationType, Integer rooms, PriceCondition condition);
}
