import { TrendingDown, TrendingUp } from "lucide-react";
import { buildBreakdown, splitBreakdown } from "@/lib/lifeScoreBreakdown";

const pts = value => value.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const km = meters => (meters / 1000).toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/**
 * "¿Por qué este puntaje?" al estilo del SHAP de la tasación: una barra con el puntaje armado por colores
 * (cada tramo es lo que aporta una categoría) y dos columnas de chips, lo que suma y lo que lo baja, con los
 * puntos de cada uno. Las filas suman exactamente el puntaje final (es un promedio ponderado).
 *
 * categoryMeta: [{ key, label, color }]; placeColor: color de "Mis lugares".
 */
function Chip({ row, tone, label, color }) {
  const classes = tone === "up" ? "bg-tertiary/10 text-tertiary" : "bg-alert-price/10 text-alert-price";
  const amount = tone === "up" ? `+${pts(row.points)} pts` : `−${pts(row.lost)} pts`;
  const isPlace = row.kind === "place";
  return <li className={`flex max-w-full items-baseline gap-2 rounded-2xl px-3 py-1.5 text-xs ${classes}`}>
      <span className="min-w-0 font-semibold">
        <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-baseline" style={{ background: color }} />
        {label}
        {isPlace && <span className="font-normal opacity-80"> · a {km(row.distanceM)} km{row.outOfRadius ? ", fuera de tu radio" : ""}</span>}
      </span>
      <span className="shrink-0 whitespace-nowrap font-mono font-bold">{amount}</span>
    </li>;
}

export function ScoreBreakdown({ result, placeWeights, radiusKm, categoryMeta, placeColor, fallback }) {
  const { rows, total } = buildBreakdown({
    categories: result?.categories, customPlaces: result?.customPlaces, placeWeights, radiusKm
  });
  if (rows.length === 0) return fallback ? <p className="text-sm text-on-surface-variant">{fallback}</p> : null;

  const { favor, against } = splitBreakdown(rows);
  const metaOf = key => categoryMeta.find(m => m.key === key);
  const colorOf = row => (row.kind === "place" ? placeColor : metaOf(row.key)?.color ?? "#00647c");
  const labelOf = row => (row.kind === "place" ? row.label : metaOf(row.key)?.label ?? row.key);
  // Tramos del 100%: de mayor a menor aporte; lo que falta hasta 100 queda en gris.
  const segments = rows.filter(r => r.points > 0);

  return <div className="space-y-4" data-testid="score-breakdown">
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-semibold text-on-surface-variant">Así se arma tu puntaje</span>
          <span className="font-mono font-bold text-on-surface">{pts(total)} / 100</span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-surface-container" role="img" aria-label={`Puntaje ${pts(total)} de 100`}>
          {segments.map(row => <div key={row.key} title={`${labelOf(row)}: +${pts(row.points)} pts`}
            className="h-full border-r border-surface-container-lowest last:border-r-0"
            style={{ width: `${row.points}%`, background: colorOf(row) }} />)}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {favor.length > 0 && <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-bold text-tertiary"><TrendingUp className="h-4 w-4" /> Lo que más suma</p>
            <ul className="flex flex-wrap gap-1.5">
              {favor.map(row => <Chip key={row.key} row={row} tone="up" label={labelOf(row)} color={colorOf(row)} />)}
            </ul>
          </div>}
        {against.length > 0 && <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-bold text-alert-price"><TrendingDown className="h-4 w-4" /> Lo que lo baja</p>
            <ul className="flex flex-wrap gap-1.5">
              {against.map(row => <Chip key={row.key} row={row} tone="down" label={labelOf(row)} color={colorOf(row)} />)}
            </ul>
          </div>}
      </div>
      <p className="text-[11px] leading-relaxed text-on-surface-variant">
        Puntos que aporta cada uno sobre 100, según el peso que le diste. En rojo, los puntos que deja sin sumar porque hay poco cerca.
      </p>
    </div>;
}
