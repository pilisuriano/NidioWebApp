# Pruebas de extremo a extremo (Playwright)

Automatizan los flujos de página completa que las pruebas unitarias no cubren: inicio de sesión, rutas protegidas,
catálogo, mapa de calor, tasación y Life Score. Se ejecutan contra el sitio desplegado (o contra uno local).

## Cómo correrlas (PowerShell)

```powershell
cd tests\e2e
npm install
npx playwright install chromium

$env:BASE_URL = "https://<url-del-frontend>"      # sin barra final
$env:E2E_EMAIL = "<cuenta de prueba>"              # se recomienda la cuenta de administrador (sin cupo)
$env:E2E_PASSWORD = "<contraseña>"                 # nunca se guarda en el repositorio
npx playwright test
npx playwright show-report                         # informe HTML con capturas de los fallos
```

Sin `E2E_EMAIL` y `E2E_PASSWORD` se ejecutan solo las pruebas públicas y se omiten las que requieren sesión.
Con `$env:ALL_BROWSERS = "1"` se corren también en Firefox y WebKit (motor de Safari).

Las pruebas de tasación y Life Score consumen cálculos de la cuenta; con la cuenta de administrador no hay cupo.
