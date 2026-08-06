package com.nidio.dto;

import com.nidio.model.POICategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LifeScoreRequest {

    @NotBlank(message = "El campo 'address' es obligatorio")
    private String address;

    @NotEmpty(message = "El campo 'weights' es obligatorio")
    private Map<POICategory, Integer> weights;
}
