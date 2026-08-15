# Contratos REST

Documentación de los endpoints expuestos entre `frontend/`, `backend/` y `ml-service/`. Mapeados a las historias de usuario (HU-01 a HU-18) del informe formal. Ver el modelo de datos en [`docs/architecture/erd.md`](../architecture/erd.md) y el flujo entre servicios en [`docs/architecture/system-diagram.md`](../architecture/system-diagram.md).

Convención de rutas: `backend` expone `/api/...` en el puerto 8080. `ml-service` expone su API en el puerto 8000 y solo es consumido por `backend` (el frontend nunca le pega directo).

Auth: todos los endpoints de `backend` requieren JWT (`Authorization: Bearer <token>`) salvo los marcados como **público**, según el NFR de seguridad del informe (acceso a funcionalidades de análisis requiere autenticación previa).

## backend — Épica 1: Autenticación

| Método | Endpoint | HU | Auth | Descripción |
|--------|----------|----|------|-------------|
| POST | `/api/auth/register` | HU-01 | público | Crea una cuenta (nombre, email, password). Devuelve el JWT. |
| POST | `/api/auth/login` | HU-02 | público | Autentica con email + password. Devuelve el JWT. |
| POST | `/api/auth/forgot-password` | HU-03 | público | Genera un `PASSWORD_RESET_TOKEN` y dispara el email con el link de recuperación. |
| POST | `/api/auth/reset-password` | HU-03 | público | Recibe el token + nueva password, la actualiza. |
| POST | `/api/auth/logout` | HU-04 | JWT | Ver decisión de logout más abajo. |
| GET | `/api/auth/me` | — | JWT | Devuelve los datos del usuario autenticado. |

<details>
<summary>Ejemplos de request/response — Épica 1</summary>

**POST /api/auth/register** → `201 Created`

```json
// Request
{
  "name": "Magui Alfie",
  "email": "magui@example.com",
  "password": "SuperSegura123"
}
```
```json
// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "name": "Magui Alfie", "email": "magui@example.com" }
}
```
`409 Conflict` si el email ya está registrado.

**POST /api/auth/login** → `200 OK`

```json
// Request
{ "email": "magui@example.com", "password": "SuperSegura123" }
```
Response: mismo shape que `register` (`token` + `user`). `401 Unauthorized` si las credenciales no coinciden.

**POST /api/auth/forgot-password** → `200 OK`

```json
// Request
{ "email": "magui@example.com" }
```
```json
// Response
{ "message": "Si el email existe, vas a recibir un link de recuperación." }
```
Responde siempre `200` con el mismo mensaje exista o no el email, para no filtrar qué cuentas están registradas.

**POST /api/auth/reset-password** → `200 OK`

```json
// Request
{ "token": "a1b2c3d4...", "newPassword": "OtraSegura456" }
```
`400 Bad Request` si el token no existe, expiró o ya fue usado.

**GET /api/auth/me** → `200 OK`

```json
{ "id": 1, "name": "Magui Alfie", "email": "magui@example.com" }
```

</details>

**Decisión — logout sin blacklist:** para el MVP, `/api/auth/logout` no invalida el JWT del lado del servidor: el cliente descarta el token guardado y listo. Mantener una blacklist (tabla o Redis) agrega infraestructura que no se justifica para un prototipo académico de 50 usuarios concurrentes. El endpoint existe igual (responde `200`, sin body) para que el frontend tenga un solo flujo consistente y por si más adelante hace falta invalidación real (ej. "cerrar sesión en todos los dispositivos" → se agregaría una tabla `REVOKED_TOKEN`).

## backend — Épica 2: Valuación de Propiedades

| Método | Endpoint | HU | Auth | Descripción |
|--------|----------|----|------|-------------|
| POST | `/api/valuations` | HU-05, HU-06, HU-07 | JWT | Recibe tipo de operación, tipo de propiedad, barrio, superficie, ambientes y (opcional) precio declarado. Internamente llama a `ml-service POST /predict`, persiste el `VALUATION_REQUEST` y devuelve el rango estimado + si el precio declarado está por encima/dentro/debajo del rango. |
| GET | `/api/valuations/{id}` | — | JWT | Recupera una consulta de valuación guardada. |
| GET | `/api/valuations` | — | JWT | Últimas 20 valuaciones del usuario autenticado (para "Mis búsquedas"). Devuelve `[{ id, operationType, propertyType, neighborhoodName, surfaceM2, rooms, declaredPrice, estimatedMin, estimatedMax, result, createdAt }]`. |

<details>
<summary>Ejemplos de request/response — Épica 2</summary>

**POST /api/valuations** → `201 Created`

```json
// Request
{
  "operationType": "RENT",
  "propertyType": "APARTMENT",
  "neighborhoodId": 12,
  "surfaceM2": 45,
  "rooms": 2,
  "declaredPrice": 350000
}
```
```json
// Response
{
  "id": 88,
  "estimatedMin": 310000,
  "estimatedMax": 360000,
  "result": "FAIR",
  "createdAt": "2026-07-07T14:32:10Z"
}
```
`result` es uno de `UNDERVALUED | FAIR | OVERVALUED` (`null` si no se mandó `declaredPrice`). `502 Bad Gateway` si `ml-service` no responde.

**GET /api/valuations/{id}** → `200 OK` con el mismo shape. `404 Not Found` si no existe o no pertenece al usuario autenticado.

</details>

## backend — Épica 3: Visualización Geoespacial

| Método | Endpoint | HU | Auth | Descripción |
|--------|----------|----|------|-------------|
| GET | `/api/heatmaps/price?operationType=SALE\|RENT` | HU-08, HU-09 | JWT | Devuelve GeoJSON con precio promedio por m² por barrio (`NEIGHBORHOOD_PRICE_M2`), filtrado por tipo de operación. |
| GET | `/api/neighborhoods` | — | JWT | Listado de barrios `[{ id, name }]`, para poblar selectores en el frontend (ej. formulario de valuación). |
| GET | `/api/neighborhoods/{id}/price?operationType=SALE\|RENT` | HU-10 | JWT | Precio promedio por m² de un barrio puntual (al hacer clic en el mapa). |
| GET | `/api/heatmaps/noise` | HU-11 | JWT | Devuelve GeoJSON con niveles de ruido por zona (`NOISE_ZONE`). |
| GET | `/api/heatmaps/security` | HU-12 | JWT | Devuelve GeoJSON con índice de seguridad por zona (`SECURITY_ZONE`). |

<details>
<summary>Ejemplos de request/response — Épica 3</summary>

**GET /api/heatmaps/price?operationType=RENT** → `200 OK`, GeoJSON `FeatureCollection`:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Polygon", "coordinates": [[[-58.43, -34.58], "..."]] },
      "properties": {
        "neighborhoodId": 12,
        "neighborhoodName": "Palermo",
        "avgPriceM2": 2450.5,
        "period": "2026-06"
      }
    }
  ]
}
```

**GET /api/neighborhoods/{id}/price?operationType=RENT** → `200 OK`

```json
{ "neighborhoodId": 12, "neighborhoodName": "Palermo", "avgPriceM2": 2450.5, "period": "2026-06" }
```

**GET /api/heatmaps/noise** y **GET /api/heatmaps/security** → mismo shape `FeatureCollection`, con `properties.noiseLevel` o `properties.crimeCount` / `properties.securityIndex` respectivamente.

</details>

## backend — Épica 4: Life Score

| Método | Endpoint | HU | Auth | Descripción |
|--------|----------|----|------|-------------|
| POST | `/api/life-score` | HU-13, HU-14, HU-15 | JWT | Recibe `address` + `lat`/`lon` (ya resueltos por el frontend vía `/api/addresses/search` o una propiedad favorita — el backend ya no geocodifica texto libre acá) + peso 1-5 por cada una de las 7 categorías + opcionalmente `customPlaceWeights`/`customPlaceRadiusKm`/`customPlaceIds` para "Mis lugares". `customPlaceWeights` es un peso INDIVIDUAL por lugar (mapa id→peso, ver decisión de diseño más abajo) — antes (hasta el 15/08/2026) era un único peso para todo el conjunto de lugares. Llama a `ml-service POST /life-score` para las 7 categorías, calcula en Java (Haversine) el score de cada lugar personal seleccionado, combina ambos en un único `totalScore` ponderado, persiste `LIFE_SCORE_QUERY` + `LIFE_SCORE_CATEGORY_WEIGHT` (solo las 7 categorías fijas — los lugares personales no se auditan por consulta) y devuelve el score total, los POIs cercanos y los lugares personales incluidos con su distancia/score. Debe responder en menos de 5 segundos (NFR). |
| GET | `/api/life-score` | — | JWT | Últimas 20 consultas de Life Score del usuario autenticado (para "Mis búsquedas"). Devuelve `[{ id, address, totalScore, createdAt }]`. |
| GET | `/api/custom-places` | — | JWT | "Mis lugares" del usuario autenticado. |
| POST | `/api/custom-places` | — | JWT | Agrega un lugar personal (`label`, `address`, `lat`, `lon` — lat/lon ya resueltos del autocomplete, igual que arriba). Tope de 15 por usuario (`400` si se excede). |
| DELETE | `/api/custom-places/{id}` | — | JWT | Elimina un lugar personal propio. `404` si no existe o no es del usuario. |

**Decisión — cifrado de "Mis lugares":** `address`/`lat`/`lon` de `custom_place` se guardan cifrados a nivel de aplicación (AES-256-GCM, `EncryptedStringConverter`, clave `CUSTOM_PLACE_ENCRYPTION_KEY`) — son datos personales del usuario (dónde vive, dónde trabaja), a diferencia de la dirección de una propiedad publicada, que es pública por diseño y no pasa por este cifrado. El contrato REST (`CustomPlaceRequest`/`Response`) no cambia — siguen viajando en JSON como texto/números normales; el cifrado es puramente de almacenamiento, transparente para quien consume la API.

**Decisión — `customPlaceIds`, selección de lugares por cálculo:** `LifeScoreRequest.customPlaceIds` (opcional, `List<Long>`) deja elegir qué subconjunto de "Mis lugares" entra en un cálculo puntual (checkbox por lugar en el frontend) — por ejemplo, ignorar "casa de mis papás" al tasar una propiedad para invertir, sin borrar el lugar guardado. `null` (el default de cualquier cliente que no mande el campo) sigue significando "usar todos", igual que antes de agregar esta opción — no rompe compatibilidad. Una lista vacía significa "ninguno para este cálculo". Los IDs que no pertenezcan al usuario autenticado se descartan en silencio (el filtro corre sobre la lista ya scopeada por `userEmail`, nunca contra toda la tabla).

<details>
<summary>Ejemplos de request/response — Épica 4</summary>

**POST /api/life-score** → `201 Created`

```json
// Request
{
  "address": "Av. Santa Fe 3253, CABA",
  "lat": -34.5895,
  "lon": -58.4106,
  "weights": {
    "TRANSPORT": 5, "COMMERCE": 3, "GREEN_SPACE": 4,
    "HEALTH": 2, "GASTRONOMY": 3, "NIGHTLIFE": 1, "EDUCATION": 2
  },
  "customPlaceWeights": { "3": 15, "7": 1 },
  "customPlaceRadiusKm": 2,
  "customPlaceIds": [3, 7]
}
```
`customPlaceWeights` — mapa `id de custom_place → peso` (mismos 4 niveles que muestra el frontend: 1 "No es prioridad", 5 "Me importa", 15 "Me importa mucho", 40 "Es lo que más me importa"). Solo tiene efecto sobre los lugares presentes en `customPlaceIds` (los destildados no entran al cálculo, tengan o no un peso mandado). Un lugar sin entrada en el mapa usa el default (5, "Me importa") — compatibilidad con clientes viejos.
```json
// Response
{
  "id": 55,
  "totalScore": 78.4,
  "location": { "lat": -34.5895, "lon": -58.4106 },
  "categories": [
    {
      "category": "TRANSPORT",
      "weight": 5,
      "poiCount": 12,
      "score": 92,
      "pois": [{ "name": "Subte D - Bulnes", "lat": -34.5889, "lon": -58.4102 }]
    }
  ],
  "customPlaces": [
    { "id": 3, "label": "Trabajo", "address": "Av. Corrientes 1200", "lat": -34.6035, "lon": -58.3847, "distanceM": 620, "score": 76 }
  ],
  "explanation": "Tu puntaje de 78 se apoya principalmente en Transporte y Comercios. Vida nocturna es lo que más lo baja: hay pocos lugares de ese tipo cerca, aunque le diste bastante peso. También se tuvieron en cuenta tus 3 lugares personales, a un promedio de 650 m — son datos privados y cifrados, solo vos podés verlos."
}
```
`502 Bad Gateway` si `ml-service`/OSMnx no responde a tiempo.

**Decisión — "Mis lugares" vs. las 7 categorías fijas:** se calculan con la misma matemática de distancia (Haversine) pero con fórmulas de score distintas a propósito. Las 7 categorías son un índice de *densidad/cobertura* (cuántos POIs hay respecto de lo esperado en una zona bien servida — ver `ml-service/src/geo/life_score.py`) y se mantienen como el índice objetivo/comparable entre propiedades, con un radio de búsqueda fijo (no configurable). "Mis lugares" es una capa personalizada de un único punto por lugar, con *decaimiento por distancia* (100 hasta ~400m, decae a 0 al llegar al radio que el usuario elige, 1-3km, default 2km) — por eso el radio configurable se limita a esta capa y no a las categorías fijas, que perderían comparabilidad si cada usuario las calculara con un radio distinto.

**Decisión — `explanation` en texto, no un desglose numérico tipo SHAP:** a diferencia del XGBoost de tasación (una caja negra que necesita una técnica de atribución como SHAP para estimar qué tan importante fue cada variable), el Life Score es una fórmula transparente por construcción (promedio ponderado) — la contribución de cada categoría ya es una cuenta exacta (`weight × score`), no una aproximación. Por eso `ml-service` ahora también devuelve `score` (0-100) por categoría, no solo `poiCount`: es el dato que le faltaba a Java para poder calcular esa contribución exacta y armar la oración. Se decidió no mostrarle números al usuario final (feedback de Pili: "mucha gente no entiende cuentas matemáticas") — el backend arma una explicación en español ya redactada, mismo criterio que `explanationText` en la tasación.

</details>

## backend — Épica 5: Exploración de Propiedades

| Método | Endpoint | HU | Auth | Descripción |
|--------|----------|----|------|-------------|
| GET | `/api/properties?propertyType=&neighborhood=&operationType=&minPrice=&maxPrice=&page=&size=` | HU-16 | JWT | Catálogo de propiedades sintéticas con filtros, paginado. |
| GET | `/api/properties/{id}` | HU-17 | JWT | Detalle de una propiedad, incluyendo su rango de valuación y Life Score cacheados. |
| GET | `/api/properties/nearby?address=&radiusKm=2&page=&size=` | HU-18 | JWT | Propiedades dentro de un radio (default 2km) de una dirección, vía `ST_DWithin` sobre `PROPERTY.location`. Mismo formato paginado que el listado. |

**Decisión — paginación:** offset/limit estándar de Spring Data (`page`, `size`, default `page=0&size=20`), no cursor. Es más simple de implementar y el catálogo sintético no tiene el volumen que justificaría cursor-based pagination.

<details>
<summary>Ejemplos de request/response — Épica 5</summary>

**GET /api/properties?propertyType=APARTMENT&neighborhood=12&operationType=RENT&minPrice=200000&maxPrice=400000&page=0&size=20** → `200 OK`

```json
{
  "content": [
    {
      "id": 301,
      "title": "Depto 2 amb en Palermo",
      "propertyType": "APARTMENT",
      "operationType": "RENT",
      "neighborhoodName": "Palermo",
      "price": 350000,
      "surfaceM2": 45,
      "rooms": 2,
      "imageUrl": "https://.../foto.jpg"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 134,
  "totalPages": 7
}
```

**GET /api/properties/{id}** → `200 OK`

```json
{
  "id": 301,
  "title": "Depto 2 amb en Palermo",
  "propertyType": "APARTMENT",
  "operationType": "RENT",
  "neighborhood": { "id": 12, "name": "Palermo" },
  "address": "Av. Santa Fe 3253",
  "location": { "lat": -34.5895, "lon": -58.4106 },
  "surfaceM2": 45,
  "rooms": 2,
  "price": 350000,
  "imageUrl": "https://.../foto.jpg",
  "valuation": { "min": 310000, "max": 360000 },
  "lifeScore": 78.4
}
```
`404 Not Found` si el id no existe.

**GET /api/properties/nearby?address=Av.+Santa+Fe+3253&radiusKm=2** → mismo shape paginado que el listado.

</details>

## ml-service — consumido solo por backend

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/predict` | Recibe superficie, barrio, ambientes, tipo de propiedad, tipo de operación. Devuelve `{ min, max }` del rango de precio estimado. MAE objetivo < 15% (NFR). |
| POST | `/life-score` | Recibe lat/lon + pesos por categoría. Consulta OpenStreetMap vía OSMnx, devuelve score total + POIs por categoría. Debe resolver en menos de 5 segundos (NFR). |
| GET | `/health` | Healthcheck para el proveedor de deploy (Render). |

<details>
<summary>Ejemplos de request/response — ml-service</summary>

**POST /predict**
```json
// Request
{ "operationType": "RENT", "propertyType": "APARTMENT", "neighborhood": "Palermo", "surfaceM2": 45, "rooms": 2 }
```
```json
// Response
{ "min": 310000, "max": 360000 }
```

**POST /life-score**
```json
// Request
{
  "lat": -34.5895, "lon": -58.4106,
  "weights": { "TRANSPORT": 5, "COMMERCE": 3, "GREEN_SPACE": 4, "HEALTH": 2, "GASTRONOMY": 3, "NIGHTLIFE": 1, "EDUCATION": 2 }
}
```
```json
// Response
{
  "totalScore": 78.4,
  "categories": [
    { "category": "TRANSPORT", "poiCount": 12, "pois": [{ "name": "Subte D - Bulnes", "lat": -34.5889, "lon": -58.4102 }] }
  ]
}
```

**GET /health**
```json
{ "status": "ok" }
```

</details>

## Formato de errores (backend)

Todos los endpoints de `backend` devuelven errores con el mismo shape (manejado centralizado en `exception/`):

```json
{
  "timestamp": "2026-07-07T14:32:10Z",
  "status": 400,
  "error": "Bad Request",
  "message": "El campo 'email' es obligatorio",
  "path": "/api/auth/register"
}
```

Para errores de validación con múltiples campos, se agrega un array `errors`:

```json
{
  "timestamp": "2026-07-07T14:32:10Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Error de validación",
  "path": "/api/auth/register",
  "errors": [
    { "field": "email", "message": "debe ser un email válido" },
    { "field": "password", "message": "debe tener al menos 8 caracteres" }
  ]
}
```

Status codes usados en todo el backend:

| Código | Cuándo |
|--------|--------|
| 200 | Lectura o acción exitosa sin creación de recurso |
| 201 | Creación de recurso (register, valuations, life-score) |
| 400 | Body inválido (falla `@Valid` de Spring Validation) |
| 401 | JWT ausente, inválido o expirado; o credenciales incorrectas en login |
| 403 | JWT válido pero sin permiso sobre el recurso (no se usa en el MVP, no hay roles) |
| 404 | Recurso inexistente (valuation, property, life-score query) |
| 409 | Conflicto (email ya registrado, token de reset ya usado) |
| 502 | `ml-service` no responde o responde con error |
| 500 | Error no controlado |

## Pendiente de definir

- Documentar los endpoints con OpenAPI/Swagger (`springdoc-openapi`), para que esta tabla no se desincronice del código a medida que crezca.
- Si el proyecto crece más allá del MVP y aparecen roles (ej. admin vs. usuario), revisar el uso de `403`.
