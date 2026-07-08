import axios from "axios";

/** Cliente HTTP hacia el backend (Spring Boot). El JWT viaja en Authorization. */

const TOKEN_KEY = "nidio_token";
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080"
});
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(response => response, error => {
  // JWT vencido o inválido: se descarta la sesión y se vuelve al login.
  if (error.response?.status === 401 && !error.config?.url?.startsWith("/api/auth/")) {
    setToken(null);
    if (!window.location.pathname.startsWith("/auth")) {
      window.location.href = "/auth/login";
    }
  }
  return Promise.reject(error);
});

/** Mensaje legible del shape de error estándar del backend. */
export function apiErrorMessage(error, fallback) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.errors?.length) {
      return data.errors.map(e => `${e.field}: ${e.message}`).join(". ");
    }
    if (data?.message) {
      return data.message;
    }
    if (!error.response) {
      return "No se pudo conectar con el servidor. ¿Está corriendo el backend?";
    }
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Tipos del contrato REST (docs/api/endpoints.md)
// ---------------------------------------------------------------------------
