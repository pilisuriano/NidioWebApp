package com.nidio.service;

import com.nidio.dto.GeoJsonGeometry;
import com.nidio.dto.LocationDto;
import org.locationtech.jts.geom.Coordinate;
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
