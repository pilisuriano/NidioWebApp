import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/**
 * Entorno de las propiedades (ruido de día y de noche, seguridad del barrio) para
 * las etiquetas de tarjetas y ficha. Los niveles (1-4) son relativos a CABA y 1 es
 * siempre el mejor (ruido "Tranquilo", seguridad "Alta"): la gente no entiende de
 * decibeles, así que el color y la palabra dicen qué tan ruidoso o seguro es
 * comparado con el resto de la ciudad. Ver ml-service/data/noise/thresholds.json.
 */

// Semáforo de 4 pasos (verde → rojo). Siempre va acompañado de la palabra, así
// el color no es lo único que informa.
export const LEVEL_STYLES = {
  1: { bg: "#E3F1E6", fg: "#1F6B3A", border: "#B7DABF" },
  2: { bg: "#F0F2D3", fg: "#5E6B12", border: "#D6DBA0" },
  3: { bg: "#FDE8CF", fg: "#9A4A00", border: "#F2C68F" },
  4: { bg: "#F9DAD7", fg: "#A32119", border: "#EBABA5" }
};

export function levelStyle(level) {
  return LEVEL_STYLES[level] ?? { bg: "#EEF0F2", fg: "#5B6168", border: "#D5D9DD" };
}

/** Texto de ayuda de cada chip (title / lectores de pantalla). */
export function describeNoise(period, noise) {
  const when = period === "day" ? "de día" : "de noche";
  if (!noise) {
    return `Ruido ${when}: sin dato para esta ubicación`;
  }
  const source = noise.source === "2018" ? " (dato de 2018)" : "";
  return `Ruido ${when}: ${noise.label.toLowerCase()} comparado con el resto de CABA${source}. Mapa de Ruido de BA Data.`;
}

export function describeSecurity(security) {
  if (!security) {
    return "Seguridad del barrio: sin dato";
  }
  return `Seguridad del barrio: ${security.label.toLowerCase()} comparada con el resto de CABA, según hechos denunciados 2023-2025 (BA Data).`;
}

const cache = new Map();
const MAX_IDS = 100;

/** Arma la lista de ids a pedir: únicos, sin vacíos, con el tope del backend. */
export function normalizeIds(ids) {
  return [...new Set((ids ?? []).filter(id => id != null))].slice(0, MAX_IDS);
}

/**
 * Devuelve `{ [propertyId]: environment }` para los ids dados. Pide solo los que
 * todavía no tiene en memoria. Si el pedido falla no rompe la pantalla: las
 * etiquetas simplemente no aparecen.
 */
export function usePropertyEnvironment(ids) {
  const wanted = normalizeIds(ids);
  const key = wanted.join(",");
  const [, setVersion] = useState(0);

  useEffect(() => {
    const missing = wanted.filter(id => !cache.has(id));
    if (missing.length === 0) {
      return undefined;
    }
    let cancelled = false;
    api.get("/api/properties/environment", { params: { ids: missing.join(",") } })
      .then(res => {
        for (const env of res.data) {
          cache.set(env.propertyId, env);
        }
        // Las propiedades sin respuesta se marcan para no volver a pedirlas en cada render.
        for (const id of missing) {
          if (!cache.has(id)) {
            cache.set(id, null);
          }
        }
        if (!cancelled) {
          setVersion(v => v + 1);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const result = {};
  for (const id of wanted) {
    if (cache.get(id)) {
      result[id] = cache.get(id);
    }
  }
  return result;
}

/** Solo para tests. */
export function _clearEnvironmentCache() {
  cache.clear();
}

// ---------------------------------------------------------------------------
// Colores y niveles para las capas de los mapas
// ---------------------------------------------------------------------------

/** Color de relleno de cada nivel en los mapas (mismo semáforo que los chips, más saturado). */
export const MAP_LEVEL_COLORS = { 1: "#43A047", 2: "#C0CA33", 3: "#FB8C00", 4: "#D32F2F" };

export const NOISE_LABELS = ["Tranquilo", "Moderado", "Ruidoso", "Muy ruidoso"];
export const SECURITY_LABELS = ["Alta", "Media-alta", "Media-baja", "Baja"];

/** Nivel de seguridad (1 = Alta ... 4 = Baja) según el índice 0-100. Mismos cortes que el backend (PropertyEnvironmentService). */
export function securityLevelFromIndex(index) {
  if (index == null || Number.isNaN(Number(index))) {
    return null;
  }
  const value = Number(index);
  return value >= 75 ? 1 : value >= 50 ? 2 : value >= 25 ? 3 : 4;
}

/** Nivel de ruido (1-4) de una franja de `lo` dBA, dados los cortes de thresholds.json. */
export function noiseLevelFromDb(lo, cuts) {
  return 1 + cuts.filter(cut => lo >= cut).length;
}

/** Filas de la leyenda de ruido: palabra relativa + rango de dBA ("< 65", "65–70", "≥ 75"). */
export function noiseLegend(cuts) {
  const ranges = cuts.map((cut, i) => {
    if (i === 0) return `menos de ${cut} dBA`;
    return `${cuts[i - 1]}–${cut} dBA`;
  });
  ranges.push(`${cuts[cuts.length - 1]} dBA o más`);
  return ranges.map((range, i) => ({ level: i + 1, label: NOISE_LABELS[i], range }));
}
