// Lógica pura del "Recomendador con Nidi" (sin React): definición de las preguntas,
// armado del pedido al backend y textos de apoyo. Diseño y justificación de cada
// pregunta en el documento nidio-recomendador-diseno-test (proyecto de tesis).
// Las respuestas NO se guardan en ningún lado: viajan en el pedido y se descartan.

/** Orden de los pasos. Los dos últimos son opcionales. */
export const STEP_IDS = ["operation", "type", "budget", "household", "dealbreaker", "noise", "proximity", "overpriced", "details", "work"];
export const REQUIRED_STEPS = 8;
export const OPTIONAL_STEP_IDS = ["details", "work"];

export const OPERATION_OPTIONS = [
  { value: "RENT", label: "Alquilar" },
  { value: "SALE", label: "Comprar" },
];

export const TYPE_OPTIONS = [
  { value: "APARTMENT", label: "Departamento" },
  { value: "HOUSE_PH", label: "Casa o PH", note: "La estimación de precio es menos precisa en casas y PH." },
  { value: "ANY", label: "Me da igual" },
];

// Cada opción de convivencia SUGIERE un mínimo de ambientes (mismo criterio que el backend:
// RecommendationEngine.minRooms; es un supuesto de diseño, no un dato). La persona lo puede cambiar
// con las opciones de ROOMS_CHOICES (en el pedido viaja como `minRooms`).
export const HOUSEHOLD_OPTIONS = [
  { value: "SOLO", label: "Solo/a", hint: "Sugerimos desde 1 ambiente" },
  { value: "COUPLE", label: "En pareja", hint: "Sugerimos desde 2 ambientes" },
  { value: "FAMILY", label: "Con familia", hint: "Sugerimos desde 3 ambientes" },
  { value: "SHARED", label: "Compartiendo", hint: "Sugerimos desde 3 ambientes" },
];

const SUGGESTED_MIN_ROOMS = { SOLO: 1, COUPLE: 2, FAMILY: 3, SHARED: 3 };

/** Ambientes mínimos que se pueden elegir (el último significa "ese número o más"). */
export const ROOMS_CHOICES = [1, 2, 3, 4, 5];

/** Mínimo sugerido para una convivencia (null si todavía no eligió). */
export function suggestedMinRooms(household) {
  return SUGGESTED_MIN_ROOMS[household] ?? null;
}

/** Mínimo de ambientes en vigor: lo que eligió la persona o, si no tocó nada, lo sugerido. */
export function effectiveMinRooms(answers) {
  return answers.minRooms ?? suggestedMinRooms(answers.household);
}

/** Qué tanto pesa la cercanía a la dirección de trabajo o estudio (paso opcional 10). */
export const WORK_IMPORTANCE_OPTIONS = [
  { value: "LOW", label: "Un poco", hint: "Suma, pero pesan más otras cosas" },
  { value: "IMPORTANT", label: "Bastante", hint: "Lo tengo muy en cuenta" },
  { value: "KEY", label: "Es clave", hint: "Prefiero ceder en otras cosas antes que vivir lejos" },
];

export const DEALBREAKER_OPTIONS = [
  { value: "UNSAFE", label: "Que sea insegura", searching: "Descartando las zonas con menos seguridad" },
  { value: "LOW_TRANSPORT", label: "Que tenga poco transporte cerca", searching: "Descartando las zonas con poco transporte cerca" },
  { value: "NOISY", label: "Que sea ruidosa", searching: "Descartando las zonas más ruidosas" },
  { value: "FEW_SHOPS", label: "Que tenga pocos comercios cerca", searching: "Descartando las zonas con pocos comercios cerca" },
];

export const NOISE_OPTIONS = [
  { value: "QUIET", label: "Una zona tranquila" },
  { value: "TOLERANT", label: "Tolero algo de ruido" },
  { value: "LIVELY", label: "Me gusta una zona con movimiento" },
];

export const OVERPRICED_OPTIONS = [
  { value: "HIDE", label: "No quiero que me la muestren" },
  { value: "LAST", label: "Que aparezca después de las que están en precio" },
  { value: "SHOW", label: "Que me la muestren igual: puedo negociar el precio con quien la publica" },
];

// Las 7 categorías de cercanía se ofrecen por igual: no se asume que alguna importe más.
export const PROXIMITY_CATEGORIES = [
  { key: "TRANSPORT", label: "Transporte público" },
  { key: "COMMERCE", label: "Comercios del día a día" },
  { key: "GREEN_SPACE", label: "Espacios verdes" },
  { key: "HEALTH", label: "Centros de salud" },
  { key: "EDUCATION", label: "Escuelas y universidades" },
  { key: "GASTRONOMY", label: "Gastronomía" },
  { key: "NIGHTLIFE", label: "Vida nocturna" },
];

export const IMPORTANCE_LEVELS = [
  { value: "NOT_IMPORTANT", label: "No me importa" },
  { value: "IMPORTANT", label: "Me importa" },
  { value: "KEY", label: "Es clave" },
];

export const DETAIL_OPTIONS = [
  { key: "bright", label: "Luminoso" },
  { key: "garage", label: "Cochera" },
  { key: "poolOrAmenities", label: "Pileta o amenities" },
  { key: "furnished", label: "Amoblado", only: "RENT" },
  { key: "aptoCredito", label: "Apto crédito", only: "SALE" },
];

export const PRICE_STATUS_TEXT = {
  IN_RANGE: "Precio dentro de lo que estima Nidio",
  BELOW: "Precio por debajo de lo que estima Nidio",
  ABOVE: "Precio por encima de lo que estima Nidio",
};

/** Todas las categorías arrancan en "Me importa" (decisión de diseño: sin tope de selección). */
export function defaultProximity() {
  return Object.fromEntries(PROXIMITY_CATEGORIES.map(c => [c.key, "IMPORTANT"]));
}

export function initialAnswers() {
  return {
    operationType: null,
    typeChoice: null,
    budget: null, // { min, max } (null en un extremo = sin tope), tomado de /budget-ranges
    household: null,
    minRooms: null, // null = el mínimo que sugiere la convivencia; un número = lo que eligió
    dealbreaker: null,
    noisePreference: null,
    proximity: defaultProximity(),
    overpricedPolicy: null,
    details: {},
    work: null, // { address, lat, lon }
    workImportance: "IMPORTANT",
  };
}

/** Mezcla (Fisher-Yates) sin modificar el original. `rng` se puede inyectar para probar. */
export function shuffle(items, rng = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** ¿Está contestado el paso? Los dos opcionales siempre se pueden saltear. */
export function isStepAnswered(stepId, answers) {
  switch (stepId) {
    case "operation": return answers.operationType != null;
    case "type": return answers.typeChoice != null;
    case "budget": return answers.budget != null;
    case "household": return answers.household != null;
    case "dealbreaker": return answers.dealbreaker != null;
    case "noise": return answers.noisePreference != null;
    case "proximity": return true; // todas arrancan en "Me importa"
    case "overpriced": return answers.overpricedPolicy != null;
    default: return true;
  }
}

export function allRequiredAnswered(answers) {
  return STEP_IDS.slice(0, REQUIRED_STEPS).every(id => isStepAnswered(id, answers));
}

// ---- Presupuesto: barra con el tope que la persona aceptaría ----
// La barra se arma con los precios reales del catálogo de la operación (ordenados): la posición 0 es el precio más
// bajo, la 100 es "sin tope", y en el medio se interpola (cada tramo de la barra tiene la misma cantidad de
// propiedades, así la barra no se llena de montos que nadie publicó).

/** Paso de redondeo del tope, para que muestre montos "redondos" y no 847.213. */
function budgetStep(value, operationType) {
  if (operationType === "RENT") return value < 300000 ? 10000 : 50000;
  return value < 100000 ? 5000 : value < 300000 ? 10000 : 25000;
}

/** Tope de presupuesto en la posición 0-100 de la barra (null = sin tope, que es la posición 100). */
export function budgetAtPosition(prices, position, operationType) {
  if (!prices || prices.length === 0 || position >= 100) return null;
  const t = Math.max(0, position) / 100 * (prices.length - 1);
  const i = Math.floor(t);
  const raw = prices[i] + (prices[Math.min(i + 1, prices.length - 1)] - prices[i]) * (t - i);
  const step = budgetStep(raw, operationType);
  return Math.ceil(raw / step) * step; // hacia arriba: el tope siempre alcanza para el precio de esa posición
}

/** Cuántas propiedades del catálogo cuestan hasta el tope (null = todas). */
export function countWithinBudget(prices, max) {
  return max == null ? prices.length : prices.filter(p => p <= max).length;
}

/** Distancia en línea recta, legible: "600 m" o "2,3 km". */
export function formatDistance(km) {
  if (km == null) return null;
  if (km < 1) return `${Math.max(10, Math.round(km * 100) * 10)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

/** Monto con su moneda: venta en USD, alquiler en ARS mensual (convención de los datos). */
function money(value, operationType) {
  const unit = operationType === "SALE" ? "USD" : "ARS";
  return `${unit} ${Math.round(Number(value)).toLocaleString("es-AR")}`;
}

/** Texto de un tramo de presupuesto; min o max null = sin tope en ese extremo. */
export function formatBudgetRange(range, operationType) {
  const suffix = operationType === "RENT" ? " por mes" : "";
  const hasMin = range.min != null;
  const hasMax = range.max != null;
  if (hasMin && hasMax) return `${money(range.min, operationType)} a ${money(range.max, operationType)}${suffix}`;
  if (hasMax) return `Hasta ${money(range.max, operationType)}${suffix}`;
  if (hasMin) return `Más de ${money(range.min, operationType)}${suffix}`;
  return "Sin tope de presupuesto";
}

/**
 * Cuerpo del POST /api/recommendations. `blueRate` (pesos por dólar) hace falta para comparar el
 * precio de un alquiler (en pesos) con el rango de valuación (en dólares); si no hay cotización
 * se omite y el backend deja el precio sin evaluar en vez de comparar pesos con dólares.
 */
export function buildRequest(answers, blueRate) {
  const op = answers.operationType;
  const propertyTypes = answers.typeChoice === "APARTMENT" ? ["APARTMENT"]
    : answers.typeChoice === "HOUSE_PH" ? ["HOUSE", "PH"] : [];

  // Solo viajan los detalles marcados, y solo los que aplican a la operación elegida.
  const details = {};
  for (const option of DETAIL_OPTIONS) {
    if (answers.details?.[option.key] && (!option.only || option.only === op)) {
      details[option.key] = true;
    }
  }

  const body = {
    operationType: op,
    propertyTypes,
    budgetMin: answers.budget?.min ?? null,
    budgetMax: answers.budget?.max ?? null,
    household: answers.household,
    dealbreaker: answers.dealbreaker,
    noisePreference: answers.noisePreference,
    proximity: { ...answers.proximity },
    overpricedPolicy: answers.overpricedPolicy,
  };
  if (answers.minRooms != null) body.minRooms = answers.minRooms;
  if (Object.keys(details).length > 0) body.details = details;
  if (typeof blueRate === "number" && blueRate > 0) body.blueRate = blueRate;
  if (answers.work?.lat != null && answers.work?.lon != null) {
    body.workLat = answers.work.lat;
    body.workLon = answers.work.lon;
    body.workImportance = answers.workImportance ?? "IMPORTANT";
  }
  return body;
}

const FUNNEL_TEXT = {
  CATALOG: n => `${n} ${n === 1 ? "propiedad publicada" : "propiedades publicadas"}`,
  TYPE: n => `${n} del tipo que elegiste`,
  BUDGET: n => `${n} dentro de tu presupuesto`,
  ROOMS: n => `${n} con los ambientes que necesitás`,
  PRICE: n => `${n} sin las que están por encima del precio que estima Nidio`,
  DEALBREAKER: n => `${n} después de dejar de lado las zonas que descartarías`,
};

/**
 * Cómo se llegó al resultado, con los números reales que devuelve el backend (`funnel`): cuántas propiedades
 * quedaban después de cada filtro. Se omiten los pasos que no sacaron a ninguna (excepto el primero).
 */
export function funnelSummary(funnel) {
  if (!Array.isArray(funnel)) return [];
  const lines = [];
  let previous = null;
  funnel.forEach((step, i) => {
    const text = FUNNEL_TEXT[step.code]?.(step.remaining);
    if (text && (i === 0 || step.remaining !== previous)) lines.push(text);
    previous = step.remaining;
  });
  return lines;
}

/**
 * Lista de lo que el motor mira para ESTE pedido (no hay pasos de relleno). Se muestra mientras se espera
 * la respuesta, como lista fija, sin tildes ni barra de avance (no hay avance real que mostrar).
 */
export function searchingSteps(answers) {
  const labels = Object.fromEntries(PROXIMITY_CATEGORIES.map(c => [c.key, c.label.toLowerCase()]));
  const steps = ["Filtrando por tipo, presupuesto y ambientes"];
  const dealbreaker = DEALBREAKER_OPTIONS.find(o => o.value === answers.dealbreaker);
  if (dealbreaker) steps.push(dealbreaker.searching);
  const key = PROXIMITY_CATEGORIES.filter(c => answers.proximity?.[c.key] === "KEY").map(c => labels[c.key]);
  if (key.length > 0) steps.push(`Midiendo lo que es clave para vos: ${key.join(", ")}`);
  steps.push("Mirando la seguridad y el ruido de cada barrio");
  steps.push("Comparando cada precio con la estimación de Nidio");
  if (answers.work?.lat != null) steps.push("Calculando la distancia a tu trabajo o estudio");
  steps.push("Armando tu top 3 y explicando por qué encaja cada una");
  return steps;
}
