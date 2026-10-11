import { useEffect, useState } from "react";
import { TileLayer, useMap, useMapEvents } from "react-leaflet";
import { BASE_LABELS } from "@/lib/mapTiles";

export const LABELS_PANE = "overlayLabels";
// Por encima de las capas de color (400-450) y por debajo de los pines (600).
const LABELS_Z_INDEX = 480;
// Las etiquetas vienen en estilo "dark" (texto blanco, borde oscuro). La clase CSS `nidio-labels`
// (index.css) las invierte: queda texto negro con borde blanco, que se lee sobre cualquier color
// de capa. El filtro va en cada capa de tiles y no en el pane, para que no dependa del orden en
// que se crean los panes.
const LABELS_CLASS = "nidio-labels";

/**
 * Etiquetas de calles y barrios dibujadas sobre las capas de color, para que no queden
 * tapadas. Solo se monta cuando hay alguna capa de color prendida (`enabled`) y existe
 * una clave de CARTO (ver lib/mapTiles.js); sin ella no dibuja nada.
 */
export function OverlayLabels({ enabled }) {
  const map = useMap();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled || !BASE_LABELS) return undefined;
    const pane = map.getPane(LABELS_PANE) ?? map.createPane(LABELS_PANE);
    pane.style.zIndex = String(LABELS_Z_INDEX);
    pane.style.pointerEvents = "none";
    setReady(true);
    return () => setReady(false);
  }, [enabled, map]);

  // Esta capa es transparente: si después de un zoom Leaflet no descarta el nivel de tiles
  // anterior (le pasa cuando algún tile nuevo tarda en cargar y la animación ya terminó), ese
  // nivel queda agrandado y borroso arriba del mapa, con las letras claras, hasta que se mueve
  // el mapa. Cuando termina un zoom se oculta todo nivel que no sea el de más arriba.
  const hideStaleLevels = () => {
    const pane = map.getPane(LABELS_PANE);
    if (!pane) return;
    pane.querySelectorAll(".leaflet-layer").forEach(layer => {
      const levels = [...layer.querySelectorAll(".leaflet-tile-container")];
      const top = Math.max(0, ...levels.map(level => Number(level.style.zIndex) || 0));
      levels.forEach(level => {
        level.style.visibility = (Number(level.style.zIndex) || 0) < top ? "hidden" : "";
      });
    });
  };
  useMapEvents({
    zoomend: () => {
      hideStaleLevels();
      setTimeout(hideStaleLevels, 300);
      setTimeout(hideStaleLevels, 1000);
    },
    moveend: hideStaleLevels
  });

  if (!enabled || !BASE_LABELS || !ready) return null;
  // Tres copias de la misma capa (las otras salen de la caché del navegador): el texto se
  // superpone consigo mismo y queda más grueso y oscuro.
  return <>
      <TileLayer url={BASE_LABELS.url} pane={LABELS_PANE} className={LABELS_CLASS} />
      <TileLayer url={BASE_LABELS.url} pane={LABELS_PANE} className={LABELS_CLASS} />
      <TileLayer url={BASE_LABELS.url} pane={LABELS_PANE} className={LABELS_CLASS} />
    </>;
}
