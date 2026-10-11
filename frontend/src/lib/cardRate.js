import { useEffect, useState } from "react";

// Cotización del dólar tarjeta (dolarapi.com, API pública sin key; la misma fuente que
// lib/blueRate.js). Los planes se cobran en dólares y en pantalla se muestra además una
// referencia aproximada en pesos con este valor. Es solo informativa: no se guarda ni se
// cobra en pesos. Se pide una sola vez por sesión y se comparte entre todas las pantallas.
export const CARD_RATE_URL = "https://dolarapi.com/v1/dolares/tarjeta";

let cachedRate = null;
let inflight = null;

function loadCardRate() {
  if (cachedRate != null) return Promise.resolve(cachedRate);
  if (!inflight) {
    inflight = fetch(CARD_RATE_URL)
      .then(res => {
        if (!res.ok) throw new Error(`dolarapi respondió ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (typeof data.venta !== "number" || data.venta <= 0) throw new Error("respuesta sin campo 'venta'");
        cachedRate = data.venta;
        return cachedRate;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** { cardRate, cardRateError }: cardRate es null mientras carga o si falló (entonces no se muestran pesos). */
export function useCardRate() {
  const [cardRate, setCardRate] = useState(cachedRate);
  const [cardRateError, setCardRateError] = useState(false);
  useEffect(() => {
    if (cachedRate != null) return undefined;
    let active = true;
    loadCardRate()
      .then(rate => {
        if (active) setCardRate(rate);
      })
      .catch(() => {
        if (active) setCardRateError(true);
      });
    return () => {
      active = false;
    };
  }, []);
  return { cardRate, cardRateError };
}

/** "USD 6", "USD 6,40". */
export function formatUsd(value) {
  const hasDecimals = Math.abs(value - Math.round(value)) > 0.001;
  const text = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  }).format(value);
  return `USD ${text}`;
}

/** Pesos redondeados a la centena, para que se lea como aproximado: "$ 9.400". */
export function formatArs(value) {
  const rounded = Math.round(value / 100) * 100;
  return `$ ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(rounded)}`;
}

/** Equivalente aproximado en pesos de un monto en USD; null si todavía no hay cotización. */
export function arsApprox(usd, rate) {
  if (rate == null) return null;
  return formatArs(usd * rate);
}
