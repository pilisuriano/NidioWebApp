import { describe, it, expect } from "vitest";
import { filterProperties, toggleAmenityTag, NO_AMENITIES } from "@/lib/propertyFilters";

const conPileta = { id: 1, title: "Depto con pileta", description: "", rooms: 2 };
const conCocheraCampo = { id: 2, title: "Depto", description: "Luminoso", rooms: 2, hasGarage: true };
const sinNada = { id: 3, title: "Depto 2 ambientes", description: "Luminoso, cerca del subte", rooms: 2 };
const props = [conPileta, conCocheraCampo, sinNada];

describe("filtro Sin amenities", () => {
  it("deja solo las propiedades sin ningún amenity (texto ni campos de Publicar)", () => {
    expect(filterProperties(props, { amenities: [NO_AMENITIES] }).map(p => p.id)).toEqual([3]);
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
