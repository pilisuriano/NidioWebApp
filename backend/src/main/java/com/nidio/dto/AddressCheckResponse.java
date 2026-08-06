package com.nidio.dto;

// Resultado de validar si una dirección (lat/lon, ya elegida del listado de
// sugerencias de georef.ar) cae dentro del barrio seleccionado. Se usa tanto
// para el chequeo "en vivo" del formulario de Publicar (GET
// /api/addresses/validate, apenas se elige la dirección) como para la
// validación que hace PropertyService.createProperty al publicar de verdad
// (ver PropertyService.checkAddressInNeighborhood).
public record AddressCheckResponse(boolean valid, String actualNeighborhoodName) {
}
