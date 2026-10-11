// Panes propios para las capas de color (ruido, seguridad). Cada una va en su pane, con
// "multiplicar" como modo de mezcla: el color solo oscurece lo que tiene abajo, así el
// nombre de las calles del mapa base se sigue leyendo a través de la capa (con el relleno
// normal, a mayor opacidad, las tapaba).
export const NOISE_PANE = "noiseStreets";
export const SECURITY_PANE = "securityFill";

/** Crea el pane si no existe (idempotente, se puede llamar al renderizar). */
export function ensurePane(map, name, zIndex) {
  const pane = map.getPane(name) ?? map.createPane(name);
  pane.style.zIndex = String(zIndex);
  pane.style.pointerEvents = "none";
  pane.style.mixBlendMode = "multiply";
  return pane;
}
