import { Moon, ShieldCheck, Sun } from "lucide-react";
import { describeNoise, describeSecurity, levelStyle } from "@/lib/environment";
import { cn } from "@/lib/utils";

function Chip({ icon: Icon, text, level, title, size }) {
  const style = levelStyle(level);
  return <span
      title={title}
      aria-label={title}
      className={cn("inline-flex items-center gap-1 rounded-full border font-sans font-semibold whitespace-nowrap", size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs")}
      style={{ backgroundColor: style.bg, color: style.fg, borderColor: style.border }}>
      <Icon className={size === "lg" ? "w-4 h-4" : "w-3 h-3"} aria-hidden="true" />
      {text}
    </span>;
}

/**
 * Etiquetas de entorno de una propiedad: sol = ruido diurno, luna = ruido nocturno,
 * escudo = seguridad del barrio. El color (verde → rojo) y la palabra dicen qué tan
 * ruidoso o seguro es comparado con el resto de CABA.
 *
 * `size="sm"` (tarjetas): solo muestra los datos que existen. `size="lg"` (ficha):
 * muestra también "sin dato" para que no parezca que falta la etiqueta.
 */
export function EnvironmentChips({ environment, size = "sm", className }) {
  if (!environment) {
    return null;
  }
  const { noiseDay, noiseNight, security } = environment;
  const full = size === "lg";
  // Siempre con el nombre completo ("Ruido diurno: Tranquilo"): el ícono solo no alcanza
  // para entender qué mide cada etiqueta.
  const text = (name, item) => `${name}: ${item ? item.label : "sin dato"}`;
  const chips = [];
  if (noiseDay || full) {
    chips.push(<Chip key="day" icon={Sun} level={noiseDay?.level} size={size} title={describeNoise("day", noiseDay)} text={text("Ruido diurno", noiseDay)} />);
  }
  if (noiseNight || full) {
    chips.push(<Chip key="night" icon={Moon} level={noiseNight?.level} size={size} title={describeNoise("night", noiseNight)} text={text("Ruido nocturno", noiseNight)} />);
  }
  if (security || full) {
    chips.push(<Chip key="security" icon={ShieldCheck} level={security?.level} size={size} title={describeSecurity(security)} text={text("Seguridad", security)} />);
  }
  if (chips.length === 0) {
    return null;
  }
  // En tarjetas un títulito aclara a qué se refieren los colores; en la ficha el bloque ya tiene el suyo.
  return <div className={cn("space-y-1", className)}>
      {!full && <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Entorno · comparado con CABA</p>}
      <div className="flex flex-wrap items-center gap-1.5">{chips}</div>
    </div>;
}
