"""
Nidio -- diagnostico PROFUNDO del bug de alquiler (prediccion negativa).

Ya se descarto (comparando construir_candidatas() de entrenar_xgboost_valuacion.py
contra construir_vector_features() de predecir_propiedad_nueva.py, linea por linea):
  - El bloque one-hot extra de ref_cobertura (solo alquiler) -- SI esta espejado
    correctamente en construir_vector_features() (usa artefactos["categorias_onehot"]
    ["ref_cobertura"], que exportar_artefactos_produccion() llena solo para alquiler).
  - El target/ref_col por operacion (TARGET_POR_OPERACION / COLUMNA_REF_POR_OPERACION)
    -- misma unidad en train y en snapshot (los dos salen de la misma columna cruda).
  - barrio_target_encoded -- mismo mapping, misma unidad que el target.

Como la CONSTRUCCION del vector de features parece correcta en el codigo de
referencia, este script imprime el vector X real que arma construir_vector_features()
para el caso Palermo/alquiler, MAS la contribucion (TreeSHAP) de CADA columna
individual -- para ver directamente cual/cuales columnas estan empujando la
prediccion a negativo, en vez de seguir revisando codigo a ciegas.

Correr desde ml-service/, con el venv activado:
    python test_diagnostico_vector_alquiler.py
"""
import json
import sys

sys.path.insert(0, ".")
from src.models.predecir_propiedad_nueva import (
    cargar_artefactos,
    construir_vector_features,
)

try:
    import xgboost as xgb
except ImportError:
    xgb = None

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

modelo, artefactos = cargar_artefactos("alquiler", ruta_artefactos="src/models/artifacts")

print("=== METADATA DE ARTEFACTOS (alquiler) ===")
print("target_col:", artefactos["target_col"])
print("ref_col:", artefactos["ref_col"])
print("cantidad de columnas_modelo:", len(artefactos["columnas_modelo"]))
print("promedio_global (target encoding barrio):", artefactos["target_encoding_barrio"]["promedio_global"])
print("barrio_target_encoded para Palermo:", artefactos["target_encoding_barrio"]["mapping"].get("Palermo", "(no esta en el mapping, cae a promedio_global)"))
print("referencia_mercado_promedio_global:", artefactos["referencia_mercado_promedio_global"])
print("referencia_mercado_por_barrio['Palermo']:", artefactos["referencia_mercado_por_barrio"].get("Palermo", "(no esta en el snapshot, cae a promedio global)"))
print("piso_rango_min_relativo:", artefactos["piso_rango_min_relativo"])
print("limites_rango_globales:", artefactos["limites_rango_globales"])
print("limites_rango_barrio para Palermo:", artefactos["limites_rango_barrio"].get("Palermo", "(no esta, cae a limites globales)"))

print()
print("=== VECTOR X COMPLETO (columna: valor) ===")
X = construir_vector_features(propiedad, "alquiler", artefactos)
for col in X.columns:
    print(f"  {col}: {X[col].iloc[0]}")

print()
print("=== PREDICCION CRUDA ===")
y_pred = float(modelo.predict(X)[0])
print("y_pred (deberia ser USD/mes, positivo, unos cientos/miles):", y_pred)

print()
print("=== CONFIG DEL BOOSTER (por si el objective/base_score estan raros) ===")
booster = modelo.get_booster()
config = json.loads(booster.save_config())
print("objective:", config.get("learner", {}).get("objective", {}).get("name"))
print("base_score:", config.get("learner", {}).get("learner_model_param", {}).get("base_score"))
print("num_feature:", config.get("learner", {}).get("learner_model_param", {}).get("num_feature"))
print("num_target:", config.get("learner", {}).get("learner_model_param", {}).get("num_target"))

print()
print("=== CONTRIBUCION (TreeSHAP) DE CADA COLUMNA, ORDENADAS POR IMPACTO ===")
dmat = xgb.DMatrix(X)
contribs = booster.predict(dmat, pred_contribs=True)[0]
columnas = list(X.columns)
sesgo_base = float(contribs[-1])
pares = list(zip(columnas, [float(c) for c in contribs[:-1]]))
pares.sort(key=lambda p: abs(p[1]), reverse=True)
print(f"  (sesgo base del modelo): {sesgo_base}")
suma = sesgo_base
for col, contrib in pares:
    suma += contrib
    if abs(contrib) > 0.01:
        print(f"  {col}: {contrib:+.2f}   (valor de la columna: {X[col].iloc[0]})")
print(f"  SUMA TOTAL (deberia dar igual a y_pred de arriba): {suma:.2f}")

print()
print("=== PARA COMPARAR: mismo caso pero con banos/expensas/etc en NaN (sin pasar nada opcional) ===")
propiedad_simple = {
    "barrio": "Palermo",
    "tipo_propiedad": "Departamento",
    "ambientes": 2,
    "superficie_cubierta": 45,
    "estado_propiedad": "usado_buen_estado",
}
X_simple = construir_vector_features(propiedad_simple, "alquiler", artefactos)
y_pred_simple = float(modelo.predict(X_simple)[0])
print("y_pred (caso simple):", y_pred_simple)
