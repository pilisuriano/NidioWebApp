package com.nidio.repository;

import com.nidio.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    boolean existsByUserEmailAndPropertyId(String email, Long propertyId);

    Optional<Favorite> findByUserEmailAndPropertyId(String email, Long propertyId);

    List<Favorite> findByUserEmailOrderByCreatedAtDesc(String email);

    void deleteByUserEmailAndPropertyId(String email, Long propertyId);

    // "Mis publicaciones": cuántos la guardaron como favorita (por aviso, y
    // total sumado entre todos los avisos del dueño — ver PropertyService).
    long countByPropertyId(Long propertyId);

    long countByPropertyIdIn(List<Long> propertyIds);
}
