"""
Nidio -- ml-service/src/models/valuation.py

Reemplaza la implementacion sintetica placeholder (predict_range(), tabla de precio por
m2 por barrio + hash) por el modelo XGBoost real de Nidio (entrenado y validado
extensamente, ver bitacora del modelo `nidio-modelo-valuacion-decisiones.md`).

CORREGIDO (07/08/2026) despues de leer el codigo real del repo:
  - Se saco por completo la conversion a ARS (antes activable por
    VALUATION_CONVERTIR_A_ARS) -- confirmado que TODO el sistema trabaja en USD, y el
    contrato Java real (MlServiceClient.PredictResponse) no tiene un campo `currency`,
    asi que un valor a medias soportado (convertir sin poder avisarle a Java en que
    moneda vino) es mas riesgo que beneficio. Si en el futuro hace falta ARS, hay que
    agregar un campo `currency` al contrato en los dos lados (Python y Java) a la vez,
    no reactivar esto solo.
  - `surface_total_m2` -> `total_surface_m2`, para calzar con el nombre real ya usado en
    toda la app (columna `total_surface_m2` desde V16, DTOs Java `totalSurfaceM2`).

Requiere:
  - predecir_propiedad_nueva.py en el mismo paquete (src/models/).
  - Los artefactos entrenados (modelo_xgboost_venta.json, artefactos_venta.joblib,
    modelo_xgboost_alquiler.json, artefactos_alquiler.joblib) en la carpeta indicada por
    MODEL_ARTIFACTS_PATH (ya definida en el .env.example real del repo), o en
    src/models/artifacts/ si esa variable no esta seteada.
"""
import os

from src.models import predecir_propiedad_nueva as _modelo_nidio

# Respeta MODEL_ARTIFACTS_PATH si esta seteada (ya existia en el .env.example real del
# repo) -- si no, cae al default relativo a este archivo.
_RUTA_ARTEFACTOS = os.environ.get(
    "MODEL_ARTIFACTS_PATH", os.path.join(os.path.dirname(__file__), "artifacts")
)

_PROPERTY_TYPE_MAP = {"APARTMENT": "Departamento", "HOUSE": "Casa", "PH": "PH"}
_OPERATION_MAP = {"SALE": "venta", "RENT": "alquiler"}
_CONDITION_MAP = {
    "NEW": "a_estrenar",
    "USED_GOOD_CONDITION": "usado_buen_estado",
    "NEEDS_RENOVATION": "a_reciclar",
    "NOT_SPECIFIED": "no_especificado",
    None: "no_especificado",
}
# request.<campo> -> nombre esperado por predecir_propiedad_nueva()
_BOOLEAN_FIELD_MAP = {
    "has_pool": "tiene_pileta",
    "has_garage": "tiene_cochera",
    "apto_credito": "apto_credito",
    "building_amenities": "amenities_edificio",
    "security_24h": "seguridad_24hs",
    "bright": "luminoso",
    "furnished": "amoblado",
}


def _traducir_propiedad(request):
    """Arma el dict que espera predecir_propiedad_nueva() a partir del request del
    contrato /predict. Todos los campos opcionales que no se pasaron quedan ausentes
    del dict (no se fuerza ningun valor por default aca -- eso ya lo maneja
    predecir_propiedad_nueva.py de forma consistente, ver bitacora 6.28/6.40)."""
    propiedad = {
        "barrio": request.neighborhood,
        "tipo_propiedad": _PROPERTY_TYPE_MAP[request.property_type.value],
        "ambientes": request.rooms,
        "superficie_cubierta": request.surface_m2,
        "estado_propiedad": _CONDITION_MAP[
            request.property_condition.value if request.property_condition else None
        ],
    }
    if request.total_surface_m2 is not None:
        propiedad["superficie_total"] = request.total_surface_m2
    if request.bathrooms is not None:
        propiedad["banos"] = request.bathrooms
    if request.expenses_usd is not None:
        propiedad["expensas_usd"] = request.expenses_usd
    for campo_request, campo_modelo in _BOOLEAN_FIELD_MAP.items():
        valor = getattr(request, campo_request)
        if valor is not None:
            propiedad[campo_modelo] = valor
    return propiedad


def _precio_real_para_modelo(request, operacion):
    """`declared_price` ya viene en USD (ver docstring del modulo). Para venta,
    predecir_propiedad_nueva() espera `precio_real` en USD/m2 (NO el total -- ver
    bitacora 6.33), asi que se divide por la misma superficie que usa
    _calcular_superficie_usada() (prioriza cubierta, cae a total si cubierta < 10m2)."""
    if request.declared_price is None:
        return None
    if operacion == "alquiler":
        return request.declared_price
    superficie = request.surface_m2
    if superficie is None or superficie < 10:
        superficie = request.total_surface_m2
    if not superficie:
        return None  # no se puede convertir a USD/m2 sin una superficie valida
    return request.declared_price / superficie


def predict_valuation(request):
    """Punto de entrada del endpoint POST /predict. Devuelve un dict con min/max (USD),
    la explicacion completa (factores) y el texto en español listo para mostrarle al
    usuario, usando el modelo XGBoost real.

    No calcula clasificacion (SOBREVALUADO/EN_RANGO/SUBVALUADO) -- eso lo sigue
    calculando el backend en Java (ValuationService.compare()), sin cambios."""
    operacion = _OPERATION_MAP[request.operation_type.value]
    propiedad = _traducir_propiedad(request)
    precio_real = _precio_real_para_modelo(request, operacion)

    resultado = _modelo_nidio.predecir_propiedad_nueva(
        propiedad,
        operacion=operacion,
        precio_real=precio_real,
        explicar=True,
        ruta_artefactos=_RUTA_ARTEFACTOS,
    )

    if operacion == "venta":
        minimo, maximo = resultado["rango_min_total"], resultado["rango_max_total"]
    else:
        minimo, maximo = resultado["rango_min"], resultado["rango_max"]

    return {
        "min": minimo,
        "max": maximo,
        "explanation": resultado["explicacion"],
        "explanation_text": resultado["explicacion_texto"],
    }