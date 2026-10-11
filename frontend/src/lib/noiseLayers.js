import { noiseLevelFromDb } from "@/lib/environment";

/**
 * Capas de ruido (BA Data, Mapa Estratégico de Ruido) para los mapas. Son archivos
 * estáticos en public/data/ruido/ (los genera ml-service/scripts/build_noise_layers.py);
 * se descargan recién cuando la persona prende la capa y se guardan en memoria.
 */

const BASE = `${import.meta.env.BASE_URL ?? "/"}data/ruido/`;
const promises = {};

function load(name) {
  if (!promises[name]) {
    promises[name] = fetch(`${BASE}${name}`)
      .then(res => {
        if (!res.ok) throw new Error(`No se pudo cargar ${name}`);
        return res.json();
      })
      .catch(err => {
        delete promises[name]; // permite reintentar
        throw err;
      });
  }
  return promises[name];
}

/** Cortes en dBA de la escala relativa a CABA: `{ dia: [65,70,75], noche: [60,65,70] }`. */
export function loadNoiseCuts() {
  return load("thresholds.json").then(t => ({ day: t.dia.cortes_db, night: t.noche.cortes_db }));
}

/** FeatureCollection de franjas de 5 dBA (`properties: { lo, hi, src }`). `period`: "day" | "night". */
export function loadNoiseLayer(period) {
  return load(period === "night" ? "noise_night.geojson" : "noise_day.geojson");
}

function ringBounds(ring) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of ring) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

/** ¿Se solapan dos cajas [minX, minY, maxX, maxY]? */
export function boxesIntersect(a, b) {
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
}

/**
 * Se queda solo con los polígonos que tocan la caja `[minLon, minLat, maxLon, maxLat]`
 * y le pone a cada feature su `level` (1-4). Así el mapa dibuja las calles de la zona
 * que se está mirando y no las ~25 capas de toda la ciudad.
 */
export function clipNoiseToBox(collection, box, cuts) {
  const features = [];
  for (const feature of collection.features) {
    const { lo } = feature.properties;
    const parts = feature.geometry.type === "MultiPolygon" ? feature.geometry.coordinates : [feature.geometry.coordinates];
    const kept = parts.filter(part => boxesIntersect(ringBounds(part[0]), box));
    if (kept.length === 0) continue;
    features.push({
      type: "Feature",
      properties: { ...feature.properties, level: noiseLevelFromDb(lo, cuts) },
      geometry: { type: "MultiPolygon", coordinates: kept }
    });
  }
  return { type: "FeatureCollection", features };
}
