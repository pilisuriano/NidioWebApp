package com.nidio.repository;

import com.nidio.model.Role;
import com.nidio.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByEmailVerifiedTrue();

    long countByActiveTrue();

    long countByRole(Role role);

    // Panel de admin: búsqueda simple por nombre o email.
    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email, Pageable pageable);
}
