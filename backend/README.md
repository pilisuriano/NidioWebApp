# Nidio: Backend

API REST de Nidio, construida con Java 17 y Spring Boot 3.3 (Maven). Se despliega en Render mediante Docker.

Es el punto de entrada de la plataforma: autentica usuarios, expone el catálogo, los mapas de calor, el Life Score, la valuación y el recomendador, y consulta al `ml-service` para las valuaciones y el cálculo del Life Score. Los contratos están en [`docs/api/endpoints.md`](../docs/api/endpoints.md).

## Tecnologías

Spring Web, Spring Data JPA, Spring Security con JWT (jjwt), Spring Validation, Spring Mail, PostgreSQL con PostGIS (Hibernate Spatial), Flyway, Lombok y Cloudinary (fotos). Pruebas con JUnit 5 y JaCoCo.

## Estructura

Código en `src/main/java/com/nidio/`:

- `controller/`: endpoints REST (autenticación, propiedades, mapas de calor, Life Score, valuación, recomendador, favoritos, "Mis lugares", planes, administración).
- `service/`: lógica de negocio.
- `repository/`: acceso a PostgreSQL y PostGIS.
- `model/`: entidades JPA.
- `dto/`: objetos de transferencia de datos.
- `security/` y `config/`: JWT, CORS y configuración.
- `exception/`: manejo centralizado de errores.
- `util/`: utilidades.

El esquema de la base de datos se crea y actualiza con Flyway desde `src/main/resources/db/migration/` (45 migraciones, `V1` a `V45`). `spring.jpa.hibernate.ddl-auto` está en `validate`: Hibernate no modifica el esquema.

## Variables de entorno

Copiar la plantilla y completarla:

```bash
cp .env.example .env
```

Obligatorias: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET` y `CUSTOM_PLACE_ENCRYPTION_KEY` (clave de cifrado AES-256-GCM de "Mis lugares"; sin ella el backend no arranca; se genera con `openssl rand -base64 32`).

Opcionales para desarrollo: `JWT_EXPIRATION_MS` (por defecto 24 h), `CORS_ALLOWED_ORIGINS`, `ML_SERVICE_URL` (por defecto el `ml-service` local en el puerto 8000), `MAIL_*` (verificación de email y recuperación de contraseña por Gmail SMTP) y `CLOUDINARY_*` (subida de fotos). Sin `MAIL_*` no se envían mails y sin `CLOUDINARY_*` no se pueden subir fotos; el resto de la aplicación funciona igual.

## Desarrollo

Requiere JDK 17 y una base PostgreSQL con la extensión PostGIS. Maven no hace falta instalarlo: el proyecto trae el wrapper.

```bash
./mvnw spring-boot:run     # http://localhost:8080
```

## Tests

```bash
./mvnw test      # pruebas unitarias y reporte de cobertura (JaCoCo, en target/site/jacoco)
./mvnw verify    # ciclo completo, el mismo que corre el CI
```

El workflow `backend-ci` corre `./mvnw verify` contra una base PostGIS en cada cambio dentro de `backend/`.

## Despliegue

El `Dockerfile` hace un build en dos etapas (Maven y JRE 17) y limita el heap de la JVM a 400 MB. Render inyecta la variable `PORT`, que la aplicación toma de `server.port`.
