import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

// Modal de confirmación genérico, centrado en pantalla con overlay. Se usa
// para acciones que conviene confirmar antes de ejecutar (ej. cerrar sesión).
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  variant = "default", // "default" | "danger"
  onConfirm,
  onCancel
}) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant w-full max-w-sm p-6 space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex items-start gap-3">
          {variant === "danger" && <span className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </span>}
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-on-surface">{title}</h2>
            {description && <p className="text-sm text-on-surface-variant">{description}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
          <Button
            onClick={onConfirm}
            className={variant === "danger" ? "bg-error text-on-error hover:bg-error/90" : "bg-primary-container text-on-primary-container hover:bg-primary-container/90"}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>;
}
