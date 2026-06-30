# Nidio — ML Service

Épica 2: servicio de Machine Learning en Python (deploy en Render).

## Estructura

- `data/raw/` — datasets crudos (Kaggle/IDECBA), no versionado
- `data/processed/` — datasets limpios, no versionado
- `notebooks/` — exploración (EDA, prototipado de modelos)
- `src/data/preprocessing.py` — limpieza, IQR, filtrado geográfico CABA
- `src/features/` — feature engineering
- `src/models/` — entrenamiento, valuación y artefactos serializados
- `src/geo/life_score.py` — cálculo del Life Score con OSMnx
- `src/api/` — API FastAPI

## Desarrollo

```bash
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload
```

## Tests

```bash
pytest
```
