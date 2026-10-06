package com.nidio.repository;

import com.nidio.model.NoiseZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NoiseZoneRepository extends JpaRepository<NoiseZone, Long> {

    // [neighborhoodId (Long), noiseLevel (BigDecimal)] de las zonas ya ligadas a un barrio (V9).
    @Query("SELECT n.neighborhood.id, n.noiseLevel FROM NoiseZone n WHERE n.neighborhood IS NOT NULL")
    List<Object[]> findNoiseLevelsByNeighborhood();
}
