package com.nidio.repository;

import com.nidio.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    // Vigentes: no reemplazadas y que todavía no vencieron.
    List<Subscription> findByUserIdAndReplacedFalseAndExpiresAtAfter(Long userId, Instant now);
}
