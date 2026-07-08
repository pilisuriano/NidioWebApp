# Nidio — Frontend (Épica 4)

Cliente web de Nidio: React + Vite (JavaScript), Tailwind CSS 4, React Router, Axios y React Leaflet.

Consume la API REST del backend (Spring Boot, puerto 8080). Ver contratos en [`docs/api/endpoints.md`](../docs/api/endpoints.md).

## Correr localmente

**Prerequisitos:** Node.js 20+, y el backend + ml-service corriendo (ver README de la raíz).

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:8080
npm install
npm run dev            # http://localhost:5173
```

## Scripts

- `npm run dev` — servidor de desarrollo (puerto 5173).
- `npm run build` — build de producción.
- `npm run lint` — `oxlint`.
- `npm run test` — `vitest run`.

## Estructura

- `src/lib/api.js` — cliente Axios + shapes del contrato REST (JWT en `Authorization`).
- `src/lib/auth.jsx` — contexto de sesión (`AuthProvider`, `useAuth`, `RequireAuth`).
- `src/pages/` — Dashboard, Mapa (heatmaps + propiedades), Valuación, Life Score, Mis búsquedas, Perfil y auth.
- `src/components/` — layout y componentes de UI.

Los datos que se ven son sintéticos (solo CABA), sembrados por la migración `V2__seed_synthetic_caba.sql` del backend.

**Nota:** el frontend se migró de TypeScript a JavaScript (decisión del proyecto). `oxlint` y `vitest`/`@testing-library/react` se reinstalaron para que `npm run lint` y `npm run test` volvieran a existir, con tests mínimos en `src/__tests__/`.
