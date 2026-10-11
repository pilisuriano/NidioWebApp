import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { valuationStatus } from "@/lib/valuation";
import { ValuationBadge } from "@/components/ui/ValuationBadge";

const sale = (price) => ({ operationType: "SALE", price, valuation: { min: 100000, max: 120000 } });

describe("valuationStatus", () => {
  it("clasifica una venta contra el rango en USD", () => {
    expect(valuationStatus(sale(90000))).toBe("UNDERVALUED");
    expect(valuationStatus(sale(110000))).toBe("FAIR");
    expect(valuationStatus(sale(130000))).toBe("OVERVALUED");
  });

  it("convierte los alquileres (ARS) con el dólar blue", () => {
    const rent = { operationType: "RENT", price: 1000000, valuation: { min: 700, max: 900 } };
    expect(valuationStatus(rent, 1000)).toBe("OVERVALUED");
    expect(valuationStatus({ ...rent, price: 800000 }, 1000)).toBe("FAIR");
    expect(valuationStatus({ ...rent, price: 500000 }, 1000)).toBe("UNDERVALUED");
  });

  it("no arriesga etiqueta sin tasación o sin cotización", () => {
    expect(valuationStatus({ operationType: "SALE", price: 1 })).toBeNull();
    expect(valuationStatus({ operationType: "RENT", price: 1, valuation: { min: 1, max: 2 } }, null)).toBeNull();
  });
});

describe("ValuationBadge", () => {
  it.each([["FAIR", "EN RANGO"], ["OVERVALUED", "SOBREVALUADA"], ["UNDERVALUED", "SUBVALUADA"]])("muestra %s", (result, label) => {
    render(<ValuationBadge result={result} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("no renderiza nada sin resultado", () => {
    const { container } = render(<ValuationBadge result={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
