import { NavLink, Outlet, Link } from "react-router-dom";
import { BarChart3, Users, Building2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_NAV_ITEMS = [{ icon: BarChart3, label: "Métricas", path: "/admin", end: true }, { icon: Users, label: "Usuarios", path: "/admin/usuarios", end: false }, { icon: Building2, label: "Propiedades", path: "/admin/propiedades", end: false }];

// Layout propio del panel de administración: mismo lenguaje visual que
// MainLayout (sidebar oscura), pero con su propia navegación, separada de la
// app "normal" para que quede claro que es una sección distinta.
export function AdminLayout() {
  return <div className="flex h-screen w-full bg-background overflow-hidden">
      <aside className="w-64 bg-inverse-surface text-inverse-on-surface flex flex-col flex-shrink-0">
        <div className="p-6">
          <img src="/logo.svg" alt="nidio" className="h-8 w-auto" />
          <p className="text-[10px] uppercase tracking-widest text-outline-variant mt-1">Panel de administración</p>
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

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-auto bg-surface p-8">
          <Outlet />
        </main>
      </div>
    </div>;
}
