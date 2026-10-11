package com.nidio.repository;

import com.nidio.model.Addon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface AddonRepository extends JpaRepository<Addon, Long> {

    // Adicionales que todavía no vencieron, el que vence antes primero.
    List<Addon> findByUserIdAndExpiresAtAfterOrderByExpiresAtAsc(Long userId, Instant now);
}
