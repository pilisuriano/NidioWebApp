package com.nidio.repository;

import com.nidio.model.LifeScoreCategoryWeight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LifeScoreCategoryWeightRepository extends JpaRepository<LifeScoreCategoryWeight, Long> {

    List<LifeScoreCategoryWeight> findByLifeScoreQueryId(Long lifeScoreQueryId);
}
