import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LogIn, Eye, AtSign, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { apiErrorMessage } from "@/lib/api";
export default function Login() {
  const navigate = useNavigate();
  const {
    login
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo iniciar sesión"));
    } finally {
      setSubmitting(false);
    }
  }
  return <div className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-[440px] p-8 md:p-12 shadow-sm">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-3xl font-bold text-primary tracking-tighter mb-1">nidio</h1>
        <p className="text-xs font-semibold text-outline uppercase tracking-widest">Real Estate Intelligence</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && <div className="bg-error-container text-on-error-container text-sm rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>}

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="email">Email</label>
          <div className="relative">
            <Input id="email" type="email" placeholder="tu@email.com" required className="pl-4 pr-10" value={email} onChange={e => setEmail(e.target.value)} />
            <AtSign className="absolute right-3 top-2.5 h-5 w-5 text-outline" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="password">Contraseña</label>
            <Link to="/auth/recuperar" className="text-[11px] text-primary hover:underline transition-all">¿Olvidaste tu contraseña?</Link>
          </div>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required className="pl-4 pr-10" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" className="absolute right-3 top-2.5 text-outline hover:text-primary transition-colors" onClick={() => setShowPassword(!showPassword)}>
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full h-12 text-lg gap-2 mt-4 bg-primary-container text-on-primary-container hover:bg-primary-container/90 disabled:opacity-60">
          {submitting ? "Ingresando…" : "Iniciar sesión"}
          <LogIn className="w-5 h-5" />
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-outline-variant text-center">
        <p className="text-sm text-on-surface-variant">
          ¿No tienes cuenta? <Link to="/auth/registro" className="text-primary font-bold hover:underline transition-all">Regístrate</Link>
        </p>
      </div>
    </div>;
}
