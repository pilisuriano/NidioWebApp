package com.nidio.dto;

import java.util.List;

public record GeoJsonFeatureCollection<T>(String type, List<GeoJsonFeature<T>> features) {

    public GeoJsonFeatureCollection(List<GeoJsonFeature<T>> features) {
        this("FeatureCollection", features);
    }
}
