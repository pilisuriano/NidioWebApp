/**
 * Buscador de Inicio: interpreta lo que la persona escribe para llevarla al mapa con la operación
 * (comprar / alquilar), el tipo de propiedad y los ambientes ya cargados, y solo el resto del texto
 * (barrio, dirección) queda como búsqueda. Antes "alquiler" se buscaba como una palabra más y no
 * encontraba nada (reportado en la prueba de SUS).
 *
 * Todo corre en el navegador, sin pegarle al backend ni guardar lo que se escribe.
 */

function normalize(value) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const RENT_WORDS = new Set(["alquiler", "alquileres", "alquilar", "alquilo", "alquila", "renta", "rentar", "rent"]);
const SALE_WORDS = new Set(["venta", "ventas", "vender", "comprar", "compra", "compro", "comprarme", "sale"]);
const TYPE_WORDS = {
  depto: "APARTMENT", deptos: "APARTMENT", dpto: "APARTMENT", dptos: "APARTMENT",
  departamento: "APARTMENT", departamentos: "APARTMENT",
  casa: "HOUSE", casas: "HOUSE",
  ph: "PH", phs: "PH"
};
// Conectores que sobran al principio o al final ("alquiler EN palermo"); en el medio se dejan,
// porque forman parte de nombres de barrio (Parque de los Patricios, Villa del Parque).
const EDGE_FILLER = new Set(["en", "de", "del", "un", "una", "para", "por", "con", "el", "la", "quiero", "busco", "necesito", "ambientes", "ambiente", "amb"]);

/**
 * @param {string} text lo que escribió la persona
 * @returns {{ operationType: ("SALE"|"RENT"|null), propertyType: (string|null), rooms: number[], search: string }}
 */
export function parseSearchIntent(text) {
  const result = { operationType: null, propertyType: null, rooms: [], search: "" };
  if (typeof text !== "string" || !text.trim()) return result;

  const tokens = text.replace(/[,;]+/g, " ").trim().split(/\s+/).filter(Boolean);
  const addRooms = n => {
    if (n >= 1 && n <= 10) result.rooms.push(Math.min(n, 5));
  };
  // Se compara sin tildes ni mayúsculas, pero lo que sobra se conserva tal cual lo escribió la persona
  // (el filtro del mapa busca "núñez" con tilde en el barrio).
  const kept = [];
  for (let i = 0; i < tokens.length; i++) {
    const word = normalize(tokens[i]);
    const next = i + 1 < tokens.length ? normalize(tokens[i + 1]) : "";
    const glued = word.match(/^(\d{1,2})\+?(?:ambientes?|amb\.?)$/);
    if (/^monoambientes?$/.test(word)) {
      addRooms(1);
    } else if (glued) {
      addRooms(Number(glued[1]));
    } else if (/^\d{1,2}\+?$/.test(word) && /^(?:ambientes?|amb\.?)$/.test(next)) {
      // "3 ambientes", "3 amb": los números sueltos se dejan, pueden ser la altura de una calle.
      addRooms(parseInt(word, 10));
      i++;
    } else if (RENT_WORDS.has(word)) {
      result.operationType = "RENT";
    } else if (SALE_WORDS.has(word)) {
      result.operationType = "SALE";
    } else if (TYPE_WORDS[word] && result.propertyType == null) {
      result.propertyType = TYPE_WORDS[word];
    } else {
      kept.push(tokens[i]);
    }
  }
  while (kept.length > 0 && EDGE_FILLER.has(normalize(kept[0]))) kept.shift();
  while (kept.length > 0 && EDGE_FILLER.has(normalize(kept[kept.length - 1]))) kept.pop();

  result.rooms = [...new Set(result.rooms)].sort((a, b) => a - b);
  result.search = kept.join(" ");
  return result;
}

/**
 * Arma la URL del mapa. Lo que se eligió con los botones del buscador (`selected`) se completa con lo
 * que se entendió del texto; si hay conflicto, gana lo escrito (es lo último que hizo la persona).
 *
 * @param {string} text
 * @param {{ operationType?: string, propertyType?: string }} selected
 */
export function buildMapUrl(text, selected = {}) {
  const intent = parseSearchIntent(text);
  const params = new URLSearchParams();
  const operationType = intent.operationType ?? selected.operationType ?? "";
  const propertyType = intent.propertyType ?? selected.propertyType ?? "";
  if (operationType) params.set("operationType", operationType);
  if (propertyType) params.set("propertyType", propertyType);
  if (intent.rooms.length > 0) params.set("rooms", intent.rooms.join(","));
  if (intent.search) params.set("search", intent.search);
  const query = params.toString();
  return query ? `/mapa?${query}` : "/mapa";
}
