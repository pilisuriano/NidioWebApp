import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Mail, Lock, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { apiErrorMessage } from "@/lib/api";
export default function Register() {
  const navigate = useNavigate();
  const {
    register
  } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo crear la cuenta"));
    } finally {
      setSubmitting(false);
    }
  }
  return <div className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-[440px] p-8 shadow-sm">
      <h2 className="text-xl font-bold text-on-surface mb-6 border-b border-outline-variant pb-4">Crear cuenta</h2>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && <div className="bg-error-container text-on-error-container text-sm rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="full_name">Nombre completo</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-outline" />
            <Input id="full_name" type="text" placeholder="Ej. Juan Pérez" required className="pl-10" value={name} onChange={e => setName(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="email">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-outline" />
            <Input id="email" type="email" placeholder="tu@email.com" required className="pl-10" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="password">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-outline" />
            <Input id="password" type="password" placeholder="••••••••" required className="pl-10" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="confirm_password">Confirmar contraseña</label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-2.5 h-5 w-5 text-outline" />
            <Input id="confirm_password" type="password" placeholder="••••••••" required className="pl-10" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
        </div>

        <div className="flex items-start gap-3 py-2">
          <div className="flex items-center h-5">
            <input id="terms" type="checkbox" required className="w-4 h-4 text-primary bg-surface-container-low border-outline-variant rounded focus:ring-primary" />
          </div>
          <label htmlFor="terms" className="text-sm text-on-surface-variant leading-none cursor-pointer">
            Acepto los <span className="text-primary hover:underline transition-all font-medium">términos y condiciones</span>
          </label>
        </div>

        <Button type="submit" disabled={submitting} className="w-full h-12 text-lg gap-2 mt-4 bg-primary-container text-on-primary-container hover:bg-primary-container/90 disabled:opacity-60">
          {submitting ? "Creando cuenta…" : "Crear cuenta"}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-outline-variant text-center">
        <Link to="/auth/login" className="text-sm text-on-surface-variant hover:text-primary transition-colors group">
          Ya tengo cuenta. <span className="text-primary font-bold group-hover:underline">Iniciar sesión</span>
        </Link>
      </div>
    </div>;
}
