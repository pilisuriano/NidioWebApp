import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "@/lib/leaflet-setup";

/**
 * Capa de heatmap de puntos (leaflet.heat). React-leaflet no expone un
 * componente propio para esto, así que se maneja de forma imperativa:
 * se crea la capa sobre el mapa del contexto y se limpia al desmontar
 * o cuando cambian los puntos.
 *
 * @param {Array<[number, number, number]>} points - [lat, lon, intensidad]
 * @param {object} [options] - opciones de leaflet.heat (radius, blur, max, gradient...)
 */
export default function HeatmapLayer({ points, options }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return undefined;

    const heatLayer = L.heatLayer(points, {
      radius: 28,
      blur: 20,
      maxZoom: 16,
      minOpacity: 0.35,
      ...options
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null;
}
