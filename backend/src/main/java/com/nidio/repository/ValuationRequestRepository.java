package com.nidio.repository;

import com.nidio.model.ValuationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ValuationRequestRepository extends JpaRepository<ValuationRequest, Long> {

    List<ValuationRequest> findTop20ByUserEmailOrderByCreatedAtDesc(String email);
}
