import { Outlet, Link } from "react-router-dom";
export function AuthLayout() {
  return <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
         <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-transparent"></div>
         <div className="w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      </div>

      <header className="bg-surface-container-lowest flex justify-between items-center w-full px-8 h-16 border-b border-outline-variant relative z-10">
        <Link to="/" className="font-bold text-xl text-primary tracking-tighter">nidio</Link>
        <div className="flex items-center gap-4">
          <Link to="/auth/login" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Login</Link>
          <Link to="/auth/registro" className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all">Sign Up</Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <Outlet />
      </main>

      <footer className="h-8 border-t border-outline-variant bg-surface-container-low flex items-center justify-between px-4 text-xs font-mono text-outline-variant relative z-10">
         <div className="flex items-center gap-2">
            <span className="font-bold text-tertiary">LIVE</span>
            <span>Timestamp: {new Date().toISOString().substring(0, 19)}Z</span>
         </div>
         <div>
            <span>v2.4.0-stable &copy; nidio 2026</span>
         </div>
      </footer>
    </div>;
}
