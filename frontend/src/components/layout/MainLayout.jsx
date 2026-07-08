import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Map, Calculator, HeartPulse, Bookmark, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
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
  label: "Valuación",
  path: "/valuacion"
}, {
  icon: HeartPulse,
  label: "Life Score",
  path: "/life-score"
}, {
  icon: Bookmark,
  label: "Mis búsquedas",
  path: "/busquedas"
}];
const TITLES = {
  "/": "Inicio",
  "/mapa": "Explorar propiedades",
  "/valuacion": "Valuación",
  "/life-score": "Life Score",
  "/busquedas": "Mis búsquedas",
  "/perfil": "Perfil"
};
export function MainLayout() {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  async function handleLogout() {
    await logout();
    navigate("/auth/login");
  }
  return <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-inverse-surface text-inverse-on-surface flex flex-col flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-inverse-primary tracking-tighter">nidio</h1>
          <p className="text-[10px] uppercase tracking-widest text-outline-variant mt-1">Real Estate Intelligence</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => <NavLink key={item.path} to={item.path} end={item.path === "/"} className={({
          isActive
        }) => cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all", isActive ? "bg-primary text-on-primary border-l-4 border-inverse-primary rounded-l-none" : "text-outline-variant hover:bg-surface-variant/10 hover:text-inverse-on-surface")}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>)}
        </nav>

        <div className="p-4 border-t border-outline-variant/20 flex flex-col gap-2">
          <NavLink to="/perfil" className={({
          isActive
        }) => cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors", isActive ? "bg-primary text-on-primary" : "text-outline-variant hover:text-inverse-on-surface")}>
            <User className="w-5 h-5" />
            Perfil
          </NavLink>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-outline-variant hover:text-inverse-on-surface transition-colors text-left w-full">
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-outline-variant bg-surface flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-on-surface">{TITLES[location.pathname] ?? "Nidio"}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-on-surface-variant font-medium">{user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold border border-outline-variant">
              {user?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-surface relative">
          <Outlet />
        </main>
      </div>
    </div>;
}
