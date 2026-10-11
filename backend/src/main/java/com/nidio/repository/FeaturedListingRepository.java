package com.nidio.repository;

import com.nidio.model.FeaturedListing;
import com.nidio.model.FeaturedSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface FeaturedListingRepository extends JpaRepository<FeaturedListing, Long> {

    // Destacados en curso O reservados (todavía no vencieron), en toda la plataforma, el que termina antes primero.
    List<FeaturedListing> findByEndsAtAfterOrderByEndsAtAsc(Instant now);

    List<FeaturedListing> findByUserIdAndEndsAtAfterOrderByEndsAtAsc(Long userId, Instant now);

    // Destacados que ya arrancaron y siguen en curso (sin contar las reservas que empiezan más adelante).
    @Query("select f from FeaturedListing f where f.startsAt <= :now and f.endsAt > :now order by f.endsAt asc")
    List<FeaturedListing> findActive(@Param("now") Instant now);

    @Query("select f from FeaturedListing f where f.userId = :userId and f.startsAt <= :now and f.endsAt > :now order by f.endsAt asc")
    List<FeaturedListing> findActiveByUser(@Param("userId") Long userId, @Param("now") Instant now);

    long countByUserIdAndEndsAtAfter(Long userId, Instant now);

    boolean existsByPropertyIdAndEndsAtAfter(Long propertyId, Instant now);

    boolean existsByUserIdAndSource(Long userId, FeaturedSource source);

    long countByUserIdAndSourceAndStartsAtGreaterThanEqual(Long userId, FeaturedSource source, Instant from);

    long countByAddonId(Long addonId);
}
