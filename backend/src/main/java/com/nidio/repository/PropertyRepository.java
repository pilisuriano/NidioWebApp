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
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    // Publicaciones sin rango de tasación guardado (avisos demo antiguos o publicadas con ml-service
    // caído): las completa PropertyValuationBackfillRunner al arrancar.
    @Query("select p.id from Property p where p.valuationRangeMin is null or p.valuationRangeMax is null order by p.id")
    List<Long> findIdsMissingValuation();

    // Publicaciones activas de una cuenta: se compara contra el límite de su plan (BillingRules).
    long countByCreatedByIdAndActiveTrue(Long userId);

    // Catálogo completo (activas) de una operación, con el barrio ya cargado: lo usa el
    // recomendador (RecommendationService).
    @Query("""
        SELECT p FROM Property p JOIN FETCH p.neighborhood
        WHERE p.active = true AND p.operationType = :operationType
        """)
    java.util.List<Property> findActiveByOperationType(@Param("operationType") OperationType operationType);

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
          AND (:operationType IS NULL OR p.operationType = :operationType)
        """)
    Page<Property> findAllForAdmin(
            @Param("query") String query, @Param("active") Boolean active,
            @Param("operationType") OperationType operationType, Pageable pageable);

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

    // Igual que findAllForOwner pero solo las que tienen un destacado en curso en este momento
    // (ya arrancó y no venció; las reservas que empiezan más adelante no cuentan todavía).
    @Query("""
        SELECT p FROM Property p
        WHERE p.createdBy.email = :ownerEmail
          AND (:query IS NULL OR :query = ''
            OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(p.address) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(p.neighborhood.name) LIKE LOWER(CONCAT('%', :query, '%')))
          AND (:active IS NULL OR p.active = :active)
          AND EXISTS (SELECT 1 FROM FeaturedListing f
                      WHERE f.propertyId = p.id AND f.startsAt <= :now AND f.endsAt > :now)
        """)
    Page<Property> findFeaturedForOwner(
            @Param("ownerEmail") String ownerEmail, @Param("query") String query, @Param("active") Boolean active,
            @Param("now") java.time.Instant now, Pageable pageable);
}
