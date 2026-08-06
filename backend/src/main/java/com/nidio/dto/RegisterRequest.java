package com.nidio.dto;

import com.nidio.model.AccountType;
import com.nidio.model.ProfessionalType;
import com.nidio.model.TaxCondition;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
            message = "debe tener al menos una mayúscula, una minúscula y un número")
    private String password;

    // Cuenta profesional ("Crear cuenta profesional" en el registro): si no
    // se manda, se toma PERSONAL. El resto de estos campos son opcionales a
    // nivel de Bean Validation porque solo son obligatorios cuando
    // accountType = PROFESSIONAL — esa regla condicional se valida a mano en
    // AuthService.register() en vez de con anotaciones.
    private AccountType accountType;
    private ProfessionalType professionalType;
    private String businessName;
    private TaxCondition taxCondition;
    private String cuit;
    private String phone;
    private String mobilePhone;

    // Constructor de conveniencia para una cuenta PERSONAL (el caso común,
    // usado también en los tests): deja los campos de cuenta profesional en
    // null en vez de tener que pasar los 10 argumentos del @AllArgsConstructor.
    public RegisterRequest(String name, String email, String password) {
        this(name, email, password, null, null, null, null, null, null, null);
    }
}
