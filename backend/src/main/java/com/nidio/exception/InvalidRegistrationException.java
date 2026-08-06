package com.nidio.exception;

// Registro inválido por reglas que no se pueden expresar con anotaciones de
// Bean Validation (ej. campos obligatorios solo cuando accountType =
// PROFESSIONAL).
public class InvalidRegistrationException extends RuntimeException {

    public InvalidRegistrationException(String message) {
        super(message);
    }
}
