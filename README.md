# NidioWebApp

Monorepo de Nidio, compuesto por tres servicios independientes:

- [`frontend/`](frontend/README.md) — Épica 4: cliente React (deploy en Vercel).
- [`backend/`](backend/README.md) — Épica 3: API REST en Spring Boot (deploy en Render).
- [`ml-service/`](ml-service/README.md) — Épica 2: servicio de Machine Learning en Python/FastAPI (deploy en Render).

## Documentación

- [`docs/architecture/`](docs/architecture/) — diagramas de arquitectura (ERD, diagrama de sistema) y ADRs.
- [`docs/api/endpoints.md`](docs/api/endpoints.md) — contratos REST entre los tres servicios.

## CI

Cada servicio tiene su propio workflow de GitHub Actions, que se dispara solo ante cambios en su carpeta:

- [`.github/workflows/frontend-ci.yml`](.github/workflows/frontend-ci.yml)
- [`.github/workflows/backend-ci.yml`](.github/workflows/backend-ci.yml)
- [`.github/workflows/ml-service-ci.yml`](.github/workflows/ml-service-ci.yml)
