package com.nidio.repository;

import com.nidio.model.PropertyNoise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface PropertyNoiseRepository extends JpaRepository<PropertyNoise, Long> {

    List<PropertyNoise> findByPropertyIdIn(Collection<Long> propertyIds);

    @Modifying
    @Query("DELETE FROM PropertyNoise n WHERE n.propertyId = :propertyId")
    void deleteByPropertyId(@Param("propertyId") Long propertyId);

    // Propiedades sin ruido calculado con la versión de datasets vigente (nuevas,
    // publicadas con ml-service caído, o calculadas con una versión anterior).
    @Query("""
        SELECT p.id FROM Property p
        WHERE NOT EXISTS (
            SELECT 1 FROM PropertyNoise n
            WHERE n.propertyId = p.id AND n.datasetsVersion = :version)
        ORDER BY p.id
        """)
    List<Long> findPropertyIdsMissingNoise(@Param("version") String version);
}
