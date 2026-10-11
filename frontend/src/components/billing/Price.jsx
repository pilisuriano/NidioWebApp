import { cn } from "@/lib/utils";
import { useCardRate, formatUsd, arsApprox } from "@/lib/cardRate";

/**
 * Precio en dólares con su referencia aproximada en pesos (dólar tarjeta de hoy).
 * El cobro es siempre en USD; los pesos son solo orientativos y no aparecen si la
 * cotización no se pudo obtener.
 */
export function Price({ usd, suffix, align = "left", className, size = "md" }) {
  const { cardRate } = useCardRate();
  const ars = arsApprox(usd, cardRate);
  return <div className={cn(align === "right" ? "text-right" : "text-left", className)}>
      <p className={cn("font-bold text-on-surface leading-tight", size === "lg" ? "text-3xl" : "text-lg")}>
        {formatUsd(usd)}
        {suffix && <span className="text-xs font-mono font-normal text-on-surface-variant ml-1">{suffix}</span>}
      </p>
      {ars && <p className="text-xs font-mono text-on-surface-variant" title="Valor aproximado al dólar tarjeta de hoy. El cobro es en dólares.">
          ≈ {ars} ARS
        </p>}
    </div>;
}
