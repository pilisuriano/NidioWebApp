import { positionInBar } from "@/lib/rangeBar";

/**
 * Barra del rango estimado de una tasación. La zona de color es el rango (de "min" a "max"); las zonas
 * claras de los costados son "por debajo" / "por encima", para poder ubicar un precio que cae afuera.
 * Escala: 25 % por debajo, 50 % el rango, 25 % por encima.
 *
 * Marcas: el valor sugerido (la predicción central del modelo, que NO está en el medio del rango) y,
 * si el usuario cargó uno, su precio.
 */
export function RangeBar({ min, max, suggested, declared = null, declaredLabel, format }) {
  const suggestedPct = suggested != null ? positionInBar(suggested, min, max) : null;
  const declaredPct = declared != null ? positionInBar(declared, min, max) : null;

  return <div className="px-2" data-testid="range-bar">
      {/* Etiqueta del precio cargado por el usuario: arriba de la barra */}
      <div className="relative h-9">
        {declaredPct != null && <div className="absolute bottom-1 -translate-x-1/2 rounded bg-inverse-surface px-2 py-1 text-[10px] font-bold text-white whitespace-nowrap" style={{ left: `${declaredPct}%` }}>
            {declaredLabel}
            <div className="absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-inverse-surface" />
          </div>}
      </div>

      <div className="relative h-4 rounded-full bg-tertiary/15">
        <div className="absolute inset-y-0 rounded-full bg-tertiary" style={{ left: "25%", width: "50%" }} />
        {suggestedPct != null && <div className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-sm border-2 border-tertiary bg-white shadow" style={{ left: `${suggestedPct}%` }} title="Valor sugerido" />}
        {declaredPct != null && <div className="absolute -top-1 h-6 w-1 -translate-x-1/2 rounded bg-inverse-surface shadow-[0_0_0_2px_#fff]" style={{ left: `${declaredPct}%` }} />}
      </div>

      {/* Extremos del rango: justo bajo el borde de la zona de color */}
      <div className="relative mt-2 h-8 text-xs font-mono">
        <span className="absolute left-0 hidden text-[10px] text-on-surface-variant sm:block">por debajo</span>
        <span className="absolute right-0 hidden text-[10px] text-on-surface-variant sm:block">por encima</span>
        <span className="absolute -translate-x-1/2 text-center" style={{ left: "25%" }}>
          <span className="block font-bold text-on-surface">{format(min)}</span>
          <span className="block text-[10px] text-on-surface-variant">mínimo</span>
        </span>
        <span className="absolute -translate-x-1/2 text-center" style={{ left: "75%" }}>
          <span className="block font-bold text-on-surface">{format(max)}</span>
          <span className="block text-[10px] text-on-surface-variant">máximo</span>
        </span>
      </div>

      {suggestedPct != null && <p className="mt-6 flex items-center justify-center gap-2.5 text-base text-on-surface-variant">
          <span className="inline-block h-3.5 w-3.5 rotate-45 rounded-sm border-2 border-tertiary bg-white" aria-hidden="true" />
          Valor sugerido: <strong className="text-xl font-bold text-on-surface">{format(suggested)}</strong>
        </p>}
    </div>;
}
