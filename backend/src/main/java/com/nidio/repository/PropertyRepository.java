package com.nidio.repository;

import com.nidio.model.OperationType;
import com.nidio.model.Property;
import com.nidio.model.PropertyType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    @Query("""
        SELECT p FROM Property p
        WHERE (:propertyType IS NULL OR p.propertyType = :propertyType)
          AND (:neighborhoodId IS NULL OR p.neighborhood.id = :neighborhoodId)
          AND (:operationType IS NULL OR p.operationType = :operationType)
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        """)
    Page<Property> findByFilters(
            @Param("propertyType") PropertyType propertyType,
            @Param("neighborhoodId") Long neighborhoodId,
            @Param("operationType") OperationType operationType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    @Query(
            value = """
                SELECT * FROM property p
                WHERE ST_DWithin(
                    p.location::geography,
                    ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
                    :radiusMeters
                )
                """,
            countQuery = """
                SELECT count(*) FROM property p
                WHERE ST_DWithin(
                    p.location::geography,
                    ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
                    :radiusMeters
                )
                """,
            nativeQuery = true
    )
    Page<Property> findWithinRadius(
            @Param("lat") double lat,
            @Param("lon") double lon,
            @Param("radiusMeters") double radiusMeters,
            Pageable pageable
    );
}
