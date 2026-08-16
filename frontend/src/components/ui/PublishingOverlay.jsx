import { NidioLoadingMark } from "@/components/ui/NidioLoadingMark";

// Mensajes que van rotando mientras se espera la tasación automática (ver
// PropertyService.createProperty, ronda 13 del roadmap). El aviso de
// "puede tardar" aparece solo si de verdad está tardando (ml-service
// dormido en Render tras 15 min sin tráfico, no en el caso normal).
const EARLY_MESSAGE = "Nidio está calculando el rango de precio de tu propiedad…";
const LATE_MESSAGE = "Puede tardar un poco más de lo normal (el motor de tasación estaba inactivo) — no cierres esta pantalla.";
const SUCCESS_MESSAGE = "¡Listo! Tasación calculada.";
const LATE_THRESHOLD_MS = 8000;

/**
 * Pantalla de espera de "Publicar": se muestra mientras el backend llama a
 * ml-service /predict antes de crear la propiedad (ver Ronda 13 del roadmap
 * -- la publicación queda bloqueada hasta que el modelo responde, a pedido
 * de Pili, para que ninguna propiedad quede sin tasar). En vez de un
 * spinner genérico, el logo de Nidio se va "llenando" de color (ver
 * NidioLoadingMark) -- sin números, ídem al criterio ya usado en Life Score
 * de no mostrarle cuentas al usuario final.
 *
 * `phase`: "loading" mientras se espera la respuesta del modelo, "success"
 * apenas el backend confirma que ya tasó y creó la propiedad (dispara un
 * relleno rápido a 100% + un instante de pausa antes de que el padre pase a
 * la pantalla de "publicado"), o null/undefined para no mostrar nada.
 */
export function PublishingOverlay({ phase }) {
  if (phase !== "loading" && phase !== "success") return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/95 backdrop-blur-sm animate-in fade-in duration-300">
      <NidioLoadingMark
        phase={phase}
        size={224}
        message={EARLY_MESSAGE}
        lateMessage={LATE_MESSAGE}
        lateThresholdMs={LATE_THRESHOLD_MS}
        successMessage={SUCCESS_MESSAGE}
      />
    </div>
  );
}
