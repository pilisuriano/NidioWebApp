import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Map, Calculator, HeartPulse, Heart, ClipboardList, User, LogOut, Plus, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Footer } from "./Footer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
const NAV_ITEMS = [{
  icon: Home,
  label: "Inicio",
  path: "/"
}, {
  icon: Map,
  label: "Explorar propiedades",
  path: "/mapa"
}, {
  icon: Calculator,
  label: "Tasación",
  path: "/tasacion"
}, {
  icon: ClipboardList,
  label: "Mis publicaciones",
  path: "/mis-publicaciones"
}, {
  icon: HeartPulse,
  label: "Life Score",
  path: "/life-score",
  // Solo tiene sentido para quien busca comprar/alquilar, no para una
  // cuenta profesional (inmobiliaria/broker/desarrollador) que publica.
  hideForProfessional: true
}, {
  icon: Heart,
  label: "Mis favoritos",
  path: "/favoritos",
  hideForProfessional: true
}];
const TITLES = {
  "/": "Inicio",
  "/mapa": "Explorar propiedades",
  "/propiedades": "Listado de propiedades",
  "/tasacion": "Tasación",
  "/mis-publicaciones": "Mis publicaciones",
  "/life-score": "Life Score",
  "/favoritos": "Mis favoritos",
  "/perfil": "Perfil",
  "/terminos": "Términos y condiciones",
  "/privacidad": "Privacidad y protección de datos",
  "/publicar": "Publicar"
};
export function MainLayout() {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const isProfessional = user?.accountType === "PROFESSIONAL";
  const navItems = NAV_ITEMS.filter(item => !item.hideForProfessional || !isProfessional);
  async function handleLogout() {
    setConfirmingLogout(false);
    await logout();
    navigate("/");
  }
  return <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-inverse-surface text-inverse-on-surface flex flex-col flex-shrink-0">
        <Link to="/" className="block p-6">
          <img src="/logo.svg" alt="nidio" className="h-8 w-auto" />
          <p className="text-[10px] uppercase tracking-widest text-outline-variant mt-1">Inmuebles en CABA</p>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => <NavLink key={item.path} to={item.path} end={item.path === "/"} className={({
          isActive
        }) => cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all", isActive ? "bg-primary text-on-primary border-l-4 border-inverse-primary rounded-l-none" : "text-outline-variant hover:bg-surface-variant/10 hover:text-inverse-on-surface")}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>)}
        </nav>

        <div className="p-4 border-t border-outline-variant/20 flex flex-col gap-2">
          {user ? <>
              <NavLink to="/perfil" className={({
            isActive
          }) => cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors", isActive ? "bg-primary text-on-primary" : "text-outline-variant hover:text-inverse-on-surface")}>
                <User className="w-5 h-5" />
                Perfil
              </NavLink>
              {user.role === "ADMIN" && <NavLink to="/admin" className={({
            isActive
          }) => cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors", isActive ? "bg-primary text-on-primary" : "text-outline-variant hover:text-inverse-on-surface")}>
                <ShieldCheck className="w-5 h-5" />
                Panel admin
              </NavLink>}
              <button onClick={() => setConfirmingLogout(true)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-outline-variant hover:text-inverse-on-surface transition-colors text-left w-full">
                <LogOut className="w-5 h-5" />
                Cerrar sesión
              </button>
            </> : <>
              <NavLink to="/auth/login" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-outline-variant hover:text-inverse-on-surface transition-colors">
                <User className="w-5 h-5" />
                Iniciar sesión
              </NavLink>
              <NavLink to="/auth/registro" className="flex items-center justify-center px-4 py-3 rounded-lg text-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all">
                Registrarse
              </NavLink>
            </>}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-outline-variant bg-surface flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-on-surface">{TITLES[location.pathname] ?? (location.pathname.startsWith("/propiedades/") ? "Propiedad" : "Nidio")}</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/publicar" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" /> Publicar
            </Link>
            {user && <Link to="/perfil" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold border border-outline-variant group-hover:opacity-90 transition-opacity">
                {user.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <span className="text-sm text-on-surface-variant font-medium group-hover:text-on-surface transition-colors">{user.name}</span>
            </Link>}
          </div>
        </header>

        {/* Page Content. Bloque normal (no flex-col): antes, envolver el
            Outlet en un hijo flex-1 hacía que el contenido de páginas
            normales (más alto que el espacio "sobrante" arriba del Footer)
            quedara tapado por el Footer en vez de empujarlo hacia abajo —
            los hijos flex no se superponen entre sí, pero si el contenido
            se desborda de su caja, el hermano siguiente lo sigue pintando
            encima. En flujo de bloque normal el Footer simplemente aparece
            después de todo el contenido, sin importar cuánto mida. */}
        <main className="flex-1 min-h-0 overflow-auto bg-surface relative">
          <Outlet />
          <Footer />
        </main>
      </div>

      <ConfirmDialog
        open={confirmingLogout}
        title="¿Cerrar sesión?"
        description="Vas a tener que volver a iniciar sesión para acceder a tu cuenta."
        confirmLabel="Cerrar sesión"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>;
}
