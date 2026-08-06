package com.nidio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRoleRequest {

    @NotBlank(message = "El campo 'role' es obligatorio")
    @Pattern(regexp = "USER|ADMIN", message = "debe ser 'USER' o 'ADMIN'")
    private String role;
}
