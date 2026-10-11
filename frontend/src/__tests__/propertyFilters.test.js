import { describe, it, expect } from "vitest";
import { filterProperties, toggleAmenityTag, NO_AMENITIES } from "@/lib/propertyFilters";

const conPileta = { id: 1, title: "Depto con pileta", description: "", rooms: 2 };
const conCocheraCampo = { id: 2, title: "Depto", description: "Luminoso", rooms: 2, hasGarage: true };
const sinNada = { id: 3, title: "Depto 2 ambientes", description: "Luminoso, cerca del subte", rooms: 2 };
const conCocheraTexto = { id: 4, title: "Depto con cochera y balcón", description: "Aire acondicionado, terraza propia, baulera", rooms: 3 };
const conGimnasio = { id: 5, title: "Depto", description: "Edificio con gimnasio y SUM", rooms: 2 };
const conSeguridad = { id: 6, title: "Depto", description: "", rooms: 2, security24h: true };
const sinSum = { id: 7, title: "Depto", description: "Suma una terraza de uso común y resume todo", rooms: 2 };
const props = [conPileta, conCocheraCampo, sinNada, conCocheraTexto, conGimnasio, conSeguridad, sinSum];

describe("filtro Sin amenities", () => {
  it("deja solo las propiedades sin ningún amenity (texto ni campos de Publicar)", () => {
    expect(filterProperties(props, { amenities: [NO_AMENITIES] }).map(p => p.id)).toEqual([2, 3, 4, 7]);
  });

  it("cochera, balcón, terraza, aire acondicionado y baulera no son amenities", () => {
    const ids = filterProperties(props, { amenities: [NO_AMENITIES] }).map(p => p.id);
    expect(ids).toContain(2); // hasGarage
    expect(ids).toContain(4); // cochera, balcón, aire, terraza y baulera en el texto
  });

  it("pileta, gimnasio, SUM y seguridad 24hs sí son amenities", () => {
    const ids = filterProperties(props, { amenities: [NO_AMENITIES] }).map(p => p.id);
    expect([1, 5, 6].some(id => ids.includes(id))).toBe(false);
  });

  it("no confunde 'sum' con palabras como 'suma' o 'resume'", () => {
    expect(filterProperties(props, { amenities: [NO_AMENITIES] }).map(p => p.id)).toContain(7);
  });

  it("los chips normales siguen filtrando por texto", () => {
    expect(filterProperties(props, { amenities: ["Pileta"] }).map(p => p.id)).toEqual([1]);
  });

  it("elegir Sin amenities apaga los demás chips y viceversa", () => {
    expect(toggleAmenityTag(["Pileta", "Cochera"], NO_AMENITIES)).toEqual([NO_AMENITIES]);
    expect(toggleAmenityTag([NO_AMENITIES], "Pileta")).toEqual(["Pileta"]);
    expect(toggleAmenityTag([NO_AMENITIES], NO_AMENITIES)).toEqual([]);
    expect(toggleAmenityTag(["Pileta"], "pileta")).toEqual([]);
  });
});
