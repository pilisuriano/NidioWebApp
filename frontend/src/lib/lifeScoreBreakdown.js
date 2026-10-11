// Desglose del Life Score: cuántos puntos aporta cada categoría y cada lugar personal al total.
//
// El total es un promedio ponderado (ver LifeScoreService.blendTotalScore y ml-service/src/geo/life_score.py):
//   total = Σ(peso_i × puntaje_i) / Σ peso_i      (puntajes de 0 a 100, categorías y "Mis lugares" juntos)
// Así que lo que cada fila aporta es exacto, no una aproximación: peso_i × puntaje_i / Σpesos, y todas las
// filas suman el total. "Posibles" es lo que aportaría con 100 puntos (peso_i / Σpesos × 100): la diferencia
// entre posibles y aportados es lo que ese ítem le saca al puntaje.

/**
 * categories: [{ category, weight, score }]  (result.categories)
 * customPlaces: [{ id, label, distanceM, score }]  (result.customPlaces)
 * placeWeights: { [placeId]: peso } con el que se calculó; radiusKm: radio de cercanía aceptable
 */
export function buildBreakdown({ categories = [], customPlaces = [], placeWeights = {}, radiusKm = null }) {
  const items = [
    ...categories.filter(c => c.weight > 0).map(c => ({
      kind: "category", key: c.category, weight: c.weight, score: c.score, label: null
    })),
    ...customPlaces.map(p => ({
      kind: "place", key: `place-${p.id}`, weight: Number(placeWeights?.[p.id]) > 0 ? Number(placeWeights[p.id]) : 1,
      score: p.score, label: p.label, distanceM: p.distanceM,
      outOfRadius: radiusKm != null && p.distanceM >= radiusKm * 1000
    }))
  ];
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return { rows: [], total: 0, totalWeight: 0 };

  const rows = items.map(item => ({
    ...item,
    possible: (item.weight / totalWeight) * 100,
    points: (item.weight * item.score) / totalWeight
  })).map(row => ({ ...row, lost: row.possible - row.points }));

  rows.sort((a, b) => b.points - a.points || b.possible - a.possible);
  const total = rows.reduce((sum, row) => sum + row.points, 0);
  return { rows, total, totalWeight };
}

/** La fila que más puntos le saca al total (null si ninguna pierde algo apreciable). */
export function biggestLoss(rows) {
  const worst = rows.reduce((best, row) => (best == null || row.lost > best.lost ? row : best), null);
  return worst && worst.lost >= 1 ? worst : null;
}

// Score a partir del cual una fila se considera "a favor" (mismo corte que usa el backend para decir
// qué baja el puntaje: NEGATIVE_DRIVER_MAX_SCORE en LifeScoreService).
export const FAVORABLE_MIN_SCORE = 50;

/**
 * Separa el desglose como el SHAP de la tasación: lo que suma (puntaje >= 50, ordenado por puntos que aporta)
 * y lo que baja (puntaje < 50, ordenado por puntos que deja sin sumar). Cada lista se corta en `limit`.
 */
export function splitBreakdown(rows, limit = 5) {
  const favor = rows.filter(r => r.score >= FAVORABLE_MIN_SCORE).sort((a, b) => b.points - a.points).slice(0, limit);
  const against = rows.filter(r => r.score < FAVORABLE_MIN_SCORE && r.lost >= 0.1).sort((a, b) => b.lost - a.lost).slice(0, limit);
  return { favor, against };
}
