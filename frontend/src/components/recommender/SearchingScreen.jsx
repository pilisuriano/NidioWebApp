import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Nidi } from "./Nidi";

/** Ritmo visual de la pantalla de búsqueda: un paso nuevo cada STEP_MS. */
export const STEP_MS = 600;

/**
 * Mientras se espera la respuesta, Nidi "busca" y se van tildando los pasos que el motor realmente
 * evalúa para este pedido (ver searchingSteps en lib/recommender.js). El momento de cada tilde es
 * solo ritmo visual, no el avance real del cálculo.
 */
export function SearchingScreen({ steps }) {
  const [done, setDone] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setDone(d => Math.min(d + 1, steps.length)), STEP_MS);
    return () => clearInterval(timer);
  }, [steps.length]);

  return <div className="flex flex-col md:flex-row items-center gap-8 py-6" role="status" aria-live="polite">
      <Nidi mode="searching" width={190} />
      <div className="flex-1 w-full space-y-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Estoy buscando tu lugar…</h2>
          <p className="text-sm text-on-surface-variant">Esto es lo que estoy mirando con tus respuestas.</p>
        </div>
        <ul className="space-y-2">
          {steps.map((label, i) => {
            const finished = i < done;
            const current = i === done;
            return <li key={label} className={cn("flex items-center gap-3 text-sm transition-opacity duration-300", finished || current ? "opacity-100" : "opacity-40")}>
                <span className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", finished ? "bg-primary text-on-primary" : "border border-outline-variant")}>
                  {finished ? <Check className="w-3 h-3" /> : current ? <Loader2 className="w-3 h-3 animate-spin text-primary" /> : null}
                </span>
                <span className={cn(finished ? "text-on-surface" : "text-on-surface-variant")}>{label}</span>
              </li>;
          })}
        </ul>
        <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${Math.round(done / steps.length * 100)}%` }} />
        </div>
      </div>
    </div>;
}
