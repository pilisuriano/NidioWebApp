import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Map, Calculator, HeartPulse, Heart, ClipboardList, User, LogOut, ShieldCheck, Menu, X, Plus, Sparkles, CreditCard } from "lucide-react";
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
  path: "/mis-publicaciones",
  // Solo tiene sentido con sesión iniciada.
  requiresAuth: true
}, {
  icon: HeartPulse,
  label: "Life Score",
  path: "/life-score"
}, {
  icon: Sparkles,
  label: "Recomendación",
  path: "/recomendador",
  // Mismo criterio que Life Score: es para quien busca, no para quien publica.
  hideForProfessional: true
}, {
  icon: Heart,
  label: "Mis favoritos",
  path: "/favoritos",
  hideForProfessional: true,
  requiresAuth: true
}, {
  icon: CreditCard,
  label: "Planes",
  path: "/planes"
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
  // En Explorar propiedades el mapa ocupa toda la pantalla: ahí el botón del menú se alinea con los de zoom.
  const isMapPage = location.pathname.startsWith("/mapa");
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  // Abierto por defecto; el usuario lo puede cerrar con el botón de la
  // cabecera del menú, y reabrirlo con el botón flotante que aparece
  // cuando está cerrado.
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Responsive: en pantallas chicas (celular/tablet, < 1024px = breakpoint
  // "lg" de Tailwind) el menú no ocupa lugar fijo, es un panel que se
  // desliza por encima del contenido (con fondo oscuro detrás) y arranca
  // cerrado. En compu se mantiene el sidebar de siempre.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Al navegar a otra página se cierra el menú del celular.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  // Con el menú del celular abierto, Escape lo cierra.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function onKey(e) {
      if (e.key === "Escape") setMobileMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);
  const isProfessional = user?.accountType === "PROFESSIONAL";
  const navItems = NAV_ITEMS.filter(item => (!item.hideForProfessional || !isProfessional) && (!item.requiresAuth || user));
  async function handleLogout() {
    setConfirmingLogout(false);
    await logout();
    navigate("/");
  }
  function closeMenu() {
    if (window.matchMedia("(min-width: 1024px)").matches) setSidebarOpen(false);
    else setMobileMenuOpen(false);
  }
  return <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {/* Fondo oscuro detrás del menú en celular/tablet: tocarlo lo cierra. */}
      {mobileMenuOpen && <div className="fixed inset-0 z-[1390] bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />}

      {/* Sidebar. El <aside> anima su ancho a 0 al cerrarse; el contenido
          interno mantiene un ancho fijo (w-64) para que no se aplaste ni
          reacomode durante la transición, simplemente "se desliza" afuera. */}
      <aside className={cn(
        "bg-inverse-surface text-inverse-on-surface flex flex-col flex-shrink-0 overflow-hidden",
        // Celular/tablet: panel fijo que entra desde la izquierda.
        "fixed inset-y-0 left-0 z-[1400] w-64 max-w-[85vw] transition-transform duration-300 ease-in-out",
        mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        // Compu: sidebar en el flujo normal que anima su ancho.
        "lg:static lg:z-auto lg:max-w-none lg:translate-x-0 lg:shadow-none lg:transition-[width]",
        sidebarOpen ? "lg:w-64" : "lg:w-0"
      )}>
        <div className="w-64 h-full flex flex-col">
          <div className="flex items-center justify-between px-6 pt-9 pb-2">
            <Link to="/" className="block">
              <img src="/logo.svg" alt="nidio" className="h-11 w-auto" />
              <p className="text-[11px] uppercase tracking-widest text-outline-variant mt-1.5">Inmuebles en CABA</p>
            </Link>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Cerrar menú"
              title="Cerrar menú"
              className="p-1.5 rounded-lg text-outline-variant hover:bg-surface-variant/10 hover:text-inverse-on-surface transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
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

      {/* Main Content Area. Sin topbar: la vieja barra blanca con el título
          de la página y el botón "Publicar" se sacó; Publicar ahora vive
          como card en el Inicio, junto a Tasación y Life Score. */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Barra superior solo en celular/tablet (lg:hidden): botón de menú,
            logo y los accesos rápidos (Publicar / perfil) que en compu son
            chips flotantes arriba a la derecha. */}
        {/* Botón para reabrir el menú, solo en compu y solo cuando el menú está cerrado. Flota arriba a la izquierda;
            en Explorar propiedades va a mitad de altura del borde izquierdo, alineado con los botones de zoom del mapa
            (10px de margen, 34px de ancho), para no pisar el buscador. Ya no hay chips de Publicar ni de usuario
            arriba: el perfil está en el menú de la izquierda y Publicar es una card del Inicio. */}
        {!sidebarOpen && <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            title="Abrir menú"
            className={cn("hidden lg:flex fixed z-[1300] items-center justify-center rounded-lg bg-inverse-surface text-inverse-on-surface shadow-lg hover:opacity-90 transition-opacity", isMapPage ? "top-1/2 left-[10px] -translate-y-1/2 w-[34px] h-[34px]" : "top-4 left-4 p-2.5")}
          >
            <Menu className="w-5 h-5" />
          </button>}
        <header className="lg:hidden flex items-center justify-between gap-2 h-14 px-3 sm:px-4 bg-inverse-surface text-inverse-on-surface flex-shrink-0 z-[1300]">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={mobileMenuOpen}
              className="p-2 -ml-1 rounded-lg hover:bg-surface-variant/10 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" aria-label="Ir al inicio" className="min-w-0">
              <img src="/logo.svg" alt="nidio" className="h-7 w-auto" />
            </Link>
          </div>
          {user ? <div className="flex items-center gap-2 flex-shrink-0">
              <Link to="/publicar" aria-label="Publicar propiedad" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Publicar</span>
              </Link>
              <Link to="/perfil" aria-label="Mi perfil" className="w-8 h-8 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center text-sm font-bold">
                {user.name?.charAt(0).toUpperCase() ?? "?"}
              </Link>
            </div> : <Link to="/auth/login" className="px-3 py-1.5 rounded-full bg-primary text-on-primary text-sm font-bold flex-shrink-0">
              Ingresar
            </Link>}
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
          {/* sidebarOpen se comparte con las páginas: el Inicio muestra el logo sobre la portada cuando el menú está cerrado. */}
          <Outlet context={{ sidebarOpen }} />
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
