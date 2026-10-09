import { useState } from "react";
import { createPortal } from "react-dom";
import { Lock, Sparkles, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatResetDate } from "@/lib/usage";

const LABELS = {
  valuation: ["tasación", "tasaciones"],
  recommendation: ["recomendación", "recomendaciones"]
};

/**
 * Aviso de la cuota gratuita mensual (Tasación / Recomendador):
 * - quedan usos: una línea chica "Te quedan X de N ... gratis este mes".
 * - no quedan: cartel de bloqueo con la fecha de renovación y la invitación
 *   al plan pago.
 * - admin (sin límite) o sin datos: no muestra nada.
 */
export function QuotaNotice({ feature, status }) {
  const [planOpen, setPlanOpen] = useState(false);
  if (!status || status.unlimited || status.limit == null) return null;
  const [singular, plural] = LABELS[feature] ?? ["uso", "usos"];
  const limitLabel = status.limit === 1 ? singular : plural;

  if (status.remaining > 0) {
    return <p className="text-xs font-mono text-on-surface-variant" role="status">
        Te {status.remaining === 1 ? "queda" : "quedan"} <strong className="text-on-surface">{status.remaining} de {status.limit}</strong> {limitLabel} gratis este mes.
      </p>;
  }

  return <>
      <div className="rounded-lg border border-alert-price/30 bg-alert-price/5 p-4 space-y-3" role="alert">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-alert-price shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-on-surface">Usaste tus {status.limit} {limitLabel} gratis de este mes</p>
            <p className="text-xs text-on-surface-variant">
              Se renuevan el {formatResetDate(status.resetsAt)}. Con el plan pago podés seguir usándolo sin esperar.
            </p>
          </div>
        </div>
        <Button type="button" className="w-full gap-2" onClick={() => setPlanOpen(true)}>
          <Sparkles className="w-4 h-4" /> Conocer el plan pago
        </Button>
      </div>
      {planOpen && <PlanDialog onClose={() => setPlanOpen(false)} />}
    </>;
}

// Invitación al plan pago. Todavía no se puede contratar desde la plataforma
// (no hay medio de pago integrado en el MVP), así que se ofrece el contacto.
function PlanDialog({ onClose }) {
  return createPortal(
    <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="plan-dialog-title" className="bg-surface-container-lowest rounded-xl shadow-xl max-w-md w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 id="plan-dialog-title" className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Plan pago de Nidio
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="p-1 rounded-md text-on-surface-variant hover:bg-surface-dim">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-on-surface-variant">
          Con el plan pago podés seguir usando la Tasación y el Recomendador sin esperar a que se renueven tus usos gratis del mes.
        </p>
        <p className="text-sm text-on-surface-variant">
          Por ahora no se puede contratar desde la plataforma: escribinos y te contamos cómo sumarte.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <a href="mailto:nidio.propiedades@gmail.com?subject=Plan%20pago%20de%20Nidio" className="sm:flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-on-primary text-sm font-bold hover:opacity-90">
            <Mail className="w-4 h-4" /> Escribinos
          </a>
          <Button type="button" variant="outline" className="sm:flex-1" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
