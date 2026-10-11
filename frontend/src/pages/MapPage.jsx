import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, GeoJSON, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { Search, MapPin, Building2, ChevronDown, SlidersHorizontal, List, X, Home, CheckCircle2, AlertTriangle, Info, Layers } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice, formatPriceShort, formatNumber } from "@/lib/format";
import { useBlueRate } from "@/lib/blueRate";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { NidioLoadingMark } from "@/components/ui/NidioLoadingMark";
import {
  filterProperties, countActiveFilters, buildFilterQueryString, fetchAllProperties,
  ROOMS_OPTIONS, BATHROOMS_OPTIONS, AGE_OPTIONS, PUBLISHER_TYPE_OPTIONS, ORIENTATION_OPTIONS, AMENITY_OPTIONS, NO_AMENITIES, toggleAmenityTag } from "@/lib/propertyFilters";
import { cn } from "@/lib/utils";
import { BASE_TILES } from "@/lib/mapTiles";
import { NoiseStreetsLayer, useNoiseCuts } from "@/components/map/NoiseStreetsLayer";
import { OverlayLabels } from "@/components/map/OverlayLabels";
import { MAP_LEVEL_COLORS, noiseLegend } from "@/lib/environment";

const PROPERTY_TYPE_OPTIONS = [["", "Todos los tipos"], ["APARTMENT", "Departamento"], ["HOUSE", "Casa"], ["PH", "PH"]];

// Centro aproximado de CABA (lat, lon).
const CABA_CENTER = [-34.605, -58.43];
// Leaflet ya mueve el mapa solo para que el popup no quede tapado por el
// borde del contenedor, pero no sabe que la barra de búsqueda/filtros
// (arriba a la izquierda, fuera del control de Leaflet) también tapa. Con
// este padding reservamos esa zona: si el popup caería ahí, el mapa se
// corre para dejarlo visible al lado.
const POPUP_OPTIONS = { autoPanPaddingTopLeft: L.point(480, 170), autoPanPaddingBottomRight: L.point(20, 20) };
// Mismo criterio y estilos que el ValuationBadge de PropertyDetail.jsx (y el
// ResultBadge de Valuacion.jsx), para que la clasificación se vea igual en
// toda la app -- acá para la ficha flotante de la propiedad tocada en el mapa.
function ValuationBadge({ result }) {
  if (result === "FAIR") {
    return <Badge variant="good" className="bg-good-value/5 gap-1 border border-good-value/20">
        <CheckCircle2 className="w-3 h-3" /> EN RANGO
      </Badge>;
  }
  if (result === "OVERVALUED") {
    return <Badge variant="alert" className="gap-1">
        <AlertTriangle className="w-3 h-3" /> SOBREVALUADA
      </Badge>;
  }
  if (result === "UNDERVALUED") {
    return <Badge variant="secondary" className="bg-secondary/10 text-secondary gap-1 border border-secondary/20">
        <Info className="w-3 h-3" /> SUBVALUADA
      </Badge>;
  }
  return null;
}
// Percentil de "value" dentro de "sorted" (0 = el más bajo, 1 = el más
// alto), contando empates como medio punto. Se usa en vez de interpolación
// lineal min-max para el color de precio: si uno o dos barrios (ej. Puerto
// Madero) son mucho más caros que el resto, una escala lineal los estira a
// ellos y comprime a todos los demás en un rango angosto (se ven casi
// iguales); por percentil, los barrios se reparten parejo en toda la
// paleta de colores sin importar cuán salteados estén los valores.
function percentileRank(value, sorted) {
  if (sorted.length < 2) return 0.5;
  let lower = 0;
  let equal = 0;
  for (const v of sorted) {
    if (v < value) lower++;
    else if (v === value) equal++;
  }
  return (lower + equal / 2) / (sorted.length - 1);
}
function priceColor(t) {
  // "Mapa de calor" de precio, en dos tramos (amarillo→naranja→rojo) en
  // vez de un solo degradé: así el naranja queda como una franja intermedia
  // bien visible en vez de perderse, y la mitad de arriba (los barrios más
  // caros, que es donde más barrios se amontonan) tiene su propio tramo
  // completo de hue + luminosidad para diferenciarse en vez de verse todos
  // del mismo rojo.
  if (t < 0.5) {
    const s = t / 0.5;
    const hue = 50 - 20 * s; // amarillo -> naranja
    const lightness = 64 - 12 * s;
    return `hsl(${hue}, 95%, ${lightness}%)`;
  }
  const s = ((t - 0.5) / 0.5) ** 1.3;
  const hue = 30 - 30 * s; // naranja -> rojo (no baja de hue 0: pasarse se ve bordó)
  const lightness = 52 - 16 * s;
  return `hsl(${hue}, 95%, ${lightness}%)`;
}
function securityColor(value, min, max) {
  // Rojo (peligroso) a verde (seguro), estilo semáforo.
  const t = max > min ? (value - min) / (max - min) : 0.5;
  const hue = 140 * t;
  const lightness = 42 + 8 * t;
  return `hsl(${hue}, 80%, ${lightness}%)`;
}
// Saca acentos para poder comparar "Nunez" con "Núñez" al buscar.
function normalizeText(value) {
  return (value ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
// Si lo que se busca matchea un único barrio (por nombre), acerca el mapa a
// su polígono. Con término ambiguo (ej. "villa", que matchea varios barrios)
// no hace nada, para no saltar a uno al azar.
function SearchFlyTo({ search, geoSource }) {
  const map = useMap();
  useEffect(() => {
    const term = normalizeText(search.trim());
    if (term.length < 3 || !geoSource?.features?.length) return;
    const matches = geoSource.features.filter(f => normalizeText(f.properties.neighborhoodName).includes(term));
    if (matches.length !== 1) return;
    const bounds = L.geoJSON(matches[0].geometry).getBounds();
    if (bounds.isValid()) {
      map.flyToBounds(bounds, {
        padding: [40, 40],
        duration: 0.75
      });
    }
  }, [search, geoSource, map]);
  return null;
}
// Avisa al padre el recuadro visible del mapa (al cargar, al mover y al hacer
// zoom) para que el listado de abajo muestre solo lo que está a la vista.
function MapViewportSync({ onBoundsChange }) {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds()),
    zoomend: () => onBoundsChange(map.getBounds())
  });
  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);
  return null;
}
// Leaflet calcula el tamaño de los tiles una sola vez al montar el mapa. Si
// el contenedor todavía no había terminado de asentar su tamaño final en ese
// momento (layouts con flexbox/alturas calculadas, como esta página), el
// mapa queda "cortado" — se ve solo una franja de tiles aunque la caja sea
// más grande — hasta que algo dispara un recalculo. invalidateSize() fuerza
// ese recalculo al montar.
// Antes solo escuchaba el evento "resize" de la ventana, pero cerrar/abrir
// el menú lateral no dispara ese evento (la ventana no cambia de tamaño,
// solo el ancho disponible para el mapa) — el mapa quedaba con el recorte
// viejo. Un ResizeObserver sobre el contenedor del mapa reacciona a
// cualquier cambio de tamaño, venga de donde venga.
function MapInvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const id = requestAnimationFrame(invalidate);
    const observer = new ResizeObserver(invalidate);
    observer.observe(map.getContainer());
    return () => {
      cancelAnimationFrame(id);
      observer.disconnect();
    };
  }, [map]);
  return null;
}
// Botón para volver al centro/zoom inicial de CABA (mismos valores que
// center/zoom del MapContainer más abajo).
// Antes se armaba como un L.Control propio (su propia caja "leaflet-bar"
// aparte, solo con este botón adentro). Leaflet apila cajas de controles
// distintas con un margen entre ellas, así que en vez de pegarse a los
// botones +/- nativos quedaba flotando suelto un poco más abajo -- y al ser
// una caja con su propio CSS (no exactamente el de "leaflet-bar a" que
// dimensiona los botones nativos) el ícono también quedaba corrido dentro
// del cuadradito. Se soluciona insertando el link directamente DENTRO del
// contenedor del control de zoom nativo (map.zoomControl), como tercer
// botón de la misma barra, después del "-": mismo box-model que +/- (26x26,
// separador incluido), pegado justo debajo, sin caja propia.
function RecenterControl() {
  const map = useMap();
  useEffect(() => {
    const zoomContainer = map.zoomControl?.getContainer();
    if (!zoomContainer) return;
    const link = L.DomUtil.create("a", "", zoomContainer);
    link.href = "#";
    link.title = "Centrar en CABA";
    link.setAttribute("aria-label", "Centrar en CABA");
    link.setAttribute("role", "button");
    // Ícono "crosshair" (mismo estilo que los íconos de lucide-react del
    // resto de la app: trazo, sin relleno) dibujado a mano en vez de
    // importar el componente de React -- acá el contenido lo arma Leaflet
    // con HTML plano, no JSX. display:flex + width/height 100% para
    // centrarlo bien dentro del botón de 26x26 (línea/altura del texto de
    // "leaflet-bar a" no centra un SVG solo con margin:auto).
    // viewBox 0 0 16 16 (antes 0 0 24 24, con width/height=14 -- el
    // navegador tenía que reescalarlo con un factor no entero, 14/24, y el
    // trazo de 2px quedaba borroso/antialiaseado). Con el viewBox del mismo
    // tamaño que el ancho/alto real no hace falta reescalar nada, así que
    // el trazo queda nítido, igual de nítido que el "+"/"−" nativos.
    link.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><line x1="1" y1="8" x2="3" y2="8"/><line x1="13" y1="8" x2="15" y2="8"/><line x1="8" y1="1" x2="8" y2="3"/><line x1="8" y1="13" x2="8" y2="15"/><circle cx="8" cy="8" r="4.25"/></svg>';
    link.style.display = "flex";
    link.style.alignItems = "center";
    link.style.justifyContent = "center";
    L.DomEvent.disableClickPropagation(link);
    L.DomEvent.on(link, "click", e => {
      L.DomEvent.preventDefault(e);
      map.flyTo(CABA_CENTER, 12, { duration: 0.75 });
    });
    return () => L.DomUtil.remove(link);
  }, [map]);
  return null;
}
// Mismo criterio que PropertyDetail.jsx: property.valuation SIEMPRE viene en
// USD (venta y alquiler por igual), así que para compararlo contra el precio
// de un alquiler (en ARS) hay que convertir primero con el dólar blue. Sin
// cotización todavía, o sin rango de tasación cacheado, no se arriesga
// ningún color (null = "sin dato", el pin usa el celeste por defecto).
function valuationStatus(property, blueRate) {
  if (!property.valuation) return null;
  const priceUsd = property.operationType === "RENT" ? (blueRate ? property.price / blueRate : null) : property.price;
  if (priceUsd == null) return null;
  if (priceUsd < property.valuation.min) return "UNDERVALUED";
  if (priceUsd > property.valuation.max) return "OVERVALUED";
  return "FAIR";
}
// Clase de color del pill/punto según la tasación: mismo criterio que
// ValuationBadge (PropertyDetail.jsx/Valuacion.jsx) para que el color
// signifique lo mismo en toda la app. Subvaluada se deja sin clase extra:
// usa el celeste "primary" que ya tenían todos los pills antes de este
// cambio (ver .price-pill en index.css).
function valuationPillClass(status) {
  if (status === "OVERVALUED") return " price-pill--overvalued";
  if (status === "FAIR") return " price-pill--fair";
  return "";
}
// Pines de propiedades: van en un componente propio (en vez de mapearse
// directo en el JSX de MapPage) para poder usar useMap y centrar el mapa en
// la propiedad tocada — así el listado de abajo, que se filtra por el
// recuadro visible, se actualiza mostrando las propiedades cercanas a esa.
// En celular (< 640px) con el mapa alejado (zoom < 13) los pills de precio
// se encimaban y tapaban todo el mapa: ahí se muestra solo el punto de
// color (un poco más grande para que se pueda tocar). Desde zoom 13 (un paso de zoom desde la vista inicial), o
// en la propiedad seleccionada, vuelve el pill con el precio. En tablet y
// compu no cambia nada.
const COMPACT_PINS_MAX_WIDTH = 640;
const COMPACT_PINS_MAX_ZOOM = 13;
function PropertyMarkersLayer({ properties, locations, selectedId, onSelect, blueRate }) {
  const map = useMapEvents({
    zoomend: () => setZoom(map.getZoom())
  });
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [isSmallScreen, setIsSmallScreen] = useState(() => window.innerWidth < COMPACT_PINS_MAX_WIDTH);
  useEffect(() => {
    const onResize = () => setIsSmallScreen(window.innerWidth < COMPACT_PINS_MAX_WIDTH);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const compactPins = isSmallScreen && zoom < COMPACT_PINS_MAX_ZOOM;
  return properties.map(p => {
    const loc = locations[p.id];
    if (!loc) return null;
    const handleSelect = () => {
      onSelect(p.id);
      map.flyTo([loc.lat, loc.lon], Math.max(map.getZoom(), 15), {
        duration: 0.5
      });
    };
    // El precio se muestra como un pill de HTML dentro de un Marker (en vez
    // de un CircleMarker + Tooltip "permanent"): un Tooltip no es un target
    // interactivo real de Leaflet, así que los clicks sobre el texto se le
    // escapaban al mapa y solo el puntito de abajo respondía. Con un
    // divIcon el pill ES el marker, entonces cualquier click sobre lo que
    // se ve abre la propiedad.
    // Color según tasación: sobrevaluada en rojo, en rango en verde,
    // subvaluada en el celeste de siempre (ver valuationPillClass arriba).
    // El estado "seleccionado" (dorado) pisa a cualquiera de los tres.
    const status = valuationStatus(p, blueRate);
    const statusClass = valuationPillClass(status);
    const isSelected = p.id === selectedId;
    const icon = compactPins && !isSelected ? L.divIcon({
      className: "price-pill-icon",
      html: `<div class="price-dot price-dot--compact${statusClass ? statusClass.replace("price-pill", "price-dot") : ""}"></div>`,
      iconSize: null,
      iconAnchor: [0, 0]
    }) : L.divIcon({
      className: "price-pill-icon",
      html: `<div class="price-pill${statusClass}${p.id === selectedId ? " price-pill--selected" : ""}">${formatPriceShort(p.price, p.operationType)}</div><div class="price-dot${statusClass}${p.id === selectedId ? " price-dot--selected" : ""}"></div>`,
      iconSize: null,
      iconAnchor: [0, 0]
    });
    return <Marker key={p.id} position={[loc.lat, loc.lon]} icon={icon} eventHandlers={{
      click: handleSelect
    }} />;
  });
}

// Grupo del panel "Capas del mapa": título corto + aclaración de qué pinta.
function LayerGroup({ title, hint, children }) {
  return <div className="space-y-1.5">
      <div>
        <p className="text-on-surface">{title}</p>
        <p className="text-[10px] font-normal text-on-surface-variant">{hint}</p>
      </div>
      {children}
    </div>;
}

// Selector de una opción entre pocas (botones pegados, la elegida resaltada).
// options: [valor, texto, Icono?]
function Segmented({ value, onChange, options }) {
  return <div className="flex gap-0.5 rounded-lg bg-surface-dim p-0.5" role="group">
      {options.map(([optionValue, label, Icon]) => <button
          key={optionValue}
          type="button"
          aria-pressed={value === optionValue}
          onClick={() => onChange(optionValue)}
          className={cn("flex-1 inline-flex min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-md px-1 py-1.5 text-[11px] transition-colors", value === optionValue ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface")}>
          {Icon && <Icon className="w-3 h-3" aria-hidden="true" />} {label}
        </button>)}
    </div>;
}

export default function MapPage() {
  const [layer, setLayer] = useState("price");
  // Interruptor general: muestra/oculta la superposición de color de la capa
  // activa (barrios), sin tocar el mapa base ni los pines de propiedades.
  const [showColorLayer, setShowColorLayer] = useState(false);
  // Capas que se combinan con el relleno de barrios (precios o seguridad): ruido por
  // calle (de día o de noche, una a la vez) y los pines de propiedades. Cada una se
  // prende y apaga sola, así se pueden solapar (ej. seguridad + ruido de noche + pines).
  const [noisePeriod, setNoisePeriod] = useState(null);
  const [showPins, setShowPins] = useState(true);
  const noiseCuts = useNoiseCuts(Boolean(noisePeriod));
  // Solo celular: leyenda de colores de los pines desplegada o no.
  const [legendOpen, setLegendOpen] = useState(false);
  // Panel "Capas del mapa" y referencias de color (leyenda): se pliegan para no tapar el mapa.
  // El panel arranca abierto en pantallas grandes y cerrado en celular/tablet.
  const [layersOpen, setLayersOpen] = useState(() => typeof window === "undefined" || window.innerWidth >= 1024);
  const [referencesOpen, setReferencesOpen] = useState(true);
  // Para colorear los pines según tasación (ver valuationStatus): un
  // alquiler tiene el precio en ARS, y hay que convertirlo a USD para
  // compararlo contra el rango tasado.
  const { blueRate } = useBlueRate();
  const [operationType, setOperationType] = useState("SALE");
  // Ambientes/condición son los ejes reales en los que IDECBA publica el
  // precio (no hay una serie única "precio/m² del barrio"), pero no se
  // exponen como filtro en el mapa: se fija 2 ambientes/usado (el segmento
  // más publicado) como valor representativo del barrio.
  const rooms = 2;
  const condition = "USED";
  const [priceData, setPriceData] = useState(null);
  const [noiseData, setNoiseData] = useState(null);
  const [securityData, setSecurityData] = useState(null);
  // Contorno de toda CABA (unión de los barrios, la calcula el backend con
  // JTS/PostGIS -- ver NeighborhoodService.getCabaBoundary). Es geometría de
  // referencia fija, no depende de ningún filtro: se pide una sola vez.
  const [cabaBoundary, setCabaBoundary] = useState(null);
  const [propertyType, setPropertyType] = useState("");
  const [properties, setProperties] = useState([]);
  const [locations, setLocations] = useState({});
  // Para mostrar el logo de Nidio "llenándose" sobre el mapa mientras se
  // trae el catálogo completo (ver efecto de fetchAllProperties más abajo) --
  // a pedido de Pili, mismo componente que ya usa la pantalla de Publicar.
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  // Si se llega desde el buscador de Inicio (/mapa?search=...), arranca con
  // ese término ya cargado.
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  // "Más filtros": todo esto filtra client-side sobre lo que ya está
  // cargado (ver visibleProperties más abajo), igual que la búsqueda de
  // texto — no pega contra el backend de nuevo.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minRooms, setMinRooms] = useState(0);
  const [minBathrooms, setMinBathrooms] = useState(0);
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [publisherTypeFilter, setPublisherTypeFilter] = useState("");
  const [orientationFilter, setOrientationFilter] = useState([]);
  const [amenityFilter, setAmenityFilter] = useState([]);
  const [amenityInput, setAmenityInput] = useState("");
  // Propiedad seleccionada en el mapa: se muestra como card flotante tipo
  // Zillow (foto grande, precio, dirección) en vez de un popup chico.
  const [selectedId, setSelectedId] = useState(null);
  // Recuadro visible del mapa: el listado de abajo se filtra con esto para
  // mostrar solo propiedades cercanas a lo que se está viendo.
  const [mapBounds, setMapBounds] = useState(null);
  // El panel inferior de "Propiedades cerca" arranca oculto: el mapa se ve
  // solo, a pantalla completa. Se muestra recién cuando la persona lo pide
  // (tocando el botón flotante que aparece al buscar/hacer zoom a un
  // barrio), no automáticamente.
  const [showNearbyPanel, setShowNearbyPanel] = useState(false);
  // La línea/handle del panel "Propiedades cerca" lo agranda un poco (más
  // filas visibles, en vez de una sola tira que scrollea de costado).
  const [nearbyPanelExpanded, setNearbyPanelExpanded] = useState(false);
  useEffect(() => {
    setShowNearbyPanel(false);
    setNearbyPanelExpanded(false);
  }, [search]);
  useEffect(() => {
    api.get("/api/heatmaps/price", {
      params: {
        operationType,
        rooms,
        // Alquiler solo existe como "usado" en IDECBA: se fuerza acá para no
        // depender de que el usuario haya dejado el selector en el valor
        // correcto al cambiar de Venta a Alquiler.
        condition: operationType === "RENT" ? "USED" : condition
      }
    }).then(res => setPriceData(res.data)).catch(() => setPriceData(null));
  }, [operationType, rooms, condition]);
  useEffect(() => {
    api.get("/api/heatmaps/noise").then(res => setNoiseData(res.data)).catch(() => {});
    api.get("/api/heatmaps/security").then(res => setSecurityData(res.data)).catch(() => {});
  }, []);
  useEffect(() => {
    api.get("/api/neighborhoods/boundary").then(res => setCabaBoundary(res.data)).catch(() => setCabaBoundary(null));
  }, []);
  useEffect(() => {
    // El mapa necesita el catálogo completo (para no dejar barrios sin pin),
    // no una página — se recorren todas las páginas que haga falta en vez de
    // fijar un tamaño de página arbitrario que se puede quedar corto a medida
    // que crece el catálogo de propiedades.
    const baseParams = {
      operationType,
      // "" (Todos los tipos) no debe mandarse como filtro: el backend
      // interpreta la ausencia del param como "sin filtrar por tipo".
      ...(propertyType ? { propertyType } : {})
    };
    setPropertiesLoading(true);
    fetchAllProperties(api, baseParams).then(async allContent => {
      setProperties(allContent);
      // El listado no trae lat/lon: se piden los detalles para ubicar los pins.
      const details = await Promise.allSettled(allContent.map(p => api.get(`/api/properties/${p.id}`)));
      const locs = {};
      for (const d of details) {
        if (d.status === "fulfilled") {
          locs[d.value.data.id] = {
            lat: d.value.data.location.lat,
            lon: d.value.data.location.lon,
            address: d.value.data.address
          };
        }
      }
      setLocations(locs);
    }).catch(() => setProperties([])).finally(() => setPropertiesLoading(false));
  }, [operationType, propertyType]);
  useEffect(() => {
    // Si cambia el filtro, la propiedad seleccionada puede ya no estar en el
    // listado — se cierra la card para no dejarla mostrando datos viejos.
    setSelectedId(null);
  }, [operationType, propertyType]);
  useEffect(() => {
    // Si el mapa de calor está prendido, los pines de propiedades quedan
    // ocultos (ver el render de CircleMarker más abajo) — así que si el
    // usuario busca algo, no vería el resultado. Al escribir se apaga solo
    // para que la propiedad buscada aparezca en el mapa.
    if (search.trim()) {
      setShowColorLayer(false);
    }
  }, [search]);
  // Nombre del barrio que matchea la búsqueda (mismo criterio que
  // SearchFlyTo: solo si hay un único match, para no resaltar cualquier
  // cosa con un término ambiguo como "villa"). Se usa para dibujarle un
  // borde grueso al polígono, además de acercar el mapa.
  const searchedNeighborhoodName = useMemo(() => {
    const geoSource = priceData ?? noiseData ?? securityData;
    const term = normalizeText(search.trim());
    if (term.length < 3 || !geoSource?.features?.length) return null;
    const matches = geoSource.features.filter(f => normalizeText(f.properties.neighborhoodName).includes(term));
    return matches.length === 1 ? matches[0].properties.neighborhoodName : null;
  }, [search, priceData, noiseData, securityData]);
  // Geometría del barrio buscado, para dibujarle el contorno grueso aparte
  // (ver capa "Borde del barrio buscado" más abajo).
  const searchedNeighborhoodFeature = useMemo(() => {
    if (!searchedNeighborhoodName) return null;
    const geoSource = priceData ?? noiseData ?? securityData;
    return geoSource?.features?.find(f => f.properties.neighborhoodName === searchedNeighborhoodName) ?? null;
  }, [searchedNeighborhoodName, priceData, noiseData, securityData]);
  const [minPrice, maxPrice] = useMemo(() => {
    const values = priceData?.features.map(f => f.properties.avgPriceM2) ?? [];
    return values.length ? [Math.min(...values), Math.max(...values)] : [0, 1];
  }, [priceData]);
  // Ordenado para calcular percentiles (ver percentileRank): así el color
  // de cada barrio depende de su posición relativa entre todos los demás,
  // no de una interpolación lineal entre el mínimo y el máximo absolutos.
  const sortedPrices = useMemo(() => (priceData?.features.map(f => f.properties.avgPriceM2) ?? []).slice().sort((a, b) => a - b), [priceData]);
  const [minSecurity, maxSecurity] = useMemo(() => {
    const values = securityData?.features.map(f => f.properties.securityIndex) ?? [];
    return values.length ? [Math.min(...values), Math.max(...values)] : [0, 100];
  }, [securityData]);
  const activeFilters = { minRooms, minBathrooms, priceFrom, priceTo, ageFilter, publisherType: publisherTypeFilter, orientations: orientationFilter, amenities: amenityFilter };
  const activeFilterCount = countActiveFilters(activeFilters);
  // Búsqueda por palabras (no por frase exacta): "depto palermo" separa en
  // ["depto", "palermo"] y una propiedad matchea si CADA palabra aparece en
  // algún lado (barrio, título, dirección, ambientes o descripción libre,
  // donde suelen mencionarse cosas como "pileta" o "cochera") — no hace
  // falta que las palabras estén juntas ni en ese orden. Se combina con el
  // resto de "Más filtros" (ambientes, baños, precio, antigüedad, tipo de
  // anunciante, orientación).
  const visibleProperties = filterProperties(properties, { search, ...activeFilters });
  // Si hay cualquier filtro activo (texto o "Más filtros"), el panel de
  // abajo no se restringe al recuadro visible del mapa (ver nearbyProperties).
  const hasActiveSearch = search.trim().length > 0 || activeFilterCount > 0;
  const listingQueryString = buildFilterQueryString({ operationType, propertyType, search, ...activeFilters });
  const selectedProperty = useMemo(() => properties.find(p => p.id === selectedId) ?? null, [properties, selectedId]);
  const selectedLocation = selectedId ? locations[selectedId] : null;
  // Mismo cálculo que colorea los pines (ver valuationStatus más arriba),
  // para la ficha flotante de la propiedad tocada.
  const selectedValuationStatus = selectedProperty ? valuationStatus(selectedProperty, blueRate) : null;
  // Propiedades para el panel de abajo: si ya se conoce el recuadro visible
  // del mapa, se filtra a las que caen ahí dentro (se actualiza solo al
  // mover/hacer zoom, o al tocar un pin que recentra el mapa) y se ordenan
  // por cercanía al centro. Antes de tener el recuadro (primer render) se
  // muestran todas para no arrancar con el panel vacío.
  const nearbyProperties = useMemo(() => {
    if (!mapBounds) return visibleProperties;
    // Con una búsqueda activa no se restringe al recuadro visible: el
    // usuario está buscando algo puntual (ej. "pileta palermo"), no
    // explorando la zona actual del mapa — mostrar todas las coincidencias,
    // aunque estén fuera de lo que se ve ahora, ordenadas por cercanía al
    // centro como referencia.
    const withLocation = hasActiveSearch
      ? visibleProperties.filter(p => locations[p.id])
      : visibleProperties.filter(p => {
          const loc = locations[p.id];
          return loc && mapBounds.contains([loc.lat, loc.lon]);
        });
    const center = mapBounds.getCenter();
    return withLocation.sort((a, b) => {
      const la = locations[a.id];
      const lb = locations[b.id];
      const da = (la.lat - center.lat) ** 2 + (la.lon - center.lng) ** 2;
      const db = (lb.lat - center.lat) ** 2 + (lb.lon - center.lng) ** 2;
      return da - db;
    });
  }, [visibleProperties, locations, mapBounds, hasActiveSearch]);

  function onEachPriceFeature(feature, mapLayer) {
    const props = feature.properties;
    // IDECBA publica venta en USD/m² pero alquiler como precio total del
    // depto (no hay serie de alquiler por m²) — la unidad y el pill cambian
    // según eso, no es solo un cambio de moneda.
    const unit = operationType === "SALE" ? "USD/m²" : "ARS/mes";
    // Solo popup al click (igual que Ruido/Seguridad): sin etiqueta
    // permanente sobre el polígono, para no saturar el mapa con un pill por
    // barrio.
    mapLayer.bindPopup(`<strong>${props.neighborhoodName}</strong><br/>` + `${formatNumber(props.avgPriceM2)} ${unit}`, POPUP_OPTIONS);
  }
  function onEachSecurityFeature(feature, mapLayer) {
    const props = feature.properties;
    const barrio = props.neighborhoodName ? `<strong>${props.neighborhoodName}</strong><br/>` : "";
    mapLayer.bindPopup(`${barrio}Índice de seguridad: <strong>${props.securityIndex}/100</strong><br/>Incidentes/año: ${props.crimeCount}`, POPUP_OPTIONS);
  }
  // Chip de "Características": clickear un tag lo prende/apaga (comparación
  // case-insensitive para no duplicar "Cochera" con "cochera" si se escribe
  // a mano el mismo tag que ya está en AMENITY_OPTIONS).
  function toggleAmenity(tag) {
    setAmenityFilter(list => toggleAmenityTag(list, tag));
  }
  function addCustomAmenity(e) {
    e.preventDefault();
    const tag = amenityInput.trim();
    if (!tag) return;
    if (!amenityFilter.some(t => t.toLowerCase() === tag.toLowerCase())) {
      setAmenityFilter(list => [...list.filter(t => t !== NO_AMENITIES), tag]);
    }
    setAmenityInput("");
  }
  // Tags sueltos que la persona escribió a mano y no están entre los chips
  // predefinidos — esos sí necesitan su propio chip removible, los
  // predefinidos ya muestran su estado prendido/apagado en el botón.
  const customAmenities = amenityFilter.filter(t => t !== NO_AMENITIES && !AMENITY_OPTIONS.some(o => o.toLowerCase() === t.toLowerCase()));

  // Antes ruido y seguridad tenían el relleno de color forzado (colorVisible
  // hardcodeado en true), ignorando el switch — al cambiar de pestaña el
  // control de "Mapa de calor" ni se mostraba, así que no había forma de
  // apagarlo ahí. Ahora el switch manda por igual en las tres capas.
  const colorVisible = showColorLayer;
  // Alto fijo (100% del contenedor) en vez de h-full "libre": el mapa está
  // pensado como una vista "tipo Google Maps" a pantalla completa, con el
  // panel de propiedades cercanas flotando ENCIMA (absolute bottom-0). Con
  // h-full "normal" agregar el Footer debajo (en flujo normal, no flotante)
  // le robaba altura al mapa para hacerle lugar, achicándolo mucho. Con un
  // alto fijo, el mapa mantiene su tamaño completo de siempre y el Footer
  // queda alcanzable haciendo scroll hacia abajo (igual que en cualquier
  // otra página) en vez de asomar solo. Antes esto restaba "4rem" a mano
  // para descontar la vieja barra superior blanca de MainLayout — al
  // sacarse esa barra, ese descuento quedaba como una franja en blanco
  // fija de 64px al pie (el Footer asomando sin necesidad de scrollear).
  return <div className="h-full shrink-0 flex flex-col relative animate-in fade-in duration-500">
      {/* Barra superior: tabs Alquilar/Comprar + buscador (tipo de propiedad,
          texto libre y botón Buscar). Sin pestaña de "Emprendimientos": Nidio
          no tiene ese tipo de listado. */}
      {/* z-[1200], por encima del panel inferior de "Propiedades cerca"
          (z-[1000]): antes, con el mismo z-index, el panel de "Más filtros"
          quedaba tapado por ese panel cuando crecía hacia abajo (ver
          Antigüedad/Tipo de anunciante cortados). También más ancha
          (max-w-2xl en vez de max-w-xl) para que entren más controles sin
          amontonarse. */}
      {/* Responsive: en celular/tablet ocupa todo el ancho (con margen de 12px
          a cada lado); desde lg vuelve a la caja de max-w-2xl arriba a la
          izquierda. Entre lg y xl (compu chica con el menú abierto) se le deja
          lugar a la derecha a los chips de Publicar/perfil y a los controles
          de capas, que si no quedaban tapados por el buscador. */}
      <div className="absolute top-3 left-3 right-3 lg:top-6 lg:left-6 lg:right-[18.5rem] xl:right-auto xl:w-full z-[1200] max-w-2xl">
        <div className="bg-surface-container-lowest rounded-t-xl shadow-lg border border-outline-variant border-b-0 px-4 pt-3 flex gap-6">
          {[["RENT", "Alquilar"], ["SALE", "Comprar"]].map(([op, label]) => <button key={op} onClick={() => setOperationType(op)} className={cn("pb-3 text-sm font-bold border-b-2 transition-colors", operationType === op ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface")}>
              {label}
            </button>)}
        </div>
        <div className="bg-surface-container-lowest rounded-b-xl rounded-tr-xl shadow-lg border border-outline-variant p-2 flex gap-2 min-w-0">
          <div className="relative">
            <select value={propertyType} onChange={e => setPropertyType(e.target.value)} aria-label="Tipo de propiedad" className="h-10 max-w-[7.5rem] sm:max-w-none pl-3 pr-8 rounded-md border border-outline-variant bg-transparent text-sm font-bold text-on-surface appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              {PROPERTY_TYPE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-outline pointer-events-none" />
          </div>
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-outline" />
            <Input type="text" placeholder="Barrio, dirección, ambientes, pileta, cochera..." className="pl-10 pr-9" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Borrar búsqueda" className="absolute right-2.5 top-2.5 text-outline hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>}
          </div>
          {/* La búsqueda ya es instantánea (filtra a medida que se escribe);
              el botón queda como confirmación visual, no dispara nada extra. */}
          {/* En celular se oculta (no dispara nada extra, ver arriba) para
              dejarle lugar al campo de texto. */}
          <Button className="gap-2 hidden sm:inline-flex lg:hidden xl:inline-flex">
            <Search className="w-4 h-4" /> Buscar
          </Button>
          <Button type="button" variant="outline" aria-label="Más filtros" className="gap-2 relative shrink-0 px-3 sm:px-4" onClick={() => setFiltersOpen(v => !v)}>
            <SlidersHorizontal className="w-4 h-4" /> <span className="hidden sm:inline">Más filtros</span>
            {activeFilterCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-alert-price text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
          </Button>
        </div>

        {/* Panel de "Más filtros": ambientes, baños, precio, antigüedad, tipo
            de anunciante, orientación y características — todo filtra sobre
            lo que ya está cargado (ver filterProperties en
            lib/propertyFilters.js). Grilla de 2 columnas (antes 1 sola) para
            que el panel crezca menos en alto ahora que es más ancho. */}
        {filtersOpen && <div className="mt-2 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full xl:w-[600px] max-h-[60vh] lg:max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <p className="text-xs font-bold text-outline uppercase tracking-widest">Ambientes</p>
              <div className="flex gap-2">
                {ROOMS_OPTIONS.map(n => <button key={n} type="button" onClick={() => setMinRooms(n)} className={cn("flex-1 text-sm py-1.5 rounded-md border transition-colors", minRooms === n ? "border-primary bg-primary/10 text-primary font-bold" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
                    {n === 0 ? "Todos" : `${n}+`}
                  </button>)}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-outline uppercase tracking-widest">Baños</p>
              <div className="flex gap-2">
                {BATHROOMS_OPTIONS.map(n => <button key={n} type="button" onClick={() => setMinBathrooms(n)} className={cn("flex-1 text-sm py-1.5 rounded-md border transition-colors", minBathrooms === n ? "border-primary bg-primary/10 text-primary font-bold" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
                    {n === 0 ? "Todos" : `${n}+`}
                  </button>)}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-outline uppercase tracking-widest">Precio</p>
              <div className="flex gap-2">
                <Input type="number" min={0} placeholder="Desde" value={priceFrom} onChange={e => setPriceFrom(e.target.value)} />
                <Input type="number" min={0} placeholder="Hasta" value={priceTo} onChange={e => setPriceTo(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-outline uppercase tracking-widest">Antigüedad</p>
              <div className="flex flex-wrap gap-2">
                {AGE_OPTIONS.map(([value, label]) => <button key={value} type="button" onClick={() => setAgeFilter(value)} className={cn("text-sm px-3 py-1.5 rounded-md border transition-colors", ageFilter === value ? "border-primary bg-primary/10 text-primary font-bold" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
                    {label}
                  </button>)}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-outline uppercase tracking-widest">Tipo de anunciante</p>
              <div className="flex flex-wrap gap-2">
                {PUBLISHER_TYPE_OPTIONS.map(([value, label]) => <button key={value} type="button" onClick={() => setPublisherTypeFilter(value)} className={cn("text-sm px-3 py-1.5 rounded-md border transition-colors", publisherTypeFilter === value ? "border-primary bg-primary/10 text-primary font-bold" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
                    {label}
                  </button>)}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-outline uppercase tracking-widest">Orientación</p>
              <div className="flex flex-wrap gap-2">
                {ORIENTATION_OPTIONS.map(o => <button key={o} type="button" onClick={() => setOrientationFilter(list => list.includes(o) ? list.filter(x => x !== o) : [...list, o])} className={cn("text-sm px-3 py-1.5 rounded-md border transition-colors", orientationFilter.includes(o) ? "border-primary bg-primary/10 text-primary font-bold" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
                    {o}
                  </button>)}
              </div>
            </div>

            {/* Características/amenities: chips rápidos (incluye Cochera) +
                input libre para agregar cualquier otra palabra clave, estilo
                "Ej.: pileta, balcón, permite mascotas..." de Zonaprop. */}
            <div className="space-y-2 sm:col-span-2">
              <p className="text-xs font-bold text-outline uppercase tracking-widest">Características</p>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map(tag => <button key={tag} type="button" onClick={() => toggleAmenity(tag)} className={cn("text-sm px-3 py-1.5 rounded-md border transition-colors", amenityFilter.some(t => t.toLowerCase() === tag.toLowerCase()) ? "border-primary bg-primary/10 text-primary font-bold" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
                    {tag}
                  </button>)}
                {/* "Sin amenities": excluyente con los demás chips (ver
                    toggleAmenityTag en lib/propertyFilters.js). */}
                <button type="button" title="Sin pileta, parrilla, gimnasio, SUM ni seguridad 24hs. La cochera, el balcón o la terraza no cuentan como amenities." onClick={() => toggleAmenity(NO_AMENITIES)} className={cn("text-sm px-3 py-1.5 rounded-md border border-dashed transition-colors", amenityFilter.includes(NO_AMENITIES) ? "border-primary bg-primary/10 text-primary font-bold" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
                  {NO_AMENITIES}
                </button>
              </div>
              <form onSubmit={addCustomAmenity} className="flex gap-2">
                <Input type="text" placeholder="Ej.: pileta, balcón, permite mascotas…" value={amenityInput} onChange={e => setAmenityInput(e.target.value)} />
                <Button type="submit" size="sm" variant="outline" className="shrink-0">Agregar</Button>
              </form>
              {customAmenities.length > 0 && <div className="flex flex-wrap gap-2">
                  {customAmenities.map(tag => <span key={tag} className="flex items-center gap-1 text-xs font-semibold pl-2.5 pr-1.5 py-1 rounded-full bg-primary/10 text-primary">
                      {tag}
                      <button type="button" onClick={() => setAmenityFilter(list => list.filter(t => t !== tag))} aria-label={`Quitar ${tag}`} className="hover:opacity-70">
                        <X className="w-3 h-3" />
                      </button>
                    </span>)}
                </div>}
            </div>

            <div className="sm:col-span-2 flex justify-between items-center pt-2 border-t border-outline-variant">
              <button type="button" onClick={() => {
                setMinRooms(0);
                setMinBathrooms(0);
                setPriceFrom("");
                setPriceTo("");
                setAgeFilter("");
                setPublisherTypeFilter("");
                setOrientationFilter([]);
                setAmenityFilter([]);
                setAmenityInput("");
              }} className="text-sm font-semibold text-on-surface-variant hover:text-on-surface">
                Limpiar
              </button>
              <Button type="button" size="sm" onClick={() => setFiltersOpen(false)}>Ver resultados</Button>
            </div>
          </div>}
      </div>

      {/* Selector de capas. top-24 (antes top-6): el chip de usuario ahora
          vive arriba a la derecha del todo (MainLayout, z-[1300]) en TODAS
          las páginas, incluida esta -- este selector se corre más abajo
          para no quedar tapado por el chip en vez de al revés. */}
      {/* En celular/tablet arranca debajo del buscador (que ahí ocupa todo
          el ancho) y con márgenes más chicos. */}
      <div className="absolute top-[128px] right-3 lg:top-24 lg:right-6 z-[1000] flex flex-col items-end gap-2">
        {/* Acceso directo al listado en grilla (mismos filtros ya aplicados:
            operación, tipo, texto y "Más filtros"). Antes vivía debajo de la
            barra de búsqueda a ancho completo -- tapaba demasiado mapa; se
            movió acá como botón chico, junto al resto de controles flotantes. */}
        <Link to={`/propiedades?${listingQueryString}`} className="bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant px-3 py-2 sm:px-4 sm:py-2.5 flex items-center gap-2 text-sm font-bold text-primary hover:bg-surface-dim transition-colors">
          <List className="w-4 h-4" /> <span className="sm:hidden">Ver listado</span><span className="hidden sm:inline">Ver listado de propiedades</span>
        </Link>

        {/* Precios m² / Ruido / Seguridad: solo tienen sentido con el mapa
            de calor prendido (son tres formas de colorear los barrios). Con
            el mapa de calor apagado, elegir entre ellas no cambiaba nada a
            la vista (siempre se veían los mismos pines de propiedades), así
            que se ocultan hasta que se prenda. El switch sí queda siempre a
            la vista: es el único control que hace falta para volver a
            prenderlo. */}
        <div className="bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant text-xs font-bold w-[240px] overflow-hidden">
          <button type="button" onClick={() => setLayersOpen(o => !o)} aria-expanded={layersOpen} className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-on-surface hover:bg-surface-dim transition-colors">
            <span className="inline-flex items-center gap-2 text-sm"><Layers className="w-4 h-4 text-primary" aria-hidden="true" /> Capas del mapa</span>
            <span className="inline-flex items-center gap-1.5">
              {!layersOpen && (showColorLayer || noisePeriod) && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-on-primary">{Number(showColorLayer) + Number(Boolean(noisePeriod))}</span>}
              <ChevronDown className={cn("w-4 h-4 transition-transform", layersOpen && "rotate-180")} aria-hidden="true" />
            </span>
          </button>
          {layersOpen && <div className="border-t border-outline-variant p-3 space-y-3">
              <LayerGroup title="Barrios" hint="Pinta cada barrio entero">
                <Segmented
                  value={showColorLayer ? layer : "none"}
                  onChange={kind => {
                    if (kind === "none") {
                      setShowColorLayer(false);
                    } else {
                      setLayer(kind);
                      setShowColorLayer(true);
                    }
                  }}
                  options={[["none", "Ninguno"], ["price", "Precio m²"], ["security", "Seguridad"]]} />
              </LayerGroup>
              <LayerGroup title="Ruido" hint="Pinta cada calle (se suma a los barrios)">
                <Segmented
                  value={noisePeriod ?? "off"}
                  onChange={period => setNoisePeriod(period === "off" ? null : period)}
                  options={[["off", "Apagado"], ["day", "Diurno"], ["night", "Nocturno"]]} />
              </LayerGroup>
              <div className="border-t border-outline-variant pt-2.5">
                <Switch checked={showPins} onCheckedChange={setShowPins} label="Pines de propiedades" />
              </div>
            </div>}
        </div>

        {/* Referencia de colores de los pines por tasación (ver
            valuationPillClass más arriba): solo tiene sentido cuando se ven
            los pines, o sea con el mapa de calor apagado -- con el mapa de
            calor prendido no hay pines, solo el relleno de color de los
            barrios (que ya tiene su propia Leyenda abajo a la izquierda). */}
        {/* En celular (< sm), con una propiedad seleccionada se oculta: la
            ficha ocupa todo el ancho de abajo y la tapaba. En tablet y compu
            hay lugar para las dos. */}
        {/* En celular la leyenda arranca plegada (un botón chico con los 3
            colores) para no tapar el mapa; al tocarlo se despliega. */}
        {showPins && !legendOpen && <button type="button" onClick={() => setLegendOpen(true)} aria-label="Ver qué significan los colores" className={cn("sm:hidden bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant px-3 py-2 flex items-center gap-1.5 text-xs font-bold text-on-surface", selectedProperty && "hidden")}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-tertiary)" }}></span>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-primary)" }}></span>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-alert-price)" }}></span>
            Colores
          </button>}
        {showPins && <div onClick={() => setLegendOpen(false)} className={cn("bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant p-3 space-y-1.5 text-xs font-bold text-on-surface", selectedProperty && "hidden sm:block", !legendOpen && "hidden sm:block")}>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: "var(--color-tertiary)" }}></span>
            En rango
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: "var(--color-primary)" }}></span>
            Subvaluada
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: "var(--color-alert-price)" }}></span>
            Sobrevaluada
          </div>
        </div>}
      </div>

      {/* Mapa */}
      <div className="flex-1 w-full relative">
        {propertiesLoading && <div className="absolute inset-0 z-[900] flex items-center justify-center bg-surface/85 backdrop-blur-[2px] animate-in fade-in duration-200">
          <NidioLoadingMark phase="loading" size={120} message="Cargando propiedades…" />
        </div>}
        {/* scrollWheelZoom prendido a pedido: permite acercar/alejar con la
            rueda del mouse directamente sobre el mapa. El mapa ocupa toda
            la altura de la página, así que con esto activo el usuario ya no
            puede scrollear hasta el Footer con el cursor encima del mapa
            (la rueda queda capturada por el zoom) — el zoom con botones
            +/-, doble click o pellizco (touch) sigue funcionando igual. */}
        <MapContainer center={CABA_CENTER} zoom={12} scrollWheelZoom={true} className="map-with-search w-full h-full absolute inset-0">
          {/* Mapa base de CARTO (necesita VITE_CARTO_API_KEY; ver lib/mapTiles.js). Se prefiere
              al tile server crudo de OSM porque éste aplica rate-limiting a apps que no calzan
              su política de uso (causaba el mapa "gris", sin tiles, en desarrollo); sin clave,
              mapTiles.js cae a OSM. */}
          <TileLayer attribution={BASE_TILES.attribution} url={BASE_TILES.url} />
          {/* El control de zoom nativo de MapContainer se baja con CSS
              (ver .map-with-search en index.css) para no quedar
              tapado por la barra de búsqueda. No se reemplaza por un
              <ZoomControl> manual: en dev, con StrictMode, terminaba
              montándose dos veces. */}
          {/* Acerca el mapa al barrio buscado (usa la geometría de cualquier
              capa ya cargada: no depende de qué capa esté activa). */}
          <SearchFlyTo search={search} geoSource={priceData ?? noiseData ?? securityData} />
          {/* Recuadro visible del mapa, para filtrar el panel de abajo a lo
              que está a la vista (se actualiza al mover/zoomear). */}
          <MapViewportSync onBoundsChange={setMapBounds} />
          <MapInvalidateSize />
          {/* Botón para recentrar en CABA, apilado con los +/- nativos. */}
          <RecenterControl />

          {colorVisible && layer === "price" && priceData && <GeoJSON key={`price-${operationType}`} data={priceData} style={feature => ({
            color: "#ffffff",
            weight: 1,
            fillColor: priceColor(percentileRank((feature?.properties).avgPriceM2, sortedPrices)),
            fillOpacity: 0.55
          })} onEachFeature={onEachPriceFeature} />}

          {colorVisible && layer === "security" && securityData && <GeoJSON key="security-fill" data={securityData} style={feature => ({
            color: "#ffffff",
            weight: 1,
            fillColor: securityColor((feature?.properties).securityIndex, minSecurity, maxSecurity),
            fillOpacity: 0.55
          })} onEachFeature={onEachSecurityFeature} />}

          {/* Ruido por calle (Mapa de Ruido de BA Data), encima del relleno de barrios. */}
          {noisePeriod && <NoiseStreetsLayer period={noisePeriod} cuts={noiseCuts?.[noisePeriod]} />}
          {/* Nombres de calles y barrios por encima de los colores, para que sigan leyéndose. */}
          <OverlayLabels enabled={Boolean(noisePeriod) || colorVisible} />

          {/* Borde del barrio buscado: capa propia, aparte, en vez de variar
              el color/grosor del borde por-feature dentro de los GeoJSON de
              arriba. Antes se intentaba así, pero el borde grueso quedaba
              tapado a medias por los bordes finos de los barrios vecinos
              (cada polígono dibuja su propio borde, y el orden de dibujado
              dentro del mismo GeoJSON no garantiza que el resaltado quede
              arriba de todos). Al montarse última, esta capa se dibuja por
              encima de las tres de arriba, así que el contorno queda
              siempre completo y bien marcado. Sin relleno (fillOpacity 0) y
              sin interactividad, para no taparle el click/popup al polígono
              de color que está debajo. */}
          {/* Color "secondary" de la paleta (--color-secondary, violeta/
              índigo) -- no es ni el azul "primary" del pill de precio ni el
              verde "tertiary", que ahora se usa para las propiedades en
              rango (ver valuationPillClass más arriba). La paleta no tiene
              un morado más puro que este; es el que más se le acerca. */}
          {searchedNeighborhoodFeature && <GeoJSON key={`highlight-${searchedNeighborhoodName}`} data={searchedNeighborhoodFeature} interactive={false} style={{
          color: "#4059aa",
          weight: 6,
          opacity: 1,
          fillOpacity: 0
        }} />}

          {/* Límite de toda CABA: se monta último (después de los rellenos
              de color y del contorno del barrio buscado) por la misma razón
              que ese -- si no, el borde blanco fino de los barrios del
              perímetro lo tapa justo donde más importa, en el borde mismo
              de la ciudad. Color "outline" de la paleta (gris neutro, no es
              un color "de dato" como los demás) y punteado, para que se
              distinga de un límite de barrio de un vistazo. Sin relleno ni
              interactividad. */}
          {cabaBoundary && <GeoJSON key="caba-boundary" data={cabaBoundary} interactive={false} style={{
          color: "#6e797e",
          weight: 3,
          opacity: 0.9,
          fillOpacity: 0,
          dashArray: "6 6"
        }} />}

          {/* Los pines de propiedades solo se muestran en Precios, y sólo cuando
              el mapa de calor está apagado: con el mapa de calor prendido el
              dato relevante es el precio/m² por barrio (etiqueta arriba), no
              cada propiedad individual, así que se ocultan para no duplicar
              información y no ensuciar la lectura. En Ruido/Seguridad nunca
              se muestran. */}
          {showPins && <PropertyMarkersLayer properties={visibleProperties} locations={locations} selectedId={selectedId} onSelect={setSelectedId} blueRate={blueRate} />}
        </MapContainer>

        {/* Card de la propiedad seleccionada (al tocar un pin), estilo
            ficha flotante: foto, precio, dirección — no un popup chico. */}
        {selectedProperty && <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-4 lg:bottom-52 sm:w-[360px] max-h-[calc(100%-1.5rem)] overflow-y-auto z-[1100] bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant overflow-hidden">
          <div className="relative">
            {selectedProperty.imageUrl ? <img src={selectedProperty.imageUrl} alt={selectedProperty.title} className="w-full h-32 sm:h-44 object-cover bg-surface-dim" /> : <div className="w-full h-32 sm:h-44 bg-surface-dim" />}
            <button type="button" onClick={() => setSelectedId(null)} aria-label="Cerrar" className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-surface-container-lowest">
              <X className="w-4 h-4 text-on-surface" />
            </button>
            {/* Antes era bg-good-value/10 (10% opacidad, heredado del
                variant="good"): sobre una foto se transparentaba y se hacía
                ilegible según el fondo. Fondo sólido + blur (mismo criterio
                que el botón de cerrar de al lado) para que se lea siempre,
                sin importar la foto de atrás. */}
            <Badge variant="good" className="absolute top-2 left-2 text-[10px] px-2 py-0.5 bg-surface-container-lowest/90 backdrop-blur border border-good-value/20 shadow-sm">
              {selectedProperty.operationType === "SALE" ? "VENTA" : "ALQUILER"}
            </Badge>
            <FavoriteButton propertyId={selectedProperty.id} className="absolute bottom-2 right-2" />
          </div>
          <div className="p-4 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-xl text-on-surface">{formatPrice(selectedProperty.price, selectedProperty.operationType)}</p>
              {selectedProperty.valuation && <ValuationBadge result={selectedValuationStatus} />}
            </div>
            {/* Rango aceptable: mismo criterio que la ficha de detalle
                (property.valuation siempre en USD; alquiler se muestra
                convertido a ARS como valor principal, con el dólar blue).
                En negrita y verde (color-good-value, el mismo verde que ya
                usa el Badge "good"), a pedido, para que resalte más que el
                resto de los datos de la card. */}
            {selectedProperty.valuation && <p className="text-xs font-bold text-good-value">
              Rango aceptable: {selectedProperty.operationType === "RENT" && blueRate
                ? `ARS ${formatNumber(selectedProperty.valuation.min * blueRate)} – ARS ${formatNumber(selectedProperty.valuation.max * blueRate)}/mes`
                : `USD ${formatNumber(selectedProperty.valuation.min)} – USD ${formatNumber(selectedProperty.valuation.max)}${selectedProperty.operationType === "RENT" ? "/mes" : ""}`}
            </p>}
            <p className="text-sm text-on-surface-variant font-mono">
              {selectedProperty.rooms} amb · {formatNumber(selectedProperty.surfaceM2)} m² · {PROPERTY_TYPE_OPTIONS.find(([value]) => value === selectedProperty.propertyType)?.[1] ?? selectedProperty.propertyType}
            </p>
            <h4 className="font-bold text-sm text-on-surface pt-1">{selectedProperty.title}</h4>
            <p className="text-xs text-on-surface-variant flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {selectedLocation?.address ? `${selectedLocation.address}, ` : ""}{selectedProperty.neighborhoodName}
            </p>
            <Link to={`/propiedades/${selectedProperty.id}`} className="block w-full text-center mt-2 py-2 rounded-lg text-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all">
              Ver aviso completo
            </Link>
          </div>
        </div>}

        {/* Botón flotante "Propiedades cercanas": solo aparece cuando la
            búsqueda matcheó un único barrio (mismo criterio que
            searchedNeighborhoodName, que ya dispara el flyTo del mapa) y el
            panel de abajo todavía no se abrió. Titila con un punto tipo
            notificación (animate-ping) para llamar la atención sin taparse
            texto a sí mismo con la animación. */}
        {searchedNeighborhoodName && !showNearbyPanel && <button type="button" onClick={() => setShowNearbyPanel(true)} className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[1050] flex items-center gap-2 bg-primary text-on-primary rounded-full shadow-xl pl-4 pr-5 py-3 font-bold text-sm hover:opacity-90 transition-all">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-on-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-on-primary"></span>
            </span>
            <Home className="w-4 h-4" />
            Propiedades cercanas
          </button>}

        {/* Leyenda */}
        {/* Leyenda: en compu se corre a la derecha del botón del menú (que vive a la
            izquierda, a mitad de altura) y se puede plegar, así nunca lo tapa. */}
        {(colorVisible || noisePeriod) && <div className="absolute bottom-4 left-3 sm:bottom-40 sm:left-16 lg:left-20 z-[1000] w-[235px] max-h-[40vh] overflow-y-auto bg-surface-container-lowest/95 backdrop-blur border border-outline-variant rounded-lg shadow-sm text-xs font-bold text-on-surface">
          <button type="button" onClick={() => setReferencesOpen(o => !o)} aria-expanded={referencesOpen} className="flex w-full items-center justify-between px-3 py-2">
            Referencias <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", !referencesOpen && "rotate-180")} aria-hidden="true" />
          </button>
          {referencesOpen && <div className="space-y-2 px-3 pb-3">
          {colorVisible && layer === "price" && <>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{
              background: "hsl(50,95%,64%)"
            }}></span>
                Más barato ({formatNumber(minPrice)})
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{
              background: "hsl(0,95%,36%)"
            }}></span>
                Más caro ({formatNumber(maxPrice)})
              </div>
              <div className="text-[10px] font-mono text-on-surface-variant">
                {operationType === "SALE" ? "USD/m²" : "ARS/mes (precio total)"}
              </div>
            </>}
          {colorVisible && layer === "security" && <div className="space-y-1">
              <p>Seguridad del barrio</p>
              <div className="h-2.5 rounded-full" style={{ background: "linear-gradient(to right, hsl(0,80%,42%), hsl(70,80%,46%), hsl(140,80%,50%))" }}></div>
              <div className="flex justify-between text-[10px] font-normal text-on-surface-variant"><span>Menos seguro</span><span>Más seguro</span></div>
              <div className="text-[10px] font-normal text-on-surface-variant">Comparado con el resto de CABA</div>
            </div>}
          {noisePeriod && <div className="space-y-1">
              <p>Ruido {noisePeriod === "day" ? "diurno" : "nocturno"} por calle</p>
              {noiseCuts && noiseLegend(noiseCuts[noisePeriod]).map(row => <div key={row.level} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: MAP_LEVEL_COLORS[row.level] }}></span>
                  <span className="flex-1">{row.label}</span>
                  <span className="font-normal text-on-surface-variant whitespace-nowrap">{row.range}</span>
                </div>)}
              <div className="text-[10px] font-mono font-normal text-on-surface-variant">Compara cada calle con el resto de CABA. Fuente: Mapa de Ruido, BA Data (CC BY 2.5 AR)</div>
            </div>}
          </div>}
        </div>}
      </div>

      {/* Panel inferior de propiedades: arranca oculto (ver showNearbyPanel)
          para que el mapa se vea solo, a pantalla completa. Se abre desde el
          botón flotante "Propiedades cercanas" y se filtra por lo que está a
          la vista en el mapa (recuadro visible), así que se actualiza solo
          al mover o hacer zoom, y al tocar un pin (que recentra el mapa
          ahí). */}
      {showNearbyPanel && <div className="absolute bottom-0 w-full bg-surface-container-lowest border-t border-outline-variant shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl p-4 sm:p-6 z-[1000] animate-in slide-in-from-bottom duration-300">
        <button type="button" onClick={() => setShowNearbyPanel(false)} aria-label="Cerrar panel de propiedades" className="absolute top-3 right-4 sm:top-4 sm:right-6 w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-dim hover:text-on-surface transition-colors">
          <X className="w-4 h-4" />
        </button>
        {/* Handle para agrandar/achicar el panel: antes era una línea
            puramente decorativa (sin onClick), por eso no hacía nada al
            tocarla. */}
        <button
          type="button"
          onClick={() => setNearbyPanelExpanded(v => !v)}
          aria-label={nearbyPanelExpanded ? "Achicar panel de propiedades" : "Agrandar panel de propiedades"}
          title={nearbyPanelExpanded ? "Achicar panel" : "Agrandar panel"}
          className="flex items-center justify-center w-full py-1 -mt-2 mb-3 group"
        >
          <span className="w-12 h-1.5 bg-outline/30 rounded-full group-hover:bg-outline/60 transition-colors"></span>
        </button>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-mono text-on-surface-variant">
            Propiedades cerca ({nearbyProperties.length})
          </p>
          {/* Lleva los mismos filtros activos al listado completo, en vez de
              limitarse a lo que entra en el carrusel de acá abajo. */}
          <Link to={`/propiedades?${listingQueryString}`} className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            <List className="w-3.5 h-3.5" /> Ver listado de propiedades
          </Link>
        </div>

        {/* Agrandado (handle tocado): grilla que crece hacia arriba con
            varias filas visibles a la vez, en vez de una sola tira que
            scrollea de costado. */}
        <div className={cn("gap-4 sm:gap-6 pb-2", nearbyPanelExpanded ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 overflow-y-auto max-h-[55vh] pr-1" : "flex overflow-x-auto hide-scrollbar")}>
          {nearbyProperties.length === 0 && <p className="text-sm text-on-surface-variant font-mono py-4">
              No hay propiedades en esta zona.
            </p>}
          {nearbyProperties.slice(0, 12).map(p => <Card key={p.id} onClick={() => setSelectedId(p.id)} className={cn("relative overflow-hidden cursor-pointer", nearbyPanelExpanded ? "w-full" : "min-w-[270px] sm:min-w-[320px] flex-shrink-0", p.id === selectedId ? "border-primary border-2" : "border-outline-variant")}>
              <div className="p-4 flex gap-4">
                {p.imageUrl && <img src={p.imageUrl} className="w-20 h-20 rounded-lg object-cover bg-surface-dim" alt={p.title} />}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-sm text-on-surface line-clamp-1">{p.title}</h4>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="good" className="text-[9px] px-1 py-0 h-4">
                        {p.operationType === "SALE" ? "VENTA" : "ALQ."}
                      </Badge>
                      <FavoriteButton propertyId={p.id} className="w-6 h-6 bg-transparent shadow-none hover:bg-surface-dim" />
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {p.neighborhoodName}
                  </p>
                  <div className="flex justify-between items-end pt-1">
                    <span className="font-bold text-primary text-sm">{formatPrice(p.price, p.operationType)}</span>
                    <span className="text-xs font-mono flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {p.rooms} amb · {formatNumber(p.surfaceM2)} m²
                    </span>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); navigate(`/propiedades/${p.id}`); }} className="text-xs font-bold text-primary hover:underline">
                    Ver aviso completo →
                  </button>
                </div>
              </div>
            </Card>)}
        </div>
      </div>}
    </div>;
}
