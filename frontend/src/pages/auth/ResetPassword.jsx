import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";

// Página a la que apunta el link del mail de recuperación
// (app.mail.password-reset-url-base en el backend): /auth/restablecer?token=...
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/auth/reset-password", { token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo restablecer la contraseña"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return <div className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-[440px] p-8 shadow-sm text-center space-y-6">
        <div className="space-y-3 py-6">
          <XCircle className="w-10 h-10 mx-auto text-error" />
          <p className="text-sm font-semibold text-on-surface">Falta el token de recuperación en el link.</p>
        </div>
        <div className="pt-6 border-t border-outline-variant">
          <Link to="/auth/recuperar" className="text-sm text-primary font-bold hover:underline">
            Pedir un nuevo link
          </Link>
        </div>
      </div>;
  }

  if (done) {
    return <div className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-[440px] p-8 shadow-sm text-center space-y-6">
        <div className="space-y-3 py-6">
          <CheckCircle2 className="w-10 h-10 mx-auto text-good-value" />
          <p className="text-sm font-semibold text-on-surface">Contraseña actualizada correctamente.</p>
        </div>
        <Button onClick={() => navigate("/auth/login")} className="w-full h-12 text-lg gap-2 bg-primary-container text-on-primary-container hover:bg-primary-container/90">
          Iniciar sesión
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>;
  }

  return <div className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-[440px] p-8 shadow-sm">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-on-surface tracking-tight">Nueva contraseña</h1>
        <p className="text-sm text-on-surface-variant">Elegí una contraseña nueva para tu cuenta.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && <div className="bg-error-container text-on-error-container text-sm rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="password">Contraseña nueva</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-outline" />
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required className="pl-10 pr-10" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" className="absolute right-3 top-2.5 text-outline hover:text-primary transition-colors" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-on-surface-variant">Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="confirm_password">Confirmar contraseña</label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-2.5 h-5 w-5 text-outline" />
            <Input id="confirm_password" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" required className="pl-10 pr-10" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <button type="button" className="absolute right-3 top-2.5 text-outline hover:text-primary transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full h-12 text-lg gap-2 bg-primary-container text-on-primary-container hover:bg-primary-container/90 disabled:opacity-60">
          {submitting ? "Guardando…" : "Guardar contraseña"}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-outline-variant text-center">
        <Link to="/auth/login" className="text-sm text-on-surface-variant hover:text-primary transition-colors group">
          Volver al <span className="text-primary font-bold group-hover:underline">login</span>
        </Link>
      </div>
    </div>;
}
