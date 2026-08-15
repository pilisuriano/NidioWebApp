"""Cálculo del Life Score.

POIs REALES vía OSMnx (que a su vez consulta Overpass API, la API pública
de OpenStreetMap) alrededor del punto consultado, dentro de un radio fijo
(RADIUS_M). Reemplaza la implementación sintética que hubo antes (POIs con
nombres inventados y densidad simulada por distancia al Obelisco) -- ya no
hay ningún dato ficticio: si Overpass no devuelve resultados para una
categoría, o la consulta falla, esa categoría queda en 0 (poiCount=0,
pois=[]), nunca se rellena con datos inventados.

Por qué OSMnx y no pegarle a Overpass "a mano": OSMnx arma la query
Overpass QL, maneja reintentos/backoff según el header de rate-limit del
servidor, y sobre todo cachea cada respuesta en disco (ver
_configure_osmnx) -- necesario porque las instancias públicas de Overpass
tienen un tope documentado de ~10.000 requests/día por IP y piden
explícitamente no repetir la misma consulta más de lo necesario.
"""

from __future__ import annotations

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
    "TRANSPORT": [
        ("highway", "bus_stop"),
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
    ("highway", "bus_stop"): "Parada de colectivo",
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
_FULL_COVERAGE_COUNT: dict[str, int] = {
    "TRANSPORT": 70,
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
    # Respeta el backoff que pide el propio servidor Overpass ante uso
    # intenso, en vez de reintentar a lo loco -- es justamente lo que pide
    # la política de uso de las instancias públicas.
    ox.settings.overpass_rate_limit = True
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


# Cuántas veces se intenta la consulta a Overpass antes de rendirse.
# Agregado (13/08/2026, Ronda 6) porque Pili tuvo un caso real: una
# dirección nueva (caché frío) tardó, falló (probablemente timeout contra
# el servidor público, ver requests_timeout arriba) y al reintentar
# manualmente (volver a apretar "Calcular") anduvo bien -- un solo
# reintento automático evita que el usuario tenga que notar el error y
# volver a intentar a mano.
_MAX_FETCH_ATTEMPTS = 2


def _fetch_osm_features(lat: float, lon: float):
    """Devuelve el GeoDataFrame de OSMnx con todo lo encontrado en el radio,
    o None si no hay nada o la consulta falló (Overpass caído, timeout,
    rate limit agotado, etc., incluso después de reintentar) -- en
    cualquiera de esos casos el resultado real es "no se pudo determinar",
    nunca se inventa un valor."""
    _configure_osmnx()
    tags = _all_osm_tags()
    for attempt in range(1, _MAX_FETCH_ATTEMPTS + 1):
        try:
            return ox.features_from_point((lat, lon), tags=tags, dist=RADIUS_M)
        except ox._errors.InsufficientResponseError:
            # Overpass respondió pero no hay NINGÚN elemento de NINGÚN tag
            # en el radio -- pasa en zonas poco densas. No es un error: es
            # un resultado real (las 7 categorías quedan en 0). Reintentar
            # no cambiaría nada, así que no se cuenta como intento fallido.
            return None
        except Exception as exc:
            if attempt < _MAX_FETCH_ATTEMPTS:
                logger.warning(
                    "Intento %d/%d de Overpass/OSMnx falló para lat=%s lon=%s (%s) -- reintentando",
                    attempt, _MAX_FETCH_ATTEMPTS, lat, lon, exc,
                )
                continue
            logger.exception(
                "Overpass/OSMnx falló %d/%d veces para lat=%s lon=%s -- se degrada a 0 POIs",
                attempt, _MAX_FETCH_ATTEMPTS, lat, lon,
            )
            return None


def _category_pois(gdf, category: str, lat: float, lon: float) -> list[dict]:
    if gdf is None or gdf.empty:
        return []
    pois = []
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
            # _haversine_m) -- acá se recorta al CÍRCULO real de RADIUS_M,
            # para que "poiCount" y "~800 m" en el frontend sean ciertos y
            # no una aproximación optimista de hasta ~1131 m en las puntas.
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
        pois = _category_pois(gdf, category, lat, lon)
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
