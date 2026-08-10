package com.nidio.dto;

import com.nidio.model.OperationType;
import com.nidio.model.PropertyType;
import com.nidio.model.PublisherType;

import java.math.BigDecimal;
import java.util.List;

public record PropertyDetailResponse(
        Long id,
        String title,
        PropertyType propertyType,
        OperationType operationType,
        NeighborhoodRef neighborhood,
        String address,
        LocationDto location,
        BigDecimal surfaceM2,
        BigDecimal totalSurfaceM2,
        Integer rooms,
        Integer bathrooms,
        Integer ageYears,
        String orientation,
        BigDecimal price,
        List<String> imageUrls,
        String description,
        ValuationRangeDto valuation,
        BigDecimal lifeScore,
        // Expensas mensuales en USD (misma unidad que el modelo, ver
        // Property.expensesUsd) -- el frontend la convierte a ARS en vivo
        // para mostrarla, nunca la muestra en USD directo. Null = dato
        // desconocido o propiedad sin consorcio, nunca 0.
        BigDecimal expensesUsd,
        // Resto de características de V24 (mismo criterio: null = no
        // cargada, ver Property.java). "furnished" el frontend lo muestra
        // solo si operationType es RENT.
        String propertyCondition,
        Boolean hasPool,
        Boolean hasGarage,
        Boolean buildingAmenities,
        Boolean security24h,
        Boolean bright,
        Boolean aptoCredito,
        Boolean furnished,
        // Nombre del publicador para mostrar en el detalle ("Contactá a
        // Magali"), null en el catálogo sintético (no tiene dueño real).
        String createdByName,
        // Email y teléfono del publicador: se muestran directo en la ficha
        // (a pedido, no solo a través del formulario de contacto), igual
        // que hacen los portales de referencia con los avisos de dueño
        // directo. El frontend los oculta si el usuario no está logueado.
        String createdByEmail,
        String createdByPhone,
        // Logo de la cuenta profesional (null si no cargó uno o si es
        // dueño directo): se muestra junto al check de verificado.
        String createdByLogoUrl,
        // Cartel "Inmobiliaria" / "Dueño directo" en la ficha de detalle.
        PublisherType publisherType
) {
}
