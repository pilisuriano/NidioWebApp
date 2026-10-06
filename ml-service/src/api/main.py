"""Punto de entrada de la API FastAPI del servicio de ML.

/predict usa el modelo XGBoost real (ver src/models/valuation.py). /life-score usa
datasets abiertos de BA Data que viajan en el repo (ver src/geo/life_score.py y
data/README.md), sin llamadas de red -- ya no hay ningun dato sintetico/inventado en
ninguno de los dos endpoints.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from src.geo.life_score import compute_life_score
from src.models.valuation import predict_valuation
from src.models.valuation_schemas import ValuationRequest, ValuationResponse

app = FastAPI(title="Nidio ML Service")


class LifeScoreRequest(BaseModel):
    lat: float
    lon: float
    weights: dict[str, int]


class Poi(BaseModel):
    name: str
    lat: float
    lon: float


class LifeScoreCategory(BaseModel):
    category: str
    poiCount: int
    pois: list[Poi]
    score: int


class LifeScoreResponse(BaseModel):
    totalScore: float
    categories: list[LifeScoreCategory]


@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict", response_model=ValuationResponse)
def predict(request: ValuationRequest):
    try:
        return predict_valuation(request)
    except ValueError as e:
        # Ej: falta un campo obligatorio, o superficie invalida (ver
        # predecir_propiedad_nueva.py -- valida y tira ValueError con mensaje claro).
        raise HTTPException(status_code=422, detail=str(e))
    except FileNotFoundError as e:
        # Artefactos del modelo no encontrados -- error de configuracion/deploy.
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/life-score", response_model=LifeScoreResponse)
def life_score(request: LifeScoreRequest):
    return compute_life_score(request.lat, request.lon, request.weights)
