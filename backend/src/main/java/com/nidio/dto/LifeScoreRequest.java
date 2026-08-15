package com.nidio.dto;

import com.nidio.model.POICategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LifeScoreRequest {

    // Texto libre solo para mostrar/guardar en el historial (LIFE_SCORE_QUERY.address)
    // -- el cálculo en sí usa lat/lon, no vuelve a geocodificar esto (ver
    // LifeScoreService.calculateLifeScore). El frontend lo completa eligiendo
    // una sugerencia real de /api/addresses/search o una propiedad favorita,
    // nunca queda texto sin lat/lon asociado.
    @NotBlank(message = "El campo 'address' es obligatorio")
    private String address;

    @NotNull(message = "El campo 'lat' es obligatorio")
    private Double lat;

    @NotNull(message = "El campo 'lon' es obligatorio")
    private Double lon;

    @NotEmpty(message = "El campo 'weights' es obligatorio")
    private Map<POICategory, Integer> weights;

    // "Mis lugares" (opcional): peso 1-5 de los lugares personales del
    // usuario dentro del promedio ponderado total, tratados como una
    // categoría más (ver LifeScoreService.blendTotalScore). Si es null, 0 o
    // el usuario no tiene lugares cargados, no se suman al total -- solo se
    // devuelven informativamente en la respuesta.
    private Integer customPlaceWeight;

    // Radio (km) hasta el que se considera "cerca" un lugar personal antes de
    // que su score empiece a decaer a 0 (ver LifeScoreService.decayScore).
    // Opcional: si no viene, se usa el default de 2km, acotado entre 1 y 3km.
    private Double customPlaceRadiusKm;

    // IDs de "Mis lugares" a incluir en ESTE cálculo puntual (selección por
    // checkbox en el frontend, ver LifeScoreService.scoreCustomPlaces). Es
    // opcional a propósito, para no romper compatibilidad hacia atrás:
    // - null -> se usan TODOS los lugares del usuario (comportamiento
    //   original, y lo que manda cualquier cliente que no conozca este
    //   campo).
    // - lista vacía -> no se incluye ningún lugar personal en este cálculo.
    // - lista con IDs -> se usan solo esos (se ignoran silenciosamente los
    //   IDs que no le pertenezcan al usuario autenticado, ver
    //   LifeScoreService.scoreCustomPlaces).
    private List<Long> customPlaceIds;
}
