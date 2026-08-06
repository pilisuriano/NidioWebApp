package com.nidio.dto;

import com.nidio.model.OperationType;
import com.nidio.model.PropertyType;
import com.nidio.model.PublisherType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

// "Mis publicaciones": igual forma que AdminPropertyResponse pero sin
// createdByName (siempre sos vos mismo) y con favoriteCount (cuánta gente
// guardó ese aviso como favorito — ver FavoriteRepository.countByPropertyId).
public record MyPropertyResponse(
        Long id,
        String title,
        PropertyType propertyType,
        OperationType operationType,
        String neighborhoodName,
        String address,
        BigDecimal price,
        BigDecimal surfaceM2,
        BigDecimal totalSurfaceM2,
        Integer rooms,
        Integer bathrooms,
        Integer ageYears,
        String orientation,
        List<String> imageUrls,
        String description,
        boolean active,
        // true si fue un admin quien la desactivó (no el propio dueño): el
        // frontend muestra un cartel de alerta y bloquea el botón de
        // reactivar en vez de dejar tocarla (ver Property.deactivatedByAdmin).
        boolean deactivatedByAdmin,
        PublisherType publisherType,
        Instant createdAt,
        long favoriteCount
) {
}
