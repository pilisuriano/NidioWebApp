package com.nidio.repository;

import com.nidio.model.SecurityZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SecurityZoneRepository extends JpaRepository<SecurityZone, Long> {

    // [neighborhoodId (Long), securityIndex (BigDecimal; más alto = más seguro)] de las zonas ya ligadas a un barrio (V9).
    @Query("SELECT s.neighborhood.id, s.securityIndex FROM SecurityZone s WHERE s.neighborhood IS NOT NULL")
    List<Object[]> findSecurityIndexByNeighborhood();
}
