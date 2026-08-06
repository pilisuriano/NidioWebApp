package com.nidio.exception;

// Se tira cuando un usuario intenta marcar como favorita su propia
// publicación — no tiene sentido guardarse a uno mismo como favorito.
public class PropertyNotFavoritableException extends RuntimeException {

    public PropertyNotFavoritableException(String message) {
        super(message);
    }
}
