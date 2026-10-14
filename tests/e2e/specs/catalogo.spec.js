import { test, expect } from "@playwright/test";

test.describe("Catálogo de propiedades (público)", () => {
  test("una búsqueda sin coincidencias muestra el aviso de que no hay resultados", async ({ page }) => {
    await page.goto("/propiedades");
    await expect(page.getByRole("heading", { name: "Listado de propiedades" })).toBeVisible();
    await expect(page.locator('a[href^="/propiedades/"]').first()).toBeVisible();
    await page.getByPlaceholder(/Barrio, dirección/).fill("zzzzzzzzzz");
    await expect(page.getByText("No hay propiedades que coincidan con estos filtros.")).toBeVisible();
  });

  test("se puede abrir la ficha de una propiedad del listado", async ({ page }) => {
    await page.goto("/propiedades");
    const primera = page.locator('a[href^="/propiedades/"]').first();
    await expect(primera).toBeVisible();
    await primera.click();
    await expect(page).toHaveURL(/\/propiedades\/[^/]+$/);
    await expect(page.locator("h1")).toBeVisible();
  });
});
