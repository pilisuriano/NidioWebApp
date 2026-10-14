import { test, expect } from "@playwright/test";

test.describe("Mapa de calor (público)", () => {
  test("la capa de precios por m² pinta los barrios sobre el mapa", async ({ page }) => {
    await page.goto("/mapa");
    const capa = page.getByRole("button", { name: "Precio m²", exact: true });
    await expect(capa).toBeVisible();
    await capa.click();
    await expect(capa).toHaveAttribute("aria-pressed", "true");
    // Cada barrio coloreado es un polígono SVG dentro del panel de superposiciones de Leaflet.
    await expect.poll(() => page.locator(".leaflet-overlay-pane path").count()).toBeGreaterThan(0);
  });
});
