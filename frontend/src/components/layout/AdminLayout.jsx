import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { BarChart3, Users, Building2, ArrowLeft, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_NAV_ITEMS = [{ icon: BarChart3, label: "Métricas", path: "/admin", end: true }, { icon: Users, label: "Usuarios", path: "/admin/usuarios", end: false }, { icon: Building2, label: "Propiedades", path: "/admin/propiedades", end: false }];

// Layout propio del panel de administración: mismo lenguaje visual que
// MainLayout (sidebar oscura), pero con su propia navegación, separada de la
// app "normal" para que quede claro que es una sección distinta.
// Responsive: igual que MainLayout, en celular/tablet (< lg) el sidebar es un
// panel que se desliza por encima del contenido y se abre desde una barra
// superior; en compu queda fijo a la izquierda como siempre.
export function AdminLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {menuOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <aside className={cn(
        "w-64 max-w-[85vw] bg-inverse-surface text-inverse-on-surface flex flex-col flex-shrink-0",
        "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
        menuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        "lg:static lg:translate-x-0 lg:shadow-none lg:max-w-none"
      )}>
        <div className="p-6 flex items-start justify-between gap-2">
          <div>
            <img src="/logo.svg" alt="nidio" className="h-8 w-auto" />
            <p className="text-[10px] uppercase tracking-widest text-outline-variant mt-1">Panel de administración</p>
          </div>
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" className="lg:hidden p-1.5 rounded-lg text-outline-variant hover:text-inverse-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map(item => <NavLink key={item.path} to={item.path} end={item.end} className={({
          isActive
        }) => cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all", isActive ? "bg-primary text-on-primary border-l-4 border-inverse-primary rounded-l-none" : "text-outline-variant hover:bg-surface-variant/10 hover:text-inverse-on-surface")}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>)}
        </nav>

        <div className="p-4 border-t border-outline-variant/20">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-outline-variant hover:text-inverse-on-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Volver a Nidio
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <header className="lg:hidden flex items-center gap-2 h-14 px-3 sm:px-4 bg-inverse-surface text-inverse-on-surface flex-shrink-0">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú" aria-expanded={menuOpen} className="p-2 -ml-1 rounded-lg hover:bg-surface-variant/10">
            <Menu className="w-5 h-5" />
          </button>
          <img src="/logo.svg" alt="nidio" className="h-7 w-auto" />
          <span className="text-[10px] uppercase tracking-widest text-outline-variant">Admin</span>
        </header>
        <main className="flex-1 overflow-auto bg-surface p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>;
}
