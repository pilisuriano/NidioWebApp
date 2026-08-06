"""
Nidio -- diagnostico: /predict via valuation.py da ~9% MENOS que llamar
predecir_propiedad_nueva() directo, para el MISMO caso de venta (Palermo, 45m2,
2amb, con todos los opcionales). Ambos min Y max bajan por el mismo porcentaje --
eso apunta a que la PREDICCION CRUDA (y_pred, antes del rango) difiere entre los
2 caminos, no a que falte una columna puntual (eso daria una forma de curva
distinta, no un escalado parejo).

Este script llama a los 2 caminos con, en teoria, el MISMO caso, e imprime todo
lo que hace falta para encontrar la diferencia real: el dict `propiedad` que arma
_traducir_propiedad() (comparado campo a campo contra el de CASO 3), el vector X
completo de cada camino, y la prediccion cruda de cada uno.

Correr desde ml-service/, con el venv activado:
    python test_diagnostico_wrapper_venta.py
"""
import sys

sys.path.insert(0, ".")
from src.models.predecir_propiedad_nueva import cargar_artefactos, construir_vector_features, predecir_propiedad_nueva
from src.models.valuation import _traducir_propiedad, predict_valuation
from src.models.valuation_schemas import OperationType, PropertyCondition, PropertyType, ValuationRequest

# ============================================================================
# CAMINO 1: directo, mismo dict que CASO 3 de test_diagnostico_palermo.py
# ============================================================================
propiedad_directo = {
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
modelo, artefactos = cargar_artefactos("venta", ruta_artefactos="src/models/artifacts")
X_directo = construir_vector_features(propiedad_directo, "venta", artefactos)
y_pred_directo = float(modelo.predict(X_directo)[0])
resultado_directo = predecir_propiedad_nueva(propiedad_directo, operacion="venta", ruta_artefactos="src/models/artifacts")

print("=== CAMINO 1 (directo, predecir_propiedad_nueva) ===")
print("propiedad:", propiedad_directo)
print("y_pred (USD/m2):", y_pred_directo)
print("prediccion_total:", resultado_directo["prediccion_total"])
print("rango_min_total, rango_max_total:", resultado_directo["rango_min_total"], resultado_directo["rango_max_total"])

# ============================================================================
# CAMINO 2: via valuation.py, mismo request que el curl que corrio Pili
# ============================================================================
request = ValuationRequest(
    operation_type=OperationType.SALE,
    property_type=PropertyType.APARTMENT,
    neighborhood="Palermo",
    surface_m2=45,
    rooms=2,
    bathrooms=1,
    property_condition=PropertyCondition.USED_GOOD_CONDITION,
    expenses_usd=120,
    has_garage=True,
    building_amenities=True,
    security_24h=True,
    bright=True,
    apto_credito=True,
    furnished=False,
)
propiedad_wrapper = _traducir_propiedad(request)
X_wrapper = construir_vector_features(propiedad_wrapper, "venta", artefactos)
y_pred_wrapper = float(modelo.predict(X_wrapper)[0])
resultado_wrapper = predict_valuation(request)

print()
print("=== CAMINO 2 (via valuation.py / _traducir_propiedad + predict_valuation) ===")
print("propiedad (armado por _traducir_propiedad):", propiedad_wrapper)
print("y_pred (USD/m2):", y_pred_wrapper)
print("min, max (predict_valuation, ya son _total):", resultado_wrapper["min"], resultado_wrapper["max"])

# ============================================================================
# COMPARACION DIRECTA
# ============================================================================
print()
print("=== COMPARACION ===")
print("dicts iguales?:", propiedad_directo == propiedad_wrapper)
if propiedad_directo != propiedad_wrapper:
    claves = set(propiedad_directo) | set(propiedad_wrapper)
    for k in sorted(claves):
        v1 = propiedad_directo.get(k, "<<FALTA>>")
        v2 = propiedad_wrapper.get(k, "<<FALTA>>")
        if v1 != v2:
            print(f"  DIFERENCIA en '{k}': directo={v1!r}  wrapper={v2!r}")

print()
print("=== COMPARACION DE LOS VECTORES X (columna por columna) ===")
if list(X_directo.columns) == list(X_wrapper.columns):
    for col in X_directo.columns:
        v1 = X_directo[col].iloc[0]
        v2 = X_wrapper[col].iloc[0]
        distintos = (v1 != v2) and not (v1 != v1 and v2 != v2)  # tolera NaN == NaN
        marca = "  <-- DISTINTO" if distintos else ""
        print(f"  {col}: directo={v1}  wrapper={v2}{marca}")
else:
    print("Las columnas ni siquiera coinciden:")
    print("  directo:", list(X_directo.columns))
    print("  wrapper:", list(X_wrapper.columns))

print()
print(f"y_pred directo={y_pred_directo:.4f}  y_pred wrapper={y_pred_wrapper:.4f}  ratio={y_pred_wrapper / y_pred_directo:.4f}")
