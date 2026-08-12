package com.nidio.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class AdminUserResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private boolean emailVerified;
    private boolean active;
    // PERSONAL (dueño directo/particular) o PROFESSIONAL (inmobiliaria,
    // corredor o desarrollador — ver professionalType para el rubro exacto).
    private String accountType;
    private String professionalType;
    private Instant createdAt;
}
