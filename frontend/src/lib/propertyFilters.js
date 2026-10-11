/**
 * Filtros de propiedades compartidos entre MapPage y el listado de
 * propiedades: todo filtra client-side sobre lo que ya se cargó del
 * catálogo (mismo criterio que la búsqueda de texto — no pega contra el
 * backend de nuevo por cada cambio de filtro).
 */

export const ROOMS_OPTIONS = [0, 1, 2, 3, 4];
export const BATHROOMS_OPTIONS = [0, 1, 2, 3];
export const AGE_OPTIONS = [["", "Cualquiera"], ["NEW", "A estrenar"], ["UNTIL5", "Hasta 5 años"], ["OVER5", "Más de 5 años"]];
export const PUBLISHER_TYPE_OPTIONS = [["", "Todos"], ["AGENCY", "Inmobiliaria"], ["OWNER", "Dueño directo"]];
export const ORIENTATION_OPTIONS = ["Frente", "Contrafrente", "Interno", "Lateral"];
// Chips rápidos de características/amenities, estilo "Más filtros" de
// Zonaprop — no son un campo estructurado del modelo (el catálogo sintético
// no tiene columnas por amenity), se buscan como palabras dentro de la
// descripción/título, igual que el buscador de texto libre.
export const AMENITY_OPTIONS = ["Cochera", "Pileta", "Balcón", "Terraza", "Parrilla", "Aire acondicionado", "Permite mascotas", "Seguridad 24hs", "Gimnasio", "Baulera"];
// Chip especial "Sin amenities": muestra solo las propiedades que no tienen ningún amenity.
// Un amenity es un servicio o espacio común del edificio/complejo (pileta, parrilla/quincho,
// gimnasio, SUM, seguridad 24hs). Cochera, balcón, terraza, aire acondicionado, baulera o
// "permite mascotas" son características de la unidad, NO amenities: una propiedad con cochera
// y nada más sigue siendo "sin amenities". Los chips de arriba siguen buscando por palabra,
// incluidas esas características. Viaja en la misma lista que el resto de los tags (y en el
// query string, ver buildFilterQueryString), pero es excluyente con ellos (ver toggleAmenityTag).
export const NO_AMENITIES = "Sin amenities";
// Campos estructurados que se cargan al publicar (ver AMENITY_SWITCHES en Publicar.jsx) y que
// cuentan como amenity. No están hasGarage (cochera), luminoso, apto crédito ni amoblado.
const AMENITY_FIELDS = ["hasPool", "buildingAmenities", "security24h"];
// Palabras que, en el título o la descripción, delatan un amenity (el catálogo no tiene columna
// por amenity). Se buscan como palabra entera: "sum" no debe encontrarse dentro de "suma".
const AMENITY_WORDS = ["pileta", "piscina", "parrilla", "quincho", "gimnasio", "sum", "solarium"];
// "seguridad 24" va aparte porque después trae "hs", "horas", etc.
const AMENITY_WORDS_RE = new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:(?:${AMENITY_WORDS.join("|")})(?![\\p{L}\\p{N}])|seguridad\\s*24)`, "u");

/** Prende/apaga un tag de "Características" (sin distinguir mayúsculas) y
 * mantiene "Sin amenities" excluyente con el resto. */
export function toggleAmenityTag(list, tag) {
  const same = t => t.toLowerCase() === tag.toLowerCase();
  if (list.some(same)) return list.filter(t => !same(t));
  if (tag === NO_AMENITIES) return [NO_AMENITIES];
  return [...list.filter(t => t !== NO_AMENITIES), tag];
}

/** true si la propiedad no tiene ningún amenity (ver NO_AMENITIES): ni los campos cargados al
 * publicar ni ninguna palabra de AMENITY_WORDS en el título o la descripción. */
export function hasNoAmenities(property) {
  if (AMENITY_FIELDS.some(field => property[field])) return false;
  const haystack = [property.title, property.description].filter(Boolean).join(" ").toLowerCase();
  return !AMENITY_WORDS_RE.test(haystack);
}
// El catálogo llega ordenado por id descendente (ver PropertyService.listProperties
// en el backend), que ya equivale a "más recientes primero" — por eso esa es
// la opción por default y no reordena nada.
export const SORT_OPTIONS = [
  ["", "Más recientes"],
  ["price_asc", "Menor precio"],
  ["price_desc", "Mayor precio"],
  ["surface_asc", "Menor superficie"],
  ["surface_desc", "Mayor superficie"],
  ["rooms_desc", "Más ambientes"]
];

/** Búsqueda por palabras (no por frase exacta): todas las palabras tienen
 * que aparecer en algún campo (barrio, título, dirección, ambientes o
 * descripción libre), no hace falta que estén juntas ni en ese orden. */
export function matchesSearch(property, searchWords) {
  if (searchWords.length === 0) return true;
  const haystack = [property.neighborhoodName, property.title, property.address, property.description, String(property.rooms)]
    .filter(Boolean).join(" ").toLowerCase();
  return searchWords.every(word => haystack.includes(word));
}

/** Igual que matchesSearch pero para los chips de "Características": cada
 * tag elegido (ej. "Cochera", "Pileta") tiene que aparecer en el título o la
 * descripción de la propiedad. */
export function matchesAmenities(property, amenities) {
  if (!amenities || amenities.length === 0) return true;
  if (amenities.includes(NO_AMENITIES)) return hasNoAmenities(property);
  const haystack = [property.title, property.description].filter(Boolean).join(" ").toLowerCase();
  return amenities.every(tag => haystack.includes(tag.trim().toLowerCase()));
}

export function matchesAgeFilter(property, ageFilter) {
  if (!ageFilter) return true;
  if (property.ageYears == null) return false;
  if (ageFilter === "NEW") return property.ageYears === 0;
  if (ageFilter === "UNTIL5") return property.ageYears <= 5;
  if (ageFilter === "OVER5") return property.ageYears > 5;
  return true;
}

export function filterProperties(properties, {
  search = "",
  minRooms = 0,
  minBathrooms = 0,
  priceFrom = "",
  priceTo = "",
  ageFilter = "",
  publisherType = "",
  orientations = [],
  amenities = []
} = {}) {
  const searchWords = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return properties.filter(p => {
    if (minRooms > 0 && p.rooms < minRooms) return false;
    if (minBathrooms > 0 && (p.bathrooms == null || p.bathrooms < minBathrooms)) return false;
    if (priceFrom && Number(p.price) < Number(priceFrom)) return false;
    if (priceTo && Number(p.price) > Number(priceTo)) return false;
    if (!matchesAgeFilter(p, ageFilter)) return false;
    if (publisherType && p.publisherType !== publisherType) return false;
    if (orientations.length > 0 && !orientations.includes(p.orientation)) return false;
    if (!matchesAmenities(p, amenities)) return false;
    return matchesSearch(p, searchWords);
  });
}

/** Ordena una lista ya filtrada según SORT_OPTIONS. sortKey vacío deja el
 * orden tal cual llega (más recientes primero, ver comentario de SORT_OPTIONS). */
export function sortProperties(properties, sortKey) {
  if (!sortKey) return properties;
  const sorted = [...properties];
  switch (sortKey) {
    case "price_asc":
      sorted.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case "price_desc":
      sorted.sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case "surface_asc":
      sorted.sort((a, b) => Number(a.surfaceM2) - Number(b.surfaceM2));
      break;
    case "surface_desc":
      sorted.sort((a, b) => Number(b.surfaceM2) - Number(a.surfaceM2));
      break;
    case "rooms_desc":
      sorted.sort((a, b) => (b.rooms ?? 0) - (a.rooms ?? 0));
      break;
    default:
      break;
  }
  return sorted;
}

export function countActiveFilters({ minRooms = 0, minBathrooms = 0, priceFrom = "", priceTo = "", ageFilter = "", publisherType = "", orientations = [], amenities = [] }) {
  return [minRooms > 0, minBathrooms > 0, priceFrom !== "", priceTo !== "", ageFilter !== "", publisherType !== "", orientations.length > 0, amenities.length > 0]
    .filter(Boolean).length;
}

/** Arma el query string para pasar el estado de filtros de una pantalla a
 * otra (ej. del mapa al listado completo) sin perder lo que el usuario ya
 * eligió. */
export function buildFilterQueryString({
  operationType, propertyType, search, minRooms, minBathrooms, priceFrom, priceTo, ageFilter, publisherType, orientations, amenities, sort
}) {
  const params = new URLSearchParams();
  if (operationType) params.set("operationType", operationType);
  if (propertyType) params.set("propertyType", propertyType);
  if (search?.trim()) params.set("search", search.trim());
  if (minRooms > 0) params.set("minRooms", String(minRooms));
  if (minBathrooms > 0) params.set("minBathrooms", String(minBathrooms));
  if (priceFrom !== "") params.set("priceFrom", String(priceFrom));
  if (priceTo !== "") params.set("priceTo", String(priceTo));
  if (ageFilter) params.set("age", ageFilter);
  if (publisherType) params.set("publisherType", publisherType);
  if (orientations?.length) params.set("orientation", orientations.join(","));
  if (amenities?.length) params.set("amenities", amenities.join(","));
  if (sort) params.set("sort", sort);
  return params.toString();
}

/** Lee de vuelta los filtros desde un query string (ver buildFilterQueryString). */
export function parseFilterQueryString(searchParams) {
  return {
    operationType: searchParams.get("operationType") ?? "SALE",
    propertyType: searchParams.get("propertyType") ?? "",
    search: searchParams.get("search") ?? "",
    minRooms: Number(searchParams.get("minRooms") ?? 0),
    minBathrooms: Number(searchParams.get("minBathrooms") ?? 0),
    priceFrom: searchParams.get("priceFrom") ?? "",
    priceTo: searchParams.get("priceTo") ?? "",
    ageFilter: searchParams.get("age") ?? "",
    publisherType: searchParams.get("publisherType") ?? "",
    orientations: searchParams.get("orientation")?.split(",").filter(Boolean) ?? [],
    amenities: searchParams.get("amenities")?.split(",").filter(Boolean) ?? [],
    sort: searchParams.get("sort") ?? ""
  };
}

/** Trae el catálogo completo que matchea tipo de operación/propiedad,
 * recorriendo todas las páginas del backend — el resto de los filtros
 * (ambientes, precio, texto libre, etc.) se aplican después, client-side,
 * con filterProperties. Usado tanto por el mapa como por el listado, para
 * que ambos vean siempre el mismo catálogo completo. */
export async function fetchAllProperties(api, baseParams) {
  const pageSize = 100;
  const first = await api.get("/api/properties", { params: { ...baseParams, page: 0, size: pageSize } });
  const allContent = [...first.data.content];
  const remainingPages = first.data.totalPages - 1;
  if (remainingPages > 0) {
    const rest = await Promise.all(Array.from({ length: remainingPages }, (_, i) =>
      api.get("/api/properties", { params: { ...baseParams, page: i + 1, size: pageSize } })));
    for (const res of rest) {
      allContent.push(...res.data.content);
    }
  }
  return allContent;
}
