import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthLayout } from "./components/layout/AuthLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { AuthProvider, RequireAuth, RequireAdmin, RequireNotProfessional } from "./lib/auth";
import { FavoritesProvider } from "./lib/favorites";
import { ScrollToTop } from "./components/ScrollToTop";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Recover from "./pages/auth/Recover";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import PropertyListing from "./pages/PropertyListing";
import PropertyDetail from "./pages/PropertyDetail";
import Valuacion from "./pages/Valuacion";
import LifeScore from "./pages/LifeScore";
import Recomendador from "./pages/Recomendador";
import Favoritos from "./pages/Favoritos";
import MisPublicaciones from "./pages/MisPublicaciones";
import Perfil from "./pages/Perfil";
import Terminos from "./pages/Terminos";
import Privacidad from "./pages/Privacidad";
import Publicar from "./pages/Publicar";
import AdminMetrics from "./pages/admin/AdminMetrics";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProperties from "./pages/admin/AdminProperties";
export default function App() {
  return <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Rutas principales: Inicio y Mapa son públicas, el resto requiere sesión */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="mapa" element={<MapPage />} />
              <Route path="propiedades" element={<PropertyListing />} />
              <Route path="propiedades/:id" element={<PropertyDetail />} />
              <Route path="tasacion" element={<RequireAuth>
                    <Valuacion />
                  </RequireAuth>} />
              <Route path="life-score" element={<RequireAuth>
                    <RequireNotProfessional>
                      <LifeScore />
                    </RequireNotProfessional>
                  </RequireAuth>} />
              <Route path="recomendador" element={<RequireAuth>
                    <RequireNotProfessional>
                      <Recomendador />
                    </RequireNotProfessional>
                  </RequireAuth>} />
              <Route path="favoritos" element={<RequireAuth>
                    <RequireNotProfessional>
                      <Favoritos />
                    </RequireNotProfessional>
                  </RequireAuth>} />
              <Route path="mis-publicaciones" element={<RequireAuth>
                    <MisPublicaciones />
                  </RequireAuth>} />
              <Route path="perfil" element={<RequireAuth>
                    <Perfil />
                  </RequireAuth>} />
              <Route path="terminos" element={<Terminos />} />
              <Route path="privacidad" element={<Privacidad />} />
              <Route path="publicar" element={<RequireAuth>
                    <Publicar key="nueva" />
                  </RequireAuth>} />
              <Route path="mis-publicaciones/:id/editar" element={<RequireAuth>
                    <Publicar key="edicion" />
                  </RequireAuth>} />
            </Route>

            {/* Panel de administración: requiere sesión con rol ADMIN */}
            <Route path="/admin" element={<RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>}>
              <Route index element={<AdminMetrics />} />
              <Route path="usuarios" element={<AdminUsers />} />
              <Route path="propiedades" element={<AdminProperties />} />
            </Route>

            {/* Auth */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route index element={<Navigate to="/auth/login" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="registro" element={<Register />} />
              <Route path="recuperar" element={<Recover />} />
              <Route path="restablecer" element={<ResetPassword />} />
              <Route path="verificar" element={<VerifyEmail />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>;
}
