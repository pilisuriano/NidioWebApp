import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Chips que van encima de las fotos de las tarjetas. Fondo sólido (no
// translúcido): con el 10% de opacidad del Badge "good" el texto se perdía
// según la foto de atrás. Un solo lugar para que se vean igual en el inicio,
// el mapa y la ficha.

export function OperationBadge({ operationType, short = false, className }) {
  const label = operationType === "SALE" ? "VENTA" : short ? "ALQ." : "ALQUILER";
  return <span className={cn("inline-flex items-center rounded-md bg-inverse-surface px-2.5 py-1 text-[11px] font-bold tracking-wide text-inverse-on-surface shadow-md ring-1 ring-white/20", className)}>
      {label}
    </span>;
}

export function FeaturedBadge({ className, compact = false }) {
  return <span title="Publicación destacada" className={cn("inline-flex items-center gap-1 rounded-md bg-amber-400 px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber-950 shadow-md ring-1 ring-amber-600/30", compact && "px-1.5 py-0.5 text-[10px]", className)}>
      <Star className={cn("fill-current", compact ? "h-3 w-3" : "h-3.5 w-3.5")} aria-hidden="true" />
      DESTACADA
    </span>;
}
