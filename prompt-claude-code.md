Estoy trabajando en el backend de Nidio (Spring Boot + PostgreSQL/PostGIS + Flyway + JWT), parte de un monorepo académico (Trabajo Final de Ingeniería Informática). Antes de tocar código, leé estos tres documentos que ya están en el repo — son la fuente de verdad de lo que hay que construir, no inventes estructura nueva que los contradiga:

- `docs/architecture/erd.md` — las 12 entidades del dominio, sus campos, relaciones e índices.
- `docs/architecture/system-diagram.md` — cómo se comunican frontend, backend, ml-service y la base de datos.
- `docs/api/endpoints.md` — el contrato REST completo, con ejemplos de request/response, status codes y el formato de errores estándar.

## Restricciones del proyecto (no las cuestiones, ya están decididas)

- Monorepo, no toques `frontend/` ni `ml-service/`.
- Sin Docker. El desarrollo es contra un Postgres local con PostGIS ya instalado y corriendo (db `nidio`, PostGIS habilitado).
- Stack ya scaffoldeado, no lo cambies: Spring Boot 3.3.0, Maven, Spring Web, Spring Data JPA, Spring Security, Validation, driver PostgreSQL, Hibernate Spatial, Flyway, JWT vía `jjwt` (api/impl/jackson, 0.12.6), Lombok.
- Convención de paquetes ya existente: `backend/src/main/java/com/nidio/{controller,service,repository,model,dto,config,exception}`.
- Variables de entorno ya definidas en `backend/.env.example` (`DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION_MS`, `CORS_ALLOWED_ORIGINS`, y las de `MAIL_*` para reset de password). Usalas vía `application.properties`, que ya está configurado para leerlas.
- Nombres de entidades y campos en inglés (código), textos de negocio/mensajes de error en español.

## Qué implementar

### 1. Migración Flyway

Crear `backend/src/main/resources/db/migration/V1__init.sql` con las 12 tablas de `erd.md` (USER, PASSWORD_RESET_TOKEN, NEIGHBORHOOD, PROPERTY, VALUATION_REQUEST, NEIGHBORHOOD_PRICE_M2, NOISE_ZONE, SECURITY_ZONE, LIFE_SCORE_QUERY, LIFE_SCORE_CATEGORY_WEIGHT), con sus columnas `geometry` (SRID 4326) y todos los índices documentados en la sección "Índices" del ERD (GiST en columnas espaciales, B-tree en FKs y filtros). Asegurate de que la extensión PostGIS esté habilitada (`CREATE EXTENSION IF NOT EXISTS postgis;` si no existe).

### 2. Entidades JPA

Una clase `@Entity` por tabla en `backend/src/main/java/com/nidio/model/`, con Lombok (`@Getter`/`@Setter`/`@Builder` según corresponda) y los tipos geométricos vía Hibernate Spatial (`org.locationtech.jts.geom.Point` / `Polygon`). Los enums (`PropertyType`, `OperationType`, `ValuationResult`, `POICategory`) van como Java enums, no como tablas, tal como está aclarado en el ERD.

### 3. Repositories

Una interfaz `JpaRepository` (o `PagingAndSortingRepository` donde aplique paginación) por entidad, en `repository/`. Para `PROPERTY`, agregar los métodos de consulta espacial necesarios para `ST_DWithin` (radio de 2km, HU-18) y los filtros de catálogo (tipo, barrio, operación, rango de precio, HU-16).

### 4. Épica 1 — Auth completa, end-to-end

Implementar los 6 endpoints de la sección "Épica 1: Autenticación" de `docs/api/endpoints.md` tal cual están documentados (mismos paths, mismo shape de request/response, mismos status codes):

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/logout` (sin blacklist — es la decisión ya tomada en la doc, el cliente descarta el JWT)
- `GET /api/auth/me`

Incluye: DTOs de request/response en `dto/`, `AuthService` (hash de passwords con BCrypt, generación/validación de JWT con `jjwt`), `AuthController`, configuración de Spring Security en `config/` (rutas públicas vs. protegidas con JWT según la tabla de auth del endpoints.md), y el manejo de excepciones en `exception/` devolviendo exactamente el formato de error de la sección "Formato de errores" del endpoints.md (incluyendo el array `errors` para fallos de validación de campos).

Agregar tests (JUnit + Spring Boot Test) para `AuthService` y `AuthController`: registro exitoso, email duplicado (409), login con credenciales inválidas (401), y validación de campos (400).

### 5. Épicas 2 a 5 — estructura base

Para Valuación, Visualización Geoespacial, Life Score y Exploración de Propiedades: crear las clases `Service` y `Controller` correspondientes a cada endpoint de `endpoints.md`, con las firmas de método correctas y los `@RequestMapping`/`@GetMapping`/`@PostMapping` ya apuntando a los paths documentados, pero sin implementar la lógica de negocio todavía (podés dejar un `// TODO` o lanzar `UnsupportedOperationException` en el body). El objetivo es que la estructura y los DTOs de request/response ya existan y compilen, para que programarlas después sea completar el método, no diseñar de cero. La llamada a `ml-service` (para `/api/valuations` y `/api/life-score`) también queda como TODO — todavía no hace falta un cliente HTTP real.

## Criterios de aceptación

- `./mvnw spring-boot:run` levanta sin errores contra el Postgres local y Flyway aplica `V1__init.sql` limpio (sin migraciones previas en conflicto).
- `./mvnw test` pasa, incluyendo los tests nuevos de Auth.
- Probar manualmente con curl o el cliente REST que prefieras: `register` → `login` → `GET /api/auth/me` con el token devuelto funciona end-to-end.
- El resto de los endpoints (Épicas 2-5) responden (aunque sea con el TODO/501) en las rutas exactas documentadas, no rutas inventadas.
