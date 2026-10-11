import { valuationStatus } from "@/lib/valuation";

// Agregaciones del gráfico de mercado del inicio. Son funciones puras sobre lo
// que ya devuelven /api/heatmaps/price y /api/properties, así no hace falta un
// endpoint nuevo ni se recalcula nada en el backend.

const priceOf = (f) => Number(f.properties.avgPriceM2);
const nameOf = (f) => f.properties.neighborhoodName;

/** Barrios con mayor ("desc") o menor ("asc") precio por m². */
export function rankNeighborhoods(features, order = "desc", limit = 8) {
  const rows = (features ?? [])
    .filter((f) => Number.isFinite(priceOf(f)) && priceOf(f) > 0)
    .map((f) => ({ name: nameOf(f), precio: priceOf(f) }));
  rows.sort((a, b) => (order === "asc" ? a.precio - b.precio : b.precio - a.precio));
  return rows.slice(0, limit);
}

/** Barrios con más publicaciones en el catálogo, separadas en venta y alquiler. */
export function offerByNeighborhood(properties, limit = 8) {
  const byName = new Map();
  for (const p of properties ?? []) {
    const name = p.neighborhoodName;
    if (!name) continue;
    const row = byName.get(name) ?? { name, venta: 0, alquiler: 0, total: 0 };
    if (p.operationType === "SALE") row.venta += 1;
    else row.alquiler += 1;
    row.total += 1;
    byName.set(name, row);
  }
  return [...byName.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name)).slice(0, limit);
}

/** Cuántas publicaciones están subvaluadas, en rango o sobrevaluadas según la tasación de Nidio. */
export function valuationBreakdown(properties, blueRate) {
  const counts = { UNDERVALUED: 0, FAIR: 0, OVERVALUED: 0 };
  for (const p of properties ?? []) {
    const status = valuationStatus(p, blueRate);
    if (status) counts[status] += 1;
  }
  return counts;
}

/** Oferta por cantidad de ambientes (1, 2, 3, 4 o más), separada en venta y alquiler. */
export function roomsBreakdown(properties) {
  const buckets = [1, 2, 3, 4].map((n) => ({ label: n === 4 ? "4+ amb." : `${n} amb.`, venta: 0, alquiler: 0 }));
  for (const p of properties ?? []) {
    const index = Math.min(Math.max(Number(p.rooms) || 1, 1), 4) - 1;
    if (p.operationType === "SALE") buckets[index].venta += 1;
    else buckets[index].alquiler += 1;
  }
  return buckets;
}
