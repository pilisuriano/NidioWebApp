# Prueba de carga de Nidio (50 usuarios concurrentes)

Script de [k6](https://k6.io/) que simula 50 usuarios haciendo un recorrido realista contra la API en producción
(backend en Render, que llama al `ml-service`). Verifica el requerimiento "al menos 50 usuarios concurrentes sin
degradación del servicio" y "Life Score en menos de 5 segundos" (informe 3.3.2).

## Qué hace cada usuario virtual
Repite este ciclo con pausas de 1 a 4 s entre acciones (como una persona):
1. Catálogo de propiedades y detalle de una ficha (siempre).
2. Mapa de precios por barrio (50% de las veces).
3. Valuación `POST /api/valuations` (30%), Life Score `POST /api/life-score` (30%) y recomendador
   `POST /api/recommendations` (30%): son las que llaman al `ml-service` o hacen más cálculo.

Perfil de carga: 1 min hasta 10 usuarios, 1 min hasta 50, **5 min sostenidos con 50 usuarios**, 30 s de bajada.

## Cómo correrla
1. Instalar k6 en Windows: `winget install k6 --source winget` (después cerrar y abrir PowerShell).
2. Prueba corta primero, para ver que todo funciona (30 s, 3 usuarios):
   ```powershell
   cd tests\carga
   $env:BASE_URL="https://TU-BACKEND.onrender.com"; $env:EMAIL="CUENTA_DE_PRUEBA"; $env:PASSWORD="SU_CLAVE"
   k6 run --env SMOKE=1 nidio-carga.js
   ```
3. Prueba real (unos 8 minutos), guardando el resumen en un archivo:
   ```powershell
   k6 run --summary-export=resultado-50vu.json nidio-carga.js
   ```

## Cómo leer el resultado
- `http_req_failed`: porcentaje de errores. Meta: menos de 1%.
- `http_req_duration{tipo:consulta}` y `{tipo:calculo}`: tiempos de respuesta; mirar `p(95)`, o sea, el 95% de los pedidos tardó menos que eso.
- `http_req_duration{endpoint:life_score}`: meta p95 menor a 5 s.
- Cada umbral aparece con ✓ (cumple) o ✗ (no cumple). Si alguno falla, k6 termina con código distinto de 0.

## Advertencias
- Corre contra producción: conviene hacerlo en un horario sin usuarios y avisar al equipo. Usa recursos reales de Render.
- Genera filas en el historial de la cuenta de prueba (valuaciones y Life Score). Usar una cuenta de prueba, no una real.
- Los tiempos incluyen la latencia entre tu computadora y Render (por ejemplo, tu internet). Anotar desde dónde se corrió.
- Los pedidos de `valuations` y `recommendations` se armaron según los DTO del backend; si el smoke test da 400, ajustar el cuerpo en `nidio-carga.js`.
