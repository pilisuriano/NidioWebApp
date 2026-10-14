// Pruebas de extremo a extremo de Nidio (sección 7.2 del informe).
// Variables de entorno:
//   BASE_URL      URL del frontend a probar (por defecto, el servidor local de Vite).
//   E2E_EMAIL     Email de la cuenta de prueba (se recomienda la cuenta de administrador, sin cupo de cálculos).
//   E2E_PASSWORD  Contraseña de esa cuenta (NUNCA se guarda en el repositorio).
//   ALL_BROWSERS  Si vale "1", corre también en Firefox y WebKit (motor de Safari).
import { defineConfig, devices } from "@playwright/test";

const projects = [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }];
if (process.env.ALL_BROWSERS === "1") {
  projects.push({ name: "firefox", use: { ...devices["Desktop Firefox"] } });
  projects.push({ name: "webkit", use: { ...devices["Desktop Safari"] } });
}

export default defineConfig({
  testDir: "./specs",
  // El backend en Render puede tardar en responder si estaba dormido o bajo carga.
  timeout: 120_000,
  expect: { timeout: 30_000 },
  retries: 1,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:5173",
    locale: "es-AR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects,
});
