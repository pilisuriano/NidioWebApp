# Nidio — Backend

Épica 3: API REST en Spring Boot (deploy en Render).

## Estructura

- `controller/` — Endpoints REST
- `service/` — Lógica de negocio (Life Score, etc.)
- `repository/` — Acceso a PostGIS/PostgreSQL
- `model/` — Entidades JPA
- `dto/` — Data Transfer Objects
- `config/` — Seguridad (JWT), CORS, etc.
- `exception/` — Manejo de errores centralizado
- `resources/db/migration/` — Migraciones Flyway (V1__init.sql, V2__...)

## Desarrollo

```bash
cp .env.example .env
./mvnw spring-boot:run
```

## Tests

```bash
./mvnw test
```
