import { formatNumber } from "./format";

/**
 * El texto "¿Por qué este rango?" llega armado desde ml-service
 * (explicacion_en_texto() en predecir_propiedad_nueva.py), en oraciones, sin
 * tildes y con los números sin separador de miles. Acá se lo separa en partes
 * para mostrarlo prolijo (factor principal + listas de lo que sube y baja el
 * precio) sin cambiar lo que dice. Si el formato no se reconoce, se devuelve
 * solo el texto corregido (other) para mostrarlo tal cual.
 */

// Palabras que ml-service escribe sin tilde (solo palabras completas).
const ACCENTS = [
  [/\bprediccion\b/g, "predicción"],
  [/\bmas\b/g, "más"],
  [/\bTambien\b/g, "También"],
  [/\besta clasificada\b/g, "está clasificada"],
  [/\besta un\b/g, "está un"],
  [/\bmaximo\b/g, "máximo"],
  [/\bminimo\b/g, "mínimo"],
  [/\binformacion\b/g, "información"],
  [/\bbanos\b/g, "baños"],
  [/\bcredito\b/g, "crédito"],
  [/\beste amoblado\b/g, "esté amoblado"]
];

/** Corrige tildes y agrega separador de miles a los números de 4+ cifras (79496 -> 79.496). */
export function prettifyText(text) {
  let out = text ?? "";
  for (const [re, rep] of ACCENTS) out = out.replace(re, rep);
  return out.replace(/\b\d{4,}\b/g, n => formatNumber(Number(n)));
}

/** "a, b y c" -> ["a", "b", "c"] */
function splitList(list) {
  return list.split(/,\s*|\s+y\s+/).map(s => s.trim()).filter(Boolean);
}

// Solo la cubierta: en Tasación es obligatoria, así que "la superficie" (la que
// usa el modelo) siempre es la cubierta. La total es otro dato (opcional).
const SURFACE_FACTORS = ["la superficie", "la superficie cubierta"];
function mergeSurface(list) {
  if (list.filter(f => SURFACE_FACTORS.includes(f)).length < 2) return list;
  const merged = [];
  for (const f of list) {
    const name = SURFACE_FACTORS.includes(f) ? "la superficie" : f;
    if (!merged.includes(name)) merged.push(name);
  }
  return merged;
}

export function parseExplanation(text) {
  const result = { centralPrediction: null, mainFactor: null, mainFactorUp: null, up: [], down: [], priceNotes: [], other: [] };
  if (!text) return result;
  const central = text.match(/prediccion central de (\d+)/);
  if (central) result.centralPrediction = Number(central[1]);

  const sentences = text.split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean);
  for (const sentence of sentences) {
    let m;
    if (sentence.startsWith("El rango de precio esperado")) {
      // Ya se muestra arriba (rango grande + valor sugerido).
      continue;
    } else if (sentence.startsWith("Esta propiedad esta clasificada")) {
      // Ya lo dice la etiqueta (dentro / sobre / bajo el rango).
      continue;
    } else if ((m = sentence.match(/^El factor que mas influye en esta prediccion es (.+), que (.+)\.$/))) {
      result.mainFactor = m[1];
      result.mainFactorUp = /sube/.test(m[2]);
    } else if ((m = sentence.match(/^Tambien suben el precio: (.+)\.$/))) {
      result.up = splitList(m[1]);
    } else if ((m = sentence.match(/^Bajan el precio: (.+)\.$/))) {
      result.down = splitList(m[1]);
    } else if (/^(El precio real|Eso |Cae dentro)/.test(sentence)) {
      result.priceNotes.push(prettifyText(sentence));
    } else {
      result.other.push(prettifyText(sentence));
    }
  }
  // El modelo tiene dos columnas para el mismo dato: "superficie_usada_m2" (la
  // superficie con la que calcula: la cubierta, o la total si no hay cubierta)
  // y la superficie cubierta/total cruda. Cuando el usuario carga solo una,
  // las dos valen lo mismo y el efecto se reparte entre ambas, así que salían
  // dos etiquetas para una sola cosa. Si caen del mismo lado se muestran como
  // una sola: "la superficie".
  result.up = mergeSurface(result.up).map(prettifyText);
  result.down = mergeSurface(result.down).map(prettifyText);
  if (result.mainFactor) result.mainFactor = prettifyText(result.mainFactor);
  // El factor principal también va en su lista (sube o baja), primero.
  if (result.mainFactor != null) {
    const list = result.mainFactorUp ? result.up : result.down;
    if (!list.includes(result.mainFactor)) list.unshift(result.mainFactor);
  }
  return result;
}

// Datos opcionales del formulario de Tasación y el nombre con que aparecen en
// la explicación. Si el usuario dejó uno vacío, el modelo igual le asigna un
// efecto ("no saber" ese dato también mueve la predicción), y una etiqueta
// como "la superficie total · baja el precio" se leía como si la superficie
// fuera chica. Se aclara que es un dato que no se cargó.
const OPTIONAL_FACTORS = {
  totalSurface: "la superficie total",
  bathrooms: "la cantidad de baños",
  expenses: "las expensas",
  condition: "el estado de la propiedad"
};

/** Agrega "(sin cargar)" a los factores de datos opcionales que el usuario dejó vacíos. */
export function markMissing(factor, missing = {}) {
  for (const [key, name] of Object.entries(OPTIONAL_FACTORS)) {
    if (missing[key] && factor === name) return `${name} (sin cargar)`;
  }
  return factor;
}
