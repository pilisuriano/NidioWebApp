"""Punto de entrada de la API FastAPI del servicio de ML.

Los dos endpoints usan implementaciones sintéticas temporales (ver
src/models/valuation.py y src/geo/life_score.py) hasta que estén el modelo
entrenado y la integración con OSMnx.
"""

from fastapi import FastAPI
from pydantic import BaseModel, Field

from src.geo.life_score import compute_life_score
from src.models.valuation import predict_range

app = FastAPI(title="Nidio ML Service")


class PredictRequest(BaseModel):
    operationType: str = Field(pattern="^(SALE|RENT)$")
    propertyType: str = Field(pattern="^(APARTMENT|HOUSE|PH)$")
    neighborhood: str
    surfaceM2: float = Field(gt=0)
    rooms: int = Field(gt=0)


class PredictResponse(BaseModel):
    min: float
    max: float


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


class LifeScoreResponse(BaseModel):
    totalScore: float
    categories: list[LifeScoreCategory]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    minimum, maximum = predict_range(
        request.operationType,
        request.propertyType,
        request.neighborhood,
        request.surfaceM2,
        request.rooms,
    )
    return PredictResponse(min=minimum, max=maximum)


@app.post("/life-score", response_model=LifeScoreResponse)
def life_score(request: LifeScoreRequest):
    return compute_life_score(request.lat, request.lon, request.weights)
