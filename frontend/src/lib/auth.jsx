import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { api, getToken, setToken } from "./api";
const AuthContext = createContext(null);
export function AuthProvider({
  children
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api.get("/api/auth/me").then(res => setUser(res.data)).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);
  async function login(email, password) {
    const res = await api.post("/api/auth/login", {
      email,
      password
    });
    setToken(res.data.token);
    setUser(res.data.user);
  }
  async function register(payload) {
    // El registro ya no loguea directo: el backend manda un mail de
    // verificación y el login queda bloqueado hasta confirmarlo. payload
    // acepta tanto una cuenta común ({ name, email, password }) como una
    // profesional (suma accountType, professionalType, businessName,
    // taxCondition, cuit, phone, mobilePhone — ver Register.jsx).
    const res = await api.post("/api/auth/register", payload);
    return res.data;
  }
  async function updateProfile(data) {
    const res = await api.patch("/api/auth/me", data);
    setUser(res.data);
    return res.data;
  }
  async function logout() {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // El backend no invalida el JWT (decisión de endpoints.md); basta con descartarlo.
    }
    setToken(null);
    setUser(null);
    toast.success("Sesión cerrada correctamente");
  }
  return <AuthContext.Provider value={{
    user,
    loading,
    login,
    register,
    updateProfile,
    logout
  }}>
      {children}
    </AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}

/** Protege las rutas principales: sin sesión se redirige al login. */
export function RequireAuth({
  children
}) {
  const {
    user,
    loading
  } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="h-screen flex items-center justify-center text-on-surface-variant font-mono text-sm">
        Cargando sesión…
      </div>;
  }
  if (!user) {
    return <Navigate to="/auth/login" state={{
      from: location
    }} replace />;
  }
  return <>{children}</>;
}

/** Protege el panel de administración: sin sesión al login, sin rol ADMIN a inicio. */
export function RequireAdmin({
  children
}) {
  const {
    user,
    loading
  } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="h-screen flex items-center justify-center text-on-surface-variant font-mono text-sm">
        Cargando sesión…
      </div>;
  }
  if (!user) {
    return <Navigate to="/auth/login" state={{
      from: location
    }} replace />;
  }
  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

/** Protege funciones de comprador/inquilino (Life Score, Favoritos) que no
 *  tienen sentido para una cuenta profesional (inmobiliaria/broker/desarrollador):
 *  esas cuentas publican y gestionan avisos, no compran ni alquilan a través
 *  de la plataforma. Si una cuenta profesional entra por URL directa, se la
 *  redirige a Inicio (el nav ya oculta el link, ver MainLayout). */
export function RequireNotProfessional({
  children
}) {
  const {
    user
  } = useAuth();
  if (user?.accountType === "PROFESSIONAL") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
