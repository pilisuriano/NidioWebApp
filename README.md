# Nidio

Plataforma de apoyo a la toma de decisiones inmobiliarias mediante valuación y análisis geoespacial en la Ciudad Autónoma de Buenos Aires (CABA), pensada para compradores e inquilinos. A diferencia de portales como Zonaprop, Argenprop o Mercado Libre (que se enfocan en publicar avisos), Nidio aporta análisis objetivo basado en datos para apoyar la toma de decisiones.

Trabajo Final de la carrera de Ingeniería Informática (UADE).

## Componentes principales

- **Modelo de valuación** — dos modelos XGBoost independientes (venta, sobre USD/m²; alquiler, sobre USD/mes), entrenados con datasets públicos de publicaciones de CABA (muestras públicas de Zonaprop y Properati, período 2019–2026) y con una referencia de precio de mercado de IDECBA/UADE-INECO como variable adicional. Variables: superficie cubierta, barrio, ambientes, tipo y estado de la propiedad, amenities y tipo de operación. Devuelve un **rango de precio esperado** (no un valor exacto), que permite identificar si una propiedad está subvaluada, en rango o sobrevaluada, junto con una explicación de los factores que más influyen (SHAP).
- **Mapas de calor** — precio por m² por barrio y tipo de operación (IDECBA), niveles de ruido por calle en horario diurno y nocturno (Mapa de Ruido de la Ciudad) y condiciones de seguridad por barrio (dataset de Delitos de la Ciudad). Cuando IDECBA no publica un barrio, el mapa muestra el valor de su comuna; si tampoco la comuna tiene dato, el barrio se muestra en gris.
- **Life Score** — indicador de entorno urbano basado en la cercanía a 7 categorías de puntos de interés (transporte, comercios, espacios verdes, salud, gastronomía, vida nocturna y educación). El usuario pondera cada categoría y puede sumar "Mis lugares" (direcciones personales, guardadas cifradas con AES-256-GCM).
- **Recomendador, favoritos y publicación** — recomendación de propiedades según las preferencias del usuario, favoritos, publicación de propiedades con fotos y panel de administración.

### Sobre los datos

- El catálogo de la plataforma es un **catálogo anonimizado** de 200 propiedades (144 de venta y 56 de alquiler, en 33 barrios), armado con una muestra estratificada del dataset de entrenamiento. El precio de referencia se cargó manualmente a partir de propiedades reales comparables. Las direcciones son anonimizadas (calle real del barrio con altura generada, validada con Georef), los publicadores son 32 cuentas ficticias y las fotos son ilustrativas (Pexels y Unsplash). No son avisos publicados.
- Los precios por m² de los mapas provienen de series de IDECBA (migraciones `V43`–`V45`); las capas de ruido y seguridad se procesan con los scripts de `ml-service/scripts/`.

## Servicios

Monorepo con tres servicios independientes:

| Carpeta | Descripción | Tecnología | Deploy |
|---|---|---|---|
| [`frontend/`](frontend/README.md) | Cliente web (SPA) | React 19 + Vite, React Router, Axios, React Leaflet, Tailwind CSS 4, Recharts (JavaScript) | Vercel |
| [`backend/`](backend/README.md) | API REST | Java 17, Spring Boot 3.3, Spring Security + JWT (jjwt), Spring Data JPA, Hibernate Spatial, Flyway, Spring Mail | Render (Docker) |
| [`ml-service/`](ml-service/README.md) | Valuación, Life Score y ruido | Python, FastAPI, XGBoost, scikit-learn, pandas, geopandas, shapely | Render |

- **Base de datos**: PostgreSQL + PostGIS (esquema versionado con Flyway, 23 tablas y 45 migraciones en `backend/src/main/resources/db/migration/`).
- **Servicios externos**: CARTO (mapa base, opcional), dolarapi.com (cotización del dólar), georef.ar (autocompletado y validación de direcciones), Cloudinary (fotos), Gmail SMTP (verificación de email y recuperación de contraseña).
- **Seguridad**: JWT con expiración de 24 h, contraseñas con BCrypt, HTTPS en producción.

## Documentación

- [`docs/onboarding.md`](docs/onboarding.md) — guía paso a paso para levantar el proyecto desde cero.
- [`docs/architecture/`](docs/architecture/) — ERD, diagrama de sistema y decisiones de arquitectura.
- [`docs/api/endpoints.md`](docs/api/endpoints.md) — contratos REST entre los servicios.
- [`docs/pruebas/`](docs/pruebas/) — registro de prueba de carga y prueba de usabilidad (SUS).
- [`docs/viabilidad/`](docs/viabilidad/) — análisis de viabilidad económica.

## Pruebas y CI

- **Backend**: `./mvnw test` (JUnit, JaCoCo). **Frontend**: `npm run test` (Vitest + Testing Library) y `npm run lint` (oxlint). **ml-service**: `pytest` y `ruff`.
- **End-to-end**: Playwright en [`tests/e2e/`](tests/e2e/README.md). **Carga**: k6 en [`tests/carga/`](tests/carga/README.md).
- Un workflow de GitHub Actions por servicio, que se dispara solo ante cambios en su carpeta: [`frontend-ci.yml`](.github/workflows/frontend-ci.yml), [`backend-ci.yml`](.github/workflows/backend-ci.yml) y [`ml-service-ci.yml`](.github/workflows/ml-service-ci.yml).

## Cómo levantar el proyecto localmente

Requisitos: Git, Node.js 20, JDK 17, Python 3.12 y PostgreSQL con PostGIS. Maven no hace falta: el backend trae `./mvnw`. La guía detallada está en [`docs/onboarding.md`](docs/onboarding.md).

```bash
git clone https://github.com/pilisuriano/NidioWebApp.git
cd NidioWebApp
```

### Variables de entorno

Cada servicio tiene un `.env.example`. Copiarlos a `.env` y completar lo necesario:

```bash
cp backend/.env.example backend/.env
cp ml-service/.env.example ml-service/.env
cp frontend/.env.example frontend/.env
```

En `backend/.env` son obligatorias `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET` y `CUSTOM_PLACE_ENCRYPTION_KEY` (sin esta última el backend no arranca; se genera con `openssl rand -base64 32`). Las variables `MAIL_*` y `CLOUDINARY_*` pueden quedar vacías para desarrollo: solo se pierden el envío de mails y la subida de fotos.

### Correr cada servicio

```bash
# Backend (puerto 8080) — crea las tablas y carga datos al arrancar vía Flyway
cd backend && ./mvnw spring-boot:run

# ml-service (puerto 8000)
cd ml-service
python -m venv .venv && source .venv/bin/activate   # en Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload

# Frontend (puerto 5173)
cd frontend && npm install && npm run dev
```

Con los tres servicios corriendo, la aplicación queda en `http://localhost:5173`.
