# Nidio

Plataforma web de análisis del mercado inmobiliario en CABA (Argentina), pensada para compradores e inquilinos. A diferencia de portales como Zonaprop, Argenprop o Mercado Libre —que solo publican avisos—, Nidio aporta análisis objetivo basado en datos para la toma de decisiones.

Trabajo Final de la carrera de Ingeniería Informática.

## Componentes del MVP

- **Modelo de valuación** — entrenado con datasets públicos de Kaggle (2019-2026, nivel individual) ajustado con datos agregados de IDECBA (Instituto de Estadística y Censos de CABA, 2010-2026). Variables: superficie, ubicación, ambientes, tipo de propiedad, tipo de operación. Devuelve un rango de precio esperado (no un valor exacto), para detectar sobre/subvaluaciones.
- **Visualización geoespacial** — mapas de calor de precios por m² segmentados por barrio, más mapas de ruido y seguridad (estos últimos también funcionan como variables de penalización/bonificación del Life Score).
- **Life Score** — indicador de entorno urbano basado en cercanía a 7 categorías de POIs (transporte, comercios, espacios verdes, salud, gastronomía, vida nocturna, educación) usando OpenStreetMap vía OSMnx. El usuario pondera cada categoría según sus preferencias. El cálculo debe completarse en menos de 5 segundos.

La plataforma no muestra propiedades reales: usa una base de datos sintética para validar los flujos sin riesgo legal (no hay scraping, por los términos de los portales y por la Ley 25.326 de Protección de Datos Personales). Las imágenes son ilustrativas (bancos abiertos o IA).

## Servicios

Monorepo compuesto por tres servicios independientes:

- [`frontend/`](frontend/README.md) — Épica 4: cliente React + Vite (deploy en Vercel).
- [`backend/`](backend/README.md) — Épica 3: API REST en Spring Boot (deploy en Render).
- [`ml-service/`](ml-service/README.md) — Épica 2: servicio de Machine Learning en Python/FastAPI (deploy en Render).

## Stack

- **Frontend**: React + Vite, React Router, Axios, React Leaflet, Tailwind CSS, Recharts. JavaScript (sin TypeScript).
- **Backend**: Spring Boot (Java) + Maven. Spring Web, Spring Data JPA, Spring Security, Validation, driver PostgreSQL, Hibernate Spatial, Flyway, JWT (jjwt), Lombok.
- **ML Service**: Python + FastAPI. pandas, numpy, scikit-learn, joblib, geopandas, osmnx, shapely, sqlalchemy, psycopg2-binary, python-dotenv, pytest.
- **Base de datos**: PostgreSQL + PostGIS.
- **Seguridad**: JWT, BCrypt, HTTPS, tokens de 24h (sesión activa) / 30min (inactiva).
- **Infraestructura**: sin Docker — Postgres local o gestionado gratuito (Render/Neon/Supabase) para desarrollo. Deploy en Vercel (frontend) + Render (backend y ml-service).

## Documentación

- [`docs/architecture/`](docs/architecture/) — diagramas de arquitectura (ERD, diagrama de sistema) y ADRs.
- [`docs/api/endpoints.md`](docs/api/endpoints.md) — contratos REST entre los tres servicios.

## CI

Cada servicio tiene su propio workflow de GitHub Actions, que se dispara solo ante cambios en su carpeta:

- [`.github/workflows/frontend-ci.yml`](.github/workflows/frontend-ci.yml)
- [`.github/workflows/backend-ci.yml`](.github/workflows/backend-ci.yml)
- [`.github/workflows/ml-service-ci.yml`](.github/workflows/ml-service-ci.yml)

## Cómo levantar el proyecto localmente

### Primera vez en una máquina nueva

```bash
git clone <URL-del-repo>
cd nidio-project
chmod +x setup.sh
./setup.sh
```

Ese script instala las dependencias de ml-service, backend y frontend en orden, creando el entorno virtual de Python (`.venv`) si no existe.

### Variables de entorno

Cada servicio tiene un `.env.example` con las variables necesarias. Copiarlos a `.env` antes de correr cualquier servicio:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
cp ml-service/.env.example ml-service/.env
```

### Correr cada servicio

```bash
# Backend (puerto 8080)
cd backend && mvn spring-boot:run

# ml-service (puerto 8000)
cd ml-service && source .venv/bin/activate && uvicorn src.api.main:app --reload

# Frontend (puerto 5173)
cd frontend && npm run dev
```

## Estado del proyecto

Cronograma de 6 sprints de 2 semanas vía Jira (plazo realista: diciembre).

- [x] Documentación formal (propuesta de tema + informe)
- [x] Scaffolding de los tres servicios
- [x] ERD de la base de datos sintética
- [x] Wireframes de la interfaz (UI implementada sobre el export de AI Studio)
- [x] Datos sintéticos placeholder de CABA (migración `V2__seed_synthetic_caba.sql`: 20 barrios, precios m², zonas de ruido/seguridad, 80 propiedades) — pendiente el pipeline real (limpieza IQR, Kaggle + IDECBA)
- [x] Componente de mapas con heatmap en frontend (React Leaflet: precios, ruido, seguridad)
- [x] Auth end-to-end (Épica 1)
- [x] Backend conectado al frontend y a ml-service (`/predict` y `/life-score` con lógica sintética temporal)
- [x] Frontend migrado de TypeScript a JavaScript (el export de AI Studio había venido en TS)
- [ ] Modelo de valuación real y Life Score con OSMnx en ml-service
- [ ] Reinstalar linter JS (`oxlint`) y tests de frontend — el CI (`frontend-ci.yml`) invoca `npm run lint`/`npm run test`, que no existen todavía en `package.json`
