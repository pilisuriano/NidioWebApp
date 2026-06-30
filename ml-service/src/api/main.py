"""Punto de entrada de la API FastAPI del servicio de ML."""

from fastapi import FastAPI

app = FastAPI(title="Nidio ML Service")


@app.get("/health")
def health():
    return {"status": "ok"}
