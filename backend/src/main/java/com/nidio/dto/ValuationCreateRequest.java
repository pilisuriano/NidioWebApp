package com.nidio.dto;

import com.nidio.model.OperationType;
import com.nidio.model.PropertyType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ValuationCreateRequest {

    @NotNull(message = "El campo 'operationType' es obligatorio")
    private OperationType operationType;

    @NotNull(message = "El campo 'propertyType' es obligatorio")
    private PropertyType propertyType;

    @NotNull(message = "El campo 'neighborhoodId' es obligatorio")
    private Long neighborhoodId;

    @NotNull(message = "El campo 'surfaceM2' es obligatorio")
    @Positive(message = "debe ser mayor a cero")
    private BigDecimal surfaceM2;

    @NotNull(message = "El campo 'rooms' es obligatorio")
    @Positive(message = "debe ser mayor a cero")
    private Integer rooms;

    private BigDecimal declaredPrice;
}
