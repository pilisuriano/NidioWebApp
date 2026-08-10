"""
Nidio -- PASO 1 de 2 para la base de 200 propiedades reales de la demo
(ver bitacora, seccion "200 propiedades" / roadmap.md).

QUE HACE:
  1. Carga dataset_v20_final.csv (el mismo dataset con el que se entrena el
     modelo -- NO son propiedades reales publicadas, son avisos historicos
     usados solo como fuente de VALORES REALISTAS: superficie, ambientes,
     banos, expensas, amenities, etc. Ningun aviso individual se muestra tal
     cual en la plataforma). NO se filtra por titulo/descripcion -- se probo
     y tenia un efecto colateral fuerte (dejaba expensas_usd en 0/200, ver
     conversacion) -- los que salgan sin titulo/descripcion, Pili los
     completa a mano.
  2. Le agrega la columna "amoblado" con el MISMO regex/funcion exactos del
     notebook de entrenamiento (entrenar_xgboost_valuacion_21.ipynb, ver
     bitacora 6.30.1/6.34) -- imprescindible para que sea coherente con como
     el modelo fue entrenado.
  3. Muestrea 200 filas, estratificado por barrio x tipo_propiedad x
     tipo_operacion, PROPORCIONAL a la distribucion real del dataset (NO
     homogeneo -- Palermo/Recoleta van a tener mas propiedades que San
     Telmo, porque asi es el mercado real), con un PISO del 20% para
     PH+Casa combinados (en el dataset real son ~8.5% del total; sin piso,
     de 200 propiedades solo ~17 serian PH/Casa -- muy poco para mostrar el
     modelo funcionando bien en esos tipos, ver bitacora 6.38/6.39 sobre el
     mismo sesgo detectado antes en el entrenamiento).
  4. Genera una direccion FICTICIA pero VALIDA para cada propiedad: elige
     una calle real + altura real dentro del rango valido de esa cuadra
     (fuente: API Georef -- datos.gob.ar, la misma API oficial que ya usa
     el backend en GeorefClient.java para el autocompletado de "Publicar"),
     la geocodifica, y verifica con el poligono REAL del barrio (el mismo
     que ya esta cargado en la base via las migraciones V5/V6) que el punto
     resultante caiga adentro de ese barrio. Si no cae adentro reintenta con
     otra calle/altura; si agota los intentos, la deja marcada para revision
     manual en vez de fallar en silencio.
  5. Exporta un CSV con todo lo anterior + dos columnas vacias para
     completar a mano buscando en Zonaprop (politica del proyecto: sin
     scraping, investigacion manual -- ver instructions del proyecto):
     "precio_referencia_zonaprop" (tal cual lo muestra Zonaprop, sin
     convertir -- USD si es venta, ARS si es alquiler, misma convencion de
     mercado que usa el resto de la plataforma) y
     "expensas_referencia_zonaprop_ars" (siempre en ARS). La conversion a
     USD final de estas dos se hace despues en un solo paso, no fila por
     fila -- ver conversacion. Las expensas del dataset original (solo
     ~15% de las filas las trae) quedan aparte, en
     "expensas_historico_dataset_usd", como referencia -- no como fuente
     final.

QUE NO HACE (a proposito):
  - Incluye titulo/descripcion TAL CUAL vienen del dataset (no se generan
    de nuevo). Pili los va a revisar/editar a mano despues (sacando
    cualquier dato sensible -- telefono, nombre de agencia real, codigo de
    aviso, etc.) antes de que estos datos entren a la demo -- ver columnas
    titulo/descripcion en la salida, marcadas para revision.
  - NO asigna publicador (created_by_user_id / publisher_type) todavia --
    eso queda para el Paso 2, porque implica leer los usuarios REALES que
    ya existen en tu base Postgres local (no algo que se pueda resolver
    desde un CSV o un archivo de migracion) mas crear 5-6 cuentas de
    inmobiliaria ficticias para el resto. Este script sigue sin conectarse
    a la base: los poligonos de barrio se parsean de los .sql de V5/V6.

COMO USARLO:
    1. Revisar la seccion CONFIG de abajo (rutas -- probablemente no hace
       falta tocar nada si se corre desde la raiz del repo NidioWebApp con
       el dataset en la ruta relativa por defecto).
    2. pip install requests   (shapely/pandas ya estan en requirements.txt
       de ml-service)
    3. python generar_200_propiedades_paso1.py

    Tarda unos minutos (llama a la API publica de Georef una vez por calle
    candidata -- hay una pausa de 0.3s entre llamadas para no saturarla).
    Imprime progreso cada 10 propiedades.

SALIDA:
    200_propiedades_paso1.csv en el mismo directorio (o RUTA_SALIDA_CSV).
"""

import json
import os
import random
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

import numpy as np
import pandas as pd
from shapely.geometry import Point
from shapely import wkt as shapely_wkt

# ===========================================================================
# CONFIG -- ajustar rutas si hace falta
# ===========================================================================
# OJO: el dataset vive en la carpeta Datasets (OneDrive, unidad C:), que NO
# es hermana de ml-service (unidad D:, repo NidioWebApp) -- por eso va con
# ruta absoluta y no relativa como las migraciones de abajo. Ajustar si tu
# ruta real es otra.
RUTA_DATASET = r"C:\Users\pilu_\OneDrive\Documentos\UADE\PFI\Datasets\LLM\mergeBasualdo\SacandoNulos\ConversionExpensas\NormalizarBarrios\NuevoMerge\Encoding\dataset_v20_final.csv"
# Estas sí son relativas porque backend SÍ es hermana de ml-service, las dos
# adentro del mismo repo (D:\NidioWebApp).
RUTA_MIGRACION_V5 = "../backend/src/main/resources/db/migration/V5__real_barrio_boundaries.sql"
RUTA_MIGRACION_V6 = "../backend/src/main/resources/db/migration/V6__complete_all_caba_barrios.sql"
RUTA_SALIDA_CSV = "200_propiedades_paso1.csv"
RUTA_CACHE_CALLES = "cache_calles_por_comuna.json"

N_TOTAL = 200
PISO_PH_CASA = 0.20  # ver punto 3 del docstring
SEED = 42

GEOREF_BASE_URL = "https://apis.datos.gob.ar/georef/api"
GEOREF_PROVINCIA = "Ciudad Autónoma de Buenos Aires"
PAUSA_ENTRE_LLAMADAS_SEG = 0.3
MAX_INTENTOS_DIRECCION = 30
# Si una propiedad no logra verificar su direccion dentro de MAX_INTENTOS_DIRECCION,
# en vez de aceptarla sin verificar se prueba con otra propiedad del MISMO estrato
# (barrio x tipo_propiedad x tipo_operacion) del resto del dataset -- hasta esta
# cantidad de propiedades distintas por estrato antes de rendirse (ver
# reemplazar_hasta_verificar()).
MAX_REEMPLAZOS_POR_FILA = 4

# Mapeo oficial barrio -> comuna de CABA (division administrativa del
# Gobierno de la Ciudad de Buenos Aires, dato publico -- no cambia con el
# tiempo). Los nombres de barrio son EXACTAMENTE los mismos que usan las
# migraciones V5/V6 y el dataset (verificado: match exacto, sin acentos
# faltantes ni variantes).
COMUNA_DE_BARRIO = {
    "Retiro": 1, "San Nicolás": 1, "Puerto Madero": 1, "San Telmo": 1,
    "Monserrat": 1, "Constitución": 1,
    "Recoleta": 2,
    "Balvanera": 3, "San Cristóbal": 3,
    "La Boca": 4, "Barracas": 4, "Parque Patricios": 4, "Nueva Pompeya": 4,
    "Almagro": 5, "Boedo": 5,
    "Caballito": 6,
    "Flores": 7, "Parque Chacabuco": 7,
    "Villa Soldati": 8, "Villa Riachuelo": 8, "Villa Lugano": 8,
    "Liniers": 9, "Mataderos": 9, "Parque Avellaneda": 9,
    "Villa Real": 10, "Monte Castro": 10, "Versalles": 10, "Floresta": 10,
    "Vélez Sarsfield": 10, "Villa Luro": 10,
    "Villa General Mitre": 11, "Villa Devoto": 11, "Villa del Parque": 11,
    "Villa Santa Rita": 11,
    "Coghlan": 12, "Saavedra": 12, "Villa Urquiza": 12, "Villa Pueyrredón": 12,
    "Núñez": 13, "Belgrano": 13, "Colegiales": 13,
    "Palermo": 14,
    "Chacarita": 15, "Villa Crespo": 15, "La Paternal": 15,
    "Villa Ortúzar": 15, "Agronomía": 15, "Parque Chas": 15,
}

# ===========================================================================
# PASO A: columna "amoblado" -- copia EXACTA del notebook de entrenamiento
# (entrenar_xgboost_valuacion_21.ipynb, ver bitacora 6.30.1/6.34). No tocar
# el regex sin actualizar tambien el notebook -- tienen que quedar
# identicos siempre, sino la propiedad sintetica queda inconsistente con
# como el modelo aprendio la feature.
# ===========================================================================
PATRON_AMOBLADO = re.compile(
    r"amoblad[oa]?|amueblad[oa]?|con\s+muebles|muebles\s+inclu|full\s+equip|furnished",
    re.IGNORECASE,
)


def agregar_columna_amoblado(df):
    """Agrega la columna booleana 'amoblado' al DataFrame COMPLETO, ANTES de
    separar por operacion (se usa en venta y alquiler, ver bitacora 6.34).
    Busca PATRON_AMOBLADO en titulo+descripcion. No modifica el CSV en
    disco -- se recalcula cada vez que se corre el script (igual que en el
    notebook)."""
    df = df.copy()
    texto = (df["titulo"].fillna("") + " " + df["descripcion"].fillna(""))
    df["amoblado"] = texto.str.contains(PATRON_AMOBLADO, na=False)
    n_amoblado = int(df["amoblado"].sum())
    print(
        f"Columna 'amoblado' agregada: {n_amoblado} de {len(df)} avisos "
        f"({n_amoblado / len(df):.1%}) matchean el patron."
    )
    return df


# ===========================================================================
# PASO B: muestreo estratificado proporcional con piso PH+Casa
# ===========================================================================
def _muestrear_proporcional(df_sub, n, columnas_estrato, rng):
    """Reparte n cupos entre los estratos definidos por columnas_estrato,
    proporcional a su peso real en df_sub (metodo de restos mas grandes,
    para que la suma cierre exacto en n sin sesgo de redondeo), y muestrea
    cada estrato sin reemplazo."""
    if n <= 0 or len(df_sub) == 0:
        return df_sub.iloc[0:0]

    conteos = df_sub.groupby(columnas_estrato, observed=True).size()
    proporciones = conteos / conteos.sum()
    cupos_float = proporciones * n
    cupos = np.floor(cupos_float).astype(int)
    faltante = int(n - cupos.sum())
    if faltante > 0:
        restos = (cupos_float - cupos).sort_values(ascending=False)
        for estrato in restos.index[:faltante]:
            cupos[estrato] += 1

    partes = []
    for estrato, grupo in df_sub.groupby(columnas_estrato, observed=True):
        cupo = int(cupos.get(estrato, 0))
        if cupo == 0:
            continue
        cupo = min(cupo, len(grupo))  # sin reemplazo: no puede pedir mas de lo que hay
        semilla = int(rng.integers(0, 2**31 - 1))
        partes.append(grupo.sample(n=cupo, random_state=semilla))
    if not partes:
        return df_sub.iloc[0:0]
    return pd.concat(partes)


def muestreo_estratificado_con_piso(df, n_total, piso_ph_casa, seed):
    rng = np.random.default_rng(seed)
    es_ph_casa = df["tipo_propiedad"].isin(["PH", "Casa"])

    n_ph_casa_natural = round(n_total * es_ph_casa.mean())
    n_ph_casa = max(n_ph_casa_natural, round(n_total * piso_ph_casa))
    n_depto = n_total - n_ph_casa

    print(
        f"Reparto: {n_ph_casa} PH/Casa (piso {piso_ph_casa:.0%}, natural "
        f"hubiera sido {n_ph_casa_natural}) + {n_depto} Departamento"
    )

    muestra_ph_casa = _muestrear_proporcional(
        df[es_ph_casa], n_ph_casa, ["barrio", "tipo_propiedad", "tipo_operacion"], rng
    )
    muestra_depto = _muestrear_proporcional(
        df[~es_ph_casa], n_depto, ["barrio", "tipo_operacion"], rng
    )
    muestra = pd.concat([muestra_ph_casa, muestra_depto])

    # Top-up: si el redondeo por estrato dejo la muestra corta (puede pasar
    # si algun estrato muy chico no tenia suficientes filas), completa desde
    # el resto del pool proporcionalmente, excluyendo lo ya elegido.
    faltante = n_total - len(muestra)
    if faltante > 0:
        print(f"Ajuste: faltan {faltante} filas tras el reparto por estrato, completando del resto del pool...")
        resto = df.drop(index=muestra.index)
        extra = resto.sample(n=min(faltante, len(resto)), random_state=seed)
        muestra = pd.concat([muestra, extra])

    # OJO: NO se resetea el index aca a proposito -- resolver_direccion_con_reemplazo()
    # necesita el index ORIGINAL de df para saber que filas ya estan usadas y elegir
    # reemplazos sin duplicar. Se resetea recien al armar el CSV final, en main().
    return muestra.sample(frac=1, random_state=seed)  # shuffle final


# ===========================================================================
# PASO C: poligonos reales de barrio (parseados de las migraciones V5/V6,
# mismo dato que ya esta cargado en Postgres -- no hace falta conectarse a
# la base).
# ===========================================================================
def parsear_poligonos_barrios(ruta_v5, ruta_v6):
    poligonos = {}

    v5 = open(ruta_v5, encoding="utf-8").read()
    for match in re.finditer(
        r"UPDATE neighborhood SET boundary = ST_SetSRID\(ST_GeomFromText\('([^']+)'\).*?WHERE name = '([^']+)'",
        v5,
    ):
        wkt_str, nombre = match.group(1), match.group(2)
        poligonos[nombre] = shapely_wkt.loads(wkt_str)

    v6 = open(ruta_v6, encoding="utf-8").read()
    for match in re.finditer(
        r"INSERT INTO neighborhood \(name, boundary\) VALUES \('([^']+)', ST_SetSRID\(ST_GeomFromText\('([^']+)'\)",
        v6,
    ):
        nombre, wkt_str = match.group(1), match.group(2)
        poligonos[nombre] = shapely_wkt.loads(wkt_str)

    print(f"Poligonos de barrio parseados: {len(poligonos)} (esperado: 48)")
    faltantes = set(COMUNA_DE_BARRIO) - set(poligonos)
    if faltantes:
        print(f"ADVERTENCIA: faltan poligonos para {faltantes} -- revisar V5/V6.")
    return poligonos


# ===========================================================================
# PASO D: direcciones reales via Georef (datos.gob.ar)
# ===========================================================================
def _georef_get(path, params, timeout=10):
    url = f"{GEOREF_BASE_URL}{path}?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(url, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
        print(f"  [georef] error en {path}: {e}")
        return None


def obtener_calles_de_comuna(comuna_num, cache):
    clave = str(comuna_num)
    if clave in cache:
        return cache[clave]

    calles = []
    inicio = 0
    tam_pagina = 1000
    while True:
        data = _georef_get(
            "/calles",
            {
                "provincia": GEOREF_PROVINCIA,
                "departamento": f"Comuna {comuna_num}",
                "max": tam_pagina,
                "inicio": inicio,
                "campos": "nombre,altura",
            },
        )
        if not data or "calles" not in data:
            break
        lote = data["calles"]
        calles.extend(lote)
        if len(lote) < tam_pagina:
            break
        inicio += tam_pagina

    # Solo calles con rango de altura valido en al menos un lado.
    candidatas = []
    for c in calles:
        altura = c.get("altura") or {}
        inicio_b = altura.get("inicio") or {}
        fin_b = altura.get("fin") or {}
        valores = [v for v in [inicio_b.get("derecha"), inicio_b.get("izquierda"),
                                fin_b.get("derecha"), fin_b.get("izquierda")] if v]
        if not valores:
            continue
        candidatas.append({"nombre": c["nombre"], "altura_min": min(valores), "altura_max": max(valores)})

    print(f"  Comuna {comuna_num}: {len(candidatas)} calles con altura valida (de {len(calles)} totales)")
    cache[clave] = candidatas
    return candidatas


def geocodificar_direccion(texto_direccion):
    data = _georef_get(
        "/direcciones",
        {"direccion": texto_direccion, "provincia": GEOREF_PROVINCIA, "max": 1},
    )
    if not data or not data.get("direcciones"):
        return None
    d = data["direcciones"][0]
    ubicacion = d.get("ubicacion") or {}
    if "lat" not in ubicacion or "lon" not in ubicacion:
        return None
    return {"direccion": d.get("nomenclatura", texto_direccion), "lat": ubicacion["lat"], "lon": ubicacion["lon"]}


def generar_direccion_para_barrio(barrio, poligonos, cache_calles, rng, direcciones_usadas):
    comuna = COMUNA_DE_BARRIO.get(barrio)
    poligono = poligonos.get(barrio)
    if comuna is None or poligono is None:
        return {"direccion": None, "lat": None, "lon": None, "verificada": False, "intentos": 0}

    calles = obtener_calles_de_comuna(comuna, cache_calles)
    if not calles:
        return {"direccion": None, "lat": None, "lon": None, "verificada": False, "intentos": 0}

    mejor_intento = None
    mejor_distancia = None
    centroide = poligono.centroid

    for intento in range(1, MAX_INTENTOS_DIRECCION + 1):
        calle = calles[rng.integers(0, len(calles))]
        altura = int(rng.integers(calle["altura_min"], calle["altura_max"] + 1))
        resultado = geocodificar_direccion(f"{calle['nombre']} {altura}")
        time.sleep(PAUSA_ENTRE_LLAMADAS_SEG)
        if resultado is None:
            continue
        # Con pool de calles chico por comuna, dos propiedades del mismo
        # estrato pueden caer en la misma calle+altura por puro azar -- se
        # descarta y se reintenta en vez de dejar dos propiedades con la
        # direccion EXACTA repetida (se nota mucho en la demo).
        if resultado["direccion"] in direcciones_usadas:
            continue

        punto = Point(resultado["lon"], resultado["lat"])
        if punto.within(poligono):
            resultado["verificada"] = True
            resultado["intentos"] = intento
            direcciones_usadas.add(resultado["direccion"])
            return resultado

        distancia = punto.distance(centroide)
        if mejor_distancia is None or distancia < mejor_distancia:
            mejor_distancia = distancia
            mejor_intento = resultado

    # Se agotaron los intentos: devuelve el mas cercano al centroide del
    # barrio, marcado para revision manual en vez de fallar en silencio.
    if mejor_intento is not None:
        mejor_intento["verificada"] = False
        mejor_intento["intentos"] = MAX_INTENTOS_DIRECCION
        direcciones_usadas.add(mejor_intento["direccion"])  # reservarla igual, aunque no verificada
        return mejor_intento
    return {"direccion": None, "lat": None, "lon": None, "verificada": False, "intentos": MAX_INTENTOS_DIRECCION}


def elegir_reemplazo(df, usados, barrio, tipo_propiedad, tipo_operacion, rng):
    """Devuelve una fila candidata a reemplazo del MISMO estrato (barrio x
    tipo_propiedad x tipo_operacion) que todavia no este en `usados`, o None
    si no queda ninguna disponible en el dataset para ese estrato."""
    candidatos = df[
        (df["barrio"] == barrio)
        & (df["tipo_propiedad"] == tipo_propiedad)
        & (df["tipo_operacion"] == tipo_operacion)
        & (~df.index.isin(usados))
    ]
    if len(candidatos) == 0:
        return None
    idx = candidatos.index[rng.integers(0, len(candidatos))]
    return df.loc[idx]


def resolver_direccion_con_reemplazo(fila, df, usados, poligonos, cache_calles, rng, direcciones_usadas):
    """Intenta generar una direccion verificada para `fila`. Si no lo logra
    dentro de MAX_INTENTOS_DIRECCION intentos, en vez de aceptarla sin
    verificar prueba con OTRA propiedad del mismo estrato (barrio x
    tipo_propiedad x tipo_operacion) sacada del resto del dataset -- hasta
    MAX_REEMPLAZOS_POR_FILA propiedades distintas en total. Mantiene la
    proporcion del muestreo intacta (el reemplazo es siempre del mismo
    estrato) y nunca deja un hueco en las 200: si se agotan los reemplazos
    (estrato sin mas candidatos, o ninguno logra verificar), devuelve la
    ULTIMA propiedad probada con su mejor direccion candidata, marcada
    direccion_verificada=False para revision manual.
    Devuelve (fila_final, resultado_direccion, cantidad_de_reemplazos_usados)."""
    fila_actual = fila
    resultado = None
    reemplazos_usados = 0

    for intento_fila in range(1, MAX_REEMPLAZOS_POR_FILA + 1):
        usados.add(fila_actual.name)
        resultado = generar_direccion_para_barrio(fila_actual["barrio"], poligonos, cache_calles, rng, direcciones_usadas)
        if resultado["verificada"]:
            return fila_actual, resultado, reemplazos_usados

        if intento_fila < MAX_REEMPLAZOS_POR_FILA:
            reemplazo = elegir_reemplazo(df, usados, fila["barrio"], fila["tipo_propiedad"], fila["tipo_operacion"], rng)
            if reemplazo is None:
                break  # no quedan mas propiedades de este estrato -- no tiene sentido seguir
            fila_actual = reemplazo
            reemplazos_usados += 1

    return fila_actual, resultado, reemplazos_usados


# ===========================================================================
# MAIN
# ===========================================================================
def main():
    print("=" * 70)
    print("Nidio -- Paso 1: generacion de 200 propiedades reales para la demo")
    print("=" * 70)

    # --- Autotest de Georef ANTES de arrancar el trabajo pesado: si el
    # parametro "departamento=Comuna N" no funciona como se espera, mejor
    # frenar aca con un mensaje claro que descubrirlo despues de 200 vueltas.
    print("\nAutotest Georef (Comuna 1)...")
    test_cache = {}
    test_calles = obtener_calles_de_comuna(1, test_cache)
    if not test_calles:
        print(
            "ERROR: la consulta de prueba a Georef (/calles?departamento=Comuna 1) "
            "no devolvio calles con altura valida. Revisar manualmente en el navegador:\n"
            f"  {GEOREF_BASE_URL}/calles?provincia={urllib.parse.quote(GEOREF_PROVINCIA)}&departamento=Comuna%201&max=5\n"
            "antes de seguir (puede que el nombre del parametro/departamento haya cambiado)."
        )
        sys.exit(1)
    print(f"OK -- ejemplo: {test_calles[0]}")

    print(f"\nCargando dataset: {RUTA_DATASET}")
    df = pd.read_csv(RUTA_DATASET, low_memory=False)
    print(f"  {len(df)} filas, {len(df.columns)} columnas")

    # NO se filtra por titulo/descripcion (se probo y tenia un efecto
    # colateral fuerte: dejaba expensas_usd en 0/200 y corria la proporcion
    # venta/alquiler bastante lejos de la real -- ver conversacion). Los que
    # salgan sin titulo/descripcion, Pili los completa a mano en la revision.
    df = agregar_columna_amoblado(df)

    print(f"\nMuestreando {N_TOTAL} propiedades...")
    muestra = muestreo_estratificado_con_piso(df, N_TOTAL, PISO_PH_CASA, SEED)
    print(f"  Muestra final: {len(muestra)} filas")
    print(muestra["tipo_propiedad"].value_counts())
    print(muestra["tipo_operacion"].value_counts())

    print("\nParseando poligonos reales de barrio (V5/V6)...")
    poligonos = parsear_poligonos_barrios(RUTA_MIGRACION_V5, RUTA_MIGRACION_V6)

    cache_calles = {}
    if os.path.exists(RUTA_CACHE_CALLES):
        with open(RUTA_CACHE_CALLES, encoding="utf-8") as f:
            cache_calles = json.load(f)
        print(f"Cache de calles cargado: {len(cache_calles)} comunas")

    print(f"\nGenerando {len(muestra)} direcciones (Georef)... esto tarda unos minutos.")
    print(
        f"Si a una propiedad no le sale la direccion en {MAX_INTENTOS_DIRECCION} intentos, se "
        f"prueba con otra del mismo barrio/tipo/operacion (hasta {MAX_REEMPLAZOS_POR_FILA} en total)."
    )
    rng = np.random.default_rng(SEED)
    usados = set(muestra.index)  # todas las 200 originales, para que ningun reemplazo las repita
    direcciones_usadas = set()  # nomenclaturas ya asignadas -- para que ninguna propiedad repita la direccion EXACTA de otra
    filas_finales = []
    direcciones = []
    n_con_reemplazo = 0
    inicio_tiempo = time.time()
    for i, (_, fila) in enumerate(muestra.iterrows(), start=1):
        fila_final, resultado, reemplazos = resolver_direccion_con_reemplazo(fila, df, usados, poligonos, cache_calles, rng, direcciones_usadas)
        filas_finales.append(fila_final)
        direcciones.append(resultado)
        if reemplazos > 0:
            n_con_reemplazo += 1
        if i % 10 == 0 or i == len(muestra):
            transcurrido = time.time() - inicio_tiempo
            print(f"  {i}/{len(muestra)} direcciones generadas ({transcurrido:.0f}s)")

    with open(RUTA_CACHE_CALLES, "w", encoding="utf-8") as f:
        json.dump(cache_calles, f, ensure_ascii=False)

    if n_con_reemplazo:
        print(
            f"\n{n_con_reemplazo} propiedades necesitaron cambiar a otra del mismo estrato "
            "(barrio/tipo_propiedad/tipo_operacion) porque la original no encontraba direccion verificada."
        )

    n_no_verificadas = sum(1 for d in direcciones if not d["verificada"])
    if n_no_verificadas:
        print(
            f"\nADVERTENCIA: {n_no_verificadas} de {len(direcciones)} direcciones NO se pudieron "
            f"verificar ni probando hasta {MAX_REEMPLAZOS_POR_FILA} propiedades distintas del mismo "
            "estrato (quedan marcadas direccion_verificada=False -- revisar a mano antes de usarlas)."
        )

    # --- ensamblar salida ---
    muestra_final = pd.DataFrame(filas_finales)
    dir_df = pd.DataFrame(direcciones).rename(
        columns={"direccion": "direccion_generada", "lat": "lat_generada", "lon": "lon_generada", "verificada": "direccion_verificada", "intentos": "intentos_direccion"}
    )
    salida = pd.concat([muestra_final.reset_index(drop=True), dir_df.reset_index(drop=True)], axis=1)

    columnas_finales = [
        "barrio", "tipo_propiedad", "tipo_operacion", "ambientes", "dormitorios", "banos",
        "superficie_total", "superficie_cubierta", "expensas_usd", "tiene_cochera",
        "tiene_pileta", "amenities_edificio", "seguridad_24hs", "luminoso", "apto_credito",
        "estado_propiedad", "amoblado",
        "titulo", "descripcion",  # OJO: vienen tal cual del dataset -- revisar/editar a mano antes de publicar (ver docstring)
        "direccion_generada", "lat_generada", "lon_generada", "direccion_verificada", "intentos_direccion",
        "fecha", "precio_usd",  # referencia historica del dataset -- NO usar como precio final, ver docstring
    ]
    columnas_finales = [c for c in columnas_finales if c in salida.columns]
    salida = salida[columnas_finales].rename(columns={
        "precio_usd": "precio_historico_dataset_usd",
        # Solo 31 de 200 traen expensas del dataset (ver conversacion) -- se
        # renombra "historico" para dejar claro que, igual que el precio, no
        # es la fuente final: Pili puede completar/corregir a mano buscando
        # en Zonaprop, en la columna de al lado (mismo criterio que el precio).
        "expensas_usd": "expensas_historico_dataset_usd",
    })
    salida.insert(0, "id_temporal", range(1, len(salida) + 1))
    # Sin "_usd" en el nombre a proposito -- Pili escribe el numero TAL CUAL
    # lo ve en Zonaprop, sin convertir nada (venta ahi ya se publica en USD,
    # alquiler en ARS -- misma convencion que el resto de la plataforma, ver
    # format.js). La conversion a USD final se hace despues, en un solo
    # paso, con una cotizacion consistente para las 200 -- ver conversacion.
    salida["precio_referencia_zonaprop"] = ""  # para completar a mano (USD si venta, ARS si alquiler)
    salida["expensas_referencia_zonaprop_ars"] = ""  # para completar a mano -- expensas siempre se cotizan en ARS en Argentina

    salida.to_csv(RUTA_SALIDA_CSV, index=False, encoding="utf-8-sig")
    print(f"\nListo -- {len(salida)} propiedades escritas en {RUTA_SALIDA_CSV}")
    print(
        "Proximo paso: completar a mano 'precio_referencia_zonaprop' (tal cual lo muestra "
        "Zonaprop -- USD si es venta, ARS si es alquiler) y 'expensas_referencia_zonaprop_ars' "
        "(siempre en ARS) buscando propiedades comparables (mismo barrio/tipo/tamano aprox). "
        "Revisar tambien las filas con direccion_verificada=False."
    )


if __name__ == "__main__":
    main()
