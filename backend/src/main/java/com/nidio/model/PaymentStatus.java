package com.nidio.model;

// Estado de un pago de la pasarela SIMULADA: nace PENDING y el usuario lo
// resuelve con los botones "simular pago aprobado / rechazado".
public enum PaymentStatus {
    PENDING,
    APPROVED,
    REJECTED
}
