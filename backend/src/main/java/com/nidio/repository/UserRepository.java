package com.nidio.repository;

import com.nidio.model.AccountType;
import com.nidio.model.Role;
import com.nidio.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByEmailVerifiedTrue();

    long countByActiveTrue();

    long countByRole(Role role);

    // Panel de admin: búsqueda simple por nombre o email, con filtro
    // opcional por tipo de cuenta (particular vs. profesional). Reemplaza
    // al derived query anterior (findByNameContainingIgnoreCaseOrEmail...)
    // porque ese no soportaba el filtro de accountType.
    @Query("""
        SELECT u FROM User u
        WHERE (:query IS NULL OR :query = ''
            OR LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))
          AND (:accountType IS NULL OR u.accountType = :accountType)
        """)
    Page<User> findAllForAdmin(
            @Param("query") String query, @Param("accountType") AccountType accountType, Pageable pageable);
}
