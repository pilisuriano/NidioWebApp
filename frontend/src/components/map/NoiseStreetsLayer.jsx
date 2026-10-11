import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { useMap, useMapEvents } from "react-leaflet";
import { MAP_LEVEL_COLORS } from "@/lib/environment";
import { NOISE_PANE, ensurePane } from "@/lib/mapPanes";
import { clipNoiseToBox, loadNoiseCuts, loadNoiseLayer } from "@/lib/noiseLayers";

// Caja a recortar: la vista actual con un margen del 50 % por lado. Solo se recalcula cuando
// la vista se sale de la caja actual (al arrastrar poco o acercar no hay que repintar todo).
function useViewBox() {
  const map = useMap();
  const read = () => {
    const b = map.getBounds().pad(0.5);
    return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
  };
  const [box, setBox] = useState(read);
  useMapEvents({
    moveend: () => {
      const v = map.getBounds();
      setBox(prev => (v.getWest() >= prev[0] && v.getSouth() >= prev[1] && v.getEast() <= prev[2] && v.getNorth() <= prev[3] ? prev : read()));
    }
  });
  return box;
}

/** Cortes de la escala relativa de ruido (`{ day, night }`), cargados cuando `enabled`. */
export function useNoiseCuts(enabled) {
  const [cuts, setCuts] = useState(null);
  useEffect(() => {
    if (enabled && !cuts) {
      loadNoiseCuts().then(setCuts).catch(() => {});
    }
  }, [enabled, cuts]);
  return cuts;
}

/**
 * Calles coloreadas por ruido (Mapa de Ruido de BA Data): una franja por calle,
 * verde (de lo más tranquilo de CABA) a rojo (de lo más ruidoso). `period`: "day" | "night".
 * Dibuja solo lo que está a la vista (son ~28.000 polígonos en toda la ciudad).
 *
 * La capa se arma "a mano" con Leaflet, con su propio renderer de canvas dentro de un pane
 * dedicado, y se destruye entera al cambiar de período o de recorte. Con el GeoJSON de
 * react-leaflet y el canvas compartido del mapa, al pasar de día a noche con zoom el canvas
 * no se repintaba hasta mover el mapa.
 */
export function NoiseStreetsLayer({ period, cuts, fillOpacity = 0.6 }) {
  const map = useMap();
  const box = useViewBox();
  // Se guarda junto con el período para no mezclar datos de día con colores de noche
  // en el render que sigue a un cambio de período.
  const [loaded, setLoaded] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadNoiseLayer(period).then(data => !cancelled && setLoaded({ period, data })).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [period]);

  const data = loaded?.period === period ? loaded.data : null;
  const clipped = useMemo(() => (data && cuts ? clipNoiseToBox(data, box, cuts) : null), [data, cuts, box]);

  useEffect(() => {
    if (!clipped) return undefined;
    ensurePane(map, NOISE_PANE, 420);
    const renderer = L.canvas({ pane: NOISE_PANE, padding: 0.3 });
    const layer = L.geoJSON(clipped, {
      pane: NOISE_PANE,
      renderer,
      interactive: false,
      style: feature => ({
        stroke: true,
        weight: 0.6, // borde del mismo color: tapa las líneas finas entre franjas contiguas
        color: MAP_LEVEL_COLORS[feature.properties.level],
        opacity: fillOpacity,
        fillColor: MAP_LEVEL_COLORS[feature.properties.level],
        fillOpacity
      })
    }).addTo(map);
    return () => {
      map.removeLayer(layer);
      map.removeLayer(renderer);
    };
  }, [clipped, fillOpacity, map]);

  return null;
}
