package com.nidio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Alta de un lugar personal ("Mis lugares" en Life Score). lat/lon vienen ya
// resueltos del autocomplete de direcciones (GET /api/addresses/search, igual
// que en "Publicar") — no se geocodifica de nuevo en el backend.
public record CustomPlaceRequest(
        @NotBlank(message = "El campo 'label' es obligatorio") String label,
        @NotBlank(message = "El campo 'address' es obligatorio") String address,
        @NotNull(message = "El campo 'lat' es obligatorio") Double lat,
        @NotNull(message = "El campo 'lon' es obligatorio") Double lon
) {
}
