"""
Nidio -- diagnostico rapido: corre predecir_propiedad_nueva() DIRECTO (sin pasar por
ml-service/FastAPI) con el mismo caso que dio un resultado raro via /predict
(min=max=-14 USD, prediccion central -281 USD, para un depto de 45m2 en Palermo).
Sirve para aislar si el problema esta en los artefactos/modelo, o en el wrapper
(valuation.py) que arma el pedido para /predict.

Correr desde ml-service/, con el venv activado:
    python test_diagnostico_palermo.py
"""
import json
import sys

sys.path.insert(0, ".")
from src.models.predecir_propiedad_nueva import predecir_propiedad_nueva

propiedad = {
    "barrio": "Palermo",
    "tipo_propiedad": "Departamento",
    "ambientes": 2,
    "superficie_cubierta": 45,
    "estado_propiedad": "usado_buen_estado",
    "banos": 1,
    "expensas_usd": 120,
    "tiene_cochera": True,
    "amenities_edificio": True,
    "seguridad_24hs": True,
    "luminoso": True,
    "apto_credito": True,
    "amoblado": False,
}

print("=== CASO 1: mismo caso que probamos via /predict (Palermo, 45m2, 2 amb) ===")
resultado = predecir_propiedad_nueva(
    propiedad, operacion="alquiler", explicar=True,
    ruta_artefactos="src/models/artifacts",
)
print(json.dumps(resultado, indent=2, default=str))

print()
print("=== CASO 2: caso mas simple, sin nada opcional (para descartar algun campo puntual) ===")
propiedad_simple = {
    "barrio": "Palermo",
    "tipo_propiedad": "Departamento",
    "ambientes": 2,
    "superficie_cubierta": 45,
    "estado_propiedad": "usado_buen_estado",
}
resultado_simple = predecir_propiedad_nueva(
    propiedad_simple, operacion="alquiler", explicar=False,
    ruta_artefactos="src/models/artifacts",
)
print(json.dumps(resultado_simple, indent=2, default=str))

print()
print("=== CASO 3: mismo caso pero operacion VENTA, a ver si tambien da numeros raros ===")
propiedad_venta = dict(propiedad)
resultado_venta = predecir_propiedad_nueva(
    propiedad_venta, operacion="venta", explicar=False,
    ruta_artefactos="src/models/artifacts",
)
print(json.dumps(resultado_venta, indent=2, default=str))
