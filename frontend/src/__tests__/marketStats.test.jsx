import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { offerByNeighborhood, rankNeighborhoods, roomsBreakdown, valuationBreakdown } from "@/lib/marketStats";
import { FeaturedBadge, OperationBadge } from "@/components/property/PropertyBadges";

const f = (name, avgPriceM2) => ({ properties: { neighborhoodName: name, avgPriceM2 } });

describe("marketStats", () => {
  it("ordena barrios por precio, más caros o más accesibles", () => {
    const features = [f("A", 3000), f("B", 5000), f("C", 2000), f("D", 0)];
    expect(rankNeighborhoods(features, "desc", 2).map(r => r.name)).toEqual(["B", "A"]);
    expect(rankNeighborhoods(features, "asc", 2).map(r => r.name)).toEqual(["C", "A"]);
  });

  it("cuenta la oferta por barrio y ordena por cantidad", () => {
    const props = [
      { neighborhoodName: "Palermo", operationType: "SALE" },
      { neighborhoodName: "Palermo", operationType: "RENT" },
      { neighborhoodName: "Palermo", operationType: "SALE" },
      { neighborhoodName: "Caballito", operationType: "RENT" },
      { operationType: "SALE" }
    ];
    expect(offerByNeighborhood(props, 5)).toEqual([
      { name: "Palermo", venta: 2, alquiler: 1, total: 3 },
      { name: "Caballito", venta: 0, alquiler: 1, total: 1 }
    ]);
  });

  it("cuenta la oferta según la tasación", () => {
    const v = { min: 100, max: 200 };
    const props = [
      { operationType: "SALE", price: 50, valuation: v },
      { operationType: "SALE", price: 150, valuation: v },
      { operationType: "SALE", price: 250, valuation: v },
      { operationType: "SALE", price: 250 }
    ];
    expect(valuationBreakdown(props, 1000)).toEqual({ UNDERVALUED: 1, FAIR: 1, OVERVALUED: 1 });
  });

  it("agrupa por ambientes y junta 4 o más", () => {
    const rows = roomsBreakdown([
      { rooms: 1, operationType: "SALE" },
      { rooms: 2, operationType: "RENT" },
      { rooms: 6, operationType: "SALE" },
      { rooms: 4, operationType: "RENT" }
    ]);
    expect(rows.map(r => [r.venta, r.alquiler])).toEqual([[1, 0], [0, 1], [0, 0], [1, 1]]);
  });
});

describe("PropertyBadges", () => {
  it("rotula venta y alquiler", () => {
    render(<><OperationBadge operationType="SALE" /><OperationBadge operationType="RENT" short /></>);
    expect(screen.getByText("VENTA")).toBeInTheDocument();
    expect(screen.getByText("ALQ.")).toBeInTheDocument();
  });

  it("rotula las destacadas", () => {
    render(<FeaturedBadge />);
    expect(screen.getByText("DESTACADA")).toBeInTheDocument();
  });
});
