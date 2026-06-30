# Nidio — Frontend

Épica 4: cliente React + Vite (deploy en Vercel).

## Estructura

- `src/components/` — Mapas, Filtros, Cards, etc.
- `src/hooks/` — Lógica de estado personalizada
- `src/services/` — Llamadas a la API (axios/fetch)
- `src/utils/` — Conversión de datos/geoespacial
- `src/__tests__/` — Tests de componentes

## Librerías clave

- `react-router-dom` — routing entre páginas
- `axios` — llamadas a la API (capa `services/`)
- `react-leaflet` / `leaflet` — mapas (Life Score, exploración)
- `leaflet.heat` — heatmaps de precios por m²

## Desarrollo

```bash
cp .env.example .env
npm install
npm run dev
```

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
