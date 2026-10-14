import { test, expect } from "@playwright/test";
import { HAS_CREDENTIALS, SIN_CREDENCIALES, login } from "./helpers.js";

test.describe("Autenticación y rutas protegidas", () => {
  for (const ruta of ["/tasacion", "/life-score", "/admin"]) {
    test(`sin sesión, ${ruta} redirige al inicio de sesión`, async ({ page }) => {
      await page.goto(ruta);
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  }

  test("credenciales incorrectas muestran un error y no inician sesión", async ({ page }) => {
    await page.goto("/auth/login");
    await page.locator("#email").fill("no-existe@ejemplo.invalid");
    await page.locator("#password").fill("clave-incorrecta-de-prueba");
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator(".bg-error-container")).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("con credenciales válidas se accede a una función protegida", async ({ page }) => {
    test.skip(!HAS_CREDENTIALS, SIN_CREDENCIALES);
    await login(page);
    await page.goto("/tasacion");
    await expect(page).toHaveURL(/\/tasacion/);
    await expect(page.getByRole("heading", { name: "Tasación" })).toBeVisible();
  });
});
