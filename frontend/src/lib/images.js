// Fotos de propiedades: las que suben los usuarios viven en Cloudinary (ver FileStorageService).
// Cloudinary entrega una versión reducida y comprimida si se la pedimos en la URL; sin esto cada
// pantalla bajaba el archivo original (3 a 5 MB por foto). Cada ancho distinto es una transformación
// que Cloudinary cuenta una sola vez por foto, así que se usan solo tres anchos fijos.
export const IMG_THUMB = 400;   // miniaturas (uploader, mosaico de la ficha, mapa)
export const IMG_CARD = 800;    // tarjetas, portada del mosaico, tarjeta del mapa
export const IMG_FULL = 1600;   // foto única de la ficha y visor ampliado

const UPLOAD_SEGMENT = "/image/upload/";

// Inserta la transformación en una URL de Cloudinary: ancho máximo `width` (sin agrandar),
// calidad y formato automáticos (WebP/AVIF si el navegador los soporta). Si la URL no es de
// Cloudinary (fotos de demostración, vacía) la devuelve igual.
export function optimizedImage(url, width = IMG_CARD) {
  if (typeof url !== "string" || !url.includes("res.cloudinary.com") || !url.includes(UPLOAD_SEGMENT)) return url;
  const [head, tail] = url.split(UPLOAD_SEGMENT);
  if (tail.includes("f_auto,q_auto/")) return url; // ya optimizada
  return `${head}${UPLOAD_SEGMENT}c_limit,w_${width},f_auto,q_auto/${tail}`;
}
