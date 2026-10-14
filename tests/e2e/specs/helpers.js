import { expect } from "@playwright/test";

export const EMAIL = process.env.E2E_EMAIL;
export const PASSWORD = process.env.E2E_PASSWORD;
export const HAS_CREDENTIALS = Boolean(EMAIL && PASSWORD);
export const SIN_CREDENCIALES = "Definir E2E_EMAIL y E2E_PASSWORD para correr esta prueba";

/** Inicia sesión con la cuenta de prueba y espera a salir de la pantalla de login. */
export async function login(page) {
  await page.goto("/auth/login");
  await page.locator("#email").fill(EMAIL);
  await page.locator("#password").fill(PASSWORD);
  await page.locator('form button[type="submit"]').click();
  await expect(page).not.toHaveURL(/\/auth\/login/);
}
