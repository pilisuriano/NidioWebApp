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

    // "Mis lugares" (opcional): peso INDIVIDUAL de cada lugar personal
    // (clave = id de custom_place, valor = nivel elegido en el frontend --
    // CUSTOM_PLACE_WEIGHT_LEVELS en LifeScore.jsx: 1/5/15/40), dentro del
    // promedio ponderado total (ver LifeScoreService.blendTotalScore). Antes
    // era un único peso para todo el conjunto de lugares -- desde el
    // 15/08/2026 cada lugar pesa por separado (a pedido de Pili: puede
    // importar más estar cerca del gimnasio que de la casa de los papás). Un
    // lugar sin entrada en el mapa usa el peso por defecto (ver
    // LifeScoreService.DEFAULT_CUSTOM_PLACE_WEIGHT) -- por compatibilidad
    // con clientes viejos o un lugar que el frontend no llegó a mandar. Si
    // el usuario no tiene lugares cargados (o los destildó todos vía
    // customPlaceIds), este campo no tiene efecto.
    private Map<Long, Integer> customPlaceWeights;

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
