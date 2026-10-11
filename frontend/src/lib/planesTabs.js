// Pestañas de la página /planes. Cada una agrupa los planes de un tipo de usuario para que
// nadie tenga que recorrer una página larga con todo mezclado.

export const PLAN_TABS = [
  { id: "busco", label: "Busco propiedad", hint: "Voy a comprar o alquilar", anchors: ["busco", "packs"] },
  { id: "duenos", label: "Soy dueño", hint: "Publico mi propiedad", anchors: ["duenos", "destacados"] },
  { id: "profesionales", label: "Inmobiliaria o profesional", hint: "Publico muchas propiedades", anchors: ["profesionales"] },
];

/** Pestaña que corresponde a un hash de la URL (#packs → "busco"), o null si no es ninguna. */
export function tabFromHash(hash) {
  const anchor = String(hash ?? "").replace(/^#/, "");
  if (!anchor) return null;
  return PLAN_TABS.find(tab => tab.anchors.includes(anchor))?.id ?? null;
}

/** Pestaña inicial según la cuenta: las profesionales arrancan en la suya, el resto en "Busco propiedad". */
export function defaultTabFor(user) {
  return user?.accountType === "PROFESSIONAL" ? "profesionales" : "busco";
}
