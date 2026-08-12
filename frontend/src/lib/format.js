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

/** Precio abreviado para pills en el mapa (estilo Zillow): "USD 272K", "ARS 1.2M/mes". */
export function formatPriceShort(price, operationType) {
  const abbreviated = value => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (value >= 1_000) {
      return `${Math.round(value / 1_000)}K`;
    }
    return `${Math.round(value)}`;
  };
  if (operationType === "SALE") {
    return `USD ${abbreviated(price)}`;
  }
  return `ARS ${abbreviated(price)}/mes`;
}

/** Precio por m² abreviado para la etiqueta de cada barrio en el mapa de calor: "USD 2.4K/m²". */
export function formatPriceM2Short(avgPriceM2, operationType) {
  const abbreviated = value => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (value >= 1_000) {
      return `${Math.round(value / 1_000)}K`;
    }
    return `${Math.round(value)}`;
  };
  const unit = operationType === "SALE" ? "USD" : "ARS";
  return `${unit} ${abbreviated(avgPriceM2)}/m²`;
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
export const ACCOUNT_TYPE_LABEL = {
  PERSONAL: "Particular",
  PROFESSIONAL: "Profesional"
};
export const PROFESSIONAL_TYPE_LABEL = {
  AGENCY: "Inmobiliaria",
  BROKER: "Corredor / Martillero",
  DEVELOPER: "Desarrollador"
};
export const PUBLISHER_TYPE_LABEL = {
  AGENCY: "Inmobiliaria",
  OWNER: "Dueño directo"
};
