"""Punto de entrada de la API FastAPI del servicio de ML.

/predict usa el modelo XGBoost real (ver src/models/valuation.py). /life-score usa
datasets abiertos de BA Data que viajan en el repo (ver src/geo/life_score.py y
data/README.md), sin llamadas de red -- ya no hay ningun dato sintetico/inventado en
ninguno de los dos endpoints.
"""

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

from src.geo.life_score import compute_life_score
from src.geo.noise import compute_noise
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


class NoiseLevel(BaseModel):
    dbLow: int
    dbHigh: int
    level: int  # 1 = Tranquilo ... 4 = Muy ruidoso (escala relativa a CABA)
    label: str
    source: str  # "2025", o "2018" en Comuna 1 de día (ver data/README.md)
    distanceM: float


class NoiseResponse(BaseModel):
    day: NoiseLevel | None
    night: NoiseLevel | None


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


@app.get("/noise", response_model=NoiseResponse)
def noise(lat: float = Query(..., ge=-90, le=90), lon: float = Query(..., ge=-180, le=180)):
    """Ruido diurno y nocturno del punto (Mapa de Ruido de BA Data). `null` = sin dato."""
    return compute_noise(lat, lon)
