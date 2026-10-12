package com.nidio.dto;

import com.nidio.model.OperationType;
import com.nidio.model.POICategory;
import com.nidio.model.PropertyType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Respuestas del test del recomendador ("Recomendador con Nidi"). Ninguna se
 * guarda: se usan para este pedido y se descartan (Ley 25.326). Diseño y
 * justificación de cada pregunta en el documento nidio-recomendador-diseno-test.
 */
@Getter
@Setter
@NoArgsConstructor
public class RecommendationRequest {

    /** Pregunta 4: con quién vivirá. Fija un mínimo de ambientes y ajusta pesos. */
    public enum Household { SOLO, COUPLE, FAMILY, SHARED }

    /** Pregunta 5: qué descartaría de inmediato una zona (filtro duro). */
    public enum Dealbreaker { UNSAFE, LOW_TRANSPORT, NOISY, FEW_SHOPS }

    /** Pregunta 6: preferencia sobre el ruido de la zona. */
    public enum NoisePreference { QUIET, TOLERANT, LIVELY }

    /** Pregunta 7: importancia de cada categoría de cercanía. */
    public enum Importance { NOT_IMPORTANT, IMPORTANT, KEY }

    /** Pregunta 8: qué hacer con una propiedad publicada por encima del rango estimado. */
    public enum OverpricedPolicy { HIDE, LAST, SHOW }

    /** Paso opcional 10: qué tanto pesa la cercanía a la dirección de trabajo o estudio (sin elegir = IMPORTANT). */
    public enum WorkImportance { LOW, IMPORTANT, KEY }

    /** Paso opcional 9: detalles que suman (todos opcionales). */
    @Getter
    @Setter
    @NoArgsConstructor
    public static class Details {
        private Boolean bright;
        private Boolean garage;
        private Boolean poolOrAmenities;
        private Boolean furnished;
        private Boolean aptoCredito;
    }

    // Pregunta 1
    @NotNull(message = "El campo 'operationType' es obligatorio")
    private OperationType operationType;

    // Pregunta 2: vacío o ausente = cualquier tipo ("Me da igual").
    private List<PropertyType> propertyTypes;

    // Pregunta 3: rango elegido (los rangos salen de GET /api/recommendations/budget-ranges).
    // null = sin tope inferior / superior.
    @DecimalMin(value = "0", message = "El presupuesto mínimo no puede ser negativo")
    private BigDecimal budgetMin;
    @DecimalMin(value = "0", message = "El presupuesto máximo no puede ser negativo")
    private BigDecimal budgetMax;

    // Expensas máximas por mes, en USD (la pantalla las elige en pesos y las convierte con el dólar blue). Solo se
    // manda al buscar departamentos. null = sin tope. Una propiedad sin expensas cargadas (casa, PH o dato
    // desconocido) nunca se descarta por este filtro: no hay cómo saber si cumple.
    @DecimalMin(value = "0", message = "Las expensas máximas no pueden ser negativas")
    private BigDecimal expensesMaxUsd;

    @NotNull(message = "El campo 'household' es obligatorio")
    private Household household;

    // Pregunta 4 (ajuste): ambientes mínimos que elige la persona. null = el mínimo que sugiere la convivencia
    // (SOLO 1, COUPLE 2, FAMILY y SHARED 3; ver RecommendationEngine.minRooms).
    @Min(value = 1, message = "Los ambientes mínimos no pueden ser menos de 1")
    @Max(value = 10, message = "Los ambientes mínimos no pueden ser más de 10")
    private Integer minRooms;

    // Pregunta 4 (ajuste 2): ambientes que acepta la persona, uno o varios. 1 a 4 son exactos y 5 significa
    // "5 o más". Si viene, manda sobre minRooms; null o vacío = se usa minRooms o el que sugiere la convivencia.
    @Size(max = 5, message = "Se pueden elegir hasta 5 opciones de ambientes")
    private List<@Min(value = 1, message = "Los ambientes no pueden ser menos de 1") @Max(value = 5, message = "Los ambientes llegan hasta 5 (5 o más)") Integer> roomsOptions;

    @NotNull(message = "El campo 'dealbreaker' es obligatorio")
    private Dealbreaker dealbreaker;

    @NotNull(message = "El campo 'noisePreference' es obligatorio")
    private NoisePreference noisePreference;

    // Pregunta 7: una categoría sin entrada se toma como IMPORTANT.
    private Map<POICategory, Importance> proximity;

    @NotNull(message = "El campo 'overpricedPolicy' es obligatorio")
    private OverpricedPolicy overpricedPolicy;

    // Paso opcional 9
    private Details details;

    // Cotización del dólar (ARS por USD; la misma "venta" del dólar blue que ya usa el frontend, ver
    // frontend/src/lib/blueRate.js). Los rangos de valuación se guardan en USD para venta y alquiler,
    // pero el precio de un alquiler está en pesos: para compararlos hace falta convertirlo. Si falta,
    // el precio de los alquileres frente al rango no se evalúa (estado UNKNOWN), en lugar de comparar
    // pesos contra dólares.
    @DecimalMin(value = "0", inclusive = false, message = "La cotización del dólar debe ser mayor que 0")
    private BigDecimal blueRate;

    // Paso opcional 10: dirección de trabajo o estudio (lat y lon juntas o ninguna).
    private Double workLat;
    private Double workLon;

    // Qué tanto importa esa dirección. null = IMPORTANT (el peso que tenía antes de poder elegirlo).
    private WorkImportance workImportance;

    @AssertTrue(message = "Para usar la dirección de trabajo hacen falta 'workLat' y 'workLon' juntas")
    public boolean isWorkLocationConsistent() {
        return (workLat == null) == (workLon == null);
    }

    @AssertTrue(message = "El presupuesto mínimo no puede superar al máximo")
    public boolean isBudgetConsistent() {
        return budgetMin == null || budgetMax == null || budgetMin.compareTo(budgetMax) <= 0;
    }
}
