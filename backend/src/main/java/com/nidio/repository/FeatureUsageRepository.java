package com.nidio.repository;

import com.nidio.model.FeatureUsage;
import com.nidio.model.QuotaFeature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;

public interface FeatureUsageRepository extends JpaRepository<FeatureUsage, Long> {

    // Usos de una función por un usuario desde el inicio del mes actual.
    long countByUserIdAndFeatureAndUsedAtGreaterThanEqual(Long userId, QuotaFeature feature, Instant from);
}
