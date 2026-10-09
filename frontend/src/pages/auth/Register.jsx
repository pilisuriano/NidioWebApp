import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Mail, Lock, ShieldCheck, ArrowRight, AlertCircle, MailCheck, Building2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

const PROFESSIONAL_TYPES = [["", "Seleccionar"], ["AGENCY", "Inmobiliaria"], ["BROKER", "Corredor / Martillero"], ["DEVELOPER", "Desarrollador inmobiliario"]];
const TAX_CONDITIONS = [["", "Seleccionar"], ["RESPONSABLE_INSCRIPTO", "Responsable Inscripto"], ["MONOTRIBUTO", "Monotributo"], ["EXENTO", "Exento"], ["CONSUMIDOR_FINAL", "Consumidor Final"]];

// Borde/anillo rojo para un campo obligatorio sin completar (o inválido).
const INVALID_CLASS = "border-error focus-visible:ring-error";

function passwordError(password) {
  if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password)) {
    return "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial";
  }
  return null;
}

export default function Register() {
  const { register } = useAuth();
  // "basic" = cuenta común, "professional" = inmobiliaria/corredor/desarrollador
  // (mismo criterio que "Crear cuenta profesional" de los portales de referencia).
  const [mode, setMode] = useState("basic");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [professionalType, setProfessionalType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [taxCondition, setTaxCondition] = useState("");
  const [cuit, setCuit] = useState("");
  const [phone, setPhone] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // Se activa recién en el primer intento de submit: antes de eso no tiene
  // sentido marcar nada en rojo (el formulario recién se está completando).
  // Una vez activado, los campos se revalidan solos a medida que se escribe.
  const [attempted, setAttempted] = useState(false);
  // Ya no se loguea directo al registrarse: el backend manda un mail de
  // verificación y hay que confirmarlo antes de poder iniciar sesión.
  const [registered, setRegistered] = useState(false);

  function validate() {
    const errors = {};
    if (!name.trim()) errors.name = true;
    if (!email.trim()) errors.email = true;
    if (!password) errors.password = true;
    else if (passwordError(password)) errors.password = true;
    if (!confirmPassword) errors.confirmPassword = true;
    else if (confirmPassword !== password) errors.confirmPassword = true;
    if (mode === "professional") {
      if (!professionalType) errors.professionalType = true;
      if (!businessName.trim()) errors.businessName = true;
      if (!taxCondition) errors.taxCondition = true;
      if (!cuit.trim()) errors.cuit = true;
    }
    if (!termsAccepted) errors.terms = true;
    return errors;
  }

  const fieldErrors = attempted ? validate() : {};
  const cls = field => cn(fieldErrors[field] && INVALID_CLASS);

  async function handleSubmit(e) {
    e.preventDefault();
    setAttempted(true);
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      if (password && confirmPassword && password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
      } else if (password && passwordError(password)) {
        setError(passwordError(password));
      } else {
        setError("Completá los campos obligatorios, marcados en rojo.");
      }
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload = mode === "professional"
        ? { name, email, password, accountType: "PROFESSIONAL", professionalType, businessName: businessName.trim(), taxCondition, cuit: cuit.trim(), phone: phone.trim() || null, mobilePhone: mobilePhone.trim() || null }
        : { name, email, password };
      await register(payload);
      setRegistered(true);
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo crear la cuenta"));
    } finally {
      setSubmitting(false);
    }
  }

  if (registered) {
    return <div className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-[440px] p-6 sm:p-8 shadow-sm animate-in fade-in zoom-in duration-300">
        <div className="bg-good-value/10 text-good-value p-4 rounded-lg flex gap-3">
          <MailCheck className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">¡Cuenta creada!</p>
            <p className="text-sm">
              Te enviamos un mail a <strong>{email}</strong> para verificar tu cuenta. Abrí el link que te llegó
              antes de iniciar sesión.
            </p>
          </div>
        </div>
        <div className="pt-6 mt-6 border-t border-outline-variant text-center">
          <Link to="/auth/login" className="text-sm text-on-surface-variant hover:text-primary transition-colors group">
            Ya verifiqué mi email. <span className="text-primary font-bold group-hover:underline">Iniciar sesión</span>
          </Link>
        </div>
      </div>;
  }

  return <div className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-[440px] p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-on-surface mb-4">Crear cuenta</h2>

        {/* Selector de tipo de cuenta, arriba de todo y siempre visible (antes
            era un link chiquito al final del formulario, poco visible). */}
        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Tipo de cuenta">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "basic"}
            onClick={() => setMode("basic")}
            className={cn(
              "flex items-center justify-center gap-2 h-11 rounded-md border text-sm font-semibold transition-colors",
              mode === "basic"
                ? "border-primary bg-primary-container text-on-primary-container"
                : "border-outline-variant text-on-surface-variant hover:border-primary/50"
            )}
          >
            <User className="w-4 h-4" /> Cuenta particular
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "professional"}
            onClick={() => setMode("professional")}
            className={cn(
              "flex items-center justify-center gap-2 h-11 rounded-md border text-sm font-semibold transition-colors",
              mode === "professional"
                ? "border-primary bg-primary-container text-on-primary-container"
                : "border-outline-variant text-on-surface-variant hover:border-primary/50"
            )}
          >
            <Building2 className="w-4 h-4" /> Cuenta profesional
          </button>
        </div>
      </div>

      {/* noValidate: la validación nativa del navegador solo frena en el
          primer campo vacío y no nos deja pintar todos los inválidos a la
          vez, así que el control queda 100% en JS (ver validate()). */}
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {error && <div className="bg-error-container text-on-error-container text-sm rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>}

        {mode === "professional" && <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="professional_type">Tipo de usuario</label>
            <select id="professional_type" value={professionalType} onChange={e => setProfessionalType(e.target.value)} className={cn("w-full h-10 rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary", cls("professionalType"))}>
              {PROFESSIONAL_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            {fieldErrors.professionalType && <p className="text-xs font-semibold text-error">Elegí un tipo de usuario</p>}
          </div>}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="full_name">
            {mode === "professional" ? "Nombre de la empresa" : "Nombre completo"}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-outline" />
            <Input id="full_name" type="text" placeholder={mode === "professional" ? "Ej. Nidio Propiedades" : "Ej. Juan Pérez"} className={cn("pl-10", cls("name"))} value={name} onChange={e => setName(e.target.value)} />
          </div>
          {fieldErrors.name && <p className="text-xs font-semibold text-error">Este campo es obligatorio</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="email">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-outline" />
            <Input id="email" type="email" placeholder="tu@email.com" className={cn("pl-10", cls("email"))} value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          {fieldErrors.email && <p className="text-xs font-semibold text-error">Este campo es obligatorio</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="password">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-outline" />
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className={cn("pl-10 pr-10", cls("password"))} value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" className="absolute right-3 top-2.5 text-outline hover:text-primary transition-colors" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className={cn("text-xs text-on-surface-variant", fieldErrors.password && "text-error font-semibold")}>Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="confirm_password">Confirmar contraseña</label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-2.5 h-5 w-5 text-outline" />
            <Input id="confirm_password" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className={cn("pl-10 pr-10", cls("confirmPassword"))} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <button type="button" className="absolute right-3 top-2.5 text-outline hover:text-primary transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {fieldErrors.confirmPassword && <p className="text-xs font-semibold text-error">{confirmPassword ? "Las contraseñas no coinciden" : "Este campo es obligatorio"}</p>}
        </div>

        {mode === "professional" && <>
            <div className="space-y-1.5 pt-2 border-t border-outline-variant">
              <p className="text-xs font-bold text-outline uppercase tracking-widest">Datos</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="business_name">Razón social</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-outline" />
                <Input id="business_name" type="text" placeholder="Ej. Nidio Propiedades S.A." className={cn("pl-10", cls("businessName"))} value={businessName} onChange={e => setBusinessName(e.target.value)} />
              </div>
              {fieldErrors.businessName && <p className="text-xs font-semibold text-error">Este campo es obligatorio</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="tax_condition">Condición fiscal</label>
              <select id="tax_condition" value={taxCondition} onChange={e => setTaxCondition(e.target.value)} className={cn("w-full h-10 rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary", cls("taxCondition"))}>
                {TAX_CONDITIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              {fieldErrors.taxCondition && <p className="text-xs font-semibold text-error">Elegí una condición fiscal</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="cuit">CUIT</label>
              <Input id="cuit" type="text" placeholder="Ej. 30-12345678-9" className={cls("cuit")} value={cuit} onChange={e => setCuit(e.target.value)} />
              {fieldErrors.cuit && <p className="text-xs font-semibold text-error">Este campo es obligatorio</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="phone">Teléfono</label>
              <Input id="phone" type="tel" placeholder="Ej. 11 4444-5555" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="mobile_phone">Teléfono móvil</label>
              <Input id="mobile_phone" type="tel" placeholder="Ej. 11 5555-6666" value={mobilePhone} onChange={e => setMobilePhone(e.target.value)} />
            </div>
          </>}

        <div className="space-y-1">
          <div className="flex items-start gap-3 py-2">
            <div className="flex items-center h-5">
              <input id="terms" type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className={cn("w-4 h-4 text-primary bg-surface-container-low border-outline-variant rounded focus:ring-primary", fieldErrors.terms && "accent-error ring-1 ring-error")} />
            </div>
            <label htmlFor="terms" className={cn("text-sm text-on-surface-variant leading-none cursor-pointer", fieldErrors.terms && "text-error font-semibold")}>
              Acepto los <span className="text-primary hover:underline transition-all font-medium">términos y condiciones</span>
            </label>
          </div>
          {fieldErrors.terms && <p className="text-xs font-semibold text-error">Tenés que aceptar los términos y condiciones</p>}
        </div>

        <Button type="submit" disabled={submitting} className="w-full h-12 text-lg gap-2 mt-4 bg-primary-container text-on-primary-container hover:bg-primary-container/90 disabled:opacity-60">
          {submitting ? "Creando cuenta…" : mode === "professional" ? "Registrarme" : "Crear cuenta"}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-outline-variant text-center">
        <Link to="/auth/login" className="block text-sm text-on-surface-variant hover:text-primary transition-colors group">
          Ya tengo cuenta. <span className="text-primary font-bold group-hover:underline">Iniciar sesión</span>
        </Link>
      </div>
    </div>;
}
