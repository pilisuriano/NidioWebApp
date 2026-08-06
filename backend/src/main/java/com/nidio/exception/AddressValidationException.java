package com.nidio.exception;

// HU "Publicar": la dirección no se pudo verificar contra georef.ar (no se
// eligió ninguna sugerencia de la lista) o el punto geocodificado no cae
// dentro del boundary del barrio seleccionado.
public class AddressValidationException extends RuntimeException {

    public AddressValidationException(String message) {
        super(message);
    }
}
