import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Map, Calculator, HeartPulse, Heart, ClipboardList, User, LogOut, ShieldCheck, Menu, X } from "lucide-react";
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
export function MainLayout() {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // En "Explorar propiedades" el botón va a media altura del borde
  // izquierdo (ver el comentario más abajo, junto al botón: ahí arriba a la
  // izquierda quedaría pegado al buscador "Alquilar/Comprar"). En el resto
  // de las páginas (Inicio, etc.) no hay ningún control fijo en esa esquina,
  // así que vuelve a la posición arriba a la izquierda de siempre.
  const isMapPage = location.pathname.startsWith("/mapa");
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  // Abierto por defecto; el usuario lo puede cerrar con el botón de la
  // cabecera del menú, y reabrirlo con el botón flotante que aparece
  // cuando está cerrado.
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isProfessional = user?.accountType === "PROFESSIONAL";
  const navItems = NAV_ITEMS.filter(item => !item.hideForProfessional || !isProfessional);
  async function handleLogout() {
    setConfirmingLogout(false);
    await logout();
    navigate("/");
  }
  return <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar. El <aside> anima su ancho a 0 al cerrarse; el contenido
          interno mantiene un ancho fijo (w-64) para que no se aplaste ni
          reacomode durante la transición, simplemente "se desliza" afuera. */}
      <aside className={cn("bg-inverse-surface text-inverse-on-surface flex flex-col flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out", sidebarOpen ? "w-64" : "w-0")}>
        <div className="w-64 h-full flex flex-col">
          <div className="flex items-center justify-between p-6">
            <Link to="/" className="block">
              <img src="/logo.svg" alt="nidio" className="h-8 w-auto" />
              <p className="text-[10px] uppercase tracking-widest text-outline-variant mt-1">Inmuebles en CABA</p>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
              title="Cerrar menú"
              className="p-1.5 rounded-lg text-outline-variant hover:bg-surface-variant/10 hover:text-inverse-on-surface transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
        </div>
      </aside>

      {/* Botón flotante para reabrir el menú, solo visible cuando está
          cerrado (sin la barra de arriba ya no hay otro lugar fijo donde
          ponerlo). z-[1300]: en Explorar propiedades el mapa de Leaflet usa
          z-index propios de hasta 1200. En Explorar propiedades va al medio
          del borde izquierdo (no en la esquina superior) para no quedar
          pegado/superpuesto al buscador "Alquilar/Comprar" de esa página,
          que también arranca pegado a la esquina de arriba -- en el resto
          de las páginas (Inicio, etc.) no hay nada fijo en esa esquina, así
          que va arriba a la izquierda, la posición "de siempre". */}
      {!sidebarOpen && <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
          title="Abrir menú"
          className={cn("fixed z-[1300] p-2.5 rounded-lg bg-inverse-surface text-inverse-on-surface shadow-lg hover:opacity-90 transition-opacity", isMapPage ? "top-1/2 left-4 -translate-y-1/2" : "top-4 left-4")}
        >
          <Menu className="w-5 h-5" />
        </button>}

      {/* Usuario logueado: ya no hay barra blanca arriba, pero se mantiene
          un acceso rápido al perfil como chip flotante arriba a la derecha.
          Mismo z-[1300] que el botón de abrir menú, por la misma razón.
          Siempre arriba a la derecha del todo, en TODAS las páginas
          (antes, en Explorar propiedades quedaba más abajo -- top-40 -- para
          no chocar con el selector de capas de esa página; ahora es al
          revés: el selector de capas de MapPage.jsx es el que se corre para
          abajo, ver el comentario junto a "Selector de capas" ahí). */}
      {user && <Link
          to="/perfil"
          className="fixed top-4 right-4 z-[1300] flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full bg-surface-container-lowest shadow-lg border border-outline-variant hover:shadow-xl transition-shadow group"
        >
          <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
            {user.name?.charAt(0).toUpperCase() ?? "?"}
          </span>
          <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
            {user.name?.split(" ")[0]}
          </span>
        </Link>}

      {/* Main Content Area. Sin topbar: la vieja barra blanca con el título
          de la página y el botón "Publicar" se sacó; Publicar ahora vive
          como card en el Inicio, junto a Tasación y Life Score. */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
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
