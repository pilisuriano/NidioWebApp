// Posición (en %) de un valor dentro de la barra del rango estimado de una tasación: 25 % por debajo,
// 50 % el rango (de min a max) y 25 % por encima. Lo que cae afuera se acota a los bordes de la barra.
export function positionInBar(value, min, max) {
  const span = max - min || 1;
  return Math.max(2, Math.min(98, 25 + ((value - min) / span) * 50));
}
