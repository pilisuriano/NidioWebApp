"""
Nidio -- diagnostico de variantes para el bug de alquiler.

Ya sabemos (ver test_diagnostico_vector_alquiler.py):
  - Run C (el modelo que se exporta a produccion) valida BIEN en Colab, EN MEMORIA,
    evaluado con datos reales de test (R2=0.8498, cobertura 79.5%).
  - Pero para el caso sintetico Palermo/45m2/2amb, la prediccion via
    predecir_propiedad_nueva() (que carga el modelo YA GUARDADO en JSON) da NEGATIVO.
  - Las 2 columnas que mas empujan a negativo son 'superficie_usada_m2' (-315, para un
    valor de 45.0, NO falta) y 'superficie_total' (-92, porque quedo en NaN -- no se
    paso ese campo).
  - Ojo: 'superficie_total' es la 2da columna mas importante del modelo (11.68% de
    importancia) -- si en el dataset de entrenamiento casi siempre viene con un valor
    real (no NaN), el caso "falta" puede ser un rincon raro/no representativo del
    dataset, y por eso tira para abajo tan fuerte.

Este script prueba variantes puntuales para aislar la causa real:
  A) Mismo caso pero completando superficie_total = superficie_cubierta (en vez de
     dejarlo NaN) -- prueba si el problema es la falta de ese dato.
  B) Superficie mas grande (tipica de un 2-ambientes real en Palermo, ej. 55-65m2) --
     prueba si 45m2 para 2 ambientes es un combo raro/fuera de distribucion.
  C) Ambientes = 1 con la misma superficie de 45m2 (monoambiente grande) -- mismo
     motivo que B, desde el otro lado.
  D) Barrio distinto (Belgrano) con los mismos atributos -- para ver si es
     especifico de Palermo o generalizado.
  E) Un caso "de manual" bien tipico: monoambiente chico (28m2, 1 ambiente, sin
     amenities) -- el tipo de propiedad mas comun en alquiler CABA.

Correr desde ml-service/, con el venv activado:
    python test_diagnostico_variantes_alquiler.py
"""
import sys

sys.path.insert(0, ".")
from src.models.predecir_propiedad_nueva import predecir_propiedad_nueva

BASE = {
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


def probar(nombre, propiedad):
    r = predecir_propiedad_nueva(propiedad, operacion="alquiler", ruta_artefactos="src/models/artifacts")
    print(f"{nombre}: prediccion={r['prediccion']:.2f}  rango=({r['rango_min']:.2f}, {r['rango_max']:.2f})")


print("=== A) Igual al caso original, pero completando superficie_total = superficie_cubierta ===")
caso_a = dict(BASE, superficie_total=45)
probar("A", caso_a)

print()
print("=== B) Superficie mas grande (55m2 y 65m2), superficie_total = cubierta ===")
for m2 in (50, 55, 60, 65, 75):
    caso_b = dict(BASE, superficie_cubierta=m2, superficie_total=m2)
    probar(f"B (m2={m2})", caso_b)

print()
print("=== C) Ambientes=1, misma superficie 45m2 ===")
caso_c = dict(BASE, ambientes=1, superficie_total=45)
probar("C", caso_c)

print()
print("=== D) Mismo caso original (45m2, 2amb) pero en Belgrano ===")
caso_d = dict(BASE, barrio="Belgrano", superficie_total=45)
probar("D", caso_d)

print()
print("=== E) Monoambiente tipico: 28m2, 1 ambiente, sin amenities ===")
caso_e = {
    "barrio": "Palermo",
    "tipo_propiedad": "Departamento",
    "ambientes": 1,
    "superficie_cubierta": 28,
    "superficie_total": 28,
    "estado_propiedad": "usado_buen_estado",
}
probar("E", caso_e)

print()
print("=== F) Barrido de superficie_cubierta de 20 a 100, todo lo demas fijo (Palermo, 2amb, superficie_total=cubierta) ===")
for m2 in range(20, 101, 10):
    caso_f = dict(BASE, superficie_cubierta=m2, superficie_total=m2)
    probar(f"F (m2={m2})", caso_f)
