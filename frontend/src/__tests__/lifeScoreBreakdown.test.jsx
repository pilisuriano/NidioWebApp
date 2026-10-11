import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { buildBreakdown, biggestLoss, splitBreakdown } from "@/lib/lifeScoreBreakdown";
import { ScoreBreakdown } from "@/components/lifescore/ScoreBreakdown";

const categories = [
  { category: "TRANSPORT", weight: 3, score: 100 },
  { category: "COMMERCE", weight: 1, score: 50 },
  { category: "HEALTH", weight: 0, score: 80 }
];

describe("buildBreakdown", () => {
  it("reparte el total ponderado exacto y las filas suman el total", () => {
    const { rows, total } = buildBreakdown({ categories });
    // (3*100 + 1*50) / 4 = 87.5
    expect(total).toBeCloseTo(87.5, 5);
    expect(rows.reduce((s, r) => s + r.points, 0)).toBeCloseTo(total, 5);
    expect(rows.map(r => r.key)).toEqual(["TRANSPORT", "COMMERCE"]);
    expect(rows[0].possible).toBeCloseTo(75, 5);
    expect(rows[1].lost).toBeCloseTo(12.5, 5);
  });

  it("incluye lugares personales con su peso y detecta los fuera de radio", () => {
    const { rows, total } = buildBreakdown({
      categories,
      customPlaces: [{ id: 7, label: "Gimnasio", distanceM: 2500, score: 0 }],
      placeWeights: { 7: 4 },
      radiusKm: 1
    });
    // Σpesos = 3+1+4 = 8; (300 + 50 + 0)/8 = 43.75
    expect(total).toBeCloseTo(43.75, 5);
    const place = rows.find(r => r.kind === "place");
    expect(place.outOfRadius).toBe(true);
    expect(place.lost).toBeCloseTo(50, 5);
    expect(biggestLoss(rows).key).toBe("place-7");
  });

  it("sin pesos devuelve vacío y biggestLoss ignora pérdidas chicas", () => {
    expect(buildBreakdown({}).rows).toEqual([]);
    const { rows } = buildBreakdown({ categories: [{ category: "TRANSPORT", weight: 1, score: 100 }] });
    expect(biggestLoss(rows)).toBeNull();
  });
});

describe("splitBreakdown", () => {
  it("separa lo que suma (puntaje >= 50) de lo que baja y ordena por puntos", () => {
    const { rows } = buildBreakdown({
      categories: [
        { category: "TRANSPORT", weight: 3, score: 100 },
        { category: "COMMERCE", weight: 1, score: 20 },
        { category: "HEALTH", weight: 2, score: 60 }
      ]
    });
    const { favor, against } = splitBreakdown(rows);
    expect(favor.map(r => r.key)).toEqual(["TRANSPORT", "HEALTH"]);
    expect(against.map(r => r.key)).toEqual(["COMMERCE"]);
  });
});

describe("ScoreBreakdown", () => {
  const meta = [{ key: "TRANSPORT", label: "Transporte", color: "#00647c" }, { key: "COMMERCE", label: "Comercios", color: "#4059aa" }];

  it("renderiza lo que suma, lo que baja y el total", () => {
    render(<ScoreBreakdown
      result={{ categories: [{ category: "TRANSPORT", weight: 3, score: 100 }, { category: "COMMERCE", weight: 1, score: 20 }], customPlaces: [] }}
      placeWeights={{}} radiusKm={null} categoryMeta={meta} placeColor="#c2410c" />);
    expect(screen.getByText("Lo que más suma")).toBeInTheDocument();
    expect(screen.getByText("Lo que lo baja")).toBeInTheDocument();
    expect(screen.getByText("+75,0 pts")).toBeInTheDocument();
    expect(screen.getByText("−20,0 pts")).toBeInTheDocument();
    expect(screen.getByText("80,0 / 100")).toBeInTheDocument();
  });

  it("muestra el lugar personal con distancia y avisa si está fuera del radio", () => {
    render(<ScoreBreakdown
      result={{ categories: [{ category: "TRANSPORT", weight: 1, score: 100 }], customPlaces: [{ id: 7, label: "Casa Mama", distanceM: 3800, score: 0 }] }}
      placeWeights={{ 7: 1 }} radiusKm={2} categoryMeta={meta} placeColor="#c2410c" />);
    expect(screen.getByText("Casa Mama")).toBeInTheDocument();
    expect(screen.getByText(/a 3,8 km, fuera de tu radio/)).toBeInTheDocument();
    expect(screen.getByText("−50,0 pts")).toBeInTheDocument();
  });

  it("sin filas muestra el texto de respaldo", () => {
    render(<ScoreBreakdown result={{ categories: [], customPlaces: [] }} placeWeights={{}} categoryMeta={meta} placeColor="#c2410c" fallback="Texto del backend" />);
    expect(screen.getByText("Texto del backend")).toBeInTheDocument();
  });
});
