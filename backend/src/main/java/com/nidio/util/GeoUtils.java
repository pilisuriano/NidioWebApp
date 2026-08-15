package com.nidio.util;

/**
 * Distancia en línea recta entre dos puntos geográficos (fórmula de
 * Haversine), en metros. Se usa para "Mis lugares" del Life Score
 * (LifeScoreService.scoreCustomPlaces) — el mismo método que ya está
 * documentado en la tesis (sección 2.1.6) y consistente con el ST_DWithin
 * que usa PropertyService.nearby (HU-18).
 */
public final class GeoUtils {

    private static final double EARTH_RADIUS_M = 6_371_000;

    private GeoUtils() {
    }

    public static double haversineMeters(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_M * c;
    }
}
