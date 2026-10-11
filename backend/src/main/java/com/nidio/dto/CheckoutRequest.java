package com.nidio.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

// Pedido de compra de la pasarela simulada: el código del ítem del catálogo y, solo para
// un destacado suelto, la propiedad a destacar.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotBlank
    private String itemCode;

    private Long propertyId;

    // Solo para un destacado reservado: la fecha en que arranca (la que ofreció /api/featured/availability).
    private Instant featuredStartsAt;
}
