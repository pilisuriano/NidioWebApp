package com.nidio.exception;

// Se tira cuando el usuario ya usó todos los usos gratis del mes de una
// función (tasación o recomendador). Responde 429 (ver GlobalExceptionHandler).
public class QuotaExceededException extends RuntimeException {

    public QuotaExceededException(String message) {
        super(message);
    }
}
