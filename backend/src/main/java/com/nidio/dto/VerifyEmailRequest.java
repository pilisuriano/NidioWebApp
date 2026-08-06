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
public class VerifyEmailRequest {

    @NotBlank(message = "El campo 'token' es obligatorio")
    private String token;
}
