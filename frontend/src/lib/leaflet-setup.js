import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
// Efecto secundario: registra L.heatLayer para el mapa de calor de precios.
import "leaflet.heat";

// Con Vite las rutas por defecto de los íconos de Leaflet no resuelven;
// hay que registrarlas explícitamente desde el paquete.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});
