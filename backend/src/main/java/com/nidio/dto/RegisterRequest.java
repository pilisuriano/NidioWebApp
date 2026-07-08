package com.nidio.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "El campo 'name' es obligatorio")
    private String name;

    @NotBlank(message = "El campo 'email' es obligatorio")
    @Email(message = "debe ser un email válido")
    private String email;

    @NotBlank(message = "El campo 'password' es obligatorio")
    @Size(min = 8, message = "debe tener al menos 8 caracteres")
    private String password;
}
