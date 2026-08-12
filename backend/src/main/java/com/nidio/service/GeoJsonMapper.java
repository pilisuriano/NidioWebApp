package com.nidio.service;

import com.nidio.dto.GeoJsonGeometry;
import com.nidio.dto.LocationDto;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.MultiPolygon;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.Polygon;

import java.util.ArrayList;
import java.util.List;

/** Conversión de geometrías JTS a los DTOs GeoJSON del contrato REST. */
public final class GeoJsonMapper {

    private GeoJsonMapper() {
    }

    public static GeoJsonGeometry toGeometry(Polygon polygon) {
        List<List<double[]>> rings = new ArrayList<>();
        rings.add(toRing(polygon.getExteriorRing().getCoordinates()));
        for (int i = 0; i < polygon.getNumInteriorRing(); i++) {
            rings.add(toRing(polygon.getInteriorRingN(i).getCoordinates()));
        }
        return new GeoJsonGeometry("Polygon", rings);
    }

    // Para el contorno de toda CABA (unión de los ~48 barrios, ver
    // NeighborhoodService.getCabaBoundary): si los barrios cubren el
    // territorio sin agujeros, la unión da un único Polygon, pero JTS no lo
    // garantiza (podría dar MultiPolygon si algún barrio queda separado del
    // resto). Se soportan los dos casos en vez de asumir uno y quedarnos
    // cortos si el segundo llega a pasar -- Leaflet/GeoJSON entienden
    // MultiPolygon nativamente, así que no hace falta "aplanarlo" a mano.
    public static GeoJsonGeometry toGeometry(Geometry geometry) {
        if (geometry instanceof Polygon polygon) {
            return toGeometry(polygon);
        }
        if (geometry instanceof MultiPolygon multiPolygon) {
            List<List<List<double[]>>> polygons = new ArrayList<>();
            for (int i = 0; i < multiPolygon.getNumGeometries(); i++) {
                Polygon polygon = (Polygon) multiPolygon.getGeometryN(i);
                List<List<double[]>> rings = new ArrayList<>();
                rings.add(toRing(polygon.getExteriorRing().getCoordinates()));
                for (int j = 0; j < polygon.getNumInteriorRing(); j++) {
                    rings.add(toRing(polygon.getInteriorRingN(j).getCoordinates()));
                }
                polygons.add(rings);
            }
            return new GeoJsonGeometry("MultiPolygon", polygons);
        }
        throw new IllegalArgumentException("Geometría no soportada para GeoJSON: " + geometry.getGeometryType());
    }

    public static LocationDto toLocation(Point point) {
        return new LocationDto(point.getY(), point.getX());
    }

    private static List<double[]> toRing(Coordinate[] coordinates) {
        List<double[]> ring = new ArrayList<>(coordinates.length);
        for (Coordinate c : coordinates) {
            ring.add(new double[]{c.x, c.y});
        }
        return ring;
    }
}
