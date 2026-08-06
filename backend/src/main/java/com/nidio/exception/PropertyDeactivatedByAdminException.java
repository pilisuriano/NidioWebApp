package com.nidio.exception;

// El dueño intentó reactivar desde "Mis publicaciones" una propiedad que un
// ADMIN desactivó desde el panel — no se puede reactivar sola, solo un admin
// puede hacerlo (ver PropertyService.setMyPropertyActive).
public class PropertyDeactivatedByAdminException extends RuntimeException {

    public PropertyDeactivatedByAdminException(String message) {
        super(message);
    }
}
