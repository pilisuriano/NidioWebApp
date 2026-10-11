import { TrendingDown, TrendingUp } from "lucide-react";
import { factorAmount, markMissing, normalizeFactors } from "@/lib/explanation";

/**
 * Los factores que más pesaron en la tasación (SHAP), en dos columnas (suben / bajan el precio), cada uno
 * con cuánto mueve el resultado. El modelo da USD/m² en venta y USD/mes en alquiler; en alquiler, si hay
 * cotización (rate = dólar blue del cálculo) se muestra en pesos, igual que el resto del resultado.
 */
function Chip({ row, tone, operationType, rate, missing }) {
  const classes = tone === "up" ? "bg-tertiary/10 text-tertiary" : "bg-alert-price/10 text-alert-price";
  // El monto va siempre al lado del nombre (no debajo): si el nombre es largo, es el nombre el que se parte en líneas.
  return <li className={`flex max-w-full items-baseline gap-2 rounded-2xl px-3 py-1.5 text-xs ${classes}`}>
      <span className="min-w-0 font-semibold">{markMissing(row.factor, missing)}</span>
      <span className="shrink-0 whitespace-nowrap font-mono font-bold">{factorAmount(row.contribution, operationType, rate)}</span>
    </li>;
}

export function FactorBars({ factors, operationType = "SALE", rate = null, missing }) {
  const rows = normalizeFactors(factors);
  if (rows.length === 0) return null;
  const up = rows.filter(r => r.contribution > 0);
  const down = rows.filter(r => r.contribution < 0);
  const rentInArs = operationType === "RENT" && Boolean(rate);

  return <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {up.length > 0 && <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-bold text-tertiary"><TrendingUp className="h-4 w-4" /> Suben el precio</p>
            <ul className="flex flex-wrap gap-1.5">
              {up.map(row => <Chip key={row.factor} row={row} tone="up" operationType={operationType} rate={rate} missing={missing} />)}
            </ul>
          </div>}
        {down.length > 0 && <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-bold text-alert-price"><TrendingDown className="h-4 w-4" /> Bajan el precio</p>
            <ul className="flex flex-wrap gap-1.5">
              {down.map(row => <Chip key={row.factor} row={row} tone="down" operationType={operationType} rate={rate} missing={missing} />)}
            </ul>
          </div>}
      </div>
      <p className="text-[11px] leading-relaxed text-on-surface-variant">
        Se muestran los 5 datos que más pesaron y cuánto mueve cada uno el precio respecto del valor promedio del modelo
        ({operationType === "RENT" ? (rentInArs ? "pesos por mes, al dólar blue del cálculo" : "USD por mes") : "USD por m²"}). No suman el total de la estimación.
      </p>
    </div>;
}
