"""
Nidio -- Prediccion de una propiedad NUEVA en produccion (paso 3 del plan de bitacora
6.25/6.28): dado un diccionario con los atributos de una propiedad que NO esta en el
dataset de entrenamiento, calcula:
  1. La prediccion puntual del modelo Run C -- el modelo de PRODUCCION, entrenado SIN
     `fuente_aviso` (ver bitacora 6.28 para el motivo: esa feature indica de que fuente
     de SCRAPING vino un aviso de entrenamiento, y una propiedad nueva cargada en
     produccion no viene de ninguna de esas fuentes -- no hay valor real posible).
  2. El rango de precio esperado (metodologia split-conformal, ver bitacora 6.26/6.28).
  3. Si se pasa el precio real/listado de la propiedad, la clasificacion
     SOBREVALUADO / EN_RANGO / SUBVALUADO -- el objetivo central declarado del MVP (ver
     instrucciones del proyecto).

Este script es standalone a proposito (no importa entrenar_xgboost_valuacion.py) --
solo depende de xgboost/joblib/pandas/numpy, pensado para correr detras de un endpoint
del backend sin arrastrar sklearn/shap (que solo hacen falta para ENTRENAR, no para
predecir).

Requiere los artefactos ya exportados por entrenar_xgboost_valuacion.py
(exportar_artefactos_produccion(), ver bitacora 6.28), en el mismo directorio (o el que
se pase en `ruta_artefactos`):
    modelo_xgboost_<operacion>.json
    artefactos_<operacion>.joblib

USO (ver tambien el bloque `if __name__ == "__main__"` mas abajo):
    from predecir_propiedad_nueva import predecir_propiedad_nueva

    resultado = predecir_propiedad_nueva(
        {
            "barrio": "Palermo", "tipo_propiedad": "Departamento", "ambientes": 2,
            "superficie_cubierta": 45, "estado_propiedad": "usado_buen_estado",
            "tiene_cochera": False, "tiene_pileta": False, "apto_credito": True,
            "amenities_edificio": True, "seguridad_24hs": True, "luminoso": True,
        },
        operacion="venta",
        precio_real=2200,  # opcional -- si se pasa, agrega la clasificacion
        ruta_artefactos=".",
    )
    print(resultado)
    # {'operacion': 'venta', 'target': 'precio_usd_m2', 'prediccion': ...,
    #  'rango_min': ..., 'rango_max': ..., 'precio_real': 2200.0, 'clasificacion': ...}

    # Para agregar la explicacion "por que" (factores que mas influyeron, TreeSHAP
    # nativo de xgboost -- ver bitacora 6.30), pasar explicar=True:
    resultado = predecir_propiedad_nueva({...}, operacion="alquiler", precio_real=1300, explicar=True)
    # resultado["explicacion"] = [
    #   {"factor": "la superficie", "contribucion": -134.2, "direccion": "baja el precio"},
    #   {"factor": "el barrio/zona", "contribucion": 88.5, "direccion": "sube el precio"},
    #   ...
    # ]
"""
import os

import joblib
import numpy as np
import pandas as pd

try:
    import xgboost as xgb
except ImportError:
    xgb = None  # se valida recien en cargar_artefactos(), con un error mas claro


# Atributos booleanos de amenities -- si no se pasan, se asume False (no se conoce, no
# se inventa una presuncion positiva). ADVERTENCIA DE DISENO (ver bitacora 6.28): en el
# dataset de ENTRENAMIENTO estos atributos vienen de una extraccion LLM de 3 estados
# (si / no / no especificado, ver bitacora 4.1) -- aca se fuerza un booleano estricto de
# 2 estados por simplicidad de la API de entrada. Es una aproximacion razonable cuando
# quien completa el formulario de una propiedad NUEVA sabe con certeza si tiene o no
# cada amenity (a diferencia de un aviso scrapeado con texto libre ambiguo), pero vale
# la pena dejarlo explicito -- si en el futuro el formulario de carga permite un
# tercer estado "no lo se", este modulo necesitaria un ajuste.
#
# NOTA sobre `amoblado` especificamente (ver bitacora 6.34): en el dataset de
# ENTRENAMIENTO esta columna sale de un regex sobre titulo/descripcion (PATRON_AMOBLADO
# en entrenar_xgboost_valuacion.py), no de la extraccion LLM de 3 estados -- ya es
# booleana de 2 estados ahi tambien (matcheo si/no), asi que el mismo criterio de "el
# usuario contesta directo, sin ambiguedad" aplica igual de bien aca.
CAMPOS_BOOLEANOS = [
    "tiene_pileta", "tiene_cochera", "apto_credito", "amenities_edificio",
    "seguridad_24hs", "luminoso", "amoblado",
]

CATEGORIAS_ESTADO_PROPIEDAD_VALIDAS = [
    "a_estrenar", "usado_buen_estado", "a_reciclar", "no_especificado",
]
CATEGORIAS_TIPO_PROPIEDAD_VALIDAS = ["Departamento", "Casa", "PH"]


def cargar_artefactos(operacion, ruta_artefactos="."):
    """Carga el modelo Run C (formato nativo XGBoost) + los encoders/snapshot/limites
    (joblib) exportados por exportar_artefactos_produccion() (ver bitacora 6.28)."""
    if xgb is None:
        raise ImportError("Falta instalar xgboost -- pip install xgboost")
    ruta_modelo = os.path.join(ruta_artefactos, f"modelo_xgboost_{operacion}.json")
    ruta_bundle = os.path.join(ruta_artefactos, f"artefactos_{operacion}.joblib")
    if not os.path.exists(ruta_modelo) or not os.path.exists(ruta_bundle):
        raise FileNotFoundError(
            f"No se encontraron los artefactos de '{operacion}' en '{ruta_artefactos}' -- "
            f"corre exportar_artefactos_produccion() en el notebook/script de entrenamiento "
            f"primero (ver bitacora 6.28)."
        )
    modelo = xgb.XGBRegressor()
    modelo.load_model(ruta_modelo)
    artefactos = joblib.load(ruta_bundle)
    return modelo, artefactos


def _calcular_superficie_usada(propiedad):
    """Misma logica de fallback que el pipeline de entrenamiento (ver bitacora 6.1.1,
    bug v8): prioriza superficie_cubierta, cae a superficie_total si la cubierta no
    esta o es < 10 m2 (piso de plausibilidad). Devuelve (valor, fuente)."""
    cubierta = propiedad.get("superficie_cubierta")
    total = propiedad.get("superficie_total")
    if cubierta is not None and cubierta >= 10:
        return float(cubierta), "cubierta"
    if total is not None and total >= 10:
        return float(total), "total"
    raise ValueError(
        "La propiedad necesita al menos una de 'superficie_cubierta'/'superficie_total' "
        "con un valor plausible (>= 10 m2) -- ver bitacora 6.1.1 (bug v8, piso de "
        "plausibilidad de superficie)."
    )


def _buscar_referencia_mercado(barrio, artefactos):
    """Busca la referencia de mercado mas reciente para este barrio en el snapshot
    exportado (ver construir_snapshot_referencia_mercado() en
    entrenar_xgboost_valuacion.py, bitacora 6.28). Si el barrio no aparece en el
    snapshot (no deberia pasar con los 48 barrios oficiales y este volumen de datos,
    pero por las dudas -- mismo criterio defensivo que aplicar_target_encoding_barrio()),
    cae al promedio global guardado, nunca se inventa un valor de la nada."""
    snapshot = artefactos["referencia_mercado_por_barrio"]
    if barrio in snapshot:
        info = snapshot[barrio]
        return info["valor"], info.get("fuente"), info.get("provisorio", False), info.get("cobertura")
    return artefactos["referencia_mercado_promedio_global"], None, False, None


def construir_vector_features(propiedad, operacion, artefactos):
    """Construye el vector de features EXACTAMENTE como lo espera el modelo Run C --
    mismo orden y mismas transformaciones que construir_candidatas()/entrenar_operacion()
    en entrenar_xgboost_valuacion.py, pero para una fila NUEVA (no una del dataset de
    entrenamiento). Ver bitacora 6.28 para el detalle de cada decision de diseno."""
    barrio = propiedad.get("barrio")
    if not barrio:
        raise ValueError("Falta 'barrio' -- es obligatorio (Target Encoding + referencia de mercado dependen de el).")
    tipo_propiedad = propiedad.get("tipo_propiedad")
    if tipo_propiedad not in CATEGORIAS_TIPO_PROPIEDAD_VALIDAS:
        raise ValueError(f"'tipo_propiedad' debe ser uno de {CATEGORIAS_TIPO_PROPIEDAD_VALIDAS}, recibido: {tipo_propiedad!r}")
    ambientes = propiedad.get("ambientes")
    if ambientes is None:
        raise ValueError("Falta 'ambientes' -- es una variable declarada del modelo (ver instrucciones del proyecto).")
    estado_propiedad = propiedad.get("estado_propiedad", "no_especificado")
    if estado_propiedad not in CATEGORIAS_ESTADO_PROPIEDAD_VALIDAS:
        raise ValueError(f"'estado_propiedad' debe ser uno de {CATEGORIAS_ESTADO_PROPIEDAD_VALIDAS}, recibido: {estado_propiedad!r}")

    superficie_usada, fuente_superficie = _calcular_superficie_usada(propiedad)

    mapping = artefactos["target_encoding_barrio"]["mapping"]
    promedio_global_barrio = artefactos["target_encoding_barrio"]["promedio_global"]
    barrio_target_encoded = mapping.get(barrio, promedio_global_barrio)

    valor_ref, ref_fuente, ref_provisorio, ref_cobertura = _buscar_referencia_mercado(barrio, artefactos)
    ref_col = artefactos["ref_col"]

    fila = {
        "ambientes": float(ambientes),
        "superficie_usada_m2": superficie_usada,
        "barrio_target_encoded": barrio_target_encoded,
        ref_col: valor_ref,
        # Candidatas numericas -- NUNCA se inventan, NaN si no se proveen (XGBoost las
        # maneja de forma nativa como faltantes reales, ver entrenar_xgboost_valuacion.py).
        "banos": float(propiedad["banos"]) if propiedad.get("banos") is not None else np.nan,
        "expensas_usd": float(propiedad["expensas_usd"]) if propiedad.get("expensas_usd") is not None else np.nan,
        "superficie_total": float(propiedad["superficie_total"]) if propiedad.get("superficie_total") is not None else np.nan,
        "superficie_cubierta": float(propiedad["superficie_cubierta"]) if propiedad.get("superficie_cubierta") is not None else np.nan,
        # Candidatas booleanas de "trazabilidad" (ver bitacora 6.28) -- SI son
        # recalculables en el momento de la inferencia, a diferencia de fuente_aviso:
        # cobertura_ambientes=True porque `ambientes` viene DIRECTO del usuario (no de
        # un rescate/imputacion LLM, a diferencia del dataset de entrenamiento -- ver
        # bitacora 6.1.6); ref_provisorio viene del snapshot de referencia consultado
        # recien arriba (si esa referencia especifica estaba marcada como provisoria).
        "cobertura_ambientes": 1.0,
        "ref_provisorio": 1.0 if ref_provisorio else 0.0,
    }
    for cat in CATEGORIAS_TIPO_PROPIEDAD_VALIDAS:
        fila[f"tipo_propiedad_{cat}"] = 1.0 if tipo_propiedad == cat else 0.0
    for cat in CATEGORIAS_ESTADO_PROPIEDAD_VALIDAS:
        fila[f"estado_propiedad_{cat}"] = 1.0 if estado_propiedad == cat else 0.0
    for campo in CAMPOS_BOOLEANOS:
        fila[campo] = 1.0 if propiedad.get(campo, False) else 0.0
    for cat in artefactos["categorias_onehot"]["fuente_superficie"]:
        fila[f"fuente_superficie_m2_{cat}"] = 1.0 if fuente_superficie == cat else 0.0
    for cat in artefactos["categorias_onehot"]["ref_fuente"]:
        fila[f"ref_fuente_{cat}"] = 1.0 if ref_fuente == cat else 0.0
    for cat in artefactos["categorias_onehot"]["ref_cobertura"]:
        fila[f"ref_cobertura_{cat}"] = 1.0 if ref_cobertura == cat else 0.0

    columnas_modelo = artefactos["columnas_modelo"]
    faltantes = [c for c in columnas_modelo if c not in fila]
    if faltantes:
        raise RuntimeError(
            f"Bug interno -- construir_vector_features() no genero estas columnas que el "
            f"modelo espera: {faltantes}. Revisar consistencia con exportar_artefactos_produccion() "
            f"en entrenar_xgboost_valuacion.py (bitacora 6.28)."
        )
    X = pd.DataFrame([[fila[c] for c in columnas_modelo]], columns=columnas_modelo)
    return X


def calcular_rango_esperado(y_pred, barrio, limites_por_barrio, limites_globales, piso_rango_min_relativo):
    """Copia deliberada (no import) de la misma funcion de entrenar_xgboost_valuacion.py
    (ver bitacora 6.26/6.28) -- este script esta pensado para correr standalone (ej.
    detras de un endpoint del backend), sin arrastrar sklearn/shap."""
    q_baja, q_alta = limites_por_barrio.get(barrio, limites_globales)
    rango_min = y_pred * (1 + q_baja)
    rango_max = y_pred * (1 + q_alta)
    rango_min = max(rango_min, y_pred * piso_rango_min_relativo)
    rango_max = max(rango_max, rango_min)
    return rango_min, rango_max


def clasificar_valuacion(precio_real, rango_min, rango_max):
    """Misma logica que entrenar_xgboost_valuacion.py (ver bitacora 6.26/6.28), copiada
    deliberadamente -- ver docstring de calcular_rango_esperado() arriba."""
    if precio_real < rango_min:
        return "SUBVALUADO"
    if precio_real > rango_max:
        return "SOBREVALUADO"
    return "EN_RANGO"


# ============================================================================
# Explicabilidad (bitacora 6.30) -- "por que esta propiedad quedo SOBREVALUADA /
# EN_RANGO / SUBVALUADA", para mostrarle al usuario final del frontend, no solo el
# numero. Usa las contribuciones NATIVAS de XGBoost (predict(..., pred_contribs=True)),
# que implementan el algoritmo TreeSHAP (Lundberg) -- son valores SHAP reales, sin
# necesidad de instalar la libreria `shap` aparte ni sumar una dependencia nueva a este
# modulo standalone (ver discusion con Pili, bitacora 6.30). Para graficos de SHAP mas
# elaborados (summary plot, waterfall) pensados como figuras de la tesis, se usa la
# libreria `shap` completa aparte, en el notebook de entrenamiento -- no aca.
# ============================================================================

# Traduccion de nombres de columnas internas a texto legible para el usuario final.
NOMBRES_LEGIBLES = {
    "ambientes": "la cantidad de ambientes",
    "superficie_usada_m2": "la superficie",
    "barrio_target_encoded": "el barrio/zona",
    "banos": "la cantidad de banos",
    "expensas_usd": "las expensas",
    "superficie_total": "la superficie total",
    "superficie_cubierta": "la superficie cubierta",
    "tiene_pileta": "la pileta",
    "tiene_cochera": "la cochera",
    "apto_credito": "que sea apto para credito",
    "amenities_edificio": "los amenities del edificio",
    "seguridad_24hs": "la seguridad 24hs",
    "luminoso": "la luminosidad",
    "amoblado": "que este amoblado",
}

# Columnas de trazabilidad/procedencia del dato (ver bitacora 6.28) -- tienen
# contribucion real en el modelo, pero son metadata de COMO se completo el dato (de
# donde salio la superficie, si la referencia de mercado es provisoria, etc.), no un
# atributo de la propiedad en si. Se excluyen de la explicacion al usuario final porque
# no son accionables ni entendibles para alguien leyendo "por que quedo sobrevalorada"
# -- mismo criterio ya aplicado a fuente_aviso en el diseno de Run C.
_PREFIJOS_TRAZABILIDAD = ("fuente_superficie_m2_", "ref_fuente_", "ref_cobertura_")
_COLUMNAS_TRAZABILIDAD = {"cobertura_ambientes", "ref_provisorio"}

# Columnas one-hot que se agrupan en un solo factor (sumando sus contribuciones)
# etiquetado con el valor real de la propiedad -- sumar por separado cada dummy (ej.
# "tipo_propiedad_PH" con contribucion != 0 aunque la propiedad sea un Departamento)
# confunde al usuario final; agrupar es la practica estandar para SHAP sobre one-hot.
_GRUPOS_ONEHOT = {
    "tipo_propiedad_": ("el tipo de propiedad", "tipo_propiedad"),
    "estado_propiedad_": ("el estado de la propiedad", "estado_propiedad"),
}


def _nombre_legible(columna, ref_col):
    if columna == ref_col:
        return "el precio de referencia de mercado en la zona"
    return NOMBRES_LEGIBLES.get(columna, columna)


def explicar_prediccion(propiedad, operacion, ruta_artefactos=".", top_n=5,
                         _modelo=None, _artefactos=None):
    """Devuelve los factores que mas influyeron en la prediccion de ESTA propiedad
    puntual, para mostrarle al usuario final POR QUE quedo SOBREVALUADA / EN_RANGO /
    SUBVALUADA (ver bitacora 6.30). Usa `Booster.predict(..., pred_contribs=True)` de
    xgboost -- TreeSHAP nativo, no la libreria `shap`.

    Devuelve una lista de dicts ordenada por magnitud de impacto (mayor a menor), cada
    uno con:
        {"factor": "la superficie", "contribucion": -134.2, "direccion": "baja el precio"}

    La `contribucion` esta en la MISMA unidad que la prediccion (USD/m2 para venta,
    USD/mes para alquiler) -- es cuanto empuja ese factor la prediccion hacia arriba o
    abajo respecto del valor base del modelo. La suma de todas las contribuciones (no
    solo las top_n) mas el sesgo base reconstruye la prediccion exacta.

    `_modelo`/`_artefactos` son solo para tests, igual que en predecir_propiedad_nueva().
    """
    if xgb is None:
        raise ImportError("Falta instalar xgboost -- pip install xgboost")
    if _modelo is not None:
        modelo, artefactos = _modelo, _artefactos
    else:
        modelo, artefactos = cargar_artefactos(operacion, ruta_artefactos)

    X = construir_vector_features(propiedad, operacion, artefactos)
    booster = modelo.get_booster()
    dmat = xgb.DMatrix(X)
    contribs = booster.predict(dmat, pred_contribs=True)[0]  # shape (n_features + 1,)
    columnas = list(X.columns)
    valores_por_columna = contribs[:-1]  # el ultimo valor es el sesgo base del modelo

    ref_col = artefactos["ref_col"]
    acumulado = {}
    for columna, contrib in zip(columnas, valores_por_columna):
        if columna in _COLUMNAS_TRAZABILIDAD or columna.startswith(_PREFIJOS_TRAZABILIDAD):
            continue
        etiqueta = None
        for prefijo, (etiqueta_base, campo_propiedad) in _GRUPOS_ONEHOT.items():
            if columna.startswith(prefijo):
                valor_real = str(propiedad.get(campo_propiedad, "no especificado")).replace("_", " ")
                etiqueta = f"{etiqueta_base} ({valor_real})"
                break
        if etiqueta is None:
            etiqueta = _nombre_legible(columna, ref_col)
        acumulado[etiqueta] = acumulado.get(etiqueta, 0.0) + float(contrib)

    factores = [
        {
            "factor": etiqueta,
            "contribucion": contrib,
            "direccion": "sube el precio" if contrib > 0 else ("baja el precio" if contrib < 0 else "neutro"),
        }
        for etiqueta, contrib in acumulado.items()
    ]
    factores.sort(key=lambda f: abs(f["contribucion"]), reverse=True)
    return factores[:top_n]


_PREFIJOS_CLASIFICACION = {
    "SOBREVALUADO": "Esta propiedad esta clasificada como SOBREVALUADA respecto del rango de precio esperado.",
    "SUBVALUADO": "Esta propiedad esta clasificada como SUBVALUADA respecto del rango de precio esperado.",
    "EN_RANGO": "Esta propiedad esta clasificada dentro del rango de precio esperado.",
}

# Unidad que se muestra en explicacion_texto -- en alquiler el target del modelo YA es
# el total mensual (USD/mes); en venta el target del modelo es USD/m2, pero el texto
# usa los valores "_total" (precio completo de la propiedad, ver predecir_propiedad_nueva()
# y bitacora 6.33) -- por eso la unidad de venta es simplemente "USD", sin "/m2".
_UNIDADES_POR_OPERACION = {"venta": "USD", "alquiler": "USD/mes"}


def _listar_en_espanol(items):
    """['a', 'b', 'c'] -> 'a, b y c' (y 'a' si hay uno solo, 'a y b' si hay dos)."""
    if len(items) == 1:
        return items[0]
    return ", ".join(items[:-1]) + " y " + items[-1]


def _texto_rango(prediccion, rango_min, rango_max, precio_real, clasificacion, unidad):
    """Parrafo con el rango de precio esperado y donde cae el precio real -- pedido
    explicito de Pili (bitacora 6.32): "que el usuario pueda visualizar el rango
    aceptable" ademas de los factores. NO usa separador de miles (','/'.') a proposito,
    para evitar ambiguedad con la convencion argentina (1.627 se leeria como mil
    seiscientos veintisiete, no como 1,627 al estilo ingles)."""
    unidad_sufijo = f" {unidad}" if unidad else ""
    partes = [
        f"El rango de precio esperado para esta propiedad va de {rango_min:.0f} a "
        f"{rango_max:.0f}{unidad_sufijo}, con una prediccion central de {prediccion:.0f}{unidad_sufijo}."
    ]
    if precio_real is not None:
        partes.append(f"El precio real es de {precio_real:.0f}{unidad_sufijo}.")
        if clasificacion == "SOBREVALUADO" and rango_max:
            desvio = (precio_real - rango_max) / rango_max * 100
            partes.append(f"Eso supera el maximo esperado en un {desvio:.0f}%.")
        elif clasificacion == "SUBVALUADO" and rango_min:
            desvio = (rango_min - precio_real) / rango_min * 100
            partes.append(f"Eso esta un {desvio:.0f}% por debajo del minimo esperado.")
        elif clasificacion == "EN_RANGO":
            partes.append("Cae dentro del rango esperado.")
    return " ".join(partes)


def explicacion_en_texto(explicacion, clasificacion=None, prediccion=None, rango_min=None,
                          rango_max=None, precio_real=None, unidad=""):
    """Convierte la lista que devuelve explicar_prediccion() en un texto en espanol,
    en oraciones, listo para mostrarle directamente al usuario final (ver bitacora
    6.31 -- pedido explicito de Pili: "que se lo diga tipo oracion", no una lista de
    dicts).

    Si se pasan `prediccion`/`rango_min`/`rango_max` (y opcionalmente `precio_real`),
    antepone tambien un parrafo con el rango de precio esperado -- para que el usuario
    pueda "visualizar el rango aceptable", no solo los factores (bitacora 6.32).
    `predecir_propiedad_nueva(..., explicar=True)` ya arma esta llamada completa; esta
    funcion tambien se puede usar suelta si se le pasan los mismos datos a mano.
    """
    if not explicacion:
        return "No hay suficiente informacion para explicar esta prediccion."

    positivos = [f["factor"] for f in explicacion if f["contribucion"] > 0]
    negativos = [f["factor"] for f in explicacion if f["contribucion"] < 0]

    principal = explicacion[0]  # ya viene ordenado por magnitud de impacto
    partes = [f"El factor que mas influye en esta prediccion es {principal['factor']}, que {principal['direccion']}."]

    resto_positivos = [f for f in positivos if f != principal["factor"]]
    resto_negativos = [f for f in negativos if f != principal["factor"]]
    if resto_positivos:
        partes.append(f"Tambien suben el precio: {_listar_en_espanol(resto_positivos)}.")
    if resto_negativos:
        partes.append(f"Bajan el precio: {_listar_en_espanol(resto_negativos)}.")

    texto_factores = " ".join(partes)

    bloques = []
    if clasificacion:
        bloques.append(_PREFIJOS_CLASIFICACION.get(clasificacion, ""))
    if prediccion is not None and rango_min is not None and rango_max is not None:
        bloques.append(_texto_rango(prediccion, rango_min, rango_max, precio_real, clasificacion, unidad))
    bloques.append(texto_factores)
    return " ".join(b for b in bloques if b)


def predecir_propiedad_nueva(propiedad, operacion, precio_real=None, ruta_artefactos=".",
                              explicar=False, _modelo=None, _artefactos=None):
    """Punto de entrada principal (ver bitacora 6.28). `propiedad` es un dict con, como
    minimo: barrio, tipo_propiedad, ambientes, y superficie_cubierta y/o
    superficie_total. Opcionalmente: estado_propiedad, banos, expensas_usd, y los
    booleanos de CAMPOS_BOOLEANOS (default False si no se pasan). Si se pasa
    `precio_real` (el precio real/listado de la propiedad, en la MISMA unidad que el
    target de la operacion -- USD/m2 para venta, USD/mes para alquiler), se agrega
    tambien la clasificacion SOBREVALUADO/EN_RANGO/SUBVALUADO.

    Si `explicar=True`, agrega dos claves: "explicacion" con los factores que mas
    influyeron en la prediccion (ver explicar_prediccion() -- TreeSHAP nativo de
    xgboost, bitacora 6.30), en formato lista de dicts (para que el frontend arme su
    propia UI); y "explicacion_texto" con lo mismo redactado como oracion en espanol,
    lista para mostrarsela directo al usuario final (ver explicacion_en_texto(),
    bitacora 6.31/6.32/6.33).

    En VENTA, ademas siempre se agregan "prediccion_total"/"rango_min_total"/
    "rango_max_total" (y "precio_real_total" si se paso precio_real) -- el precio
    COMPLETO de la propiedad en USD (valor por m2 * superficie), que es lo que un
    usuario final quiere ver, no el valor por m2 (bitacora 6.33). Los campos sin
    "_total" (prediccion/rango_min/rango_max/precio_real/clasificacion) siguen en
    USD/m2 sin cambios -- son los que se usan para la clasificacion, no se tocan. En
    ALQUILER no hace falta esto: el target del modelo ya es el total mensual.

    `_modelo`/`_artefactos` son solo para tests (evitan releer del disco en cada
    llamada) -- en uso normal se dejan en None y esta funcion carga todo desde disco
    con cargar_artefactos()."""
    if operacion not in ("venta", "alquiler"):
        raise ValueError("operacion debe ser 'venta' o 'alquiler'")
    if _modelo is not None:
        modelo, artefactos = _modelo, _artefactos
    else:
        modelo, artefactos = cargar_artefactos(operacion, ruta_artefactos)

    X = construir_vector_features(propiedad, operacion, artefactos)
    y_pred = float(modelo.predict(X)[0])
    superficie_usada = float(X["superficie_usada_m2"].iloc[0])

    barrio = propiedad["barrio"]
    rango_min, rango_max = calcular_rango_esperado(
        y_pred, barrio, artefactos["limites_rango_barrio"], artefactos["limites_rango_globales"],
        artefactos["piso_rango_min_relativo"],
    )

    resultado = {
        "operacion": operacion,
        "target": artefactos["target_col"],
        "prediccion": y_pred,
        "rango_min": rango_min,
        "rango_max": rango_max,
    }
    if precio_real is not None:
        resultado["precio_real"] = float(precio_real)
        resultado["clasificacion"] = clasificar_valuacion(float(precio_real), rango_min, rango_max)

    # En VENTA el modelo predice USD/m2 -- necesario para que el rango calibrado (6.26)
    # y la clasificacion sigan siendo correctos, pero no es lo que un usuario quiere
    # leer ("cuanto me sale la propiedad"). Se agregan estas claves "_total" (precio
    # completo de la propiedad = valor por m2 * superficie) SOLO para venta -- en
    # alquiler "prediccion"/"rango_min"/"rango_max"/"precio_real" YA son el total
    # mensual, no hace falta duplicar (ver bitacora 6.33, pedido de Pili).
    if operacion == "venta":
        resultado["prediccion_total"] = y_pred * superficie_usada
        resultado["rango_min_total"] = rango_min * superficie_usada
        resultado["rango_max_total"] = rango_max * superficie_usada
        if precio_real is not None:
            resultado["precio_real_total"] = float(precio_real) * superficie_usada

    if explicar:
        # Reutiliza el modelo/artefactos ya cargados -- no vuelve a leer del disco.
        resultado["explicacion"] = explicar_prediccion(
            propiedad, operacion, ruta_artefactos=ruta_artefactos, _modelo=modelo, _artefactos=artefactos,
        )
        if operacion == "venta":
            # El TEXTO usa los valores totales (precio completo de la propiedad en
            # USD), no USD/m2 -- ver bitacora 6.33. Los campos per-m2 en `resultado`
            # (prediccion/rango_min/rango_max/precio_real/clasificacion) NO cambian,
            # siguen siendo los que se usan para calcular la clasificacion.
            texto_prediccion, texto_rango_min, texto_rango_max = (
                resultado["prediccion_total"], resultado["rango_min_total"], resultado["rango_max_total"],
            )
            texto_precio_real = resultado.get("precio_real_total")
        else:
            texto_prediccion, texto_rango_min, texto_rango_max = y_pred, rango_min, rango_max
            texto_precio_real = resultado.get("precio_real")
        resultado["explicacion_texto"] = explicacion_en_texto(
            resultado["explicacion"],
            clasificacion=resultado.get("clasificacion"),
            prediccion=texto_prediccion,
            rango_min=texto_rango_min,
            rango_max=texto_rango_max,
            precio_real=texto_precio_real,
            unidad=_UNIDADES_POR_OPERACION.get(operacion, ""),
        )
    return resultado


if __name__ == "__main__":
    # Ejemplo minimo de uso -- ver bitacora 6.28. Requiere haber corrido antes
    # exportar_artefactos_produccion() (dentro del notebook/script de entrenamiento) y
    # tener modelo_xgboost_venta.json / artefactos_venta.joblib en el directorio actual
    # (o pasar ruta_artefactos="..." con la carpeta correcta).
    ejemplo = {
        "barrio": "Palermo", "tipo_propiedad": "Departamento", "ambientes": 2,
        "superficie_cubierta": 45, "estado_propiedad": "usado_buen_estado",
        "tiene_cochera": False, "tiene_pileta": False, "apto_credito": True,
        "amenities_edificio": True, "seguridad_24hs": True, "luminoso": True,
    }
    resultado = predecir_propiedad_nueva(ejemplo, operacion="venta", precio_real=2200)
    print(resultado)