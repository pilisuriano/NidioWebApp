# Nidio: Frontend

Cliente web de Nidio: una SPA en React 19 con Vite (JavaScript), Tailwind CSS 4, React Router, Axios, React Leaflet y Recharts. Se despliega en Vercel.

Consume la API REST del backend (Spring Boot). Los contratos están en [`docs/api/endpoints.md`](../docs/api/endpoints.md).

## Correr localmente

Requisitos: Node.js 20 y el backend y el `ml-service` corriendo (ver el [README de la raíz](../README.md)).

```bash
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

Variables de entorno:

- `VITE_API_URL`: URL base del backend (por ejemplo `http://localhost:8080`).
- `VITE_CARTO_API_KEY`: API key de CARTO para el mapa base. Es opcional: sin ella el mapa usa OpenStreetMap.

## Scripts

- `npm run dev`: servidor de desarrollo (puerto 5173).
- `npm run build`: build de producción.
- `npm run preview`: sirve el build localmente.
- `npm run lint`: análisis estático con `oxlint`.
- `npm run test`: pruebas con Vitest y Testing Library.

## Estructura

Código en `src/`:

- `pages/`: pantallas (inicio, mapa, valuación, Life Score, recomendador, detalle y listado de propiedades, publicar, mis publicaciones, favoritos, planes, perfil, términos y privacidad), más `auth/` (ingreso, registro, verificación de email y recuperación de contraseña) y `admin/` (usuarios, propiedades y métricas).
- `components/`: componentes de interfaz agrupados por funcionalidad (mapa, valuación, Life Score, recomendador, propiedad, planes y layout).
- `lib/`: cliente Axios y contrato REST (`api.js`), sesión (`auth.jsx`) y lógica de cada funcionalidad (valuación, recomendador, capas del mapa, formato, etc.).
- `__tests__/`: pruebas unitarias y de componentes.
- `public/`: logo, imágenes del personaje del recomendador y datos estáticos de las capas del mapa.

El enrutamiento de la SPA en producción se resuelve con `vercel.json`, que redirige todas las rutas a `index.html`.

## Pruebas de extremo a extremo

Las pruebas con Playwright, que recorren los flujos completos contra el sitio desplegado o uno local, están en [`tests/e2e/`](../tests/e2e/README.md).
