# Diagrama de arquitectura de sistema

Cómo se comunican los tres servicios del monorepo, la base de datos y las fuentes de datos externas. Complementa el [ERD](erd.md) y el [contrato de endpoints](../api/endpoints.md).

## Diagrama

```mermaid
flowchart TB
    subgraph client["Cliente"]
        browser["Navegador\n(React + Vite)"]
    end

    subgraph vercel["Vercel"]
        frontend["frontend/\nReact SPA"]
    end

    subgraph render["Render"]
        backend["backend/\nSpring Boot :8080"]
        mlservice["ml-service/\nFastAPI :8000"]
    end

    subgraph dbhost["Render / Neon / Supabase (dev: local)"]
        db[("PostgreSQL + PostGIS\nnidio")]
    end

    subgraph external["Fuentes externas"]
        osm["OpenStreetMap\n(vía OSMnx)"]
        idecba["IDECBA / BA Data\n(ingesta batch, no runtime)"]
    end

    browser -->|"HTTPS"| frontend
    frontend -->|"REST + JWT\n(Authorization: Bearer)"| backend
    backend -->|"REST interno\nPOST /predict, POST /life-score"| mlservice
    backend -->|"JDBC (Hibernate Spatial)"| db
    mlservice -->|"consultas en vivo\n(POIs cercanos)"| osm
    mlservice -.->|"carga inicial de datasets\n(pandas / geopandas)"| idecba
    mlservice -->|"lectura de agregados\n(sqlalchemy, opcional)"| db
```

## Flujos por épica

- **Auth (Épica 1):** `browser → frontend → backend`. El backend es dueño exclusivo de `USER` y `PASSWORD_RESET_TOKEN`; `ml-service` nunca ve credenciales.
- **Valuación (Épica 2):** `frontend → backend → ml-service (POST /predict) → backend` (persiste `VALUATION_REQUEST`) `→ frontend`.
- **Geoespacial (Épica 3):** `frontend → backend → db` directo. Los heatmaps se sirven desde tablas ya agregadas (`NEIGHBORHOOD_PRICE_M2`, `NOISE_ZONE`, `SECURITY_ZONE`), no hay llamada a `ml-service` en este flujo.
- **Life Score (Épica 4):** `frontend → backend → ml-service (POST /life-score) → OpenStreetMap (OSMnx, en vivo) → ml-service → backend` (persiste `LIFE_SCORE_QUERY` + pesos) `→ frontend`. Es el flujo más sensible al límite de 5 segundos (NFR), porque depende de una API externa en tiempo real.
- **Exploración (Épica 5):** `frontend → backend → db` directo, usando `ST_DWithin` sobre `PROPERTY.location` para el filtro por radio.

## Notas de despliegue

- `frontend` en Vercel, `backend` y `ml-service` como dos servicios separados en Render (según lo presupuestado: USD 20/mes c/u).
- En desarrollo local los tres servicios corren en `localhost` contra el mismo Postgres local; en producción cada uno apunta a la misma instancia gestionada (Render/Neon/Supabase) vía `DATABASE_URL`.
- `ml-service` solo necesita acceso de lectura a `db` si se decide leer agregados (`NEIGHBORHOOD_PRICE_M2`, etc.) directamente para entrenar o recalcular el modelo offline; en runtime (`/predict`, `/life-score`) no depende de la base, solo de sus artefactos de modelo (`MODEL_ARTIFACTS_PATH`) y de OSM.
- Nada del `frontend` habla directo con `ml-service` ni con la base: todo pasa por `backend`, que es el único punto de autenticación (JWT) y de acceso a datos.
