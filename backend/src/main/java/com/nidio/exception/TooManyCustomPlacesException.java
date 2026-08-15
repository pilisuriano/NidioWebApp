package com.nidio.exception;

// Se tira cuando un usuario intenta agregar más de CustomPlaceService.MAX_PLACES_PER_USER
// lugares personales en Life Score.
public class TooManyCustomPlacesException extends RuntimeException {

    public TooManyCustomPlacesException(String message) {
        super(message);
    }
}
