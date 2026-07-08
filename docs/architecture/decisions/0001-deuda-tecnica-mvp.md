# Deuda técnica conocida del MVP

Registro de atajos tomados durante la implementación inicial (Auth + Épicas 2-5 con datos sintéticos) que hay que revisar antes de reemplazar los datos sintéticos por los datasets reales.

## Tabla de precios por m² duplicada entre backend y ml-service

`backend` sembró precios por barrio en `NEIGHBORHOOD_PRICE_M2` vía `V2__seed_synthetic_caba.sql` (usada para los heatmaps de la Épica 3). `ml-service` tiene su propia tabla de precios por barrio hardcodeada en `src/models/valuation.py` para resolver `/predict` (Épica 2). Son dos fuentes independientes que hoy están alineadas a mano, pero nada garantiza que sigan coincidiendo si se edita una sin la otra.

**Por qué pasó:** `ml-service` todavía no lee de la base de datos en runtime (ver `system-diagram.md`, la llamada a `/predict` no depende de `db`), así que necesitaba sus propios valores para devolver algo coherente.

**Cómo resolverlo:** cuando se cargue el dataset real y se entrene el modelo de valuación (reemplazando la lógica sintética de `valuation.py`), esta duplicación desaparece sola — el modelo entrenado no necesita la tabla hardcodeada. Mientras tanto, si se edita `NEIGHBORHOOD_PRICE_M2` (por ejemplo al ajustar el seed), hay que replicar el cambio a mano en `ml-service/src/models/valuation.py`.

## Proceso viejo del backend en el puerto 8080

Durante la implementación había un proceso del backend corriendo en background con el código anterior (servicios en `TODO`, sin los endpoints nuevos). Se reemplazó por el proceso con el código actual, pero si en algún momento el backend responde con comportamiento viejo (por ejemplo, un endpoint documentado que da 404), lo primero a chequear es que no haya dos procesos de `spring-boot:run` compitiendo por el puerto 8080 (`lsof -i :8080` en Mac/Linux).

## ~~Lint y tests de frontend pendientes~~ (resuelto)

Se reinstaló `oxlint` (`npm run lint`) y `vitest` + `@testing-library/react` (`npm run test`), con tests mínimos en `src/__tests__/`. Los 3 pasos de `frontend-ci.yml` (lint, test, build) se verificaron localmente y pasan.

## Los 3 workflows de CI fallaban por motivos independientes (resuelto el 08/07)

- **frontend-ci:** los scripts `lint`/`test` no existían (ver punto anterior).
- **backend-ci:** `AuthServiceTest` es `@SpringBootTest` (contexto completo, conecta a Postgres real vía Flyway), pero el workflow no tenía ningún servicio de base de datos. Se agregó un `services: postgres` con imagen `postgis/postgis:16-3.4` a `backend-ci.yml`. **Sin verificar end-to-end** (no hay Docker ni acceso a Maven Central desde este entorno) — conviene mirar el run de Actions después del próximo push para confirmar que levanta bien.
- **ml-service-ci:** `tests/` solo tenía un `.gitkeep`, cero tests reales. `pytest` sin tests devuelve exit code 5, que CI trata como falla. Se agregaron `tests/test_valuation.py` y `tests/test_life_score.py` (10 tests, corridos y verificados localmente) más un `pytest.ini` con `pythonpath = .` para que el import `from src...` resuelva igual que en `uvicorn`.
