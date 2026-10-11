import { Link } from "react-router-dom";
import { Lock, Sparkles, PlusCircle } from "lucide-react";
import { formatResetDate } from "@/lib/usage";
import { cn } from "@/lib/utils";

const LABELS = {
  valuation: ["tasación", "tasaciones"],
  recommendation: ["recomendación", "recomendaciones"],
  lifeScore: ["cálculo de Life Score", "cálculos de Life Score"]
};

const linkButton = "w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-primary text-on-primary text-sm font-bold hover:bg-primary-container";

/**
 * Aviso de la cuota de una función (Tasación / Recomendador / Life Score). Va ARRIBA de la
 * página, bien visible:
 * - quedan usos: banner con el número grande ("3 / 3"), una barra y la frase "Te quedan X de N ...".
 *   Con cuota gratis dice "gratis este mes" y cuándo se renueva; con Pase de análisis o plan dice hasta
 *   cuándo vale. Si queda poco (un tercio o menos) cambia a color de alerta.
 * - no quedan: cartel de bloqueo. Con cuota gratis, la fecha de renovación y "Conocer el plan pago"
 *   (lleva a la página de planes); con pase o plan, la fecha de vencimiento y "Comprar +10 usos".
 * - admin (sin límite) o sin datos: no muestra nada.
 */
export function QuotaNotice({ feature, status, className }) {
  if (!status || status.unlimited || status.limit == null) return null;
  const [singular, plural] = LABELS[feature] ?? ["uso", "usos"];
  const limitLabel = status.limit === 1 ? singular : plural;
  const paid = status.source === "PASS" || status.source === "PLAN";
  const owner = status.source === "PLAN" ? "plan" : "pase";

  if (status.remaining > 0) {
    const low = status.remaining / status.limit <= 1 / 3;
    const percent = Math.max(0, Math.min(100, Math.round((status.remaining / status.limit) * 100)));
    return <div role="status" className={cn("rounded-xl border p-4 sm:p-5 flex flex-wrap items-center gap-x-6 gap-y-3", low ? "border-alert-price/40 bg-alert-price/5" : "border-primary/30 bg-primary/5", className)}>
        <p className="flex items-baseline gap-1.5 shrink-0" aria-hidden="true">
          <span className={cn("text-5xl sm:text-6xl font-bold leading-none", low ? "text-alert-price" : "text-primary")}>{status.remaining}</span>
          <span className="text-xl font-semibold text-on-surface-variant">/ {status.limit}</span>
        </p>
        <div className="flex-1 min-w-[220px] space-y-2">
          <p className="text-base font-bold text-on-surface">
            Te {status.remaining === 1 ? "queda" : "quedan"} {status.remaining} de {status.limit} {limitLabel}
            {paid ? ` de tu ${owner} (vence el ${formatResetDate(status.resetsAt)}).` : " gratis este mes."}
          </p>
          <div className="h-2.5 w-full rounded-full bg-surface-container overflow-hidden" aria-hidden="true">
            <div className={cn("h-full rounded-full transition-all", low ? "bg-alert-price" : "bg-primary")} style={{ width: `${percent}%` }} />
          </div>
          {!paid && <p className="text-xs text-on-surface-variant">Se renuevan el {formatResetDate(status.resetsAt)}.</p>}
        </div>
        <Link to={paid ? "/planes#packs" : "/planes"} className="text-sm font-bold text-primary hover:underline shrink-0">
          {paid ? "Sumar usos" : "Ver planes"}
        </Link>
      </div>;
  }

  return <div className={cn("rounded-xl border border-alert-price/30 bg-alert-price/5 p-4 sm:p-5 space-y-3", className)} role="alert">
      <div className="flex items-start gap-3">
        <Lock className="w-6 h-6 text-alert-price shrink-0 mt-0.5" />
        <div className="space-y-1">
          {paid
            ? <>
                <p className="text-base font-bold text-on-surface">Usaste los {status.limit} {limitLabel} de tu {owner}</p>
                <p className="text-sm text-on-surface-variant">
                  Tu {owner} vence el {formatResetDate(status.resetsAt)}. Podés sumar +10 usos con un pack adicional.
                </p>
              </>
            : <>
                <p className="text-base font-bold text-on-surface">Usaste tus {status.limit} {limitLabel} gratis de este mes</p>
                <p className="text-sm text-on-surface-variant">
                  Se renuevan el {formatResetDate(status.resetsAt)}. Con el plan pago podés seguir usándolo sin esperar.
                </p>
              </>}
        </div>
      </div>
      {paid
        ? <Link to="/planes#packs" className={linkButton}><PlusCircle className="w-4 h-4" /> Comprar +10 usos</Link>
        : <Link to="/planes" className={linkButton}><Sparkles className="w-4 h-4" /> Conocer el plan pago</Link>}
    </div>;
}
