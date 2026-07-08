import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, Key, LogOut, ChevronRight, History } from "lucide-react";
import { useAuth } from "@/lib/auth";
export default function Perfil() {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  async function handleLogout() {
    await logout();
    navigate("/auth/login");
  }
  return <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="border-b border-outline-variant pb-6 mb-8">
        <h1 className="text-3xl font-bold text-on-surface mb-2">Mi Perfil</h1>
        <p className="text-sm font-mono text-on-surface-variant">
          Administra la configuración de tu cuenta y preferencias de seguridad.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Account Details */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                    Detalles de la cuenta
                  </h2>
                  <p className="text-xs font-mono text-on-surface-variant mt-1">Información personal registrada</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <div className="space-y-1 border-b border-outline-variant/50 pb-2">
                  <p className="text-xs font-bold text-outline uppercase tracking-widest">NOMBRE COMPLETO</p>
                  <p className="text-base font-mono text-on-surface">{user?.name}</p>
                </div>

                <div className="space-y-1 border-b border-outline-variant/50 pb-2">
                  <p className="text-xs font-bold text-outline uppercase tracking-widest">CORREO ELECTRÓNICO</p>
                  <p className="text-base font-mono text-on-surface">{user?.email}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-outline uppercase tracking-widest">TIPO DE CUENTA</p>
                  <div>
                    <Badge className="bg-primary/10 text-primary border border-primary/20 tracking-widest text-[10px]">
                      USUARIO NIDIO
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-outline uppercase tracking-widest">ID DE USUARIO</p>
                  <p className="text-base font-mono text-on-surface">#{user?.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Security */}
        <div>
          <Card className="h-full bg-surface-container-low border-outline-variant">
            <CardContent className="p-8 flex flex-col h-full">
              <h2 className="text-lg font-bold text-on-surface mb-6">Seguridad</h2>

              <div className="space-y-4 flex-1">
                <Link to="/auth/recuperar" className="w-full bg-surface-container-lowest border border-outline-variant hover:border-primary transition-colors p-4 rounded-lg flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                    <span className="text-sm font-mono text-on-surface font-semibold">Cambiar contraseña</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
                </Link>
                <p className="text-xs text-on-surface-variant font-mono px-1">
                  Se envía un link de restablecimiento a tu email registrado.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <Link to="/auth/recuperar">
                  <Button variant="outline" className="w-full gap-2 text-primary border-primary hover:bg-primary/5">
                    <Key className="w-4 h-4" /> Cambiar contraseña
                  </Button>
                </Link>
                <Button onClick={handleLogout} className="w-full gap-2 bg-primary text-white border-none">
                  <LogOut className="w-4 h-4" /> Cerrar sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}
