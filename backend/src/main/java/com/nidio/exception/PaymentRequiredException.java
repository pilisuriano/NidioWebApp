package com.nidio.exception;

// Hace falta pagar (o contratar un plan) para seguir: se acabó el cupo de publicaciones
// o no quedan destacados incluidos. Responde 402 (ver GlobalExceptionHandler).
public class PaymentRequiredException extends RuntimeException {

    public PaymentRequiredException(String message) {
        super(message);
    }
}
