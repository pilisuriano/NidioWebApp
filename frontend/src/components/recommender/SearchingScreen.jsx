import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Nidi } from "./Nidi";

/** Pasados estos milisegundos sin respuesta se avisa que está tardando (por ejemplo, un servidor que estaba dormido). */
export const SLOW_AFTER_MS = 8000;

/**
 * Mientras se espera la respuesta, Nidi "busca" y se lista, sin tildes ni barra de avance, lo que el motor
 * mira para este pedido (ver searchingSteps en lib/recommender.js). No hay progreso falso: la búsqueda en sí
 * dura una fracción de segundo y lo que se espera es la respuesta del servidor. Cómo se llegó al resultado
 * (cuántas propiedades quedaron en cada filtro) se muestra con datos reales en la pantalla de resultados.
 */
export function SearchingScreen({ steps }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return <div className="flex flex-col md:flex-row items-center gap-8 py-6" role="status" aria-live="polite">
      <Nidi mode="searching" width={190} />
      <div className="flex-1 w-full space-y-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Estoy buscando tu lugar…</h2>
          <p className="text-sm text-on-surface-variant">Esto es lo que voy a mirar con tus respuestas:</p>
        </div>
        <ul className="space-y-2 list-disc pl-5 marker:text-primary">
          {steps.map(label => <li key={label} className="text-sm text-on-surface">{label}</li>)}
        </ul>
        <p className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Esperando la respuesta del servidor…
        </p>
        {slow && <p className="text-xs text-on-surface-variant rounded-md border border-outline-variant bg-surface-container-low p-3">
            Está tardando más de lo normal, pero sigo trabajando en tu búsqueda. No cierres esta pantalla.
          </p>}
      </div>
    </div>;
}
