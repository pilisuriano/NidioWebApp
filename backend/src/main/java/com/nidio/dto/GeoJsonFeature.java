package com.nidio.dto;

public record GeoJsonFeature<T>(String type, GeoJsonGeometry geometry, T properties) {

    public GeoJsonFeature(GeoJsonGeometry geometry, T properties) {
        this("Feature", geometry, properties);
    }
}
