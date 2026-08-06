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

    // Catálogo público: solo propiedades activas (ver Property.active).
    @Query("""
        SELECT p FROM Property p
        WHERE p.active = true
          AND (:propertyType IS NULL OR p.propertyType = :propertyType)
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
                WHERE p.active = true
                  AND ST_DWithin(
                    p.location::geography,
                    ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
                    :radiusMeters
                )
                """,
            countQuery = """
                SELECT count(*) FROM property p
                WHERE p.active = true
                  AND ST_DWithin(
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

    // Panel admin: ve todo (activas e inactivas) por default, con búsqueda
    // simple y filtro opcional por estado (active = null trae ambos).
    @Query("""
        SELECT p FROM Property p
        WHERE (:query IS NULL OR :query = ''
            OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(p.address) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(p.neighborhood.name) LIKE LOWER(CONCAT('%', :query, '%')))
          AND (:active IS NULL OR p.active = :active)
        """)
    Page<Property> findAllForAdmin(@Param("query") String query, @Param("active") Boolean active, Pageable pageable);

    // "Mis publicaciones": igual que findAllForAdmin pero acotado a las
    // propiedades del usuario logueado (ownerEmail = createdBy.email). Con
    // Pageable.unpaged() también sirve para traer TODAS las propiedades del
    // dueño de una (ver PropertyService.getMyPropertiesStats).
    @Query("""
        SELECT p FROM Property p
        WHERE p.createdBy.email = :ownerEmail
          AND (:query IS NULL OR :query = ''
            OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(p.address) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(p.neighborhood.name) LIKE LOWER(CONCAT('%', :query, '%')))
          AND (:active IS NULL OR p.active = :active)
        """)
    Page<Property> findAllForOwner(
            @Param("ownerEmail") String ownerEmail, @Param("query") String query, @Param("active") Boolean active, Pageable pageable);
}
