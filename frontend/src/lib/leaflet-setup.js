import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Con Vite las rutas por defecto de los íconos de Leaflet no resuelven;
// hay que registrarlas explícitamente desde el paquete.
//
// El `delete` es imprescindible, no cosmético: Icon.Default._getIconUrl
// (heredado del prototipo de Leaflet) intenta autodetectar un "imagePath"
// leyendo los <link>/<style> del documento y lo antepone a iconUrl/
// shadowUrl. Con Vite ese autodetect devuelve basura y el resultado es una
// URL tipo "<imagePath>/<url-ya-resuelta-por-vite>.png" que 404ea -- eso es
// exactamente el "recuadro vacío" (ícono roto) que se veía en el marker de
// la propiedad en Life Score. Borrando el método antes de mergeOptions,
// Leaflet vuelve a usar directamente las URLs de options (las que Vite ya
// resolvió), sin el prefijo autodetectado.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});
