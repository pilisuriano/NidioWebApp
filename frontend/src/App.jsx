import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthLayout } from "./components/layout/AuthLayout";
import { AuthProvider, RequireAuth } from "./lib/auth";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Recover from "./pages/auth/Recover";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import Valuacion from "./pages/Valuacion";
import LifeScore from "./pages/LifeScore";
import Busquedas from "./pages/Busquedas";
import Perfil from "./pages/Perfil";
export default function App() {
  return <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas principales (requieren sesión) */}
          <Route path="/" element={<RequireAuth>
                <MainLayout />
              </RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="mapa" element={<MapPage />} />
            <Route path="valuacion" element={<Valuacion />} />
            <Route path="life-score" element={<LifeScore />} />
            <Route path="busquedas" element={<Busquedas />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>

          {/* Auth */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<Navigate to="/auth/login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="registro" element={<Register />} />
            <Route path="recuperar" element={<Recover />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>;
}
