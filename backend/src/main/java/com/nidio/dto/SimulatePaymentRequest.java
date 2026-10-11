package com.nidio.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Resolución del pago simulado: true = "simular pago aprobado", false = "simular pago rechazado".
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SimulatePaymentRequest {

    private boolean approved;
}
