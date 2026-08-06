"""
Nidio -- ml-service/src/models/valuation.py

Reemplaza la implementacion sintetica placeholder (tabla de precio por m2 por barrio +
hash) por el modelo XGBoost real de Nidio (entrenado y validado extensivamente, ver
bitacora del modelo `nidio-modelo-valuacion-decisiones.md`). Ver documento de
integracion (Pili/compañera, 05/08/2026) para el contrato completo.

Requiere:
  - predecir_propiedad_nueva.py en el mismo paquete (src/models/) -- es el modulo real
    ya entregado y probado extensivamente en la sesion de trabajo del modelo.
  - Los artefactos entrenados (modelo_xgboost_venta.json, artefactos_venta.joblib,
    modelo_xgboost_alquiler.json, artefactos_alquiler.joblib) en src/models/artifacts/
    -- sacados del .gitignore y commiteados directo al repo (decision tomada 05/08/2026,
    ver roadmap: son pocos MB, mas simple que storage externo para el alcance de
    diciembre).

Moneda -- CONFIRMADO por Pili (07/08/2026): la base ficticia que habia armado la
compañera nunca interactuo con el modelo real (era solo para probar el front), asi que
el ejemplo de contrato en ARS no aplica como referencia. El criterio real es todo lo
trabajado en la sesion del modelo (bitacora `nidio-modelo-valuacion-decisiones.md`):
SIEMPRE en USD. Default cambiado a `VALUATION_CONVERTIR_A_ARS=false` -- se deja la
conversion como opcion (no se borra el codigo) por si mas adelante se decide mostrar
precios en ARS en el frontend, pero HOY la base y el contrato quedan en USD.
"""
import os

from src.models import predecir_propiedad_nueva as _modelo_nidio

# Respeta MODEL_ARTIFACTS_PATH si esta seteada (ya existia en el .env.example del repo,
# pensada justamente para esto) -- si no esta seteada, cae al default relativo a este
# archivo (src/models/artifacts), que es donde van los 4 artefactos commiteados.
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

# CONFIRMADO por Pili (07/08/2026): USD, no ARS -- ver docstring del modulo. Default
# cambiado de true a false. Si mas adelante el frontend quiere mostrar precios en ARS,
# alcanza con poner VALUATION_CONVERTIR_A_ARS=true en el .env del ml-service, sin tocar
# este archivo.
CONVERTIR_A_ARS = os.environ.get("VALUATION_CONVERTIR_A_ARS", "false").lower() == "true"
# Cotizacion dolar blue venta -- actualizar segun corresponda o reemplazar por una
# consulta real si el proyecto arma un mecanismo de actualizacion automatica mas
# adelante. Valor de referencia al 04/08/2026 (ver bitacora del modelo).
DOLAR_BLUE_VENTA = float(os.environ.get("VALUATION_DOLAR_BLUE_VENTA", "1545"))


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
    if request.surface_total_m2 is not None:
        propiedad["superficie_total"] = request.surface_total_m2
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
    """Convierte declared_price (moneda de salida, ej. ARS) a la unidad que espera
    `precio_real` en predecir_propiedad_nueva(): USD/m2 para venta (NO el total --
    ver bitacora 6.33, distincion importante), USD total mensual para alquiler."""
    if request.declared_price is None:
        return None
    precio_usd = (
        request.declared_price / DOLAR_BLUE_VENTA if CONVERTIR_A_ARS else request.declared_price
    )
    if operacion == "alquiler":
        return precio_usd
    # venta: precio_real debe ser USD/m2, no el total -- se divide por la misma
    # superficie que usa _calcular_superficie_usada() (prioriza cubierta, cae a total
    # si cubierta < 10m2 -- ver predecir_propiedad_nueva.py).
    superficie = request.surface_m2
    if superficie is None or superficie < 10:
        superficie = request.surface_total_m2
    if not superficie:
        return None  # no se puede convertir a USD/m2 sin una superficie valida
    return precio_usd / superficie


def _convertir_moneda(valor_usd):
    if valor_usd is None:
        return None
    return valor_usd * DOLAR_BLUE_VENTA if CONVERTIR_A_ARS else valor_usd


def predict_valuation(request):
    """Punto de entrada del endpoint POST /predict. Devuelve un dict con min/max (en
    la moneda configurada -- ver CONVERTIR_A_ARS), la explicacion completa (factores) y
    el texto en español listo para mostrarle al usuario, usando el modelo XGBoost real.

    No calcula clasificacion (SOBREVALUADO/EN_RANGO/SUBVALUADO) -- eso lo sigue
    calculando el backend en Java comparando el precio declarado contra min/max, sin
    cambios respecto del diseño actual (ver documento de integracion, punto 4)."""
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
        minimo_usd, maximo_usd = resultado["rango_min_total"], resultado["rango_max_total"]
    else:
        minimo_usd, maximo_usd = resultado["rango_min"], resultado["rango_max"]

    return {
        "min": _convertir_moneda(minimo_usd),
        "max": _convertir_moneda(maximo_usd),
        "currency": "ARS" if CONVERTIR_A_ARS else "USD",
        "explanation": resultado["explicacion"],
        "explanation_text": resultado["explicacion_texto"],
    }