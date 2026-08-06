package com.nidio.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = "El campo 'name' es obligatorio")
    private String name;

    private String dni;

    private String phone;

    // Logo de cuenta profesional (URL ya subida vía POST /api/uploads/image).
    // Igual que dni/phone: si no viene en el request, no se toca (ver
    // AuthService.updateProfile).
    private String logoUrl;

    // Cuenta profesional: el perfil edita razón social/CUIT en vez de
    // nombre y apellido/documento — mismo criterio "si no viene, no se toca".
    private String businessName;

    private String cuit;
}
