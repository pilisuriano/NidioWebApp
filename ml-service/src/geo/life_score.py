"""Cálculo del Life Score.

POIs REALES para 6 de las 7 categorías vía OSMnx (que a su vez consulta
Overpass API, la API pública de OpenStreetMap) alrededor del punto
consultado, dentro de un radio fijo (RADIUS_M). Reemplaza la
implementación sintética que hubo antes (POIs con nombres inventados y
densidad simulada por distancia al Obelisco) -- ya no hay ningún dato
ficticio: si Overpass no devuelve resultados para una categoría, o la
consulta falla, esa categoría queda en 0 (poiCount=0, pois=[]), nunca se
rellena con datos inventados.

TRANSPORT es la excepción parcial: las paradas de colectivo salen del
dataset oficial de BA Data (ver _load_bus_stops), no de Overpass -- en OSM
casi ninguna parada de colectivo tiene tag de qué línea para ahí, así que
Overpass servía nombres/líneas pero no identificaba la parada. Subte, tren
y bicicletas públicas dentro de TRANSPORT siguen viniendo de Overpass como
el resto de las categorías.

Por qué OSMnx y no pegarle a Overpass "a mano": OSMnx arma la query
Overpass QL, maneja reintentos/backoff según el header de rate-limit del
servidor, y sobre todo cachea cada respuesta en disco (ver
_configure_osmnx) -- necesario porque las instancias públicas de Overpass
tienen un tope documentado de ~10.000 requests/día por IP y piden
explícitamente no repetir la misma consulta más de lo necesario.
"""

from __future__ import annotations

import csv
import logging
import math
import os
from collections import defaultdict

import osmnx as ox

logger = logging.getLogger(__name__)

# Mismo radio que se mostraba en el frontend con la implementación
# sintética ("N POIs en ~800 m") -- se mantiene para no tener que tocar ese
# texto ni la expectativa de qué significa "cerca".
RADIUS_M = 800

_EARTH_RADIUS_M = 6371000.0


def _haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Mismo método (Haversine) que `GeoUtils.java` usa para "Mis lugares"
    -- una sola fórmula de distancia para todo el producto, no dos
    distintas para dos features parecidas.

    Hace falta esto (no alcanza con lo que ya filtra OSMnx) porque
    `ox.features_from_point(..., dist=RADIUS_M)` arma un bounding box
    CUADRADO de RADIUS_M metros N/S/E/W del punto (confirmado leyendo el
    código de OSMnx), no un círculo -- en las esquinas de ese cuadrado hay
    puntos hasta ~1131 m de distancia real (RADIUS_M * sqrt(2)) cuando el
    texto le dice al usuario "~800 m". Se filtra acá, después, para que
    RADIUS_M sea un radio de verdad y no una aproximación optimista.
    """
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * _EARTH_RADIUS_M * math.asin(math.sqrt(a))

CATEGORIES = [
    "TRANSPORT",
    "COMMERCE",
    "GREEN_SPACE",
    "HEALTH",
    "GASTRONOMY",
    "NIGHTLIFE",
    "EDUCATION",
]

# Mapeo categoría -> lista de (clave, valor) de OSM que cuentan para esa
# categoría. Basado en las claves estándar de OSM (amenity=*, shop=*,
# leisure=*, highway=bus_stop, railway=*) -- son las mismas que usa
# cualquier mapa de OSM (ej. la capa de POIs de openstreetmap.org).
# "pharmacy" quedó en HEALTH (no en COMMERCE, donde había quedado en el
# generador sintético viejo): amenity=pharmacy es la clasificación
# estándar de OSM para farmacias, y semánticamente es salud, no comercio.
CATEGORY_TAGS: dict[str, list[tuple[str, str]]] = {
    # highway=bus_stop NO está acá a propósito -- las paradas de colectivo
    # salen del dataset de BA Data (ver _load_bus_stops), no de Overpass.
    "TRANSPORT": [
        ("railway", "station"),
        ("railway", "subway_entrance"),
        ("amenity", "bicycle_rental"),
    ],
    "COMMERCE": [
        ("shop", "supermarket"),
        ("shop", "convenience"),
        ("shop", "mall"),
        ("shop", "department_store"),
        ("amenity", "marketplace"),
    ],
    "GREEN_SPACE": [
        ("leisure", "park"),
        ("leisure", "garden"),
        ("leisure", "nature_reserve"),
    ],
    "HEALTH": [
        ("amenity", "hospital"),
        ("amenity", "clinic"),
        ("amenity", "pharmacy"),
        ("amenity", "doctors"),
    ],
    "GASTRONOMY": [
        ("amenity", "restaurant"),
        ("amenity", "cafe"),
        ("amenity", "fast_food"),
    ],
    "NIGHTLIFE": [
        ("amenity", "bar"),
        ("amenity", "pub"),
        ("amenity", "nightclub"),
    ],
    "EDUCATION": [
        ("amenity", "school"),
        ("amenity", "university"),
        ("amenity", "college"),
        ("amenity", "kindergarten"),
    ],
}

# Nombre para mostrar cuando el elemento de OSM no tiene tag "name" (muy
# común en paradas de colectivo, farmacias chicas, plazas sin nombre
# propio, etc.) -- sin esto el frontend mostraría una tarjeta sin título.
_FALLBACK_LABEL: dict[tuple[str, str], str] = {
    ("railway", "station"): "Estación de tren/subte",
    ("railway", "subway_entrance"): "Entrada de subte",
    ("amenity", "bicycle_rental"): "Estación de bicicletas públicas",
    ("shop", "supermarket"): "Supermercado",
    ("shop", "convenience"): "Almacén / kiosco",
    ("shop", "mall"): "Shopping",
    ("shop", "department_store"): "Tienda departamental",
    ("amenity", "marketplace"): "Mercado",
    ("leisure", "park"): "Parque",
    ("leisure", "garden"): "Jardín / plaza",
    ("leisure", "nature_reserve"): "Reserva natural",
    ("amenity", "hospital"): "Hospital",
    ("amenity", "clinic"): "Clínica",
    ("amenity", "pharmacy"): "Farmacia",
    ("amenity", "doctors"): "Consultorio médico",
    ("amenity", "restaurant"): "Restaurante",
    ("amenity", "cafe"): "Café",
    ("amenity", "fast_food"): "Comida rápida",
    ("amenity", "bar"): "Bar",
    ("amenity", "pub"): "Pub",
    ("amenity", "nightclub"): "Boliche",
    ("amenity", "school"): "Escuela",
    ("amenity", "university"): "Universidad",
    ("amenity", "college"): "Instituto terciario",
    ("amenity", "kindergarten"): "Jardín de infantes",
}

# Cuántos POIs de una categoría, dentro de RADIUS_M, se consideran
# "cobertura plena" (score 100). Es un supuesto documentado, no un valor
# medido con datos históricas.
#
# ATENCIÓN -- recalibrado el 13/08/2026 (Ronda 5), PROVISORIO: la primera
# versión de estos números se puso a ojo, ANTES de tener ni un solo dato
# real de Overpass, y quedó demasiado baja -- Pili probó una dirección real
# (zona densa de CABA) y estos fueron los conteos reales que devolvió
# Overpass en ~800m: TRANSPORT=111, COMMERCE=25, GREEN_SPACE=8, HEALTH=5,
# GASTRONOMY=53, NIGHTLIFE=6, EDUCATION=34 -- muy por encima de los
# umbrales viejos (10, 12, 3, 5, 10, 6, 5), así que las 7 categorías
# quedaban en coverage=1.0 (score 100) sin importar la dirección, y el
# promedio ponderado de puros 100 da 100 sin importar los pesos (de ahí el
# bug reportado: "siempre da 100 aunque mueva los sliders"). Los números de
# acá abajo se subieron usando ESE dato real como referencia de "zona muy
# densa" (con margen, porque el filtro de distancia real que se agregó en
# esta misma ronda -- ver _haversine_m -- va a bajar un poco los conteos
# respecto de lo que Pili vio, que todavía no lo tenía).
#
# ATENCIÓN -- recalibrado de nuevo el 14/08/2026 (Ronda 8), con 3 puntos de
# datos reales ya juntados (zona densa/céntrica, Villa Lugano -- periférica
# y históricamente la de menos servicios de CABA -- y Núñez, zona verde):
#   TRANSPORT:   111 (densa) / 30 (Lugano) / 30 (Núñez)
#   COMMERCE:     25 (densa) / 6  (Lugano) / 29 (Núñez)
#   GREEN_SPACE:   8 (densa) / 9  (Lugano) / 29 (Núñez)
#   HEALTH:        5 (densa) / 6  (Lugano) / 8  (Núñez)
#   GASTRONOMY:   53 (densa) / 9  (Lugano) / 77 (Núñez)
#   NIGHTLIFE:     6 (densa) / 0  (Lugano) / 10 (Núñez)
#   EDUCATION:    34 (densa) / 30 (Lugano) / 33 (Núñez)
# Con estos 3 puntos, TRANSPORT, COMMERCE, GASTRONOMY y NIGHTLIFE ya
# diferencian razonablemente entre zonas (quedan sin tocar). GREEN_SPACE y
# EDUCATION, en cambio, saturaban en 100 en las 3 zonas -- incluso en
# Lugano, la zona con menos servicios de la ciudad -- así que el umbral
# viejo estaba puesto muy por debajo de la realidad, no diferenciaba nada.
# Se subieron GREEN_SPACE (6→15, apoyado en el máximo real de 29 visto en
# Núñez, con margen para que solo una zona genuinamente muy verde llegue a
# 100) y EDUCATION (20→34, el máximo real observado -- las 3 zonas dieron
# valores muy parecidos entre sí, 30-34, lo cual sugiere que la educación
# está razonablemente pareja en toda CABA; con este umbral esa cercanía
# real queda reflejada como un score de 88-100% en vez de 100% fijo).
# HEALTH quedó sin tocar a propósito (5/6/8 -- ya diferencia lo suficiente
# y no hay evidencia de que esté mal calibrado). Sigue siendo un supuesto
# documentado, no una medición estadística -- ajustar sin culpa si con más
# zonas de prueba el score deja de sentirse representativo.
#
# ATENCIÓN -- TRANSPORT recalibrado de nuevo el 15/08/2026 (cambio de
# fuente a BA Data para colectivos, ver _load_bus_stops): el dataset
# oficial es mucho más denso que lo que OSM devolvía solo para bus_stop
# (que ya dominaba el conteo viejo de TRANSPORT). Se midió la distancia
# real (misma fórmula Haversine que usa production) desde 300 paradas
# elegidas al azar en las 6962 del dataset hacia las demás, contando
# cuántas caen dentro de RADIUS_M de cada una -- son solo colectivos,
# TODAVÍA sin sumar subte/tren/bicicletas de Overpass encima: mínimo 13,
# percentil 25 = 63, mediana = 86, percentil 75 = 128, percentil 90 = 176,
# máximo 232. El umbral viejo (70) quedaba por debajo de la MEDIANA de
# solo colectivos -- con eso, la categoría iba a saturar en 100 en más de
# la mitad de CABA apenas se sumara subte/tren/bicicletas, reproduciendo
# el mismo bug que motivó la Ronda 5 ("siempre da 100"). Se sube a 140
# (entre p75 y p90 de colectivos solos, con margen para lo que sumen las
# otras 3 categorías de Overpass) -- sigue siendo un supuesto, no dato
# medido en producción: falta confirmar con un par de direcciones reales
# post-deploy que el score de TRANSPORT diferencia bien entre zonas.
_FULL_COVERAGE_COUNT: dict[str, int] = {
    "TRANSPORT": 140,
    "COMMERCE": 20,
    "GREEN_SPACE": 15,
    "HEALTH": 6,
    "GASTRONOMY": 35,
    "NIGHTLIFE": 8,
    "EDUCATION": 34,
}

_osmnx_configured = False


def _configure_osmnx() -> None:
    """Configura caché en disco + identificación de la app ante Overpass.

    Se ejecuta una sola vez (por proceso) -- no en cada request, para no
    pisar la config en medio de una consulta concurrente.
    """
    global _osmnx_configured
    if _osmnx_configured:
        return
    ox.settings.use_cache = True
    # NOTA (Render / deploy): esto cachea en el disco local del proceso. En
    # local persiste entre corridas (buenísimo mientras se prueba, evita
    # pegarle a Overpass de nuevo por la misma dirección). En Render, si el
    # disco no es persistente, el caché se vacía en cada redeploy/reinicio
    # -- no rompe nada (simplemente esa primera consulta después del
    # restart no tiene caché), pero no hay que asumir que el caché
    # "sobrevive" ahí. Si más adelante hace falta que persista de verdad
    # (por volumen de uso real, no solo demo de tesis), el siguiente paso
    # sería moverlo a un Persistent Disk de Render o a la base Postgres.
    ox.settings.cache_folder = os.environ.get("OSMNX_CACHE_DIR", ".osmnx_cache")
    # Subido de 25s a 45s (13/08/2026, Ronda 6) -- confirmado en la práctica
    # por Pili: una consulta fría en una zona densa de CABA (7 categorías
    # combinadas en un solo bbox de 1.6km x 1.6km) puede tardar más de 25s
    # en el servidor público de Overpass, y esta variable define DOS cosas
    # a la vez (ver `_make_overpass_settings` en el código de OSMnx): el
    # timeout embebido en la query Overpass QL (`[timeout:N]`, cuánto
    # tiempo el SERVIDOR sigue procesando antes de rendirse) y el timeout
    # HTTP del lado cliente (`requests`, cuánto esperamos la respuesta).
    # MlServiceClient (lado Java) tiene su propio read-timeout, subido en
    # conjunto para dar margen a esto (ver MlServiceClient.java).
    ox.settings.requests_timeout = 45
    # Desactivado (16/08/2026, Ronda 15) -- antes en True. Este flag hace que
    # OSMnx, ANTES de cada consulta real, le pegue a `/api/status` del mismo
    # servidor para leer su rate-limit y calcular una pausa de cortesía
    # (`_get_overpass_pause`) -- un request de red adicional que comparte el
    # mismo `requests_timeout` de arriba. Con el mirror de respaldo agregado
    # en esta misma ronda (ver _OVERPASS_ENDPOINTS más abajo), cada intento
    # podía tardar hasta 90s en el peor caso (45s del chequeo + 45s de la
    # consulta real) en vez de 45s -- con los 2 endpoints, el peor caso
    # total llegaba a ~180s, muy por encima de los 100s que tolera
    # MlServiceClient.java (ver Ronda 6) y del propio proxy de Render, sin
    # que ml-service llegue a loguear ningún error (la consulta no falla,
    # simplemente tarda tanto que corta otro eslabón de la cadena antes).
    # Justamente ese chequeo de `/api/status` fue el que se cayó con
    # `ConnectionRefusedError` en el incidente real que motivó el mirror,
    # así que sacarlo de encima también elimina ese punto de falla
    # puntual. Es una cortesía pensada para uso masivo (evitar saturar el
    # servidor público bajo carga alta) -- no aplica al volumen de una
    # demo de tesis, así que el trade-off es razonable: el timeout embebido
    # en la propia consulta Overpass QL (`[timeout:45]`, ver comentario de
    # requests_timeout arriba) sigue siendo el límite real de cada intento.
    ox.settings.overpass_rate_limit = False
    ox.settings.http_user_agent = (
        "Nidio-TFI-IngenieriaInformatica/1.0 (+https://github.com/pilisuriano/NidioWebApp)"
    )
    ox.settings.http_referer = ox.settings.http_user_agent
    _osmnx_configured = True


def _all_osm_tags() -> dict[str, list[str]]:
    """Une los tags de las 7 categorías en un solo dict para pedirlos todos
    en UNA sola consulta a Overpass (7 consultas separadas por cálculo
    multiplicaría por 7 el consumo de la cuota diaria, sin necesidad)."""
    tags: dict[str, set[str]] = defaultdict(set)
    for entries in CATEGORY_TAGS.values():
        for key, value in entries:
            tags[key].add(value)
    return {key: sorted(values) for key, values in tags.items()}


# Instancias públicas de Overpass a probar, en orden. Overpass no es un
# servicio único: hay varias instancias independientes que corren el mismo
# software sobre una copia sincronizada de los mismos datos de OpenStreetMap
# (mismo protocolo de consulta, mismos resultados) -- lo único que cambia es
# quién las opera, así que su disponibilidad es independiente entre sí.
#
# Agregado (16/08/2026, Ronda 15) tras una caída real del endpoint principal
# en producción, confirmada con el log de Render: `overpass-api.de` rechazó
# la conexión (`ConnectionRefusedError`) justo cuando el chequeo interno de
# rate-limit de OSMnx le pegaba a `/api/status`, degradando en silencio las
# 6 categorías que dependen de Overpass a 0 POIs (Transporte no se vio
# afectado porque los colectivos salen de un dataset local, ver
# _load_bus_stops). En ese momento se decidió con Pili documentar el riesgo
# nada más (ver Sección 6.7.8 del informe) -- pero ante una segunda caída
# real, se agregó esta mitigación: en vez de reintentar dos veces contra el
# MISMO servidor caído (lo que hacía antes esta función), ahora cada
# reintento prueba un servidor DISTINTO. `overpass.kumi.systems` es un
# mirror público conocido, operado independientemente de `overpass-api.de`.
_OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]


def _fetch_osm_features(lat: float, lon: float):
    """Devuelve el GeoDataFrame de OSMnx con todo lo encontrado en el radio,
    o None si no hay nada o la consulta falló contra TODOS los endpoints de
    _OVERPASS_ENDPOINTS (cada uno caído, timeout, rate limit agotado,
    etc.) -- en cualquiera de esos casos el resultado real es "no se pudo
    determinar", nunca se inventa un valor."""
    _configure_osmnx()
    tags = _all_osm_tags()
    for attempt, endpoint in enumerate(_OVERPASS_ENDPOINTS, start=1):
        # Se pisa el endpoint en las settings globales de OSMnx antes de
        # cada intento -- es la forma que expone la librería de elegir a
        # qué servidor pegarle (no hay un parámetro por-consulta).
        ox.settings.overpass_endpoint = endpoint
        try:
            return ox.features_from_point((lat, lon), tags=tags, dist=RADIUS_M)
        except ox._errors.InsufficientResponseError:
            # Overpass respondió pero no hay NINGÚN elemento de NINGÚN tag
            # en el radio -- pasa en zonas poco densas. No es un error: es
            # un resultado real (las 7 categorías quedan en 0). Es la MISMA
            # base de datos de OSM detrás de cualquier endpoint, así que
            # probar otro servidor no cambiaría este resultado -- no tiene
            # sentido intentar el mirror para esto.
            return None
        except Exception as exc:
            if attempt < len(_OVERPASS_ENDPOINTS):
                logger.warning(
                    "Endpoint de Overpass %s falló para lat=%s lon=%s (%s) -- probando el siguiente (%s)",
                    endpoint, lat, lon, exc, _OVERPASS_ENDPOINTS[attempt],
                )
                continue
            logger.exception(
                "Los %d endpoints de Overpass configurados fallaron para lat=%s lon=%s -- se degrada a 0 POIs",
                len(_OVERPASS_ENDPOINTS), lat, lon,
            )
            return None


_BUS_STOPS_CACHE: list[dict] | None = None


def _bus_stops_csv_path() -> str:
    return os.path.join(os.path.dirname(__file__), "..", "..", "data", "paradas-de-colectivo.csv")


def _line_sort_key(line: str) -> tuple[int, str]:
    """Ordena las líneas de colectivo numéricamente cuando se puede (la
    gran mayoría son solo un número, ej. "60", "152") y por texto si no
    (hay algunas con sufijo de ramal, ej. "168A") -- así "9" no queda
    ordenada después de "60" solo por comparación de string."""
    digits = "".join(ch for ch in line if ch.isdigit())
    return (int(digits) if digits else 0, line)


def _load_bus_stops() -> list[dict]:
    """Carga (una sola vez por proceso) el dataset oficial de paradas de
    colectivo de BA Data (Gobierno de la Ciudad de Buenos Aires,
    data.buenosaires.gob.ar/dataset/colectivos-paradas, CC-BY 2.5 AR,
    actualizado junio 2026) -- reemplaza a Overpass/OSM para esta
    categoría puntual.

    Motivo (15/08/2026, a pedido de Pili): en OSM, highway=bus_stop casi
    nunca trae con qué línea corresponde esa parada, así que el frontend
    terminaba mostrando la misma etiqueta genérica ("Parada de colectivo")
    para todas las paradas cercanas -- no había forma de distinguir una de
    otra. Este dataset oficial SIEMPRE trae las líneas (hasta 6 por
    parada, columnas L1-L6) y es CABA-only (columna COMUNA 1-15, sin nada
    de conurbano).

    Se bundlea como CSV estático versionado en el repo (ver
    ml-service/data/) en vez de pegarle a la API de BA Data en cada
    consulta -- mismo criterio que ya se usa para los datasets de
    valuación: nada de scraping ni de llamada externa extra en el camino
    caliente de cada cálculo, y no depende de que ese servicio esté arriba
    justo en el momento en que alguien pide su Life Score. Efecto
    secundario bueno: al no ser una llamada de red, no compite con el
    tiempo de respuesta de Overpass (ver requests_timeout más abajo).

    Se degrada a lista vacía (TRANSPORT queda sin colectivos, pero sigue
    funcionando con subte/tren/bicicletas de Overpass) si el archivo no
    está -- por ejemplo, si alguien corre este servicio sin haber bajado
    el dataset todavía. Nunca inventa una parada.
    """
    global _BUS_STOPS_CACHE
    if _BUS_STOPS_CACHE is not None:
        return _BUS_STOPS_CACHE
    stops: list[dict] = []
    path = _bus_stops_csv_path()
    try:
        with open(path, encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                try:
                    # BA Data usa coma decimal (formato AR) -- coord_X es
                    # longitud, coord_Y es latitud (confirmado con datos
                    # reales: valores ~-58 y ~-34 respectivamente).
                    lon = float(row["coord_X"].replace(",", "."))
                    lat = float(row["coord_Y"].replace(",", "."))
                except (KeyError, ValueError):
                    continue
                lines = sorted(
                    {row.get(f"L{i}", "").strip() for i in range(1, 7)} - {""},
                    key=_line_sort_key,
                )
                stops.append({"lat": lat, "lon": lon, "lines": lines})
    except (OSError, csv.Error) as exc:
        logger.warning(
            "No se pudo cargar el dataset de paradas de colectivo (%s): %s -- "
            "TRANSPORT queda sin datos de colectivos",
            path, exc,
        )
        stops = []
    _BUS_STOPS_CACHE = stops
    return stops


def _bus_stop_label(lines: list[str]) -> str:
    if not lines:
        return "Parada de colectivo"
    word = "líneas" if len(lines) > 1 else "línea"
    return f"Parada de colectivo: {word} " + ", ".join(lines)


def _nearby_bus_stops(lat: float, lon: float) -> list[dict]:
    """Mismo formato que las entradas que arma _category_pois desde
    Overpass (con "_distance_m" incluido, para que se puedan mezclar y
    ordenar juntas antes del corte final)."""
    pois = []
    for stop in _load_bus_stops():
        distance_m = _haversine_m(lat, lon, stop["lat"], stop["lon"])
        if distance_m > RADIUS_M:
            continue
        pois.append({
            "name": _bus_stop_label(stop["lines"]),
            "lat": round(stop["lat"], 6),
            "lon": round(stop["lon"], 6),
            "_distance_m": distance_m,
        })
    return pois


def _category_pois(gdf, category: str, lat: float, lon: float, extra: list[dict] | None = None) -> list[dict]:
    """`extra` son POIs ya armados (con "_distance_m" incluido) que no
    vienen de Overpass -- hoy solo lo usa TRANSPORT, para sumar las
    paradas de colectivo de BA Data al resultado final (ver
    compute_life_score). Se mezclan ACÁ, antes del sort final, para que
    "los 4 más cercanos" (ver LifeScore.jsx) salgan bien sin importar de
    qué fuente vino cada POI."""
    pois = []
    if gdf is not None and not gdf.empty:
        seen_idx = set()
        for key, value in CATEGORY_TAGS[category]:
            if key not in gdf.columns:
                continue
            matches = gdf[gdf[key] == value]
            for idx, row in matches.iterrows():
                # Un mismo elemento puede calzar en dos tags de la MISMA
                # categoría (ej. algo con amenity=hospital y otro tag de
                # salud a la vez) -- se cuenta una sola vez.
                if idx in seen_idx:
                    continue
                seen_idx.add(idx)
                try:
                    centroid = row.geometry.centroid
                except (AttributeError, ValueError, TypeError) as exc:
                    logger.debug("POI con geometria invalida, se descarta: %s", exc)
                    continue
                distance_m = _haversine_m(lat, lon, centroid.y, centroid.x)
                # OSMnx ya trajo todo dentro del CUADRADO de RADIUS_M (ver
                # _haversine_m) -- acá se recorta al CÍRCULO real de
                # RADIUS_M, para que "poiCount" y "~800 m" en el frontend
                # sean ciertos y no una aproximación optimista de hasta
                # ~1131 m en las puntas.
                if distance_m > RADIUS_M:
                    continue
                name = row.get("name")
                if not isinstance(name, str) or not name.strip():
                    name = _FALLBACK_LABEL.get((key, value), value)
                pois.append({
                    "name": name,
                    "lat": round(centroid.y, 6),
                    "lon": round(centroid.x, 6),
                    "_distance_m": distance_m,
                })
    if extra:
        pois.extend(extra)
    # Los más cercanos primero -- el frontend solo muestra los primeros 4
    # de cada categoría (ver LifeScore.jsx), tiene que priorizar los útiles.
    pois.sort(key=lambda p: p["_distance_m"])
    for poi in pois:
        del poi["_distance_m"]
    return pois


def compute_life_score(lat: float, lon: float, weights: dict[str, int]) -> dict:
    """Devuelve {"totalScore": float, "categories": [...]} según el contrato REST
    (sin cambios respecto a la implementación sintética anterior -- el
    backend Java no necesitó ningún cambio para este reemplazo)."""
    gdf = _fetch_osm_features(lat, lon)

    categories = []
    weighted_sum = 0.0
    total_weight = 0

    for category in CATEGORIES:
        extra = _nearby_bus_stops(lat, lon) if category == "TRANSPORT" else None
        pois = _category_pois(gdf, category, lat, lon, extra=extra)
        count = len(pois)
        full_coverage = _FULL_COVERAGE_COUNT[category]
        coverage = min(1.0, count / full_coverage)
        category_score = round(coverage * 100)

        weight = int(weights.get(category, 0))
        weighted_sum += weight * coverage
        total_weight += weight

        categories.append({"category": category, "poiCount": count, "pois": pois, "score": category_score})

    total_score = round(100.0 * weighted_sum / total_weight, 1) if total_weight > 0 else 0.0
    return {"totalScore": total_score, "categories": categories}
