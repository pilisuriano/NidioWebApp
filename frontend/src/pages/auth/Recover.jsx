import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, ArrowRight, AlertCircle } from "lucide-react";
import { useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
export default function Recover() {
  const { user } = useAuth();
  // Si venís logueado (ej. desde "Cambiar contraseña" en Perfil), solo tiene
  // sentido mandar el link a TU cuenta: se precarga y se bloquea el email.
  // Desde el registro ("el email ya está registrado" → Olvidé mi contraseña)
  // llega el email que se intentó registrar, para no tener que escribirlo de nuevo.
  const location = useLocation();
  const [email, setEmail] = useState(user?.email ?? location.state?.email ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post("/api/auth/forgot-password", {
        email
      });
      setMessage(res.data.message);
      setSubmitted(true);
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo enviar el email de recuperación"));
    } finally {
      setSubmitting(false);
    }
  }
  return <div className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-[440px] p-6 sm:p-8 shadow-sm">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-on-surface tracking-tight">Recuperar Acceso</h1>
        <p className="text-sm text-on-surface-variant">Introduce tu correo para recibir un enlace seguro de restablecimiento.</p>
      </div>

      {!submitted ? <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-error-container text-on-error-container text-sm rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>}

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="email">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <Input id="email" type="email" placeholder="tu@email.com" required disabled={!!user} className={`py-3 h-12 ${user ? "bg-surface-container-low text-on-surface-variant" : ""}`} value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <Button type="submit" disabled={submitting} className="w-full h-12 text-base sm:text-lg gap-2 bg-primary-container text-on-primary-container hover:bg-primary-container/90 disabled:opacity-60">
            {submitting ? "Enviando…" : "Enviar link de recuperación"}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </form> : <div className="space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-good-value/10 text-good-value p-4 rounded-lg flex gap-3">
            <div className="mt-0.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <p className="text-sm font-semibold">{message}</p>
          </div>
        </div>}

      <div className="pt-6 mt-6 border-t border-outline-variant text-center">
        <p className="text-sm text-on-surface-variant">
          ¿Recordaste tu contraseña? <Link to="/auth/login" className="text-primary font-bold hover:underline">Volver al login</Link>
        </p>
      </div>
    </div>;
}
