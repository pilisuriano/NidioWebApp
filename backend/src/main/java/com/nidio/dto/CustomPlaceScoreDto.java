package com.nidio.dto;

// Resultado de un lugar personal dentro de un cálculo de Life Score:
// distancia en línea recta (Haversine, en metros) al punto consultado y el
// score 0-100 que le corresponde según esa distancia (ver
// LifeScoreService.scoreCustomPlaces — decae desde 100 hasta 0 al llegar al
// radio de "cercanía aceptable" que eligió el usuario).
public record CustomPlaceScoreDto(
        Long id, String label, String address, double lat, double lon, long distanceM, int score
) {
}
