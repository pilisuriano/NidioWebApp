import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
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
  async function register(name, email, password) {
    const res = await api.post("/api/auth/register", {
      name,
      email,
      password
    });
    setToken(res.data.token);
    setUser(res.data.user);
  }
  async function logout() {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // El backend no invalida el JWT (decisión de endpoints.md); basta con descartarlo.
    }
    setToken(null);
    setUser(null);
  }
  return <AuthContext.Provider value={{
    user,
    loading,
    login,
    register,
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
