// Mapa base de las pantallas con mapa (Explorar, detalle de propiedad).
// CARTO pide una API key para sus tiles (sin ella dibuja la marca "API KEY REQUIRED"). Se configura con
// VITE_CARTO_API_KEY (frontend/.env.local en desarrollo; variable de entorno en Vercel en producción).
// Es una clave de uso público en el navegador: conviene restringirla por dominio en el panel de CARTO.
// Sin clave se usa el mapa estándar de OpenStreetMap, para que el mapa se vea igual (con otro estilo).

const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY;

const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const BASE_TILES = CARTO_KEY
  ? {
      url: `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${encodeURIComponent(CARTO_KEY)}`,
      attribution: `${OSM_ATTRIBUTION} &copy; <a href="https://carto.com/attributions">CARTO</a>`,
    }
  : {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: OSM_ATTRIBUTION,
    };

// Solo las etiquetas (calles, barrios), para dibujarlas ENCIMA de las
// capas de color (ruido, seguridad) y que las calles se sigan leyendo. Solo existe con
// clave de CARTO. Se usa el estilo "dark" (texto blanco con borde oscuro) y OverlayLabels lo invierte
// con CSS: queda texto negro con borde blanco, mucho más marcado que el gris de Voyager. Con el mapa estándar de OSM no hay una capa de etiquetas aparte, y ahí
// la legibilidad la resuelve la mezcla "multiplicar" de las capas de color.
export const BASE_LABELS = CARTO_KEY
  ? {
      url: `https://basemaps.cartocdn.com/rastertiles/dark_only_labels/{z}/{x}/{y}.png?key=${encodeURIComponent(CARTO_KEY)}`,
    }
  : null;
