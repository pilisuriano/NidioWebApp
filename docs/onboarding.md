# Onboarding — poner Nidio a correr en una máquina nueva

Guía para levantar los tres servicios (`frontend`, `backend`, `ml-service`) por primera vez. Pensada para alguien que arranca de cero, sin nada instalado.

## 1. Qué instalar

| Herramienta | Versión | Para qué |
|---|---|---|
| [Git](https://git-scm.com/) | cualquiera reciente | clonar el repo |
| [Node.js](https://nodejs.org/) | 20.x | `frontend/` |
| JDK | 17 (recomendado [Temurin](https://adoptium.net/)) | `backend/` |
| Maven | — | **no hace falta instalarlo**: `backend/` trae el wrapper `./mvnw` |
| [Python](https://www.python.org/) | 3.12 | `ml-service/` |
| PostgreSQL + PostGIS | Postgres 16 + PostGIS 3.4 | base de datos (ver opción A/B abajo) |

Docker no hace falta para desarrollo local: solo se usa para desplegar el backend en Render.

Para verificar lo que ya tenés instalado:

```bash
git --version
node --version
java -version
python3 --version
```

## 2. Clonar el repo

```bash
git clone https://github.com/pilisuriano/NidioWebApp.git
cd NidioWebApp
```

## 3. Base de datos

Elegí una opción (ambas están contempladas en el proyecto, no hace falta Docker):

**Opción A — gestionada gratis (más simple, recomendada si no querés instalar Postgres local):** crear una base en [Neon](https://neon.tech) o [Supabase](https://supabase.com) (planes free). Ambos soportan la extensión PostGIS. Guardate la connection string que te dan — va en `DATABASE_URL` del backend (ver paso 4).

**Opción B — Postgres local (macOS con Homebrew):**

```bash
brew install postgresql@16 postgis
brew services start postgresql@16
createdb nidio
psql nidio -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

(En Linux/Windows, instalar Postgres 16 + PostGIS con el gestor de paquetes correspondiente y hacer lo mismo.)

No hace falta crear tablas a mano: el backend las crea solo al arrancar, vía Flyway (migraciones en `backend/src/main/resources/db/migration/`).

## 4. Variables de entorno

Cada servicio tiene un `.env.example` de plantilla:

```bash
cp backend/.env.example backend/.env
cp ml-service/.env.example ml-service/.env
cp frontend/.env.example frontend/.env
```

**`backend/.env`** — completar como mínimo:

```
DATABASE_URL=jdbc:postgresql://localhost:5432/nidio   # o la connection string de Neon/Supabase
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=cualquier-string-largo-random
CUSTOM_PLACE_ENCRYPTION_KEY=<salida de: openssl rand -base64 32>   # obligatoria: sin ella el backend no arranca
```

El resto (`MAIL_*`, `CLOUDINARY_*`) se puede dejar vacío para arrancar — más abajo hay una forma de evitar depender de eso. Sin `MAIL_*` configurado, el registro de cuentas nuevas y "olvidé mi contraseña" no van a mandar mail de verdad (queda solo logueado como warning en la consola del backend); sin `CLOUDINARY_*`, subir fotos de una propiedad va a fallar. Ninguna de las dos cosas bloquea correr el resto de la app.

**`ml-service/.env`** y **`frontend/.env`** — los valores de la plantilla ya sirven tal cual para desarrollo local, no hace falta tocarlos.

## 5. Instalar dependencias y levantar cada servicio

Orden sugerido: backend primero (crea las tablas), después ml-service y frontend en cualquier orden.

```bash
# Backend (puerto 8080) — Java 17
cd backend
./mvnw spring-boot:run
```

```bash
# ml-service (puerto 8000) — Python 3.12
cd ml-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload
```

```bash
# Frontend (puerto 5173) — Node 20
cd frontend
npm install
npm run dev
```

Con los tres corriendo: `http://localhost:5173`.

## 6. Loguearse sin configurar mail

Como el registro de cuentas nuevas requiere verificar el email (y sin `MAIL_*` configurado ese mail no llega), la migración `V17__seed_demo_publishers_and_listings.sql` ya deja **dos cuentas de prueba verificadas** para loguearse directo:

| Email | Contraseña | Tipo |
|---|---|---|
| `inmobiliaria.demo@nidio.app` | `Demo1234!` | Profesional (inmobiliaria) |
| `marcos.ferreyra.demo@nidio.app` | `Demo1234!` | Cuenta común |

Si en algún momento se registra una cuenta propia y hace falta "verificarla" a mano sin mail configurado, conectándose a la base:

```sql
UPDATE "user" SET email_verified = true WHERE email = 'tu@email.com';
```

Y para probar el panel de administración, promover cualquier usuario a admin:

```sql
UPDATE "user" SET role = 'ADMIN' WHERE email = 'tu@email.com';
```

## 7. Verificar que quedó todo bien

- `http://localhost:5173` carga el mapa con el catálogo anonimizado de propiedades de CABA.
- Login con `inmobiliaria.demo@nidio.app` / `Demo1234!` funciona.
- `http://localhost:8080/api/neighborhoods` devuelve JSON (backend arriba).
- `http://localhost:8000/docs` muestra la documentación interactiva de FastAPI (ml-service arriba).

## Problemas comunes

- **El backend no arranca / error de conexión a la DB**: revisar `DATABASE_URL`/`DATABASE_USERNAME`/`DATABASE_PASSWORD` en `backend/.env`, y que Postgres esté corriendo (`brew services list` si es local).
- **Error de la extensión `postgis`**: correr `CREATE EXTENSION IF NOT EXISTS postgis;` a mano contra la base (paso 3).
- **`./mvnw` sin permiso de ejecución**: `chmod +x backend/mvnw`.
