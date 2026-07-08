package com.nidio.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "El campo 'email' es obligatorio")
    @Email(message = "debe ser un email válido")
    private String email;

    @NotBlank(message = "El campo 'password' es obligatorio")
    private String password;
}
