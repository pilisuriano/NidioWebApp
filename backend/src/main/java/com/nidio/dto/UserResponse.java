package com.nidio.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String dni;
    private String phone;
    private String role;
    // Cuenta profesional: accountType siempre viene ("PERSONAL" o
    // "PROFESSIONAL"), el resto es null para una cuenta PERSONAL.
    private String accountType;
    private String professionalType;
    private String businessName;
    private String taxCondition;
    private String cuit;
    private String mobilePhone;
    private String logoUrl;
}
