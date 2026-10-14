import { test, expect } from "@playwright/test";
import { HAS_CREDENTIALS, SIN_CREDENCIALES, login } from "./helpers.js";

test.describe("Herramientas de análisis (requieren sesión)", () => {
  test.skip(!HAS_CREDENTIALS, SIN_CREDENCIALES);

  test("la tasación devuelve un rango de precio estimado", async ({ page }) => {
    await login(page);
    await page.goto("/tasacion");
    const calcular = page.getByRole("button", { name: "Calcular valuación" });
    // El botón se habilita cuando cargó la lista de barrios y hay uno elegido.
    await expect(calcular).toBeEnabled();
    await page.locator("#surface").fill("45");
    await calcular.click();
    await expect(page.getByText("RANGO ESTIMADO", { exact: true })).toBeVisible();
    await expect(page.getByText("RESULTADO DEL ANÁLISIS", { exact: true })).toBeVisible();
  });

  test("el Life Score de una dirección devuelve un puntaje y su nivel", async ({ page }) => {
    await login(page);
    const direccion = encodeURIComponent("Av. Cabildo 2100, Belgrano");
    await page.goto(`/life-score?address=${direccion}&lat=-34.5614&lon=-58.4563`);
    await page.getByRole("button", { name: "Calcular Life Score" }).click();
    await expect(page.getByText(/NIVEL:/)).toBeVisible();
  });
});
