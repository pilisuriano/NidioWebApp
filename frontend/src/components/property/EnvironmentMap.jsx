import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { Crosshair } from "lucide-react";
import { BASE_TILES } from "@/lib/mapTiles";
import { EnvironmentLegend, EnvironmentNote, EnvironmentOverlays, LayerToggles, useEnvironmentLayers } from "@/components/map/EnvironmentLayers";

/** Botón "centrar en la propiedad": vuelve a la ubicación y al zoom inicial. */
function CenterButton({ lat, lon }) {
  const map = useMap();
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      L.DomEvent.disableClickPropagation(ref.current);
    }
  }, []);
  return <button
      ref={ref}
      type="button"
      onClick={() => map.flyTo([lat, lon], 16, { duration: 0.6 })}
      aria-label="Centrar en la propiedad"
      title="Centrar en la propiedad"
      className="absolute top-2.5 right-2.5 z-[1000] inline-flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 text-xs font-semibold text-on-surface shadow hover:bg-surface-dim">
      <Crosshair className="w-3.5 h-3.5" aria-hidden="true" /> Centrar
    </button>;
}

/**
 * Mapa "Ubicación" de la ficha con capas opcionales de ruido (diurno / nocturno) y de
 * seguridad del barrio (ver components/map/EnvironmentLayers.jsx). Las capas empiezan
 * apagadas para que el mapa se vea limpio; se prenden y apagan con los botones y se
 * pueden combinar.
 */
export function EnvironmentMap({ lat, lon, neighborhoodName, pinIcon }) {
  const env = useEnvironmentLayers();
  return <div className="space-y-2">
      <LayerToggles env={env} />
      <div className="relative h-96 rounded-xl overflow-hidden border border-outline-variant">
        <MapContainer center={[lat, lon]} zoom={16} scrollWheelZoom className="w-full h-full">
          <TileLayer attribution={BASE_TILES.attribution} url={BASE_TILES.url} />
          <EnvironmentOverlays env={env} currentNeighborhood={neighborhoodName} />
          <Marker position={[lat, lon]} icon={pinIcon} />
          <CenterButton lat={lat} lon={lon} />
        </MapContainer>
        <EnvironmentLegend env={env} />
      </div>
      <EnvironmentNote env={env} />
    </div>;
}
