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
