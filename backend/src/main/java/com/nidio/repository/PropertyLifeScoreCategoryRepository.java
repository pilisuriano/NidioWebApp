package com.nidio.repository;

import com.nidio.model.PropertyLifeScoreCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PropertyLifeScoreCategoryRepository extends JpaRepository<PropertyLifeScoreCategory, Long> {

    List<PropertyLifeScoreCategory> findByPropertyId(Long propertyId);

    List<PropertyLifeScoreCategory> findByPropertyIdIn(java.util.Collection<Long> propertyIds);

    @Modifying
    @Query("DELETE FROM PropertyLifeScoreCategory c WHERE c.propertyId = :propertyId")
    void deleteByPropertyId(@Param("propertyId") Long propertyId);

    // Propiedades que todavía no tienen sus 7 puntajes (nuevas con ml-service
    // caído, o anteriores a la tabla). Las toma el relleno al arrancar.
    @Query("""
        SELECT p.id FROM Property p
        WHERE (SELECT COUNT(c) FROM PropertyLifeScoreCategory c WHERE c.propertyId = p.id) < 7
        ORDER BY p.id
        """)
    List<Long> findPropertyIdsMissingScores();
}
