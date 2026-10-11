import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { NidioLoadingMark } from "@/components/ui/NidioLoadingMark";
import { MapPin, SlidersHorizontal, Bus, ShoppingBag, TreePine, Cross, Utensils, Wine, GraduationCap, Calculator, AlertCircle, Heart, Star, Plus, Trash2, Info, Eye, EyeOff } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { BASE_TILES } from "@/lib/mapTiles";
import { useUsage, isQuotaExceeded } from "@/lib/usage";
import { QuotaNotice } from "@/components/ui/QuotaNotice";
import { ScoreBreakdown } from "@/components/lifescore/ScoreBreakdown";
import { EnvironmentLegend, EnvironmentNote, EnvironmentOverlays, LayerToggles, useEnvironmentLayers } from "@/components/map/EnvironmentLayers";

const CATEGORIES = [
  { key: "TRANSPORT", label: "Transporte", icon: Bus },
  { key: "COMMERCE", label: "Comercios", icon: ShoppingBag },
  { key: "GREEN_SPACE", label: "Espacios verdes", icon: TreePine },
  { key: "HEALTH", label: "Salud", icon: Cross },
  { key: "GASTRONOMY", label: "Gastronomía", icon: Utensils },
  { key: "NIGHTLIFE", label: "Vida nocturna", icon: Wine },
  { key: "EDUCATION", label: "Educación", icon: GraduationCap }
];

const CATEGORY_COLOR = {
  TRANSPORT: "#00647c",
  COMMERCE: "#4059aa",
  GREEN_SPACE: "#1F4D36",
  HEALTH: "#ba1a1a",
  GASTRONOMY: "#b45309",
  NIGHTLIFE: "#7c3aed",
  EDUCATION: "#0f766e"
};

// "Mis lugares" personales: color propio, distinto de las 7 categorías fijas,
// para que se distingan de un vistazo en el mapa y en las tarjetas de resultado.
const CUSTOM_PLACE_COLOR = "#c2410c";
const MAX_CUSTOM_PLACES = 15;

// Niveles de importancia de "Mis lugares", en vez de un slider numérico
// 1-5 igual que las 7 categorías fijas. Motivo (caso real de Pili,
// 13/08/2026): las 7 categorías se combinan en un único promedio ponderado
// junto con "Mis lugares" (ver LifeScoreService.blendTotalScore) -- ahí un
// peso de "5" para Mis lugares compite contra la SUMA de las 7 categorías
// (que con todas en 1 ya suman 7), no contra cada una por separado, así
// que en la escala 1-5 nunca llegaba a dominar aunque el usuario pusiera
// el máximo. Estos valores (bien más altos que 1-5) SÍ le permiten pesar
// fuerte quien quiera priorizar casi exclusivamente sus lugares personales
// -- sin mostrar el número real en pantalla, solo la etiqueta.
const CUSTOM_PLACE_WEIGHT_LEVELS = [
  { label: "No es prioridad", value: 1 },
  { label: "Me importa", value: 5 },
  { label: "Me importa mucho", value: 15 },
  { label: "Es lo que más me importa", value: 40 }
];

// Pines del mapa con divIcon + SVG propio, en vez del ícono default de
// Leaflet (Marker sin icon=) o de un CircleMarker liso: mismo criterio que
// LOCATION_PIN_ICON en PropertyDetail.jsx (ver el bug de ícono roto
// documentado en leaflet-setup.js) y además, acá, para que la propiedad
// consultada (casita) y "mis lugares" (estrella) se distingan de un
// vistazo entre sí y de los POIs de las 7 categorías (puntos chicos sin
// borde). Son constantes de módulo -- no dependen de ningún dato, así que
// no hace falta recrearlas en cada render.
const PROPERTY_PIN_ICON = L.divIcon({
  className: "property-pin-icon",
  html: `<div class="property-pin"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5L12 4l9 7.5" /><path d="M5.5 10v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9" /><path d="M9.5 20v-6h5v6" /></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});
const CUSTOM_PLACE_PIN_ICON = L.divIcon({
  className: "custom-place-pin-icon",
  html: `<div class="custom-place-pin"><svg viewBox="0 0 24 24" fill="#ffffff" stroke="none"><path d="M12 2l2.9 6.26L21.5 9l-4.9 4.73L17.8 21 12 17.5 6.2 21l1.2-7.27L2.5 9l6.6-.74z" /></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Los POIs van en un pane propio, por debajo del markerPane (600): los CircleMarker se dibujan en un
// <svg> y, en el mismo pane que los pines (casita y estrellas), quedaban encima y los tapaban. Con el
// pane en 590 los círculos se pueden clickear igual, pero la casita y "Mis lugares" siempre quedan arriba.
const POI_PANE = "poiPane";

function PoiPane() {
  const map = useMap();
  if (!map.getPane(POI_PANE)) {
    map.createPane(POI_PANE).style.zIndex = "590";
  }
  return null;
}

// Color del puntaje total, en línea con el nivel que ya muestra scoreLabel
// (rojo = bajo, azul = neutral, verdes = óptimo y excelente). El nivel también
// se escribe en texto ("NIVEL: ..."), así que el color nunca es la única señal.
// Cortes relativos a la ciudad, no absolutos: salen de la distribución del
// puntaje (pesos iguales) en 6.000 parcelas al azar de CABA -- mediana 36,
// p25 28, p75 56, p90 76 (ver nidio-life-score-por-barrio.md). Con cortes
// absolutos (80/60/40) la parcela típica de CABA quedaba en rojo.
const SCORE_CUTS = { excelente: 76, optimo: 56, neutral: 28 };

function scoreColor(score) {
  if (score >= SCORE_CUTS.excelente) return "#15803d";
  if (score >= SCORE_CUTS.optimo) return "#65a30d";
  if (score >= SCORE_CUTS.neutral) return "#2563eb";
  return "#dc2626";
}

function scoreLabel(score) {
  if (score >= SCORE_CUTS.excelente) return "EXCELENTE";
  if (score >= SCORE_CUTS.optimo) return "ÓPTIMO";
  if (score >= SCORE_CUTS.neutral) return "NEUTRAL";
  return "BAJO";
}

// Antes el mapa quedaba fijo en zoom 15 centrado en la propiedad -- con eso
// un lugar personal a 2-3 km (el radio de "cercanía aceptable" llega hasta
// 3 km) quedaba directamente fuera de cámara, aunque el CircleMarker se
// estuviera dibujando bien. Este helper ajusta cámara una sola vez, al
// montar el mapa de CADA cálculo nuevo (MapContainer se remonta entero por
// el key={result.id} de más abajo), para que entren la propiedad, los POIs
// y todos los lugares personales seleccionados. Corre solo en el mount (no
// en cada re-render) a propósito: así el usuario puede alejar/mover el mapa
// a mano sin que un re-render ajeno lo haga "saltar" de vuelta.
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 16 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

// Botón para volver a centrar el mapa en la propiedad, pegado debajo del
// "-" del control de zoom nativo -- mismo criterio que RecenterControl de
// MapPage.jsx (ver el comentario de esa función para el detalle de por qué
// se inserta el link directamente en la caja de zoom en vez de armar un
// control propio con su propia caja aparte). Acá en vez de recentrar en
// CABA, vuelve a la propiedad calculada (result.location), por eso recibe
// las coordenadas por prop en lugar de tenerlas fijas.
function RecenterToPropertyControl({ to }) {
  const map = useMap();
  useEffect(() => {
    const zoomContainer = map.zoomControl?.getContainer();
    if (!zoomContainer) return;
    const link = L.DomUtil.create("a", "", zoomContainer);
    link.href = "#";
    link.title = "Volver a la propiedad";
    link.setAttribute("aria-label", "Volver a la propiedad");
    link.setAttribute("role", "button");
    // Mismo ícono de "casa" que PROPERTY_PIN_ICON (el pin de la propiedad
    // en el mapa, más arriba), para que se entienda de un vistazo que este
    // botón vuelve a esa marca.
    link.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9"/><path d="M9.5 20v-6h5v6"/></svg>';
    link.style.display = "flex";
    link.style.alignItems = "center";
    link.style.justifyContent = "center";
    L.DomEvent.disableClickPropagation(link);
    L.DomEvent.on(link, "click", e => {
      L.DomEvent.preventDefault(e);
      map.flyTo(to, 15, { duration: 0.75 });
    });
    return () => L.DomUtil.remove(link);
  }, [map, to]);
  return null;
}

export default function LifeScore() {
  // Dirección a consultar: autocomplete real (georef.ar vía /api/addresses/search,
  // mismo patrón que Publicar.jsx) -- no se puede calcular sin elegir una
  // sugerencia real o una propiedad favorita, porque el backend ya no
  // geocodifica texto libre para Life Score (antes usaba un geocoder sintético).
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const addressDebounceRef = useRef(null);

  // Dropdown "usar una propiedad favorita" como atajo para no tener que
  // volver a tipear/elegir la dirección de algo que ya guardaste.
  const [favorites, setFavorites] = useState([]);
  const [selectedFavoriteId, setSelectedFavoriteId] = useState("");
  // El buscador de dirección manual arranca oculto detrás de un link -- si
  // el usuario tiene favoritos, ese es el camino corto por defecto; "escribir
  // la dirección a mano" queda como opción secundaria, no ocupando lugar de
  // entrada. Sin favoritos no tiene sentido ocultarlo: es el único camino.
  const [showManualAddress, setShowManualAddress] = useState(false);

  const [weights, setWeights] = useState({
    TRANSPORT: 4,
    COMMERCE: 5,
    GREEN_SPACE: 3,
    HEALTH: 2,
    GASTRONOMY: 4,
    NIGHTLIFE: 1,
    EDUCATION: 4
  });

  // "Mis lugares": nivel de importancia POR LUGAR (id -> valor de
  // CUSTOM_PLACE_WEIGHT_LEVELS) -- antes era un único peso para todo el
  // conjunto; desde el 15/08/2026 cada lugar pesa por separado (a pedido de
  // Pili: puede importar más estar cerca del gimnasio que de la casa de los
  // papás). Un lugar sin entrada acá usa el default (ver getPlaceWeight).
  const [placeWeights, setPlaceWeights] = useState({});
  // Radio de cercanía aceptable (compartido entre todos los lugares -- a
  // diferencia del peso, no tiene sentido que cada lugar tenga su propio
  // radio: es la distancia a la que "ya no está cerca", no una prioridad).
  const [customPlaceRadiusKm, setCustomPlaceRadiusKm] = useState(2);

  const [customPlaces, setCustomPlaces] = useState([]);
  // IDs de "Mis lugares" que el usuario destildó para ESTE cálculo puntual
  // (checkbox por lugar). Default = todos seleccionados: un lugar recién
  // cargado, o que el usuario nunca tocó, no aparece acá -- por eso no hace
  // falta inicializar nada al traer la lista, "ausente de este set" ya
  // significa "seleccionado".
  const [deselectedPlaceIds, setDeselectedPlaceIds] = useState(new Set());
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [newPlaceLabel, setNewPlaceLabel] = useState("");
  const [newPlaceAddress, setNewPlaceAddress] = useState("");
  const [newPlaceLat, setNewPlaceLat] = useState(null);
  const [newPlaceLon, setNewPlaceLon] = useState(null);
  const [newPlaceSuggestions, setNewPlaceSuggestions] = useState([]);
  const [showNewPlaceSuggestions, setShowNewPlaceSuggestions] = useState(false);
  const [newPlaceLoading, setNewPlaceLoading] = useState(false);
  const [newPlaceSubmitting, setNewPlaceSubmitting] = useState(false);
  const [newPlaceError, setNewPlaceError] = useState(null);
  const newPlaceDebounceRef = useRef(null);

  const [result, setResult] = useState(null);
  // Pesos de "Mis lugares" y radio con los que se calculó ESTE resultado (el desglose los necesita; los sliders pueden cambiar después).
  const [resultMeta, setResultMeta] = useState({ placeWeights: {}, radiusKm: null });
  // Categorías de POIs apagadas en el mapa (botones de la leyenda): en zonas
  // densas hay cientos de puntos y abruma, así que cada categoría se puede
  // ocultar. No afecta el puntaje, solo lo que se dibuja.
  const [hiddenCategories, setHiddenCategories] = useState(new Set());
  const [error, setError] = useState(null);
  // Capas de entorno del mapa (ruido diurno/nocturno y seguridad del barrio): solo
  // visualización, no entran en el puntaje.
  const env = useEnvironmentLayers();
  const [submitting, setSubmitting] = useState(false);
  // Cuota de Life Score (gratis del mes, pase o plan): el backend corta con 429 si no quedan usos.
  const { status: usage, blocked: quotaBlocked, refresh: refreshUsage } = useUsage("lifeScore");

  useEffect(() => {
    api.get("/api/favorites").then(res => setFavorites(res.data)).catch(() => {});
    loadCustomPlaces();
  }, []);

  // Si se llega acá con ?address=&lat=&lon= (desde el botón "Calcular Life
  // Score" de la ficha de una propiedad, ver PropertyDetail.jsx), se
  // precarga esa dirección lista para calcular. No se auto-calcula: el
  // usuario ajusta sus propios pesos por categoría antes de tocar
  // "Calcular" (por eso el cálculo neutral que había en PropertyDetail.jsx
  // se sacó, en vez de simplemente moverse acá).
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const qAddress = searchParams.get("address");
    const qLat = searchParams.get("lat");
    const qLon = searchParams.get("lon");
    if (qAddress && qLat && qLon) {
      setAddress(qAddress);
      setLat(parseFloat(qLat));
      setLon(parseFloat(qLon));
      setShowManualAddress(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadCustomPlaces() {
    api.get("/api/custom-places").then(res => setCustomPlaces(res.data)).catch(() => {});
  }

  function getPlaceWeight(id) {
    return placeWeights[id] ?? CUSTOM_PLACE_WEIGHT_LEVELS[1].value;
  }

  function setPlaceWeight(id, value) {
    setPlaceWeights(w => ({ ...w, [id]: value }));
  }

  function togglePlaceSelection(id) {
    setDeselectedPlaceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Autocomplete de la dirección principal (mismo patrón que Publicar.jsx).
  function handleAddressInput(value) {
    setAddress(value);
    setLat(null);
    setLon(null);
    setSelectedFavoriteId("");
    setShowAddressSuggestions(true);
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    if (value.trim().length < 5) {
      setAddressSuggestions([]);
      return;
    }
    addressDebounceRef.current = setTimeout(async () => {
      setAddressLoading(true);
      try {
        const res = await api.get("/api/addresses/search", { params: { q: value.trim() } });
        setAddressSuggestions(res.data);
      } catch {
        setAddressSuggestions([]);
      } finally {
        setAddressLoading(false);
      }
    }, 400);
  }

  function selectAddressSuggestion(suggestion) {
    setAddress(suggestion.label);
    setLat(suggestion.lat);
    setLon(suggestion.lon);
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
  }

  function selectFavorite(id) {
    setSelectedFavoriteId(id);
    if (!id) return;
    const favorite = favorites.find(f => String(f.id) === id);
    if (!favorite || !favorite.location) return;
    setAddress(favorite.address ?? favorite.title);
    setLat(favorite.location.lat);
    setLon(favorite.location.lon);
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
    setShowManualAddress(false);
  }

  // Vuelve a ocultar el buscador manual (link simétrico al que lo abre) y
  // limpia lo que se haya tipeado/elegido ahí, para no dejar una dirección
  // manual colgada por atrás si después el usuario elige un favorito.
  function hideManualAddress() {
    setShowManualAddress(false);
    setAddress("");
    setLat(null);
    setLon(null);
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    if (lat == null || lon == null) {
      setError("Elegí una dirección de la lista o una propiedad favorita antes de calcular");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const selectedPlaceIds = customPlaces
        .filter(p => !deselectedPlaceIds.has(p.id))
        .map(p => p.id);
      // Solo se manda el peso de los lugares SELECCIONADOS -- el peso de un
      // lugar destildado no importa (no entra al cálculo de todos modos).
      const customPlaceWeights = Object.fromEntries(
        selectedPlaceIds.map(id => [id, getPlaceWeight(id)])
      );
      const res = await api.post("/api/life-score", {
        address,
        lat,
        lon,
        weights,
        customPlaceWeights: selectedPlaceIds.length > 0 ? customPlaceWeights : null,
        customPlaceRadiusKm,
        // null si no tiene ningún lugar cargado -- el backend interpreta
        // null como "usar todos" (compatibilidad), pero acá igual da lo
        // mismo porque no hay nada para filtrar.
        customPlaceIds: customPlaces.length > 0 ? selectedPlaceIds : null
      });
      setResult(res.data);
      setResultMeta({ placeWeights: customPlaceWeights, radiusKm: customPlaceRadiusKm });
      refreshUsage();
    } catch (err) {
      // Sin usos (429): el cartel de QuotaNotice ya lo explica, no hace falta repetirlo como error.
      if (isQuotaExceeded(err)) {
        refreshUsage();
        return;
      }
      setError(apiErrorMessage(err, "No se pudo calcular el Life Score"));
    } finally {
      setSubmitting(false);
    }
  }

  // Autocomplete para agregar un lugar personal nuevo (mismo patrón que arriba).
  function handleNewPlaceAddressInput(value) {
    setNewPlaceAddress(value);
    setNewPlaceLat(null);
    setNewPlaceLon(null);
    setShowNewPlaceSuggestions(true);
    if (newPlaceDebounceRef.current) clearTimeout(newPlaceDebounceRef.current);
    if (value.trim().length < 5) {
      setNewPlaceSuggestions([]);
      return;
    }
    newPlaceDebounceRef.current = setTimeout(async () => {
      setNewPlaceLoading(true);
      try {
        const res = await api.get("/api/addresses/search", { params: { q: value.trim() } });
        setNewPlaceSuggestions(res.data);
      } catch {
        setNewPlaceSuggestions([]);
      } finally {
        setNewPlaceLoading(false);
      }
    }, 400);
  }

  function selectNewPlaceSuggestion(suggestion) {
    setNewPlaceAddress(suggestion.label);
    setNewPlaceLat(suggestion.lat);
    setNewPlaceLon(suggestion.lon);
    setNewPlaceSuggestions([]);
    setShowNewPlaceSuggestions(false);
  }

  async function handleAddCustomPlace(e) {
    e.preventDefault();
    if (newPlaceLat == null || newPlaceLon == null) {
      setNewPlaceError("Elegí una dirección de la lista");
      return;
    }
    setNewPlaceError(null);
    setNewPlaceSubmitting(true);
    try {
      await api.post("/api/custom-places", {
        label: newPlaceLabel.trim(),
        address: newPlaceAddress,
        lat: newPlaceLat,
        lon: newPlaceLon
      });
      setNewPlaceLabel("");
      setNewPlaceAddress("");
      setNewPlaceLat(null);
      setNewPlaceLon(null);
      loadCustomPlaces();
    } catch (err) {
      setNewPlaceError(apiErrorMessage(err, "No se pudo agregar el lugar"));
    } finally {
      setNewPlaceSubmitting(false);
    }
  }

  async function confirmDeletePlace() {
    if (!placeToDelete) return;
    try {
      await api.delete(`/api/custom-places/${placeToDelete.id}`);
      setCustomPlaces(places => places.filter(p => p.id !== placeToDelete.id));
      setDeselectedPlaceIds(prev => {
        if (!prev.has(placeToDelete.id)) return prev;
        const next = new Set(prev);
        next.delete(placeToDelete.id);
        return next;
      });
    } catch {
      // Si falla, se queda en la lista y se puede reintentar.
    } finally {
      setPlaceToDelete(null);
    }
  }

  function toggleCategoryVisibility(key) {
    setHiddenCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const allCategoriesHidden = hiddenCategories.size === CATEGORIES.length;

  const score = result?.totalScore ?? null;
  const circumference = 282.7;
  const selectedPlaceCount = customPlaces.filter(p => !deselectedPlaceIds.has(p.id)).length;
  // Todos los puntos que tienen que entrar en cámara al abrir el mapa: la
  // propiedad, los POIs de las 7 categorías y los lugares personales -- ver
  // FitBounds más arriba.
  const mapPoints = result
    ? [
        [result.location.lat, result.location.lon],
        ...(result.customPlaces ?? []).map(p => [p.lat, p.lon]),
        ...result.categories.flatMap(cat => cat.pois.map(poi => [poi.lat, poi.lon]))
      ]
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-3xl font-bold text-on-surface">Life Score</h1>
        <Badge variant="secondary" className="px-3 py-1 text-[10px] tracking-widest uppercase">
          DATOS ABIERTOS (BA DATA)
        </Badge>
        {/* Atribución de los datasets de BA Data que usa el Life Score (todos con
            licencia CC-BY 2.5 AR). Desde octubre de 2026 el cálculo no usa
            OpenStreetMap: la lista completa de fuentes queda en el title
            (tooltip) y en ml-service/data/README.md. El mapa de fondo sigue
            mostrando la atribución de OSM en el TileLayer. */}
        <Badge
          variant="secondary"
          className="px-3 py-1 text-[10px] tracking-widest uppercase"
          title="Datos abiertos del Gobierno de la Ciudad de Buenos Aires (CC BY 2.5 AR), procesados por Nidio: paradas de colectivo, estaciones de subte y ferrocarril, hospitales, CeSAC, centros de salud privados, farmacias, establecimientos educativos, oferta gastronómica, mercados, ferias y espacios verdes — data.buenosaires.gob.ar"
        >
          GOBIERNO DE BUENOS AIRES (DATA.BUENOSAIRES.GOB.AR)
        </Badge>
      </div>
      <p className="text-on-surface-variant max-w-3xl font-mono text-sm">
        Calculá la calidad del entorno urbano de una dirección de CABA según la cercanía a 7 categorías de puntos de interés
        y a tus propios lugares personales, ponderados según tus prioridades.
      </p>

      {/* Cuota mensual (3 gratis por mes), arriba de todo para que se note. */}
      <QuotaNotice feature="lifeScore" status={usage} />

      {/* Dirección */}
      <div className="space-y-3">
        {favorites.length > 0 && (
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg p-2 shadow-sm">
            <Heart className="w-4 h-4 text-primary ml-1 shrink-0" />
            <select
              value={selectedFavoriteId}
              onChange={e => selectFavorite(e.target.value)}
              className="flex-1 min-w-0 w-full h-9 rounded-md border-none bg-transparent text-sm text-on-surface outline-none"
            >
              <option value="">Usar una propiedad favorita…</option>
              {favorites.filter(f => f.location).map(f => (
                <option key={f.id} value={f.id}>{f.title} — {f.neighborhoodName}</option>
              ))}
            </select>
          </div>
        )}

        {/* Con favoritos, el buscador manual queda oculto detrás de este link
            para no ocupar lugar de entrada -- sin favoritos, es el único
            camino, así que se muestra directo (ver showManualAddress arriba). */}
        {favorites.length > 0 && !showManualAddress && (
          <button
            type="button"
            onClick={() => setShowManualAddress(true)}
            className="text-xs font-mono text-primary underline underline-offset-2 pl-1 hover:text-primary/80"
          >
            O seleccionar una dirección de propiedad manualmente
          </button>
        )}

        {(showManualAddress || favorites.length === 0) && (
          <form onSubmit={handleSubmit} className="flex bg-surface-container-lowest border border-outline-variant rounded-lg p-2 shadow-sm gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-outline" />
              <Input
                className="pl-10 border-none bg-transparent h-11 text-base shadow-none ring-0 focus-visible:ring-0"
                value={address}
                onChange={e => handleAddressInput(e.target.value)}
                onFocus={() => setShowAddressSuggestions(true)}
                onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 150)}
                placeholder="Dirección en CABA (ej: Av. Cabildo 2100, Belgrano)"
                required
              />
              {showAddressSuggestions && (addressLoading || addressSuggestions.length > 0) && (
                <div className="absolute z-20 top-full mt-1 w-full rounded-md border border-outline-variant bg-surface-container-lowest shadow-lg max-h-56 overflow-y-auto">
                  {addressLoading
                    ? <p className="px-3 py-2 text-xs text-on-surface-variant">Buscando…</p>
                    : addressSuggestions.map(s => (
                      <button key={s.label} type="button" onMouseDown={() => selectAddressSuggestion(s)} className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors border-b border-outline-variant last:border-0">
                        {s.label}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <Button type="submit" disabled={submitting || quotaBlocked} className="h-11 px-6 gap-2 disabled:opacity-60">
              <Calculator className="w-4 h-4" /> {submitting ? "CALCULANDO…" : "CALCULAR"}
            </Button>
          </form>
        )}
        {/* Link simétrico al de arriba, para volver a ocultar el buscador
            manual -- solo tiene sentido si hay favoritos para volver a usar. */}
        {showManualAddress && favorites.length > 0 && (
          <button
            type="button"
            onClick={hideManualAddress}
            className="text-xs font-mono text-primary underline underline-offset-2 pl-1 hover:text-primary/80"
          >
            Ocultar y usar una propiedad favorita
          </button>
        )}
        {address.trim() && lat == null && !addressLoading && !showAddressSuggestions && (
          <p className="text-xs font-semibold text-error pl-2">Elegí una dirección de la lista para poder calcular</p>
        )}
      </div>

      {/* Mis lugares: gestión (siempre visible, no depende de haber calculado) */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" style={{ color: CUSTOM_PLACE_COLOR }} /> Mis lugares
            </h3>
            <span className="text-xs font-mono text-on-surface-variant">{customPlaces.length}/{MAX_CUSTOM_PLACES}</span>
          </div>
          <p className="text-xs text-on-surface-variant max-w-2xl font-mono">
            Direcciones que te interesa tener cerca (trabajo, familia, gimnasio…). Se suman al cálculo con el peso y el
            radio de acá abajo, además de las 7 categorías de arriba. Son datos privados y cifrados: solo vos podés verlos.
          </p>

          <div className="space-y-2 max-w-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface font-medium">Cercanía aceptable</span>
              <span className="text-xs font-mono font-bold text-primary">{customPlaceRadiusKm} km</span>
            </div>
            <input
              type="range" min={1} max={3} step={0.5} value={customPlaceRadiusKm}
              onChange={e => setCustomPlaceRadiusKm(Number(e.target.value))}
              className="w-full h-1.5 cursor-pointer"
              style={{ accentColor: CUSTOM_PLACE_COLOR }}
            />
          </div>
          {/* Texto explicativo del radio, afuera del max-w-sm del slider (que
              lo achicaba de más y lo hacía saltar de línea justo a la mitad) --
              acá aprovecha el ancho completo de la card, y además se acortó
              un poco el texto para que entre en un renglón. */}
          <p className="text-xs text-on-surface-variant font-mono">
            Puntaje pleno hasta ~400 m; decae a 0 al llegar a este radio.
          </p>

          {customPlaces.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-on-surface-variant font-mono">
                Elegí cuáles usar en el próximo cálculo y qué tan importante es cada uno
                (por defecto se usan todos, con importancia "Me importa"):
              </p>
              {customPlaces.map(place => {
                const selected = !deselectedPlaceIds.has(place.id);
                const placeWeight = getPlaceWeight(place.id);
                return (
                  <div key={place.id} className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center gap-3 min-w-0 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => togglePlaceSelection(place.id)}
                          className="shrink-0 w-4 h-4 cursor-pointer"
                          style={{ accentColor: CUSTOM_PLACE_COLOR }}
                          aria-label={`Incluir ${place.label} en el cálculo`}
                        />
                        <div className={`min-w-0 ${selected ? "" : "opacity-50"}`}>
                          <p className="text-sm font-bold text-on-surface truncate">{place.label}</p>
                          <p className="text-xs text-on-surface-variant truncate font-mono">{place.address}</p>
                        </div>
                      </label>
                      <button
                        type="button" onClick={() => setPlaceToDelete(place)}
                        className="shrink-0 p-2 rounded-md text-outline hover:text-error hover:bg-error-container/40 transition-colors"
                        aria-label={`Eliminar ${place.label}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Importancia de ESTE lugar en particular -- antes vivía
                        como un único selector global, aparte de la lista
                        (en la tarjeta de preferencias). Deshabilitado si el
                        lugar está destildado: no tiene sentido elegir
                        importancia de algo que no se va a usar en este
                        cálculo. */}
                    <div className={`flex flex-wrap gap-1.5 pl-7 ${selected ? "" : "opacity-40"}`}>
                      {CUSTOM_PLACE_WEIGHT_LEVELS.map(level => {
                        const levelSelected = placeWeight === level.value;
                        return (
                          <button
                            key={level.value}
                            type="button"
                            disabled={!selected}
                            onClick={() => setPlaceWeight(place.id, level.value)}
                            className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors disabled:cursor-not-allowed ${
                              levelSelected
                                ? "text-white border-transparent"
                                : "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container"
                            }`}
                            style={levelSelected ? { backgroundColor: CUSTOM_PLACE_COLOR } : undefined}
                          >
                            {level.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {customPlaces.length < MAX_CUSTOM_PLACES && (
            <form onSubmit={handleAddCustomPlace} className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-outline-variant/50">
              <Input
                value={newPlaceLabel} onChange={e => setNewPlaceLabel(e.target.value)}
                placeholder="Ej: Trabajo, Casa de mis papás" required className="sm:w-52"
              />
              <div className="relative flex-1">
                <Input
                  value={newPlaceAddress} onChange={e => handleNewPlaceAddressInput(e.target.value)}
                  onFocus={() => setShowNewPlaceSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowNewPlaceSuggestions(false), 150)}
                  placeholder="Dirección en CABA" required
                />
                {showNewPlaceSuggestions && (newPlaceLoading || newPlaceSuggestions.length > 0) && (
                  <div className="absolute z-20 top-full mt-1 w-full rounded-md border border-outline-variant bg-surface-container-lowest shadow-lg max-h-56 overflow-y-auto">
                    {newPlaceLoading
                      ? <p className="px-3 py-2 text-xs text-on-surface-variant">Buscando…</p>
                      : newPlaceSuggestions.map(s => (
                        <button key={s.label} type="button" onMouseDown={() => selectNewPlaceSuggestion(s)} className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors border-b border-outline-variant last:border-0">
                          {s.label}
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <Button type="submit" disabled={newPlaceSubmitting} className="gap-2 disabled:opacity-60 shrink-0">
                <Plus className="w-4 h-4" /> Agregar
              </Button>
            </form>
          )}
          {newPlaceAddress.trim() && newPlaceLat == null && !newPlaceLoading && !showNewPlaceSuggestions && (
            <p className="text-xs font-semibold text-error">Elegí una dirección de la lista</p>
          )}
          {newPlaceError && <p className="text-xs font-semibold text-error">{newPlaceError}</p>}
        </CardContent>
      </Card>


      {error && <div className="bg-error-container text-on-error-container text-sm rounded-lg p-3 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{error}</span>
      </div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Preferencias */}
        <Card className="lg:col-span-1">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest flex items-center gap-2 mb-4">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              PREFERENCIA DE ANÁLISIS
            </h3>

            <div className="space-y-3">
              {CATEGORIES.map(item => (
                <div key={item.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface font-medium flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-on-surface-variant" /> {item.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-primary">{weights[item.key]}/5</span>
                  </div>
                  <input
                    type="range" min={1} max={5} step={1} value={weights[item.key]}
                    onChange={e => setWeights(w => ({ ...w, [item.key]: Number(e.target.value) }))}
                    className="w-full h-1.5 accent-[#00647c] cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t border-outline-variant/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface font-medium flex items-center gap-2">
                  <Star className="w-4 h-4 text-on-surface-variant" /> Mis lugares personales
                </span>
              </div>
              {customPlaces.length === 0 ? (
                <p className="text-xs text-on-surface-variant font-mono">
                  Agregá lugares personales más abajo para sumarlos al puntaje.
                </p>
              ) : selectedPlaceCount === 0 ? (
                <p className="text-xs text-on-surface-variant font-mono">
                  Destildaste todos tus lugares — no se van a usar en este cálculo.
                </p>
              ) : (
                <p className="text-xs text-on-surface-variant font-mono">
                  Se van a usar {selectedPlaceCount} de {customPlaces.length} lugares, cada uno con la
                  importancia que le elegiste más abajo, en "Mis lugares".
                </p>
              )}
            </div>

            <Button onClick={() => handleSubmit()} disabled={submitting || quotaBlocked} className="w-full h-11 mt-4 text-base gap-2 disabled:opacity-60">
              <Calculator className="w-5 h-5" />
              {submitting ? "Calculando…" : "Calcular Life Score"}
            </Button>
          </CardContent>
        </Card>

        {/* Columna derecha: mapa (más chico que antes) y, debajo, puntaje +
            explicación -- a pedido de Pili (15/08/2026), para que las tres
            piezas queden agrupadas juntas al lado de las preferencias, en
            vez del mapa grande solo en su propia fila. */}
        <div className="lg:col-span-3 space-y-6">
          {/* Mapa */}
          <Card className="p-2 overflow-hidden bg-surface-container-lowest">
            {/* Capas de entorno: ruido y seguridad se ven sobre el mapa, como en la ficha de
                propiedad. Solo informan; el Life Score se calcula igual con o sin ellas. */}
            {result && <div className="flex flex-wrap items-center gap-2 px-1 pb-2">
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Entorno del mapa</span>
                <LayerToggles env={env} />
              </div>}
            <div className="w-full h-full rounded-lg relative overflow-hidden min-h-[420px]">
              {result ? (
                <MapContainer key={result.id} center={[result.location.lat, result.location.lon]} zoom={15} className="w-full h-full min-h-[420px]">
                  <TileLayer attribution={BASE_TILES.attribution} url={BASE_TILES.url} />
                  <EnvironmentOverlays env={env} />
                  <PoiPane />
                  <FitBounds points={mapPoints} />
                  <RecenterToPropertyControl to={[result.location.lat, result.location.lon]} />
                  <Marker position={[result.location.lat, result.location.lon]} icon={PROPERTY_PIN_ICON} zIndexOffset={1000}>
                    <Popup>{address}</Popup>
                  </Marker>
                  {result.categories.filter(cat => !hiddenCategories.has(cat.category)).flatMap(cat => cat.pois.map((poi, i) => (
                    <CircleMarker
                      key={`${cat.category}-${i}`} center={[poi.lat, poi.lon]} radius={6} pane={POI_PANE}
                      pathOptions={{ color: CATEGORY_COLOR[cat.category], fillColor: CATEGORY_COLOR[cat.category], fillOpacity: 0.7, weight: 1 }}
                    >
                      <Popup>
                        <strong>{poi.name}</strong>
                        <br />
                        {CATEGORIES.find(c => c.key === cat.category)?.label}
                      </Popup>
                    </CircleMarker>
                  )))}
                  {result.customPlaces?.map(place => (
                    <Marker
                      key={`custom-${place.id}`} position={[place.lat, place.lon]} icon={CUSTOM_PLACE_PIN_ICON}
                    >
                      <Popup>
                        <strong>{place.label}</strong>
                        <br />
                        {place.address}
                        <br />
                        {place.distanceM} m · score {place.score}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : null}
              {/* Referencias de las capas de entorno: abajo a la izquierda (los POIs usan la derecha). */}
              {result && <EnvironmentLegend env={env} className="bottom-6 left-3" />}
              {/* Referencia de colores de los circulitos de POIs por categoría
                  (mismo patrón que la leyenda de pines por tasación en
                  MapPage.jsx/Explorar) -- solo tiene sentido una vez que hay
                  un resultado calculado, que es cuando aparecen los POIs. */}
              {result && <div className="absolute bottom-6 right-3 z-[1000] bg-surface-container-lowest/90 backdrop-blur border border-outline-variant p-2.5 rounded-lg shadow-sm space-y-1 text-[10px] font-bold text-on-surface max-h-[85%] overflow-y-auto">
                  {CATEGORIES.map(c => {
                    const hidden = hiddenCategories.has(c.key);
                    const count = result.categories.find(cat => cat.category === c.key)?.poiCount ?? 0;
                    return (
                      <button
                        key={c.key} type="button" onClick={() => toggleCategoryVisibility(c.key)}
                        aria-pressed={!hidden}
                        title={hidden ? `Mostrar ${c.label} en el mapa` : `Ocultar ${c.label} en el mapa`}
                        className={`flex w-full items-center gap-1.5 text-left rounded px-1 py-0.5 hover:bg-surface-container transition-opacity ${hidden ? "opacity-50" : ""}`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 border"
                          style={{ background: hidden ? "transparent" : CATEGORY_COLOR[c.key], borderColor: CATEGORY_COLOR[c.key] }}
                        ></span>
                        <span className={`flex-1 ${hidden ? "line-through" : ""}`}>{c.label}</span>
                        <span className="font-mono font-normal text-on-surface-variant">{count}</span>
                        {hidden ? <EyeOff className="w-3 h-3 shrink-0" /> : <Eye className="w-3 h-3 shrink-0" />}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setHiddenCategories(allCategoriesHidden ? new Set() : new Set(CATEGORIES.map(c => c.key)))}
                    className="w-full pt-1 mt-0.5 border-t border-outline-variant text-center font-bold text-primary hover:underline"
                  >
                    {allCategoriesHidden ? "Mostrar todas" : "Ocultar todas"}
                  </button>
                </div>}
              {!result && (
                <div className="w-full h-full min-h-[420px] bg-[#e5e9f0] flex items-center justify-center">
                  {submitting ? (
                    <NidioLoadingMark phase="loading" size={120} message="Calculando el Life Score…" />
                  ) : (
                    <p className="text-sm font-mono text-on-surface-variant text-center px-8">
                      El mapa con los POIs cercanos aparece acá después de calcular.
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {result && <EnvironmentNote env={env} />}

          {/* Puntaje total + explicación, debajo del mapa. La explicación se
              muestra siempre, con placeholder antes de calcular (mismo
              criterio que ya usan el mapa y el círculo de puntaje), para que
              la fila no quede con un hueco vacío al lado del círculo. */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score */}
            <Card className="flex flex-col items-center justify-center text-center p-5 relative overflow-hidden">
              <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4 z-10">
                PUNTAJE DE UBICACIÓN
              </h3>

              <div className="relative w-32 h-32 mb-3 z-10 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#cfdaf2" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="45" fill="none" stroke={score != null ? scoreColor(score) : "#00647c"} strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - circumference * ((score ?? 0) / 100)}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.6s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold tracking-tighter" style={{ color: score != null ? scoreColor(score) : "#00647c" }}>
                    {score != null ? Math.round(score) : "—"}
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant mt-0.5">pts / 100</span>
                </div>
              </div>

              {score != null ? (
                <>
                  <Badge variant="outline" className="mb-2 font-bold tracking-widest px-4 py-1.5 z-10" style={{ color: scoreColor(score), borderColor: `${scoreColor(score)}55` }}>
                    NIVEL: {scoreLabel(score)}
                  </Badge>
                  <p className="text-sm font-mono text-on-surface-variant max-w-[250px] z-10">
                    {address}
                  </p>
                </>
              ) : (
                <p className="text-sm font-mono text-on-surface-variant max-w-[250px] z-10">
                  Ingresá una dirección y calculá el score para ver el resultado.
                </p>
              )}
            </Card>

            {/* Explicación del puntaje: la frase que arma el backend (LifeScoreService.buildExplanation) y, debajo,
                el desglose en barras -- el total es un promedio ponderado, así que cuánto aporta cada categoría
                se puede calcular exacto con los pesos y puntajes que ya vienen en el resultado. */}
            <Card className="lg:col-span-2">
              <CardContent className="p-5 flex items-start gap-3 h-full">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest mb-2">
                      ¿Por qué este puntaje?
                    </h3>
                    {!result && <p className="text-sm text-on-surface-variant">
                        Calculá el score para ver acá el detalle de por qué dio ese resultado.
                      </p>}
                  </div>
                  {result && <ScoreBreakdown
                      result={result}
                      placeWeights={resultMeta.placeWeights}
                      radiusKm={resultMeta.radiusKm}
                      categoryMeta={CATEGORIES.map(c => ({ ...c, color: CATEGORY_COLOR[c.key] }))}
                      placeColor={CUSTOM_PLACE_COLOR}
                      fallback={result.explanation}
                    />}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* POIs por categoría */}
      {result && <div className="space-y-4 pt-4">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold text-on-surface">Puntos de Interés Cercanos</h2>
          <p className="text-sm text-on-surface-variant font-mono">
            {result.categories.reduce((acc, c) => acc + c.poiCount, 0)} POIs en ~800 m
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {result.categories.filter(c => c.poiCount > 0).map(cat => {
            const meta = CATEGORIES.find(c => c.key === cat.category);
            const color = CATEGORY_COLOR[cat.category];
            return (
              <Card key={cat.category} className="border-t-4" style={{ borderTopColor: color }}>
                <CardContent className="p-6 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4" style={{ color }}>
                    <meta.icon className="w-4 h-4" /> {meta.label} ({cat.poiCount})
                  </h4>

                  <div className="space-y-4">
                    {cat.pois.slice(0, 4).map((poi, i) => (
                      <div key={i} className="flex justify-between items-start border-b border-outline-variant/30 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-sm text-on-surface">{poi.name}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5 font-mono">
                            {poi.lat.toFixed(4)}, {poi.lon.toFixed(4)}
                          </p>
                        </div>
                        <Badge variant="good" className="bg-primary/5 text-primary shrink-0">
                          Peso {cat.weight}
                        </Badge>
                      </div>
                    ))}
                    {cat.pois.length > 4 && <p className="text-xs text-on-surface-variant font-mono">
                      + {cat.pois.length - 4} más en el mapa
                    </p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>}

      <ConfirmDialog
        open={!!placeToDelete}
        title="Eliminar lugar"
        description={placeToDelete ? `¿Eliminar "${placeToDelete.label}" de tus lugares personales?` : ""}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={confirmDeletePlace}
        onCancel={() => setPlaceToDelete(null)}
      />
    </div>
  );
}
