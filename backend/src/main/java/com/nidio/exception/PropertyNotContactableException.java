package com.nidio.exception;

// Se tira al intentar contactar al publicador de una propiedad que no tiene
// dueño real (catálogo sintético) — no hay a quién mandarle el mail.
public class PropertyNotContactableException extends RuntimeException {

    public PropertyNotContactableException(String message) {
        super(message);
    }
}
