package com.nidio.dto;

import com.nidio.model.OperationType;
import com.nidio.model.PropertyType;
import com.nidio.model.PublisherType;

import java.math.BigDecimal;

public record PropertySummaryResponse(
        Long id,
        String title,
        PropertyType propertyType,
        OperationType operationType,
        String neighborhoodName,
        String address,
        String description,
        BigDecimal price,
        BigDecimal surfaceM2,
        Integer rooms,
        Integer bathrooms,
        Integer ageYears,
        String orientation,
        PublisherType publisherType,
        String imageUrl,
        // Rango de tasación cacheado (null si la propiedad no lo tiene
        // calculado). El mapa lo usa para colorear el pin de precio según
        // esté sobrevaluada, en rango o subvaluada (ver PropertyMarkersLayer
        // en MapPage.jsx) -- antes solo viajaba en el detalle de una
        // propiedad individual.
        ValuationRangeDto valuation,
        // lat/lon de la propiedad. Antes solo viajaba en el detalle
        // individual; se agrega acá para que el dropdown "usar un favorito"
        // de Life Score (LifeScore.jsx) pueda calcular directo sin volver a
        // geocodificar la dirección.
        LocationDto location,
        // Si la publicación está activa. El catálogo público solo trae activas,
        // pero "Mis favoritos" puede incluir una que el dueño o un admin
        // desactivó después de que el usuario la guardó: el frontend la muestra
        // con la etiqueta "Inactiva" (ver Favoritos.jsx).
        boolean active
) {
}
