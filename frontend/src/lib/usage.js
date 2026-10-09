import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

/**
 * Cuota gratuita mensual de Tasación / Recomendador (ver UsageQuotaService en
 * el backend). feature es "valuation" o "recommendation" (las claves de
 * GET /api/usage). Devuelve null mientras carga o si el backend no responde:
 * en ese caso no se muestra nada ni se bloquea (el backend igual es el que
 * corta con 429 si de verdad no quedan usos).
 */
export function useUsage(feature) {
  const [status, setStatus] = useState(null);
  const refresh = useCallback(() => {
    return api.get("/api/usage")
      .then(res => setStatus(res.data?.[feature] ?? null))
      .catch(() => setStatus(null));
  }, [feature]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const blocked = Boolean(status && !status.unlimited && status.remaining <= 0);
  return { status, blocked, refresh };
}

/** true si el error de axios es el 429 de "se terminaron los usos gratis del mes". */
export function isQuotaExceeded(error) {
  return error?.response?.status === 429;
}

/** "1/11" a partir del resetsAt (ISO) que manda el backend, en hora de Argentina. */
export function formatResetDate(resetsAt) {
  if (!resetsAt) return "";
  const parts = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "numeric", timeZone: "America/Argentina/Buenos_Aires" })
    .formatToParts(new Date(resetsAt));
  const day = parts.find(p => p.type === "day")?.value;
  const month = parts.find(p => p.type === "month")?.value;
  return `${day}/${month}`;
}
