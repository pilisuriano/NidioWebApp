/** Venta en USD, alquiler en ARS mensual (convención de los datos sintéticos). */
export function formatPrice(price, operationType) {
  if (operationType === "SALE") {
    return `USD ${Math.round(price).toLocaleString("es-AR")}`;
  }
  return `ARS ${Math.round(price).toLocaleString("es-AR")}/mes`;
}
export function formatNumber(value) {
  return Math.round(value).toLocaleString("es-AR");
}
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}
export const PROPERTY_TYPE_LABEL = {
  APARTMENT: "Departamento",
  HOUSE: "Casa",
  PH: "PH"
};
export const OPERATION_TYPE_LABEL = {
  SALE: "Venta",
  RENT: "Alquiler"
};
