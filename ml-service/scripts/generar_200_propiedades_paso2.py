"""
Nidio -- PASO 2 de 2 para la base de 200 propiedades reales de la demo
(ver bitacora / roadmap.md, seccion "200 propiedades").

QUE HACE:
  1. Carga 200_propiedades_paso2_input.csv (salida del Paso 1 + expensas_usd
     ya convertidas -- ver roadmap.md, "conversion ARS->USD").
  2. Se conecta a tu Postgres LOCAL (backend/.env) solo para VALIDAR:
     que los 33 barrios del CSV existan en la tabla `neighborhood`, y que
     ninguno de los emails ficticios (7 inmobiliarias + 25 dueños directos)
     ya exista en `user` -- para no generar un INSERT que rompa por
     duplicado. NO se usa para resolver IDs: las migraciones de salida usan
     subqueries por nombre/email (mismo patron que V17), no IDs
     hardcodeados, para que la migracion sea portable entre entornos.
  3. Asigna cada propiedad a un publicador ficticio:
       - 7 inmobiliarias, una por zona geografica (agrupando las 15 comunas
         de CABA en 7 zonas -- ver ZONA_DE_COMUNA), que se quedan con el 65%
         de las propiedades DE SU ZONA.
       - 25 dueños directos (sin restriccion de zona), que se reparten el
         35% restante (~70 propiedades) round-robin -- cada uno termina con
         2 o 3 propiedades, un numero realista para una persona fisica
         (una inmobiliaria puede tener decenas de avisos, un dueño directo
         no).
     La asignacion es DETERMINISTICA (ordena por id_temporal antes de
     repartir) para que correr el script dos veces de la misma entrada
     produzca la misma salida.
  4. Llama a POST /predict (ml-service, local) por cada una de las 200
     filas para obtener el rango de valuacion real del modelo (min/max +
     explicacion en texto/JSON) -- las 200 propiedades quedan tasadas por
     el modelo entrenado, no con numeros inventados.
  5. Genera dos migraciones Flyway listas para copiar a
     backend/src/main/resources/db/migration/:
       - V25__seed_200_real_properties.sql: los 7 usuarios inmobiliaria +
         25 usuarios dueño directo, las 200 propiedades y sus fotos
         (Picsum, mismo criterio que V17).
       - V26__delete_synthetic_catalog.sql: borra el catalogo sintetico
         viejo (las propiedades V2/V10 sin dueño), ahora reemplazado por
         las 200 reales.

QUE NO HACE (a proposito):
  - No toca los 2 usuarios/4 propiedades demo de V17 (Inmobiliaria Nidio
    Demo / Marcos Ferreyra) -- quedan como estan, la migracion V26 solo
    borra `created_by_user_id IS NULL` (el catalogo sintetico original),
    que nunca incluyo esas filas.
  - No inserta directamente en tu base: solo GENERA los archivos .sql. Vos
    los revisas, los copias a la carpeta de migraciones y Flyway los aplica
    la proxima vez que levantes el backend (o con `mvn flyway:migrate`).
  - No manda `declaredPrice` a /predict: ese campo es "vos declarás cuanto
    vale, decime si esta sobre/sub valuada" (HU de tasacion en vivo) y va
    en USD -- pero el precio de las propiedades en alquiler esta en ARS
    (misma convencion que el resto de la plataforma, ver roadmap.md). Para
    sembrar el rango de valuacion no hace falta declarar precio, asi que
    se omite en las 200 filas (venta y alquiler por igual) y se evita el
    problema de mezclar monedas.

COMO USARLO:
    1. Tener el backend Y el ml-service corriendo localmente (ver
       Como_levantar_Nidio_en_local.pdf) -- este script necesita Postgres
       en localhost:5432 y ml-service respondiendo en localhost:8000.
    2. Revisar la seccion CONFIG de abajo si tu setup no usa los valores
       por defecto de backend/.env.example.
    3. pip install psycopg2-binary requests pandas   (si no los tenes)
    4. python generar_200_propiedades_paso2.py -- funciona parado en
       cualquier directorio (ml-service/ o ml-service/scripts/), las rutas
       del CSV de entrada y de los .sql de salida se resuelven solas a
       partir de donde vive este archivo, no del directorio desde el que
       lo invoques.
    5. Los dos .sql quedan escritos en ml-service/ (al lado de los CSV del
       Paso 1/2), no en scripts/. Revisarlos, copiarlos a
       backend/src/main/resources/db/migration/ y levantar el backend para
       que Flyway los aplique.
"""

import json
import os
import re
import sys
import unicodedata

import pandas as pd
import psycopg2
import requests

# ===========================================================================
# CONFIG
# ===========================================================================
# Rutas resueltas a partir de la ubicacion del script (no del directorio
# desde el que se lo invoque) -- este script vive en ml-service/scripts/ y
# el CSV de entrada (y donde se escriben los .sql de salida) vive un nivel
# arriba, en ml-service/, igual que 200_propiedades_paso1.csv. Si se corre
# `python scripts/generar_200_propiedades_paso2.py` desde ml-service/ o
# `python generar_200_propiedades_paso2.py` parado adentro de scripts/, en
# los dos casos encuentra el CSV igual -- no depende del directorio actual.
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_ML_SERVICE_DIR = os.path.dirname(_SCRIPT_DIR)

RUTA_CSV_ENTRADA = os.environ.get(
    "NIDIO_CSV_PASO2", os.path.join(_ML_SERVICE_DIR, "200_propiedades_paso2_input.csv")
)
RUTA_SALIDA_V25 = os.environ.get(
    "NIDIO_OUT_V25", os.path.join(_ML_SERVICE_DIR, "V25__seed_200_real_properties.sql")
)
RUTA_SALIDA_V26 = os.environ.get(
    "NIDIO_OUT_V26", os.path.join(_ML_SERVICE_DIR, "V26__delete_synthetic_catalog.sql")
)

# Mismos valores por defecto que backend/.env.example -- ajustar via
# variables de entorno si tu Postgres local usa otra config.
DB_HOST = os.environ.get("NIDIO_DB_HOST", "localhost")
DB_PORT = os.environ.get("NIDIO_DB_PORT", "5432")
DB_NAME = os.environ.get("NIDIO_DB_NAME", "nidio")
DB_USER = os.environ.get("NIDIO_DB_USER", "postgres")
DB_PASSWORD = os.environ.get("NIDIO_DB_PASSWORD", "postgres")

ML_SERVICE_URL = os.environ.get("NIDIO_ML_SERVICE_URL", "http://localhost:8000")

# Hash bcrypt de "Demo1234!" -- el mismo que ya usan los 2 usuarios demo de
# V17, reutilizado para los 32 usuarios ficticios nuevos (7 inmobiliarias +
# 25 dueños) por consistencia: todos loggeables con la misma password si
# hace falta probarlos a mano.
PASSWORD_HASH_DEMO = "$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W"

# ===========================================================================
# Mapeo barrio -> comuna -> zona (mismo COMUNA_DE_BARRIO que
# generar_200_propiedades_paso1.py -- no tocar sin actualizar los dos).
# ZONA_DE_COMUNA agrupa las 15 comunas en las 7 zonas del plan de
# publicadores aprobado (ver roadmap.md, "Paso 2 -- publicadores
# ficticios"). Verificado contra el CSV real: da 16/31/33/24/16/30/50 =
# 200, exactamente los numeros del plan aprobado.
# ===========================================================================
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

ZONA_DE_COMUNA = {
    1: "Centro",
    2: "Recoleta/Once", 3: "Recoleta/Once",
    5: "Almagro/Caballito/Flores", 6: "Almagro/Caballito/Flores", 7: "Almagro/Caballito/Flores",
    4: "Oeste/Sur", 8: "Oeste/Sur", 9: "Oeste/Sur", 10: "Oeste/Sur", 11: "Oeste/Sur",
    12: "Norte",
    13: "Belgrano",
    14: "Palermo/Chacarita", 15: "Palermo/Chacarita",
}

PORCENTAJE_AGENCIA_POR_ZONA = 0.65  # el resto (35%) va a los dueños directos

# 7 inmobiliarias ficticias, una por zona. cuit/tax_condition son datos
# ficticios plausibles (no CUITs reales) -- solo para completar el
# formulario de cuenta profesional de forma consistente.
AGENCIAS = {
    "Centro": {
        "nombre": "Inmobiliaria Plaza Centro",
        "email": "plazacentro.propiedades@nidio.app",
        "cuit": "30-70000001-4",
    },
    "Recoleta/Once": {
        "nombre": "Recoleta & Once Propiedades",
        "email": "recoletayonce.propiedades@nidio.app",
        "cuit": "30-70000002-2",
    },
    "Almagro/Caballito/Flores": {
        "nombre": "Inmobiliaria Almagro-Caballito",
        "email": "almagrocaballito.propiedades@nidio.app",
        "cuit": "30-70000003-0",
    },
    "Oeste/Sur": {
        "nombre": "Sur Oeste Inmobiliaria",
        "email": "suroeste.propiedades@nidio.app",
        "cuit": "30-70000004-9",
    },
    "Norte": {
        "nombre": "Norte CABA Bienes Raíces",
        "email": "nortecaba.propiedades@nidio.app",
        "cuit": "30-70000005-7",
    },
    "Belgrano": {
        "nombre": "Belgrano Propiedades",
        "email": "belgrano.propiedades@nidio.app",
        "cuit": "30-70000006-5",
    },
    "Palermo/Chacarita": {
        "nombre": "Palermo Hollywood Real Estate",
        "email": "palermohollywood.propiedades@nidio.app",
        "cuit": "30-70000007-3",
    },
}

# 25 dueños directos ficticios (sin zona asignada -- el reparto es
# round-robin sobre las ~70 propiedades que no van a una inmobiliaria).
DUENOS_DIRECTOS = [
    "Lucía Fernández", "Martín Gómez", "Sofía Rodríguez", "Nicolás Álvarez",
    "Valentina Ruiz", "Tomás Díaz", "Camila Torres", "Federico Romero",
    "Julieta Sosa", "Agustín Molina", "Florencia Acosta", "Ignacio Medina",
    "Antonella Herrera", "Franco Suárez", "Milagros Castro", "Joaquín Ortiz",
    "Rocío Aguirre", "Emiliano Rojas", "Constanza Silva", "Bautista Núñez",
    "Abril Cabrera", "Santino Peralta", "Delfina Vega", "Maximiliano Paz",
    "Catalina Benítez",
]

# ===========================================================================
# Traduccion de campos: mismos mapeos que ml-service/src/models/valuation.py
# pero DESDE el CSV (espanol) HACIA el contrato /predict (ingles/camelCase) y
# HACIA el CHECK constraint de property.property_condition (V24, tambien en
# ingles). No inventar valores nuevos -- tienen que ser exactamente estos.
# ===========================================================================
TIPO_PROPIEDAD_A_ENUM = {"Departamento": "APARTMENT", "Casa": "HOUSE", "PH": "PH"}
TIPO_OPERACION_A_ENUM = {"venta": "SALE", "alquiler": "RENT"}
ESTADO_A_ENUM = {
    "a_estrenar": "NEW",
    "usado_buen_estado": "USED_GOOD_CONDITION",
    "a_reciclar": "NEEDS_RENOVATION",
    "no_especificado": "NOT_SPECIFIED",
}


def sin_acentos(texto):
    """Para armar slugs de email a partir de nombres con tildes/ñ."""
    nfkd = unicodedata.normalize("NFKD", texto)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def _es_nulo(valor):
    """Chequeo de nulo robusto a los distintos tipos que puede devolver
    pandas segun version/backend (None, float('nan'), pd.NA, pd.NaT...) --
    no asumir que siempre es float('nan') como en la version de pandas con
    la que se probo este script."""
    if valor is None:
        return True
    try:
        resultado = pd.isna(valor)
    except (TypeError, ValueError):
        return False
    return bool(resultado)


def sql_str(valor):
    """Literal SQL para un string, o NULL. Escapa comillas simples
    duplicandolas (estandar SQL)."""
    if _es_nulo(valor):
        return "NULL"
    return "'" + str(valor).replace("'", "''") + "'"


def sql_num(valor):
    if _es_nulo(valor):
        return "NULL"
    return str(valor)


def sql_bool(valor):
    if _es_nulo(valor):
        return "NULL"
    return "true" if bool(valor) else "false"


# ===========================================================================
# PASO A: validaciones contra la base local (solo lectura)
# ===========================================================================
def validar_contra_base(barrios_csv, emails_nuevos):
    print(f"\nConectando a Postgres local ({DB_HOST}:{DB_PORT}/{DB_NAME})...")
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD
    )
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT name FROM neighborhood')
            barrios_db = {row[0] for row in cur.fetchall()}
            faltantes = set(barrios_csv) - barrios_db
            if faltantes:
                print(f"ERROR: estos barrios del CSV no existen en `neighborhood`: {faltantes}")
                sys.exit(1)
            print(f"OK -- los {len(barrios_csv)} barrios del CSV existen en `neighborhood`.")

            cur.execute('SELECT email FROM "user" WHERE email = ANY(%s)', (list(emails_nuevos),))
            ya_existen = {row[0] for row in cur.fetchall()}
            if ya_existen:
                print(
                    f"ERROR: estos emails ficticios ya existen en `user` (¿ya corriste el "
                    f"script antes?): {ya_existen}"
                )
                sys.exit(1)
            print(f"OK -- ninguno de los {len(emails_nuevos)} emails ficticios existe todavía.")
    finally:
        conn.close()


# ===========================================================================
# PASO B: asignacion de publicador (deterministica)
# ===========================================================================
def asignar_publicadores(df):
    df = df.copy()
    df["comuna"] = df["barrio"].map(COMUNA_DE_BARRIO)
    df["zona"] = df["comuna"].map(ZONA_DE_COMUNA)

    sin_zona = df["zona"].isna()
    if sin_zona.any():
        print(f"ERROR: {sin_zona.sum()} filas con barrio sin zona asignada: {df.loc[sin_zona, 'barrio'].unique()}")
        sys.exit(1)

    df["publisher_type"] = None
    df["publicador_email"] = None
    df["publicador_nombre"] = None

    pool_duenos = []  # (index,) de filas que van a la bolsa de dueños directos

    for zona, grupo in df.groupby("zona"):
        grupo_ordenado = grupo.sort_values("id_temporal")
        n = len(grupo_ordenado)
        n_agencia = round(n * PORCENTAJE_AGENCIA_POR_ZONA)
        idx_agencia = grupo_ordenado.index[:n_agencia]
        idx_dueno = grupo_ordenado.index[n_agencia:]

        agencia = AGENCIAS[zona]
        df.loc[idx_agencia, "publisher_type"] = "AGENCY"
        df.loc[idx_agencia, "publicador_email"] = agencia["email"]
        df.loc[idx_agencia, "publicador_nombre"] = agencia["nombre"]

        pool_duenos.extend(idx_dueno.tolist())
        print(f"  Zona {zona}: {n} propiedades -> {n_agencia} a '{agencia['nombre']}', {n - n_agencia} a dueños directos")

    # Reparto round-robin de la bolsa de dueños directos, ordenada por
    # id_temporal para que sea deterministico.
    pool_duenos_ordenado = df.loc[pool_duenos].sort_values("id_temporal").index.tolist()
    for i, idx in enumerate(pool_duenos_ordenado):
        nombre = DUENOS_DIRECTOS[i % len(DUENOS_DIRECTOS)]
        slug = sin_acentos(nombre).lower().replace(" ", ".")
        email = f"{slug}@nidio.app"
        df.loc[idx, "publisher_type"] = "OWNER"
        df.loc[idx, "publicador_email"] = email
        df.loc[idx, "publicador_nombre"] = nombre

    conteo_duenos = df[df["publisher_type"] == "OWNER"]["publicador_email"].value_counts()
    print(f"\n  {len(pool_duenos_ordenado)} propiedades repartidas entre {conteo_duenos.size} de los 25 dueños directos")
    print(f"  Propiedades por dueño: min={conteo_duenos.min()}, max={conteo_duenos.max()}")

    return df


# ===========================================================================
# PASO C: valuacion via /predict
# ===========================================================================
def construir_payload_predict(fila):
    payload = {
        "operationType": TIPO_OPERACION_A_ENUM[fila["tipo_operacion"]],
        "propertyType": TIPO_PROPIEDAD_A_ENUM[fila["tipo_propiedad"]],
        "neighborhood": fila["barrio"],
        "surfaceM2": float(fila["superficie_cubierta"]),
        "rooms": int(fila["ambientes"]),
    }
    if pd.notna(fila.get("superficie_total")):
        payload["totalSurfaceM2"] = float(fila["superficie_total"])
    if pd.notna(fila.get("banos")):
        payload["bathrooms"] = int(fila["banos"])
    if pd.notna(fila.get("estado_propiedad")):
        payload["propertyCondition"] = ESTADO_A_ENUM[fila["estado_propiedad"]]
    if pd.notna(fila.get("expensas_usd")):
        payload["expensesUsd"] = float(fila["expensas_usd"])
    for csv_col, api_field in [
        ("tiene_pileta", "hasPool"),
        ("tiene_cochera", "hasGarage"),
        ("amenities_edificio", "buildingAmenities"),
        ("seguridad_24hs", "security24h"),
        ("luminoso", "bright"),
        ("apto_credito", "aptoCredito"),
        ("amoblado", "furnished"),
    ]:
        if pd.notna(fila.get(csv_col)):
            payload[api_field] = bool(fila[csv_col])
    return payload


def _resultado_vacio():
    return {
        "valuation_range_min": None,
        "valuation_range_max": None,
        "valuation_explanation_text": None,
        "valuation_explanation_json": None,
    }


def _detalle_error_422(resp):
    """Pydantic/FastAPI mandan, en el cuerpo de un 422, una lista de errores
    con el campo puntual y el motivo (`detail: [{loc, msg, type}, ...]`) --
    mucho mas util que solo '422 Unprocessable Entity'. Si el cuerpo no es
    JSON (no deberia pasar con FastAPI, pero por las dudas) cae al texto
    crudo."""
    try:
        cuerpo = resp.json()
    except ValueError:
        return resp.text[:500]
    detalle = cuerpo.get("detail", cuerpo) if isinstance(cuerpo, dict) else cuerpo
    if isinstance(detalle, list):
        partes = []
        for err in detalle:
            loc = " -> ".join(str(p) for p in err.get("loc", [])) if isinstance(err, dict) else str(err)
            msg = err.get("msg", "") if isinstance(err, dict) else ""
            partes.append(f"{loc}: {msg}")
        return " | ".join(partes)
    return str(detalle)


def tasar_propiedades(df):
    print(f"\nLlamando a {ML_SERVICE_URL}/predict para {len(df)} propiedades...")
    resultados = []
    n_error = 0
    for i, (_, fila) in enumerate(df.iterrows(), start=1):
        payload = construir_payload_predict(fila)
        try:
            resp = requests.post(f"{ML_SERVICE_URL}/predict", json=payload, timeout=15)
        except requests.exceptions.RequestException as e:
            # Error de conexion (timeout, ml-service caido, etc.) -- no hay
            # response para leer detalle, distinto de un 422 (el servidor SI
            # respondio, solo que rechazo el payload).
            n_error += 1
            print(f"  [id_temporal {fila['id_temporal']}] ERROR DE CONEXION a /predict: {e}")
            resultados.append(_resultado_vacio())
        else:
            if resp.status_code >= 400:
                n_error += 1
                detalle = _detalle_error_422(resp)
                print(f"  [id_temporal {fila['id_temporal']}] ERROR {resp.status_code} llamando a /predict -- payload: {payload} -- detalle: {detalle}")
                resultados.append(_resultado_vacio())
            else:
                data = resp.json()
                resultados.append({
                    "valuation_range_min": data.get("min"),
                    "valuation_range_max": data.get("max"),
                    "valuation_explanation_text": data.get("explanationText"),
                    "valuation_explanation_json": json.dumps(data.get("explanation"), ensure_ascii=False)
                    if data.get("explanation") is not None else None,
                })
        if i % 20 == 0 or i == len(df):
            print(f"  {i}/{len(df)} tasadas")

    if n_error:
        print(
            f"\nADVERTENCIA: {n_error} de {len(df)} propiedades quedaron SIN rango de "
            "valuacion (falló la llamada a /predict -- revisar el detalle de cada error "
            "arriba). Esas filas se insertan igual, con valuation_range_min/max NULL."
        )

    return pd.concat([df.reset_index(drop=True), pd.DataFrame(resultados)], axis=1)


# ===========================================================================
# PASO D: armar las migraciones .sql
# ===========================================================================
def armar_v25(df):
    partes = []
    partes.append(
        "-- Nidio -- V25: siembra las 200 propiedades reales (Paso 2, ver roadmap.md).\n"
        "-- Reemplaza el catalogo sintetico (borrado en V26) por propiedades con datos\n"
        "-- reales (superficie/ambientes/precio de referencia Zonaprop, direcciones\n"
        "-- verificadas via Georef) y publicadores ficticios (7 inmobiliarias + 25 dueños\n"
        "-- directos, ver generar_200_propiedades_paso2.py). NO son propiedades reales\n"
        "-- publicadas -- ver instructions del proyecto (sin scraping, base sintetica).\n"
        "-- Generada automaticamente -- no editar a mano, volver a correr el script.\n"
    )

    # --- usuarios: 7 inmobiliarias (PROFESSIONAL) ---
    partes.append("\n-- 7 inmobiliarias ficticias (una por zona geografica), cuenta PROFESSIONAL.\n")
    partes.append(f"-- Password de las 32 cuentas nuevas (por si se quiere probar el login): Demo1234!\n")
    for zona, ag in AGENCIAS.items():
        seed = urllib_quote(ag["nombre"])
        partes.append(
            "INSERT INTO \"user\" (name, email, password_hash, account_type, professional_type, "
            "business_name, tax_condition, cuit, logo_url, email_verified, role, active, created_at, updated_at)\n"
            f"VALUES ({sql_str(ag['nombre'])}, {sql_str(ag['email'])}, {sql_str(PASSWORD_HASH_DEMO)}, "
            f"'PROFESSIONAL', 'AGENCY', {sql_str(ag['nombre'])}, 'RESPONSABLE_INSCRIPTO', {sql_str(ag['cuit'])}, "
            f"'https://api.dicebear.com/7.x/shapes/svg?seed={seed}&backgroundColor=00647c', "
            "true, 'USER', true, now(), now());\n"
        )

    # --- usuarios: 25 dueños directos (PERSONAL) ---
    partes.append("\n-- 25 dueños directos ficticios, cuenta PERSONAL (sin datos profesionales).\n")
    emails_vistos = set()
    for nombre in DUENOS_DIRECTOS:
        slug = sin_acentos(nombre).lower().replace(" ", ".")
        email = f"{slug}@nidio.app"
        emails_vistos.add(email)
        partes.append(
            "INSERT INTO \"user\" (name, email, password_hash, email_verified, role, active, created_at, updated_at)\n"
            f"VALUES ({sql_str(nombre)}, {sql_str(email)}, {sql_str(PASSWORD_HASH_DEMO)}, true, 'USER', true, now(), now());\n"
        )

    # --- propiedades ---
    partes.append("\n-- 200 propiedades reales, cada una asociada a su publicador por email.\n")
    for _, fila in df.iterrows():
        titulo = fila["titulo"] if pd.notna(fila["titulo"]) else f"{fila['tipo_propiedad']} en {fila['barrio']}"
        descripcion = fila["descripcion"] if pd.notna(fila["descripcion"]) else None
        operation = TIPO_OPERACION_A_ENUM[fila["tipo_operacion"]]
        ptype = TIPO_PROPIEDAD_A_ENUM[fila["tipo_propiedad"]]
        condition = ESTADO_A_ENUM.get(fila["estado_propiedad"]) if pd.notna(fila.get("estado_propiedad")) else None

        cols = [
            "title", "property_type", "operation_type", "neighborhood_id", "address", "location",
            "surface_m2", "total_surface_m2", "rooms", "bathrooms", "price", "description",
            "created_by_user_id", "publisher_type", "active", "expenses_usd", "property_condition",
            "has_pool", "has_garage", "building_amenities", "security_24h", "bright", "apto_credito",
            "furnished", "valuation_range_min", "valuation_range_max", "valuation_explanation_text",
            "valuation_explanation_json", "created_at",
        ]
        select_vals = [
            sql_str(titulo), sql_str(ptype), sql_str(operation), "n.id", sql_str(fila["direccion_generada"]),
            f"ST_SetSRID(ST_MakePoint({fila['lon_generada']}, {fila['lat_generada']}), 4326)",
            sql_num(fila["superficie_cubierta"]), sql_num(fila.get("superficie_total")),
            sql_num(fila["ambientes"]), sql_num(fila.get("banos")), sql_num(fila["precio_referencia_zonaprop"]),
            sql_str(descripcion), "u.id", sql_str(fila["publisher_type"]), "true",
            sql_num(fila.get("expensas_usd")), sql_str(condition),
            sql_bool(fila.get("tiene_pileta")), sql_bool(fila.get("tiene_cochera")),
            sql_bool(fila.get("amenities_edificio")), sql_bool(fila.get("seguridad_24hs")),
            sql_bool(fila.get("luminoso")), sql_bool(fila.get("apto_credito")), sql_bool(fila.get("amoblado")),
            sql_num(fila.get("valuation_range_min")), sql_num(fila.get("valuation_range_max")),
            sql_str(fila.get("valuation_explanation_text")),
            (f"{sql_str(fila['valuation_explanation_json'])}::jsonb" if fila.get("valuation_explanation_json") else "NULL"),
            "now()",
        ]
        partes.append(
            f"INSERT INTO property ({', '.join(cols)})\n"
            f"SELECT {', '.join(select_vals)}\n"
            f"FROM neighborhood n, \"user\" u\n"
            f"WHERE n.name = {sql_str(fila['barrio'])} AND u.email = {sql_str(fila['publicador_email'])};\n"
        )

        # 3 fotos ilustrativas por propiedad (Picsum, mismo criterio que V17).
        partes.append(
            "INSERT INTO property_image (property_id, url, sort_order)\n"
            "SELECT p.id, img.url, img.ord\n"
            "FROM property p\n"
            "JOIN \"user\" u ON p.created_by_user_id = u.id\n"
            "CROSS JOIN LATERAL (\n"
            "    VALUES\n"
            f"        ('https://picsum.photos/seed/nidio-paso2-{fila['id_temporal']}-1/1200/800', 0),\n"
            f"        ('https://picsum.photos/seed/nidio-paso2-{fila['id_temporal']}-2/1200/800', 1),\n"
            f"        ('https://picsum.photos/seed/nidio-paso2-{fila['id_temporal']}-3/1200/800', 2)\n"
            ") AS img(url, ord)\n"
            f"WHERE u.email = {sql_str(fila['publicador_email'])}\n"
            f"  AND p.title = {sql_str(titulo)}\n"
            f"  AND p.address = {sql_str(fila['direccion_generada'])};\n"
        )

    return "\n".join(partes)


def armar_v26():
    return (
        "-- Nidio -- V26: borra el catalogo sintetico original (V2/V10), reemplazado\n"
        "-- por las 200 propiedades reales sembradas en V25. Solo afecta filas SIN\n"
        "-- dueño (created_by_user_id IS NULL) -- las propiedades demo de V17 y las 200\n"
        "-- nuevas de V25 SI tienen dueño, no se tocan.\n"
        "DELETE FROM property WHERE created_by_user_id IS NULL;\n"
    )


def urllib_quote(texto):
    import urllib.parse
    return urllib.parse.quote(texto)


# ===========================================================================
# MAIN
# ===========================================================================
def main():
    print("=" * 70)
    print("Nidio -- Paso 2: publicadores + valuacion + migraciones")
    print("=" * 70)

    print(f"\nCargando {RUTA_CSV_ENTRADA}...")
    df = pd.read_csv(RUTA_CSV_ENTRADA)
    print(f"  {len(df)} filas, {len(df.columns)} columnas")

    # Aviso, no bloquea: el dataset historico trae descripciones con
    # artefactos de formato (tags <br>, saltos de linea de Zonaprop/similar)
    # que van a mostrarse LITERALES en la ficha de detalle porque el front
    # no interpreta HTML en `description`. No se limpian aca automatico a
    # proposito -- es el mismo dato que Paso 1 ya marco para revision manual
    # de titulo/descripcion (sacar datos sensibles, etc.), mejor que Pili lo
    # vea y decida como limpiarlo, no que el script lo altere en silencio.
    con_html = df["descripcion"].fillna("").str.contains(r"<[a-zA-Z/][^>]*>", regex=True).sum()
    if con_html:
        print(
            f"AVISO: {con_html} de {len(df)} descripciones tienen tags tipo <br> que van a "
            "verse literales en la ficha de detalle (el front no renderiza HTML) -- "
            "revisar/limpiar a mano si se quiere, no es bloqueante."
        )

    barrios_csv = sorted(df["barrio"].unique())
    emails_agencias = [ag["email"] for ag in AGENCIAS.values()]
    emails_duenos = [f"{sin_acentos(n).lower().replace(' ', '.')}@nidio.app" for n in DUENOS_DIRECTOS]
    validar_contra_base(barrios_csv, emails_agencias + emails_duenos)

    print("\nAsignando publicadores (7 inmobiliarias por zona + 25 dueños directos)...")
    df = asignar_publicadores(df)

    df = tasar_propiedades(df)

    print(f"\nArmando {RUTA_SALIDA_V25}...")
    v25 = armar_v25(df)
    with open(RUTA_SALIDA_V25, "w", encoding="utf-8") as f:
        f.write(v25)
    print(f"  {len(v25)} caracteres escritos.")

    print(f"\nArmando {RUTA_SALIDA_V26}...")
    v26 = armar_v26()
    with open(RUTA_SALIDA_V26, "w", encoding="utf-8") as f:
        f.write(v26)
    print(f"  {len(v26)} caracteres escritos.")

    print(
        "\nListo. Revisar los dos .sql generados, copiarlos a "
        "backend/src/main/resources/db/migration/ y levantar el backend para que "
        "Flyway los aplique (o `mvn flyway:migrate`)."
    )


if __name__ == "__main__":
    main()
