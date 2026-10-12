import { describe, it, expect } from "vitest";
import { filterProperties, toggleAmenityTag, NO_AMENITIES, normalizeSearchText, structuredTerms } from "@/lib/propertyFilters";

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

describe("búsqueda de texto", () => {
  const conPiletaCargada = { id: 11, title: "Depto luminoso", description: "Lindo", neighborhoodName: "Palermo", address: "Honduras 4000", rooms: 2, operationType: "SALE", hasPool: true };
  const conCocheraCargada = { id: 12, title: "Depto", description: "", neighborhoodName: "Núñez", address: "Cabildo 1", rooms: 3, operationType: "SALE", hasGarage: true, security24h: true };
  const sinCaracteristicas = { id: 13, title: "Depto", description: "Tranquilo", neighborhoodName: "Palermo", address: "Gorriti 5", rooms: 2, operationType: "SALE", hasPool: false };
  const amobladoAlquiler = { id: 14, title: "Depto", description: "", neighborhoodName: "Belgrano", address: "Juramento 1", rooms: 2, operationType: "RENT", furnished: true };
  const amobladoVenta = { ...amobladoAlquiler, id: 15, operationType: "SALE" };
  const todas = [conPiletaCargada, conCocheraCargada, sinCaracteristicas, amobladoAlquiler, amobladoVenta];
  const ids = search => filterProperties(todas, { search }).map(p => p.id);

  it("reconoce las características cargadas al publicar aunque el texto no las nombre", () => {
    expect(ids("pileta")).toEqual([11]);
    expect(ids("piscina")).toEqual([11]);
    expect(ids("cochera")).toEqual([12]);
    expect(ids("seguridad")).toEqual([12]);
  });

  it("se combina con el barrio y con el resto de las palabras", () => {
    expect(ids("palermo pileta")).toEqual([11]);
    expect(ids("nunez cochera")).toEqual([12]);
    expect(ids("palermo cochera")).toEqual([]);
  });

  it("no distingue tildes ni mayúsculas", () => {
    expect(ids("NUÑEZ")).toEqual([12]);
    expect(ids("núnez")).toEqual([12]);
    expect(normalizeSearchText("Balcón")).toBe("balcon");
    expect(filterProperties([{ id: 1, title: "Con balcón", description: "", rooms: 2 }], { search: "balcon" })).toHaveLength(1);
  });

  it("amoblado solo cuenta en alquiler", () => {
    expect(ids("amoblado")).toEqual([14]);
    expect(structuredTerms(amobladoVenta)).toBe("");
  });

  it("los chips de características también leen los campos cargados", () => {
    expect(filterProperties(todas, { amenities: ["Pileta"] }).map(p => p.id)).toEqual([11]);
    expect(filterProperties(todas, { amenities: ["Cochera"] }).map(p => p.id)).toEqual([12]);
    expect(filterProperties(todas, { amenities: ["Seguridad 24hs"] }).map(p => p.id)).toEqual([12]);
  });
});
