import { countWithinBudget, expensesAtPosition, formatExpenses } from "@/lib/recommender";

/**
 * Barra de expensas (solo departamentos): igual que la de presupuesto, con las expensas reales de los departamentos
 * publicados, en pesos por mes. El extremo derecho es "sin tope". Las propiedades sin expensas cargadas no se descartan.
 */
export function ExpensesSlider({ valuesArs, operationType, value, onChange }) {
  const position = value?.position ?? 100;
  const max = expensesAtPosition(valuesArs, position);
  const inside = countWithinBudget(valuesArs, max);
  const label = max == null ? "Sin tope de expensas" : `Hasta ${formatExpenses(max)}`;
  return <div className="space-y-3 rounded-lg border border-outline-variant bg-surface-container-low p-4" data-testid="expenses-slider">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-on-surface">¿Cuánto te gustaría pagar de expensas como máximo?</p>
        <p className="text-xl font-bold text-primary" aria-live="polite">{label}</p>
        <p className="text-xs text-on-surface-variant">
          {max == null ? "Te muestro departamentos con cualquier monto de expensas."
            : inside === 0 ? "Con ese tope no hay departamentos con expensas cargadas."
              : `${inside} de ${valuesArs.length} departamentos con expensas cargadas entran en ese tope.`}
        </p>
      </div>
      <input
        type="range" min={0} max={100} step={1} value={position}
        aria-label="Expensas máximas" aria-valuetext={label}
        onChange={e => {
          const next = Number(e.target.value);
          onChange({ maxArs: expensesAtPosition(valuesArs, next), position: next });
        }}
        className="w-full h-2 accent-primary cursor-pointer" />
      <div className="flex justify-between text-xs text-on-surface-variant font-mono">
        <span>{formatExpenses(expensesAtPosition(valuesArs, 0))}</span>
        <span>Sin tope</span>
      </div>
      <p className="text-[11px] text-on-surface-variant">Es un filtro aparte del presupuesto{operationType === "RENT" ? " (no se suma al alquiler)" : ""}. Si un departamento no tiene las expensas cargadas, no lo descarto.</p>
    </div>;
}
