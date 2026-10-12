import { useEffect, useState } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import { ChevronDown, ChevronUp, Moon, ShieldCheck, Sun } from "lucide-react";
import { api } from "@/lib/api";
import { MAP_LEVEL_COLORS, SECURITY_LABELS, noiseLegend, securityLevelFromIndex } from "@/lib/environment";
import { NoiseStreetsLayer, useNoiseCuts } from "@/components/map/NoiseStreetsLayer";
import { OverlayLabels } from "@/components/map/OverlayLabels";
import { SECURITY_PANE, ensurePane } from "@/lib/mapPanes";
import { cn } from "@/lib/utils";

/**
 * Capas de entorno (ruido diurno / nocturno por calle y seguridad por barrio) que comparten el
 * mapita de la ficha de propiedad y el mapa del Life Score. Son solo visualización: no entran en
 * ningún puntaje. Uso:
 *   const env = useEnvironmentLayers();
 *   <LayerToggles env={env} />                       // botones, fuera del mapa
 *   <MapContainer> ... <EnvironmentOverlays env={env} /> ... </MapContainer>
 *   <EnvironmentLegend env={env} />                  // dentro del contenedor relativo del mapa
 */

const LAYERS = [
  { id: "day", label: "Ruido diurno", icon: Sun },
  { id: "night", label: "Ruido nocturno", icon: Moon },
  { id: "security", label: "Seguridad", icon: ShieldCheck }
];

/** Estado de las capas (apagadas al inicio) y cortes de la escala de ruido. */
export function useEnvironmentLayers() {
  const [active, setActive] = useState({ day: false, night: false, security: false });
  const anyNoise = active.day || active.night;
  const cuts = useNoiseCuts(anyNoise);

  // Ruido de día y de noche son excluyentes (dos capas de calles una arriba de la otra
  // no se leen); seguridad se puede combinar con cualquiera de las dos.
  const toggle = id => setActive(prev => ({
    ...prev,
    [id]: !prev[id],
    ...(id === "day" && !prev.day ? { night: false } : {}),
    ...(id === "night" && !prev.night ? { day: false } : {})
  }));

  return { active, cuts, toggle, anyNoise, anyLayer: anyNoise || active.security };
}

export function LayerToggles({ env, className }) {
  return <div className={cn("flex flex-wrap gap-2", className)} role="group" aria-label="Capas del mapa">
      {LAYERS.map(({ id, label, icon: Icon }) => <button
          key={id}
          type="button"
          aria-pressed={env.active[id]}
          onClick={() => env.toggle(id)}
          className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
            env.active[id] ? "border-primary bg-primary text-on-primary" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
          <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {label}
        </button>)}
    </div>;
}

let securityPromise;
function loadSecurity() {
  if (!securityPromise) {
    securityPromise = api.get("/api/heatmaps/security").then(res => res.data).catch(err => {
      securityPromise = undefined;
      throw err;
    });
  }
  return securityPromise;
}

function SecurityOverlay({ currentNeighborhood }) {
  const map = useMap();
  ensurePane(map, SECURITY_PANE, 410);
  const [data, setData] = useState(null);
  useEffect(() => {
    let cancelled = false;
    loadSecurity().then(d => !cancelled && setData(d)).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  if (!data) return null;
  return <GeoJSON
      key="security"
      data={data}
      pane={SECURITY_PANE}
      style={feature => {
        const level = securityLevelFromIndex(feature.properties.securityIndex);
        const current = currentNeighborhood && feature.properties.neighborhoodName === currentNeighborhood;
        return {
          color: current ? "#1b1b1b" : "#ffffff",
          weight: current ? 3 : 1,
          fillColor: MAP_LEVEL_COLORS[level] ?? "#9e9e9e",
          fillOpacity: 0.35
        };
      }}
      onEachFeature={(feature, leafletLayer) => {
        const level = securityLevelFromIndex(feature.properties.securityIndex);
        const { neighborhoodName } = feature.properties;
        leafletLayer.bindTooltip(`${neighborhoodName ?? "Barrio"}: seguridad ${level ? SECURITY_LABELS[level - 1].toLowerCase() : "sin dato"}`, { sticky: true });
      }} />;
}

/** Las capas dentro del MapContainer. `currentNeighborhood` resalta el barrio de la propiedad. */
export function EnvironmentOverlays({ env, currentNeighborhood }) {
  const { active, cuts } = env;
  return <>
      {active.security && <SecurityOverlay currentNeighborhood={currentNeighborhood} />}
      {active.night && <NoiseStreetsLayer period="night" cuts={cuts?.night} fillOpacity={0.55} />}
      {active.day && <NoiseStreetsLayer period="day" cuts={cuts?.day} fillOpacity={0.55} />}
      <OverlayLabels enabled={env.anyLayer} />
    </>;
}

/** Leyenda plegable. `className` define dónde va (por defecto abajo a la derecha del mapa). */
export function EnvironmentLegend({ env, className = "bottom-6 right-2" }) {
  const { active, cuts } = env;
  const [open, setOpen] = useState(true);
  const rows = [];
  if (active.day || active.night) {
    rows.push(<div key="noise" className="space-y-0.5">
        <p className="font-bold text-on-surface">Ruido {active.day ? "diurno" : "nocturno"}</p>
        {cuts && noiseLegend(active.day ? cuts.day : cuts.night).map(row => <p key={row.level} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: MAP_LEVEL_COLORS[row.level] }} />
            <span className="flex-1">{row.label}</span>
            <span className="whitespace-nowrap text-on-surface-variant">{row.range}</span>
          </p>)}
        <p className="text-[10px] text-on-surface-variant">Fuente: Mapa de Ruido, BA Data (CC BY 2.5 AR)</p>
      </div>);
  }
  if (active.security) {
    rows.push(<div key="sec" className="space-y-0.5">
        <p className="font-bold text-on-surface">Seguridad del barrio</p>
        {SECURITY_LABELS.map((label, i) => <p key={label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: MAP_LEVEL_COLORS[i + 1] }} />
            {label}
          </p>)}
        <p className="text-[10px] text-on-surface-variant">Hechos denunciados 2023-2025. Fuente: Delitos, BA Data (CC BY 2.5 AR)</p>
      </div>);
  }
  if (rows.length === 0) return null;
  return <div className={cn("absolute z-[1000] w-[220px] max-h-[65%] overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-lowest/95 text-[11px] leading-tight shadow", className)}>
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className="flex w-full items-center justify-between px-2 py-1.5 font-bold text-on-surface">
        Referencias {open ? <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />}
      </button>
      {open && <div className="space-y-2 px-2 pb-2">{rows}</div>}
    </div>;
}

/** Aclaración de cómo leer los colores del ruido (solo si hay ruido prendido). */
export function EnvironmentNote({ env }) {
  if (!env.anyNoise) return null;
  return <p className="text-xs text-on-surface-variant">
      El color compara cada calle con el resto de CABA: verde es de lo más tranquilo de la ciudad y rojo de lo más ruidoso.
    </p>;
}
