import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LogoUploader } from "@/components/ui/LogoUploader";
import { LogOut, ChevronRight, History, CheckCircle2, AlertCircle, BadgeCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiErrorMessage } from "@/lib/api";
export default function Perfil() {
  const {
    user,
    logout,
    updateProfile
  } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [dni, setDni] = useState(user?.dni ?? "");
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [cuit, setCuit] = useState(user?.cuit ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [logoUrl, setLogoUrl] = useState(user?.logoUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const isProfessional = user?.accountType === "PROFESSIONAL";
  async function handleLogout() {
    setConfirmingLogout(false);
    await logout();
    navigate("/auth/login");
  }
  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      await updateProfile({
        name,
        dni,
        phone,
        ...(isProfessional ? { logoUrl, businessName, cuit } : {})
      });
      setSuccess(true);
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudieron guardar los cambios"));
    } finally {
      setSaving(false);
    }
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
              <form onSubmit={handleSave} className="space-y-10">
                {error && <div className="bg-error-container text-on-error-container text-sm rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>}
                {success && <div className="bg-good-value/10 text-good-value text-sm rounded-lg p-3 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Cambios guardados correctamente.</span>
                  </div>}

                {/* Logo de cuenta profesional: se muestra junto al check de
                    verificado en el cartel "Publicado por" de tus avisos. */}
                {isProfessional && <div>
                    <h2 className="text-lg font-bold text-primary flex items-center gap-1.5">
                      Cuenta profesional <BadgeCheck className="w-4 h-4" />
                    </h2>
                    <p className="text-xs font-mono text-on-surface-variant mt-1 mb-5">Este logo aparece en los avisos que publiques.</p>
                    <LogoUploader logoUrl={logoUrl} onChange={setLogoUrl} />
                  </div>}

                <div>
                  {isProfessional
                    ? <>
                        <h2 className="text-lg font-bold text-primary">Empresa</h2>
                        <p className="text-xs font-mono text-on-surface-variant mt-1 mb-5">Completá los datos de tu empresa.</p>
                      </>
                    : <>
                        <h2 className="text-lg font-bold text-primary">Personales</h2>
                        <p className="text-xs font-mono text-on-surface-variant mt-1 mb-5">Completá tus datos personales.</p>
                      </>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isProfessional
                      ? <>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="businessName">Nombre de la empresa</label>
                            <Input id="businessName" required value={businessName} onChange={e => setBusinessName(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="cuit">CUIT</label>
                            <Input id="cuit" value={cuit} onChange={e => setCuit(e.target.value)} />
                          </div>
                        </>
                      : <>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="name">Nombre y Apellido</label>
                            <Input id="name" required value={name} onChange={e => setName(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="dni">Documento</label>
                            <Input id="dni" value={dni} onChange={e => setDni(e.target.value)} />
                          </div>
                        </>}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-primary">Contacto</h2>
                  <p className="text-xs font-mono text-on-surface-variant mt-1 mb-5">Estos datos son para que podamos contactarte.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="email">Email</label>
                      <Input id="email" value={user?.email ?? ""} disabled className="bg-surface-container-low text-on-surface-variant" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="phone">Teléfono</label>
                      <Input id="phone" type="tel" placeholder="11 1234 5678" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={saving} className="bg-primary-container text-on-primary-container hover:bg-primary-container/90 disabled:opacity-60">
                  {saving ? "Guardando…" : "Guardar cambios"}
                </Button>
              </form>
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

              <div className="mt-8">
                <Button onClick={() => setConfirmingLogout(true)} className="w-full gap-2 bg-primary text-white border-none">
                  <LogOut className="w-4 h-4" /> Cerrar sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
