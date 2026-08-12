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
import { Search, MapPin, Building2, ChevronDown, SlidersHorizontal, List, X, Home } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice, formatPriceShort, formatNumber } from "@/lib/format";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import {
  filterProperties, countActiveFilters, buildFilterQueryString, fetchAllProperties,
  ROOMS_OPTIONS, BATHROOMS_OPTIONS, AGE_OPTIONS, PUBLISHER_TYPE_OPTIONS, ORIENTATION_OPTIONS, AMENITY_OPTIONS
} from "@/lib/propertyFilters";
import { cn } from "@/lib/utils";

const PROPERTY_TYPE_OPTIONS = [["", "Todos los tipos"], ["APARTMENT", "Departamento"], ["HOUSE", "Casa"], ["PH", "PH"]];

// Centro aproximado de CABA (lat, lon).
const CABA_CENTER = [-34.605, -58.43];
// Leaflet ya mueve el mapa solo para que el popup no quede tapado por el
// borde del contenedor, pero no sabe que la barra de búsqueda/filtros
// (arriba a la izquierda, fuera del control de Leaflet) también tapa. Con
// este padding reservamos esa zona: si el popup caería ahí, el mapa se
// corre para dejarlo visible al lado.
const POPUP_OPTIONS = { autoPanPaddingTopLeft: L.point(480, 170), autoPanPaddingBottomRight: L.point(20, 20) };
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
function noiseColor(value, min, max) {
  // Amarillo (silencioso) a rojo (ruidoso) — la paleta original, más
  // intensa (saturación al máximo, más rango de luminosidad).
  const t = max > min ? (value - min) / (max - min) : 0.5;
  const hue = 60 - 60 * t;
  const lightness = 55 - 22 * t;
  return `hsl(${hue}, 100%, ${lightness}%)`;
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
// ese recalculo al montar y cada vez que cambia el tamaño de la ventana.
function MapInvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    const id = requestAnimationFrame(handleResize);
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);
  return null;
}
// Pines de propiedades: van en un componente propio (en vez de mapearse
// directo en el JSX de MapPage) para poder usar useMap y centrar el mapa en
// la propiedad tocada — así el listado de abajo, que se filtra por el
// recuadro visible, se actualiza mostrando las propiedades cercanas a esa.
function PropertyMarkersLayer({ properties, locations, selectedId, onSelect }) {
  const map = useMap();
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
    const icon = L.divIcon({
      className: "price-pill-icon",
      html: `<div class="price-pill${p.id === selectedId ? " price-pill--selected" : ""}">${formatPriceShort(p.price, p.operationType)}</div><div class="price-dot${p.id === selectedId ? " price-dot--selected" : ""}"></div>`,
      iconSize: null,
      iconAnchor: [0, 0]
    });
    return <Marker key={p.id} position={[loc.lat, loc.lon]} icon={icon} eventHandlers={{
      click: handleSelect
    }} />;
  });
}

export default function MapPage() {
  const [layer, setLayer] = useState("price");
  // Interruptor general: muestra/oculta la superposición de color de la capa
  // activa (barrios), sin tocar el mapa base ni los pines de propiedades.
  const [showColorLayer, setShowColorLayer] = useState(false);
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
  const [propertyType, setPropertyType] = useState("");
  const [properties, setProperties] = useState([]);
  const [locations, setLocations] = useState({});
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
  useEffect(() => {
    setShowNearbyPanel(false);
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
    }).catch(() => setProperties([]));
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
  const [minPrice, maxPrice] = useMemo(() => {
    const values = priceData?.features.map(f => f.properties.avgPriceM2) ?? [];
    return values.length ? [Math.min(...values), Math.max(...values)] : [0, 1];
  }, [priceData]);
  // Ordenado para calcular percentiles (ver percentileRank): así el color
  // de cada barrio depende de su posición relativa entre todos los demás,
  // no de una interpolación lineal entre el mínimo y el máximo absolutos.
  const sortedPrices = useMemo(() => (priceData?.features.map(f => f.properties.avgPriceM2) ?? []).slice().sort((a, b) => a - b), [priceData]);
  const [minNoise, maxNoise] = useMemo(() => {
    const values = noiseData?.features.map(f => f.properties.noiseLevel) ?? [];
    return values.length ? [Math.min(...values), Math.max(...values)] : [45, 85];
  }, [noiseData]);
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
  function onEachNoiseFeature(feature, mapLayer) {
    const props = feature.properties;
    const barrio = props.neighborhoodName ? `<strong>${props.neighborhoodName}</strong><br/>` : "";
    mapLayer.bindPopup(`${barrio}Nivel de ruido: <strong>${props.noiseLevel} dB</strong>`, POPUP_OPTIONS);
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
    setAmenityFilter(list => list.some(t => t.toLowerCase() === tag.toLowerCase())
      ? list.filter(t => t.toLowerCase() !== tag.toLowerCase())
      : [...list, tag]);
  }
  function addCustomAmenity(e) {
    e.preventDefault();
    const tag = amenityInput.trim();
    if (!tag) return;
    if (!amenityFilter.some(t => t.toLowerCase() === tag.toLowerCase())) {
      setAmenityFilter(list => [...list, tag]);
    }
    setAmenityInput("");
  }
  // Tags sueltos que la persona escribió a mano y no están entre los chips
  // predefinidos — esos sí necesitan su propio chip removible, los
  // predefinidos ya muestran su estado prendido/apagado en el botón.
  const customAmenities = amenityFilter.filter(t => !AMENITY_OPTIONS.some(o => o.toLowerCase() === t.toLowerCase()));

  // Ruido y seguridad se ven siempre con su relleno de color (no tiene sentido
  // "apagarlos", es la única forma en la que se muestran). El switch solo
  // aplica a precios, que sí puede mostrarse sin la superposición de color.
  const colorVisible = layer === "price" ? showColorLayer : true;
  // Alto fijo (viewport - header) en vez de h-full: el mapa está pensado como
  // una vista "tipo Google Maps" a pantalla completa, con el panel de
  // propiedades cercanas flotando ENCIMA (absolute bottom-0). Con h-full,
  // agregar el Footer debajo (en flujo normal, no flotante) le robaba altura
  // al mapa para hacerle lugar, achicándolo mucho. Con un alto fijo, el mapa
  // mantiene su tamaño completo de siempre y el Footer queda alcanzable
  // haciendo scroll hacia abajo (igual que en cualquier otra página).
  return <div className="h-[calc(100vh-4rem)] shrink-0 flex flex-col relative animate-in fade-in duration-500">
      {/* Barra superior: tabs Alquilar/Comprar + buscador (tipo de propiedad,
          texto libre y botón Buscar). Sin pestaña de "Emprendimientos": Nidio
          no tiene ese tipo de listado. */}
      {/* z-[1200], por encima del panel inferior de "Propiedades cerca"
          (z-[1000]): antes, con el mismo z-index, el panel de "Más filtros"
          quedaba tapado por ese panel cuando crecía hacia abajo (ver
          Antigüedad/Tipo de anunciante cortados). También más ancha
          (max-w-2xl en vez de max-w-xl) para que entren más controles sin
          amontonarse. */}
      <div className="absolute top-6 left-6 z-[1200] w-full max-w-2xl">
        <div className="bg-surface-container-lowest rounded-t-xl shadow-lg border border-outline-variant border-b-0 px-4 pt-3 flex gap-6">
          {[["RENT", "Alquilar"], ["SALE", "Comprar"]].map(([op, label]) => <button key={op} onClick={() => setOperationType(op)} className={cn("pb-3 text-sm font-bold border-b-2 transition-colors", operationType === op ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface")}>
              {label}
            </button>)}
        </div>
        <div className="bg-surface-container-lowest rounded-b-xl rounded-tr-xl shadow-lg border border-outline-variant p-2 flex gap-2">
          <div className="relative">
            <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="h-10 pl-3 pr-8 rounded-md border border-outline-variant bg-transparent text-sm font-bold text-on-surface appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              {PROPERTY_TYPE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-outline pointer-events-none" />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-outline" />
            <Input type="text" placeholder="Barrio, dirección, ambientes, pileta, cochera..." className="pl-10 pr-9" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Borrar búsqueda" className="absolute right-2.5 top-2.5 text-outline hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>}
          </div>
          {/* La búsqueda ya es instantánea (filtra a medida que se escribe);
              el botón queda como confirmación visual, no dispara nada extra. */}
          <Button className="gap-2">
            <Search className="w-4 h-4" /> Buscar
          </Button>
          <Button type="button" variant="outline" className="gap-2 relative shrink-0" onClick={() => setFiltersOpen(v => !v)}>
            <SlidersHorizontal className="w-4 h-4" /> Más filtros
            {activeFilterCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-alert-price text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
          </Button>
        </div>

        {/* Panel de "Más filtros": ambientes, baños, precio, antigüedad, tipo
            de anunciante, orientación y características — todo filtra sobre
            lo que ya está cargado (ver filterProperties en
            lib/propertyFilters.js). Grilla de 2 columnas (antes 1 sola) para
            que el panel crezca menos en alto ahora que es más ancho. */}
        {filtersOpen && <div className="mt-2 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant p-5 grid grid-cols-2 gap-5 w-[600px] max-h-[70vh] overflow-y-auto">
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
            <div className="space-y-2 col-span-2">
              <p className="text-xs font-bold text-outline uppercase tracking-widest">Características</p>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map(tag => <button key={tag} type="button" onClick={() => toggleAmenity(tag)} className={cn("text-sm px-3 py-1.5 rounded-md border transition-colors", amenityFilter.some(t => t.toLowerCase() === tag.toLowerCase()) ? "border-primary bg-primary/10 text-primary font-bold" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
                    {tag}
                  </button>)}
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

            <div className="col-span-2 flex justify-between items-center pt-2 border-t border-outline-variant">
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

      {/* Selector de capas */}
      <div className="absolute top-6 right-6 z-[1000] flex flex-col items-end gap-2">
        {/* Precios m² / Ruido / Seguridad: siempre a la vista */}
        <div className="bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant p-2 flex gap-1 text-xs font-bold">
          {[["price", "Precios m²"], ["noise", "Ruido"], ["security", "Seguridad"]].map(([kind, label]) => <button key={kind} onClick={() => setLayer(kind)} className={cn("px-3 py-2 rounded-lg transition-colors", layer === kind ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-dim")}>
              {label}
            </button>)}
        </div>

        {/* El switch solo tiene sentido en precios: ruido y seguridad siempre
            se muestran con su relleno de color, no hay nada que prender/apagar. */}
        {layer === "price" && <div className="bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant px-3 py-2 flex items-center gap-2">
          <Switch checked={showColorLayer} onCheckedChange={setShowColorLayer} label="Mapa de calor" />
        </div>}

      </div>

      {/* Mapa */}
      <div className="flex-1 w-full relative">
        {/* scrollWheelZoom apagado a propósito: el mapa ocupa toda la altura
            de la página, así que si capturara la rueda del mouse el usuario
            no tendría forma de scrollear hasta el Footer con el cursor
            encima del mapa. El zoom sigue funcionando con los botones +/-,
            doble click o pellizco (touch). */}
        <MapContainer center={CABA_CENTER} zoom={12} scrollWheelZoom={false} className="w-full h-full absolute inset-0">
          {/* Tiles de CARTO en vez del tile server crudo de OSM: éste último
              aplica rate-limiting agresivo a apps que no calzan su política
              de uso (justo lo que causaba el mapa "gris", sin tiles, en
              desarrollo). CARTO reusa datos de OSM pero con un CDN pensado
              para incrustar en apps de terceros sin necesidad de API key. */}
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          {/* El control de zoom nativo de MapContainer se baja con CSS
              (ver .leaflet-top.leaflet-left en index.css) para no quedar
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

          {colorVisible && layer === "price" && priceData && <GeoJSON key={`price-${operationType}`} data={priceData} style={feature => {
          const isSearched = searchedNeighborhoodName && feature?.properties?.neighborhoodName === searchedNeighborhoodName;
          return {
            color: isSearched ? "#00647c" : "#ffffff",
            weight: isSearched ? 5 : 1,
            fillColor: priceColor(percentileRank((feature?.properties).avgPriceM2, sortedPrices)),
            fillOpacity: 0.55
          };
        }} onEachFeature={onEachPriceFeature} />}

          {colorVisible && layer === "noise" && noiseData && <GeoJSON key="noise-fill" data={noiseData} style={feature => {
          const isSearched = searchedNeighborhoodName && feature?.properties?.neighborhoodName === searchedNeighborhoodName;
          return {
            color: isSearched ? "#00647c" : "#ffffff",
            weight: isSearched ? 5 : 1,
            fillColor: noiseColor((feature?.properties).noiseLevel, minNoise, maxNoise),
            fillOpacity: 0.55
          };
        }} onEachFeature={onEachNoiseFeature} />}

          {colorVisible && layer === "security" && securityData && <GeoJSON key="security-fill" data={securityData} style={feature => {
          const isSearched = searchedNeighborhoodName && feature?.properties?.neighborhoodName === searchedNeighborhoodName;
          return {
            color: isSearched ? "#00647c" : "#ffffff",
            weight: isSearched ? 5 : 1,
            fillColor: securityColor((feature?.properties).securityIndex, minSecurity, maxSecurity),
            fillOpacity: 0.55
          };
        }} onEachFeature={onEachSecurityFeature} />}

          {/* Los pines de propiedades solo se muestran en Precios, y sólo cuando
              el mapa de calor está apagado: con el mapa de calor prendido el
              dato relevante es el precio/m² por barrio (etiqueta arriba), no
              cada propiedad individual, así que se ocultan para no duplicar
              información y no ensuciar la lectura. En Ruido/Seguridad nunca
              se muestran. */}
          {layer === "price" && !showColorLayer && <PropertyMarkersLayer properties={visibleProperties} locations={locations} selectedId={selectedId} onSelect={setSelectedId} />}
        </MapContainer>

        {/* Card de la propiedad seleccionada (al tocar un pin), estilo
            ficha flotante: foto, precio, dirección — no un popup chico. */}
        {selectedProperty && <div className="absolute bottom-52 right-6 z-[1100] w-[360px] bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant overflow-hidden">
          <div className="relative">
            {selectedProperty.imageUrl ? <img src={selectedProperty.imageUrl} alt={selectedProperty.title} className="w-full h-44 object-cover bg-surface-dim" /> : <div className="w-full h-44 bg-surface-dim" />}
            <button type="button" onClick={() => setSelectedId(null)} aria-label="Cerrar" className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-surface-container-lowest">
              <X className="w-4 h-4 text-on-surface" />
            </button>
            <Badge variant="good" className="absolute top-2 left-2 text-[10px] px-2 py-0.5">
              {selectedProperty.operationType === "SALE" ? "VENTA" : "ALQUILER"}
            </Badge>
            <FavoriteButton propertyId={selectedProperty.id} className="absolute bottom-2 right-2" />
          </div>
          <div className="p-4 space-y-1.5">
            <p className="font-bold text-xl text-on-surface">{formatPrice(selectedProperty.price, selectedProperty.operationType)}</p>
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
        {searchedNeighborhoodName && !showNearbyPanel && <button type="button" onClick={() => setShowNearbyPanel(true)} className="absolute right-6 top-1/2 -translate-y-1/2 z-[1050] flex items-center gap-2 bg-primary text-on-primary rounded-full shadow-xl pl-4 pr-5 py-3 font-bold text-sm hover:opacity-90 transition-all">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-on-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-on-primary"></span>
            </span>
            <Home className="w-4 h-4" />
            Propiedades cercanas
          </button>}

        {/* Leyenda */}
        {colorVisible && <div className="absolute bottom-40 left-6 z-[1000] bg-surface-container-lowest/90 backdrop-blur border border-outline-variant p-3 rounded-lg shadow-sm space-y-2 text-xs font-bold text-on-surface">
          {layer === "price" && <>
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
          {layer === "noise" && <>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{
              background: "hsl(60,100%,55%)"
            }}></span> Más silencioso ({formatNumber(minNoise)} dB)</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{
              background: "hsl(0,100%,33%)"
            }}></span> Más ruidoso ({formatNumber(maxNoise)} dB)</div>
            </>}
          {layer === "security" && <>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{
              background: "hsl(140,80%,50%)"
            }}></span> Más seguro ({formatNumber(maxSecurity)}/100)</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{
              background: "hsl(0,80%,42%)"
            }}></span> Más peligroso ({formatNumber(minSecurity)}/100)</div>
            </>}
        </div>}
      </div>

      {/* Panel inferior de propiedades: arranca oculto (ver showNearbyPanel)
          para que el mapa se vea solo, a pantalla completa. Se abre desde el
          botón flotante "Propiedades cercanas" y se filtra por lo que está a
          la vista en el mapa (recuadro visible), así que se actualiza solo
          al mover o hacer zoom, y al tocar un pin (que recentra el mapa
          ahí). */}
      {showNearbyPanel && <div className="absolute bottom-0 w-full bg-surface-container-lowest border-t border-outline-variant shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl p-6 z-[1000] animate-in slide-in-from-bottom duration-300">
        <button type="button" onClick={() => setShowNearbyPanel(false)} aria-label="Cerrar panel de propiedades" className="absolute top-4 right-6 w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-dim hover:text-on-surface transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="w-12 h-1.5 bg-outline/30 rounded-full mx-auto mb-4"></div>
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

        <div className="flex gap-6 overflow-x-auto pb-2 hide-scrollbar">
          {nearbyProperties.length === 0 && <p className="text-sm text-on-surface-variant font-mono py-4">
              No hay propiedades en esta zona.
            </p>}
          {nearbyProperties.slice(0, 12).map(p => <Card key={p.id} onClick={() => setSelectedId(p.id)} className={cn("min-w-[320px] flex-shrink-0 relative overflow-hidden cursor-pointer", p.id === selectedId ? "border-primary border-2" : "border-outline-variant")}>
              <div className="p-4 flex gap-4">
                {p.imageUrl && <img src={p.imageUrl} className="w-20 h-20 rounded-lg object-cover bg-surface-dim" alt={p.title} />}
                <div className="flex-1 space-y-2">
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
