package com.nidio.repository;

import com.nidio.model.LifeScoreQuery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LifeScoreQueryRepository extends JpaRepository<LifeScoreQuery, Long> {

    List<LifeScoreQuery> findTop20ByUserEmailOrderByCreatedAtDesc(String email);
}
