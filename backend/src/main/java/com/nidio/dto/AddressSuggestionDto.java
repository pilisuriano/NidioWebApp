package com.nidio.dto;

// Una dirección candidata devuelta por georef.ar para el autocomplete de
// "Publicar" (ver GeorefClient/AddressController). "label" es la
// nomenclatura formateada de georef (ej. "AV MANUEL A MONTES DE OCA 1234,
// Comuna 4, Ciudad Autónoma de Buenos Aires"); lat/lon son las coordenadas
// reales que después PropertyService usa para geocodificar la propiedad y
// validar que caiga dentro del barrio elegido.
public record AddressSuggestionDto(String label, double lat, double lon) {
}
