import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// Etiqueta de la tasación de Nidio (EN RANGO / SOBREVALUADA / SUBVALUADA).
// Mismos estilos que el ResultBadge de Valuacion.jsx, para que la
// clasificación se vea igual en toda la app. Sin resultado no renderiza nada.
export function ValuationBadge({ result, className }) {
  if (result === "FAIR") {
    return <Badge variant="good" className={cn("bg-good-value/5 gap-1 border border-good-value/20", className)}>
        <CheckCircle2 className="w-3 h-3" /> EN RANGO
      </Badge>;
  }
  if (result === "OVERVALUED") {
    return <Badge variant="alert" className={cn("gap-1", className)}>
        <AlertTriangle className="w-3 h-3" /> SOBREVALUADA
      </Badge>;
  }
  if (result === "UNDERVALUED") {
    return <Badge variant="secondary" className={cn("bg-secondary/10 text-secondary gap-1 border border-secondary/20", className)}>
        <Info className="w-3 h-3" /> SUBVALUADA
      </Badge>;
  }
  return null;
}
