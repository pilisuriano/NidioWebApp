package com.nidio.dto;

import com.nidio.model.OperationType;
import com.nidio.model.PropertyType;
import com.nidio.model.PublisherType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePropertyRequest {

    @NotNull(message = "El campo 'propertyType' es obligatorio")
    private PropertyType propertyType;

    @NotNull(message = "El campo 'operationType' es obligatorio")
    private OperationType operationType;

    @NotNull(message = "El campo 'neighborhoodId' es obligatorio")
    private Long neighborhoodId;

    @NotBlank(message = "El campo 'address' es obligatorio")
    private String address;

    // Coordenadas de la dirección elegida en el listado de sugerencias de
    // georef.ar (ver AddressController / Publicar.jsx). Opcionales a nivel de
    // Bean Validation porque el panel admin edita propiedades reusando este
    // mismo DTO sin pasar por el autocomplete; PropertyService.createProperty
    // sí las exige (ver ahí), PropertyService.updateProperty no.
    private Double lat;

    private Double lon;

    @NotNull(message = "El campo 'surfaceM2' es obligatorio")
    @DecimalMin(value = "1", message = "debe ser mayor a 0")
    private BigDecimal surfaceM2;

    @NotNull(message = "El campo 'rooms' es obligatorio")
    @Min(value = 1, message = "debe ser al menos 1")
    private Integer rooms;

    // Características opcionales (dataset de entrenamiento): si no se
    // cargan, la ficha de detalle simplemente no muestra ese ítem.
    private BigDecimal totalSurfaceM2;

    @Min(value = 0, message = "no puede ser negativo")
    private Integer bathrooms;

    @Min(value = 0, message = "no puede ser negativo")
    private Integer ageYears;

    private String orientation;

    @NotNull(message = "El campo 'price' es obligatorio")
    @DecimalMin(value = "1", message = "debe ser mayor a 0")
    private BigDecimal price;

    private List<String> imageUrls;

    private String description;

    @NotNull(message = "El campo 'publisherType' es obligatorio")
    private PublisherType publisherType;
}
