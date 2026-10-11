import { describe, it, expect } from "vitest";
import { interleaveFeatured } from "@/lib/propertyFilters";
import { arsApprox, formatArs, formatUsd } from "@/lib/cardRate";

const items = n => Array.from({ length: n }, (_, i) => ({ id: i + 1 }));
const ids = list => list.map(p => p.id);

describe("interleaveFeatured", () => {
  it("sin destacadas deja la lista igual", () => {
    const list = items(6);
    expect(interleaveFeatured(list, new Set())).toBe(list);
  });

  it("pone una destacada primero y otra cada 5 resultados, respetando el orden de cada grupo", () => {
    const list = items(12);
    const result = ids(interleaveFeatured(list, new Set([9, 11]), 5));
    // posiciones 0 y 5 son las destacadas (9 y 11); el resto mantiene su orden
    expect(result).toEqual([9, 1, 2, 3, 4, 11, 5, 6, 7, 8, 10, 12]);
  });

  it("si hay más destacadas que lugares, las que sobran van después sin perderse", () => {
    const list = items(3);
    const result = ids(interleaveFeatured(list, new Set([1, 2, 3]), 5));
    expect(result).toEqual([1, 2, 3]);
    expect(result).toHaveLength(3);
  });

  it("no pierde ni duplica propiedades", () => {
    const list = items(30);
    const result = ids(interleaveFeatured(list, new Set([3, 7, 15, 22, 29]), 5));
    expect([...result].sort((a, b) => a - b)).toEqual(ids(list));
  });
});

describe("dólar tarjeta", () => {
  it("formatea el precio en dólares", () => {
    expect(formatUsd(6)).toBe("USD 6");
    expect(formatUsd(6.4)).toBe("USD 6,40");
  });

  it("redondea los pesos a la centena para que se lea como aproximado", () => {
    expect(formatArs(9380)).toBe("$ 9.400");
    expect(arsApprox(6, 1560)).toBe("$ 9.400");
  });

  it("sin cotización no muestra pesos", () => {
    expect(arsApprox(6, null)).toBeNull();
  });
});
