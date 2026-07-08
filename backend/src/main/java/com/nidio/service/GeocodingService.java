package com.nidio.service;

import com.nidio.dto.LocationDto;
import com.nidio.model.Neighborhood;
import com.nidio.repository.NeighborhoodRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;

/**
 * Geocodificador SINTÉTICO temporal (solo CABA): si la dirección menciona un barrio
 * conocido devuelve un punto determinístico cerca de su centroide; si no, un punto
 * determinístico del centro de la ciudad. Se reemplaza por un geocoder real
 * (Nominatim / georef-ar) cuando se implemente el pipeline de datos.
 */
@Service
@RequiredArgsConstructor
public class GeocodingService {

    // Bounding box aproximado del centro de CABA para el fallback.
    private static final double FALLBACK_MIN_LAT = -34.625;
    private static final double FALLBACK_MAX_LAT = -34.575;
    private static final double FALLBACK_MIN_LON = -58.460;
    private static final double FALLBACK_MAX_LON = -58.380;

    private final NeighborhoodRepository neighborhoodRepository;

    @Transactional(readOnly = true)
    public LocationDto geocode(String address) {
        String normalized = normalize(address);
        double jitterLat = jitter(address.hashCode());
        double jitterLon = jitter(Integer.rotateLeft(address.hashCode(), 16));

        for (Neighborhood neighborhood : neighborhoodRepository.findAll()) {
            if (normalized.contains(normalize(neighborhood.getName()))) {
                Point centroid = neighborhood.getBoundary().getCentroid();
                return new LocationDto(centroid.getY() + jitterLat, centroid.getX() + jitterLon);
            }
        }

        double t1 = fraction(address.hashCode());
        double t2 = fraction(Integer.rotateLeft(address.hashCode(), 13));
        return new LocationDto(
                FALLBACK_MIN_LAT + t1 * (FALLBACK_MAX_LAT - FALLBACK_MIN_LAT),
                FALLBACK_MIN_LON + t2 * (FALLBACK_MAX_LON - FALLBACK_MIN_LON)
        );
    }

    private static String normalize(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase();
    }

    /** Corrimiento determinístico de hasta ±0.004° (~400 m). */
    private static double jitter(int hash) {
        return (fraction(hash) - 0.5) * 0.008;
    }

    private static double fraction(int hash) {
        return (hash & 0x7fffffff) / (double) Integer.MAX_VALUE;
    }
}
