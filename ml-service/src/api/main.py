"""Punto de entrada de la API FastAPI del servicio de ML."""

from fastapi import FastAPI, HTTPException

from src.models.valuation import predict_valuation
from src.models.valuation_schemas import ValuationRequest, ValuationResponse

app = FastAPI(title="Nidio ML Service")


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
        # Artefactos del modelo no encontrados (ver src/models/artifacts/) -- error de
        # configuracion/deploy, no del request del usuario.
        raise HTTPException(status_code=500, detail=str(e))