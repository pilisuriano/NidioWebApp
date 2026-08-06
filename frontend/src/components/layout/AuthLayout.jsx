import { Outlet, Link, useLocation } from "react-router-dom";
import { Footer } from "./Footer";
export function AuthLayout() {
  const { pathname } = useLocation();
  // Login/Sign Up en el header solo tienen sentido cuando estás eligiendo
  // entre esas dos opciones. En recuperar/restablecer/verificar ya hay un
  // link "volver al login" dentro de la tarjeta, así que no hace falta
  // (y confunde) repetirlos arriba.
  const showAuthLinks = pathname === "/auth/login" || pathname === "/auth/registro";
  return <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
         <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-transparent"></div>
         <div className="w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      </div>

      <header className="bg-surface-container-lowest flex justify-between items-center w-full px-8 h-16 border-b border-outline-variant relative z-10">
        <Link to="/"><img src="/logo.svg" alt="nidio" className="h-7 w-auto" /></Link>
        {showAuthLinks && <div className="flex items-center gap-4">
          <Link to="/auth/login" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Login</Link>
          <Link to="/auth/registro" className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all">Sign Up</Link>
        </div>}
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <Outlet />
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>;
}
