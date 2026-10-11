import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { normalizeFactors, factorAmount } from "@/lib/explanation";
import { positionInBar } from "@/lib/rangeBar";
import { RangeBar } from "@/components/valuation/RangeBar";
import { FactorBars } from "@/components/valuation/FactorBars";

describe("normalizeFactors", () => {
  it("suma la superficie, corrige tildes y ordena por peso", () => {
    const rows = normalizeFactors([
      { factor: "la cochera", contribution: 120 },
      { factor: "la superficie", contribution: 80 },
      { factor: "la superficie cubierta", contribution: 70 },
      { factor: "la cantidad de banos", contribution: -400 },
      { factor: "las expensas", contribution: 0 }
    ]);
    expect(rows.map(r => r.factor)).toEqual(["la cantidad de baños", "la superficie", "la cochera"]);
    expect(rows[1].contribution).toBe(150);
  });
  it("sin factores devuelve lista vacía", () => {
    expect(normalizeFactors(null)).toEqual([]);
  });
});

describe("RangeBar", () => {
  it("ubica el mínimo en 25 %, el máximo en 75 % y acota lo que cae afuera", () => {
    expect(positionInBar(100, 100, 200)).toBe(25);
    expect(positionInBar(200, 100, 200)).toBe(75);
    expect(positionInBar(150, 100, 200)).toBe(50);
    expect(positionInBar(10_000, 100, 200)).toBe(98);
    expect(positionInBar(-10_000, 100, 200)).toBe(2);
  });

  it("muestra extremos, valor sugerido y el precio del usuario", () => {
    render(<RangeBar min={100} max={200} suggested={130} declared={250} declaredLabel="Tu precio: USD 250" format={v => `USD ${v}`} />);
    expect(screen.getByText("USD 100")).toBeInTheDocument();
    expect(screen.getByText("USD 200")).toBeInTheDocument();
    expect(screen.getByText("USD 130")).toBeInTheDocument();
    expect(screen.getByText("Tu precio: USD 250")).toBeInTheDocument();
  });
});

describe("FactorBars", () => {
  const factors = [{ factor: "la cochera", contribution: 150 }, { factor: "el barrio/zona", contribution: -300 }];

  it("separa lo que sube y lo que baja, con su monto en USD/m² en venta", () => {
    render(<FactorBars factors={factors} operationType="SALE" />);
    expect(screen.getByText("Suben el precio")).toBeInTheDocument();
    expect(screen.getByText("Bajan el precio")).toBeInTheDocument();
    expect(screen.getByText("+USD 150/m²")).toBeInTheDocument();
    expect(screen.getByText("−USD 300/m²")).toBeInTheDocument();
  });

  it("en alquiler muestra pesos con el dólar blue del cálculo", () => {
    render(<FactorBars factors={factors} operationType="RENT" rate={1000} />);
    expect(screen.getByText("+ARS 150.000/mes")).toBeInTheDocument();
    expect(screen.getByText("−ARS 300.000/mes")).toBeInTheDocument();
  });

  it("en alquiler sin cotización queda en USD/mes", () => {
    expect(factorAmount(150, "RENT", null)).toBe("+USD 150/mes");
  });

  it("marca los datos opcionales sin cargar", () => {
    render(<FactorBars missing={{ bathrooms: true }} factors={[{ factor: "la cantidad de banos", contribution: 50 }]} />);
    expect(screen.getByText("la cantidad de baños (sin cargar)")).toBeInTheDocument();
  });
});
