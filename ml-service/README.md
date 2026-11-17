# Nidio: ML Service

Servicio de Machine Learning de Nidio, hecho con Python 3.12 y FastAPI. Se despliega en Render. Aporta tres cosas: la valuación de propiedades (modelos XGBoost), el Life Score y el nivel de ruido de un punto.

El backend lo consulta por HTTP. No lee de la base de datos: trabaja con los modelos serializados y con los archivos de `data/`.

## Endpoints

- `GET /health`: estado del servicio.
- `POST /predict`: valuación. Devuelve el rango de precio esperado y los factores que más influyen en la estimación.
- `POST /life-score`: puntaje de entorno urbano de un punto, con los pesos por categoría que define el usuario.
- `GET /noise?lat=&lon=`: ruido diurno y nocturno de un punto.

La documentación interactiva queda en `http://localhost:8000/docs` con el servicio levantado.

## Estructura

- `src/api/`: aplicación FastAPI (`main.py`).
- `src/models/`: valuación (`valuation.py`, `predecir_propiedad_nueva.py`, esquemas) y `artifacts/`, con los modelos entrenados: `modelo_xgboost_venta.json`, `modelo_xgboost_alquiler.json` y sus `artefactos_*.joblib`.
- `src/geo/`: cálculo del Life Score (`life_score.py`) y del ruido (`noise.py`).
- `src/data/`: preprocesamiento de datos.
- `data/`: capas del Life Score y del ruido (ver [`data/README.md`](data/README.md)). Los datasets de entrenamiento no se versionan.
- `scripts/`: generación de las capas de datos y de las migraciones de precios por barrio, de ruido y de seguridad del backend.
- `tests/`: pruebas con pytest.

## Modelo de valuación

Dos modelos XGBoost independientes: venta (sobre USD/m²) y alquiler (sobre USD/mes). Usan como variable adicional una referencia de precio de mercado de IDECBA/UADE-INECO. La salida es un rango de precio esperado, no un valor exacto.

## Desarrollo

```bash
cp .env.example .env
python -m venv .venv && source .venv/bin/activate    # en Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload                    # http://localhost:8000
```

Variable de entorno: `MODEL_ARTIFACTS_PATH`, carpeta de los modelos entrenados (por defecto `src/models/artifacts/`).

## Tests y lint

```bash
pytest
ruff check src
```
