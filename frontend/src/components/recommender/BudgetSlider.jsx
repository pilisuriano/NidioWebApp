import { budgetAtPosition, countWithinBudget, formatBudgetRange } from "@/lib/recommender";

/**
 * Barra de presupuesto: la persona arrastra hasta el tope máximo que aceptaría. Se arma con los precios reales
 * del catálogo de la operación; el extremo derecho es "sin tope". Muestra cuántas propiedades entran.
 */
export function BudgetSlider({ prices, operationType, value, onChange }) {
  const position = value?.position ?? 100;
  const max = budgetAtPosition(prices, position, operationType);
  const label = max == null ? "Sin tope de presupuesto" : formatBudgetRange({ min: null, max }, operationType);
  const inside = countWithinBudget(prices, max);
  return <div className="space-y-4">
      <div className="text-center space-y-1">
        <p className="text-2xl font-bold text-primary" aria-live="polite">{label}</p>
        <p className="text-sm text-on-surface-variant">
          {inside === 0 ? "Con ese tope no hay propiedades publicadas." : `${inside} de ${prices.length} propiedades publicadas entran en ese tope.`}
        </p>
      </div>
      <input
        type="range" min={0} max={100} step={1} value={position}
        aria-label="Presupuesto máximo" aria-valuetext={label}
        onChange={e => {
          const next = Number(e.target.value);
          onChange({ min: null, max: budgetAtPosition(prices, next, operationType), position: next });
        }}
        className="w-full h-2 accent-primary cursor-pointer" />
      <div className="flex justify-between text-xs text-on-surface-variant font-mono">
        <span>{formatBudgetRange({ min: null, max: budgetAtPosition(prices, 0, operationType) }, operationType)}</span>
        <span>Sin tope</span>
      </div>
      <p className="text-xs text-on-surface-variant">Arrastrá hasta lo máximo que pagarías. Las propiedades más baratas siempre te las puedo mostrar.</p>
    </div>;
}
