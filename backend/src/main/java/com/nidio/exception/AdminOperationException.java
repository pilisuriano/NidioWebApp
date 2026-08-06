package com.nidio.exception;

// Acción de admin inválida (ej. un admin intentando quitarse su propio rol
// o desactivar su propia cuenta, lo que dejaría el panel sin admins).
public class AdminOperationException extends RuntimeException {

    public AdminOperationException(String message) {
        super(message);
    }
}
