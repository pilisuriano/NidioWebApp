// Clasificación de una propiedad según la tasación de Nidio. Un solo lugar
// para esta lógica: la usan el mapa, la ficha y las tarjetas del inicio.
//
// property.valuation SIEMPRE viene en USD (venta y alquiler por igual), así
// que para compararlo contra el precio de un alquiler (en ARS) hay que
// convertir primero con el dólar blue. Sin cotización todavía, o sin rango
// de tasación cacheado, no se arriesga ninguna etiqueta (null = "sin dato").
export function valuationStatus(property, blueRate) {
  if (!property?.valuation) return null;
  const priceUsd = property.operationType === "RENT" ? (blueRate ? property.price / blueRate : null) : property.price;
  if (priceUsd == null) return null;
  if (priceUsd < property.valuation.min) return "UNDERVALUED";
  if (priceUsd > property.valuation.max) return "OVERVALUED";
  return "FAIR";
}
