import { useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, ShieldCheck, X, AlertCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/billing/Price";
import { createCheckout, simulatePayment } from "@/lib/billing";
import { apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";

/**
 * Compra con pasarela SIMULADA (pedida por la cátedra). No pide ni guarda datos de
 * tarjeta: 1) resumen de lo que se compra, 2) "pasar a la pasarela" crea el pago
 * pendiente, 3) el usuario lo resuelve con "simular pago aprobado / rechazado".
 * Solo si se aprueba se activa lo comprado (lo hace el backend).
 *
 * Props: item (ítem del catálogo), propertyId / propertyTitle (solo destacado suelto),
 * featuredStartsAt / featuredEndsAt (solo si es una reserva: el destacado arranca más adelante),
 * onClose(), onApproved(pago) para que la pantalla refresque sus datos.
 */
export function CheckoutDialog({ item, propertyId = null, propertyTitle = null, featuredStartsAt = null, featuredEndsAt = null, onClose, onApproved }) {
  // summary -> gateway (pago pendiente) -> approved | rejected
  const [step, setStep] = useState("summary");
  const [payment, setPayment] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function goToGateway() {
    setBusy(true);
    setError(null);
    try {
      setPayment(await createCheckout(item.code, propertyId, featuredStartsAt));
      setStep("gateway");
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo iniciar la compra"));
    } finally {
      setBusy(false);
    }
  }

  async function resolve(approved) {
    setBusy(true);
    setError(null);
    try {
      const result = await simulatePayment(payment.id, approved);
      setPayment(result);
      setStep(approved ? "approved" : "rejected");
      if (approved) onApproved?.(result);
    } catch (err) {
      // Por ejemplo, entre el checkout y la aprobación se ocupó el último cupo de destacados.
      setError(apiErrorMessage(err, "No se pudo resolver el pago"));
    } finally {
      setBusy(false);
    }
  }

  const finished = step === "approved" || step === "rejected";

  return createPortal(
    <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4" onClick={busy ? undefined : onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="checkout-title" className="bg-surface-container-lowest rounded-xl shadow-xl max-w-md w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 id="checkout-title" className="text-lg font-bold text-on-surface flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            {step === "summary" && "Resumen de tu compra"}
            {step === "gateway" && "Pasarela de pagos (simulada)"}
            {step === "approved" && "Pago aprobado"}
            {step === "rejected" && "Pago rechazado"}
          </h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Cerrar" className="p-1 rounded-md text-on-surface-variant hover:bg-surface-dim disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface">{item.name}</p>
              {propertyTitle && <p className="text-xs text-on-surface-variant mt-0.5">{propertyTitle}</p>}
            </div>
            <Price usd={Number(item.priceUsd)} align="right" />
          </div>
          <p className="text-xs text-on-surface-variant">{item.description}</p>
          {featuredStartsAt && <p className="text-xs font-semibold text-primary">
              Reserva: se destaca desde el {formatDate(featuredStartsAt)}{featuredEndsAt ? ` hasta el ${formatDate(featuredEndsAt)}` : ""}.
            </p>}
        </div>

        {step === "summary" && <>
            <p className="text-xs text-on-surface-variant flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>Esta es una pasarela simulada: no se pide ni se guarda ningún dato de tarjeta y no se cobra dinero real. Los planes no se renuevan solos.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="button" className="sm:flex-1" onClick={goToGateway} disabled={busy}>
                {busy ? "Un momento…" : "Pasar a la pasarela"}
              </Button>
              <Button type="button" variant="outline" className="sm:flex-1" onClick={onClose} disabled={busy}>Cancelar</Button>
            </div>
          </>}

        {step === "gateway" && <>
            <p className="text-sm text-on-surface-variant">
              En una pasarela real acá se cargarían los datos de pago. Como es una simulación, elegí cómo querés que termine:
            </p>
            {/* Siempre apilados: con el texto en una línea los dos botones no entran lado a lado
                en el ancho del diálogo (max-w-md) y el segundo se salía del recuadro. */}
            <div className="flex flex-col gap-2">
              <Button type="button" className="w-full gap-2" onClick={() => resolve(true)} disabled={busy}>
                <CheckCircle2 className="w-4 h-4" /> Simular pago aprobado
              </Button>
              <Button type="button" variant="outline" className="w-full gap-2" onClick={() => resolve(false)} disabled={busy}>
                <XCircle className="w-4 h-4" /> Simular pago rechazado
              </Button>
            </div>
          </>}

        {step === "approved" && <>
            <div className="rounded-lg border border-good-value/30 bg-good-value/10 p-4 flex items-start gap-3" role="status">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-good-value" />
              <div className="space-y-1">
                <p className="font-bold text-good-value">Pago aprobado</p>
                <p className="text-sm text-on-surface">Listo: ya está activo. Lo vas a ver en “Mi suscripción” de tu perfil.</p>
              </div>
            </div>
            <Button type="button" className="w-full" onClick={onClose}>Cerrar</Button>
          </>}

        {step === "rejected" && <>
            <div className="rounded-lg border border-alert-price/40 bg-alert-price/10 p-4 flex items-start gap-3" role="alert">
              <XCircle className="w-6 h-6 shrink-0 text-alert-price" />
              <div className="space-y-1">
                <p className="font-bold text-alert-price">Pago rechazado</p>
                <p className="text-sm text-on-surface">El pago simulado fue rechazado y no se activó nada. Podés intentarlo de nuevo cuando quieras.</p>
              </div>
            </div>
            <Button type="button" className="w-full" onClick={onClose}>Cerrar</Button>
          </>}

        {error && <div className="bg-error-container text-on-error-container text-sm rounded-lg p-3 flex items-start gap-2" role="alert">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>}
        {error && !finished && step === "gateway" && <Button type="button" variant="outline" className="w-full" onClick={onClose}>Cerrar</Button>}
      </div>
    </div>,
    document.body
  );
}
