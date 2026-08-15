package com.nidio.repository;

import com.nidio.model.CustomPlace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomPlaceRepository extends JpaRepository<CustomPlace, Long> {

    List<CustomPlace> findByUserEmailOrderByCreatedAtDesc(String email);

    Optional<CustomPlace> findByIdAndUserEmail(Long id, String email);

    long countByUserEmail(String email);

    void deleteByIdAndUserEmail(Long id, String email);
}
