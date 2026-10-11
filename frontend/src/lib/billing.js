import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

/**
 * Planes, pase de análisis, packs y destacados (pasarela SIMULADA, ver BillingController).
 * Los montos viajan siempre en USD; los pesos se calculan en pantalla (lib/cardRate.js).
 */

export const getCatalog = () => api.get("/api/billing/catalog").then(res => res.data);
export const getBillingSummary = () => api.get("/api/billing/summary").then(res => res.data);
export const getPayments = () => api.get("/api/billing/payments").then(res => res.data);

/** Paso 1: crea el pago PENDING. propertyId (y featuredStartsAt si es una reserva) solo para un destacado suelto. */
export const createCheckout = (itemCode, propertyId, featuredStartsAt) =>
  api.post("/api/billing/checkout", { itemCode, propertyId: propertyId ?? null, featuredStartsAt: featuredStartsAt ?? null }).then(res => res.data);

/** Paso 2: "simular pago aprobado" (true) o "rechazado" (false). */
export const simulatePayment = (paymentId, approved) =>
  api.post(`/api/billing/payments/${paymentId}/simulate`, { approved }).then(res => res.data);

/**
 * Destaca una publicación con un crédito incluido; si no hay, el backend responde 402.
 * startsAt (opcional) = fecha de una reserva, la que devolvió getFeaturedAvailability.
 */
export const activateFeatured = (propertyId, startsAt) =>
  api.post("/api/featured", { propertyId, startsAt: startsAt ?? null }).then(res => res.data);

/**
 * ¿Hay lugar para destacar hoy? { startsNow, startsAt, endsAt, blockedBy }. Si no hay lugar, startsAt es la
 * primera fecha en que se libera uno (blockedBy: "GLOBAL" = plataforma llena, "ACCOUNT" = tope de la cuenta).
 */
export const getFeaturedAvailability = propertyId =>
  api.get("/api/featured/availability", { params: { propertyId } }).then(res => res.data);

/** Catálogo de ítems por código ({ ANALYSIS_PASS: {...}, ... }); items en null mientras carga. */
export function useCatalog() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    getCatalog()
      .then(data => {
        if (active) setItems(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);
  const byCode = items ? Object.fromEntries(items.map(item => [item.code, item])) : {};
  return { items, byCode, error };
}

/** Resumen de suscripción (planes, packs, publicaciones, destacados) y pagos del usuario logueado. */
export function useBillingSummary({ enabled = true } = {}) {
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const refresh = useCallback(() => {
    setError(false);
    return Promise.all([getBillingSummary(), getPayments()])
      .then(([s, p]) => {
        setSummary(s);
        setPayments(p);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    // enabled = false (sin sesión): no se pide nada, el resumen exige estar logueado.
    if (!enabled) {
      setLoading(false);
      return;
    }
    refresh();
  }, [refresh, enabled]);
  return { summary, payments, loading, error, refresh };
}

const FEATURED_IDS_TTL_MS = 60_000;
let featuredIdsCache = { at: 0, ids: [] };
let featuredIdsInflight = null;

/** Set con los ids de las propiedades destacadas hoy (para rotular las tarjetas). Cache de 1 minuto. */
export function useFeaturedIds() {
  const [ids, setIds] = useState(() => new Set(featuredIdsCache.ids));
  useEffect(() => {
    let active = true;
    if (Date.now() - featuredIdsCache.at < FEATURED_IDS_TTL_MS) {
      return undefined;
    }
    if (!featuredIdsInflight) {
      featuredIdsInflight = api.get("/api/featured/ids")
        .then(res => {
          featuredIdsCache = { at: Date.now(), ids: res.data };
          return res.data;
        })
        .finally(() => {
          featuredIdsInflight = null;
        });
    }
    featuredIdsInflight.then(data => {
      if (active) setIds(new Set(data));
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return ids;
}

/** Fuerza que la próxima lectura de useFeaturedIds vuelva a consultar (tras destacar una publicación). */
export function invalidateFeaturedIds() {
  featuredIdsCache = { at: 0, ids: featuredIdsCache.ids };
}

export const PAYMENT_STATUS_LABEL = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado"
};
