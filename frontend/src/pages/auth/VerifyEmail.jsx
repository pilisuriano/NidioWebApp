import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";

// Página a la que apunta el link del mail de verificación
// (app.mail.verification-url-base en el backend): /auth/verificar?token=...
export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Falta el token de verificación en el link.");
      return;
    }
    api.post("/api/auth/verify-email", {
      token
    }).then(res => {
      setStatus("success");
      setMessage(res.data.message);
    }).catch(err => {
      setStatus("error");
      setMessage(apiErrorMessage(err, "No se pudo verificar el email"));
    });
  }, [token]);

  return <div className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-[440px] p-8 shadow-sm text-center space-y-6">
      {status === "loading" && <div className="space-y-3 py-6">
          <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
          <p className="text-sm text-on-surface-variant">Verificando tu email…</p>
        </div>}

      {status === "success" && <div className="space-y-3 py-6">
          <CheckCircle2 className="w-10 h-10 mx-auto text-good-value" />
          <p className="text-sm font-semibold text-on-surface">{message}</p>
        </div>}

      {status === "error" && <div className="space-y-3 py-6">
          <XCircle className="w-10 h-10 mx-auto text-error" />
          <p className="text-sm font-semibold text-on-surface">{message}</p>
          <p className="text-xs text-on-surface-variant">Si el link venció, pedí uno nuevo desde la pantalla de login.</p>
        </div>}

      <div className="pt-6 border-t border-outline-variant">
        <Link to="/auth/login" className="text-sm text-primary font-bold hover:underline">
          Ir a iniciar sesión
        </Link>
      </div>
    </div>;
}
