"""Cálculo del Life Score con datasets abiertos locales (BA Data).

Cada categoría se calcula con archivos que viajan dentro del repositorio
(`ml-service/data/`), sin ninguna llamada de red en el camino de la consulta:

- `data/paradas-de-colectivo.csv`  -> TRANSPORT (colectivos)
- `data/poi/pois.csv`              -> el resto de los puntos (subte, tren, salud,
                                      educación, gastronomía, vida nocturna, comercio)
- `data/poi/green_spaces.geojson`  -> GREEN_SPACE (polígonos)
- `data/poi/thresholds.json`       -> cantidad de POIs que da 100 puntos por categoría

`pois.csv`, `green_spaces.geojson` y `thresholds.json` los genera
`scripts/build_poi_dataset.py` y `scripts/calibrate_life_score.py` a partir de los
datasets descargados de BA Data (licencia CC-BY 2.5 AR, ver `data/README.md`).

Reemplaza la versión anterior, que consultaba OpenStreetMap vía OSMnx/Overpass
en cada cálculo. Esa dependencia tardaba segundos por consulta, no tiene SLA y
falló en producción. Si una categoría no tiene ningún dato cercano, queda en 0
(poiCount=0, pois=[]); nunca se completa con datos inventados.
"""

from __future__ import annotations

import csv
import json
import logging
import math
import os
from dataclasses import dataclass, field
from functools import lru_cache

import numpy as np
import shapely
from shapely.geometry import Point, box, shape
from shapely.strtree import STRtree

logger = logging.getLogger(__name__)

# Radio en metros, un círculo real (no un cuadrado). Es el mismo que muestra el
# frontend ("N POIs en ~800 m").
RADIUS_M = 800

_EARTH_RADIUS_M = 6371000.0
_METERS_PER_DEG_LAT = 111_320.0

CATEGORIES = [
    "TRANSPORT",
    "COMMERCE",
    "GREEN_SPACE",
    "HEALTH",
    "GASTRONOMY",
    "NIGHTLIFE",
    "EDUCATION",
]

_BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")


def _data_dir() -> str:
    """Carpeta de datos. `LIFE_SCORE_DATA_DIR` permite apuntar a otra (tests)."""
    return os.environ.get("LIFE_SCORE_DATA_DIR", _BASE_DIR)


def _haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Distancia Haversine entre dos puntos, en metros. Misma fórmula que usa
    `GeoUtils.java` para "Mis lugares": una sola medida de distancia en todo el
    producto."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * _EARTH_RADIUS_M * math.asin(math.sqrt(a))


def _haversine_m_array(lat0: float, lon0: float, lats: np.ndarray, lons: np.ndarray) -> np.ndarray:
    """Haversine vectorizado de un punto a muchos."""
    phi0 = math.radians(lat0)
    phis = np.radians(lats)
    dphi = phis - phi0
    dlambda = np.radians(lons - lon0)
    a = np.sin(dphi / 2) ** 2 + math.cos(phi0) * np.cos(phis) * np.sin(dlambda / 2) ** 2
    return 2 * _EARTH_RADIUS_M * np.arcsin(np.sqrt(a))


# ---------------------------------------------------------------------------
# Carga de datos
# ---------------------------------------------------------------------------


@dataclass
class _PointSet:
    lats: np.ndarray
    lons: np.ndarray
    names: list[str]


@dataclass
class _GreenSpaces:
    geoms: list = field(default_factory=list)
    names: list[str] = field(default_factory=list)
    tree: STRtree | None = None


@dataclass
class _Index:
    points: dict[str, _PointSet]
    green: _GreenSpaces
    thresholds: dict[str, int]


def _line_sort_key(line: str) -> tuple[int, str]:
    """Ordena líneas de colectivo numéricamente cuando se puede ("9" antes que
    "60") y por texto si no ("168A")."""
    digits = "".join(ch for ch in line if ch.isdigit())
    return (int(digits) if digits else 0, line)


def _bus_stop_label(lines: list[str]) -> str:
    if not lines:
        return "Parada de colectivo"
    word = "líneas" if len(lines) > 1 else "línea"
    return f"Parada de colectivo: {word} " + ", ".join(lines)


def _load_bus_stops(path: str) -> list[tuple[float, float, str]]:
    """Paradas de colectivo de BA Data (columnas coord_X/coord_Y con coma
    decimal y L1..L6 con las líneas). Devuelve (lat, lon, nombre)."""
    stops: list[tuple[float, float, str]] = []
    try:
        with open(path, encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                try:
                    lon = float(row["coord_X"].replace(",", "."))
                    lat = float(row["coord_Y"].replace(",", "."))
                except (KeyError, ValueError):
                    continue
                lines = sorted(
                    {row.get(f"L{i}", "").strip() for i in range(1, 7)} - {""},
                    key=_line_sort_key,
                )
                stops.append((lat, lon, _bus_stop_label(lines)))
    except (OSError, csv.Error) as exc:
        logger.warning("No se pudo cargar las paradas de colectivo (%s): %s", path, exc)
    return stops


def _load_pois_csv(path: str) -> dict[str, list[tuple[float, float, str]]]:
    """`pois.csv`: category, subtype, name, lat, lon, source."""
    by_category: dict[str, list[tuple[float, float, str]]] = {c: [] for c in CATEGORIES}
    with open(path, encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            category = row["category"]
            if category not in by_category:
                continue
            by_category[category].append((float(row["lat"]), float(row["lon"]), row["name"]))
    return by_category


def _load_green_spaces(path: str) -> _GreenSpaces:
    green = _GreenSpaces()
    if not os.path.exists(path):
        return green
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    for feature in data.get("features", []):
        geom = shape(feature["geometry"])
        if geom.is_empty:
            continue
        green.geoms.append(geom)
        green.names.append((feature.get("properties") or {}).get("name") or "Espacio verde")
    if green.geoms:
        green.tree = STRtree(green.geoms)
    return green


def _load_thresholds(path: str) -> dict[str, int]:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    thresholds = {c: int(data["full_coverage"][c]) for c in CATEGORIES}
    if any(v < 1 for v in thresholds.values()):
        raise ValueError(f"Umbrales inválidos en {path}: {thresholds}")
    return thresholds


@lru_cache(maxsize=4)
def _load_index(data_dir: str, with_thresholds: bool = True) -> _Index:
    """Carga los datasets una sola vez por proceso (y por carpeta de datos).
    `with_thresholds=False` lo usa el script de calibración, que es quien
    genera `thresholds.json` y por lo tanto todavía no lo tiene."""
    poi_dir = os.path.join(data_dir, "poi")
    by_category = _load_pois_csv(os.path.join(poi_dir, "pois.csv"))
    by_category["TRANSPORT"].extend(_load_bus_stops(os.path.join(data_dir, "paradas-de-colectivo.csv")))

    points: dict[str, _PointSet] = {}
    for category, rows in by_category.items():
        points[category] = _PointSet(
            lats=np.array([r[0] for r in rows], dtype=float),
            lons=np.array([r[1] for r in rows], dtype=float),
            names=[r[2] for r in rows],
        )
    green = _load_green_spaces(os.path.join(poi_dir, "green_spaces.geojson"))
    thresholds = _load_thresholds(os.path.join(poi_dir, "thresholds.json")) if with_thresholds else {}
    logger.info(
        "Life Score: datasets cargados (%s)",
        ", ".join(f"{c}={len(points[c].names)}" for c in CATEGORIES if c != "GREEN_SPACE")
        + f", GREEN_SPACE={len(green.geoms)}",
    )
    return _Index(points=points, green=green, thresholds=thresholds)


# ---------------------------------------------------------------------------
# Consulta
# ---------------------------------------------------------------------------


def _nearby_points(ps: _PointSet, lat: float, lon: float) -> list[tuple[float, str, float, float]]:
    """(distancia_m, nombre, lat, lon) de los puntos dentro del círculo de
    RADIUS_M. Primero un recorte por caja (barato) y recién después Haversine."""
    if not ps.names:
        return []
    dlat = RADIUS_M / _METERS_PER_DEG_LAT
    dlon = dlat / max(math.cos(math.radians(lat)), 1e-6)
    in_box = (np.abs(ps.lats - lat) <= dlat) & (np.abs(ps.lons - lon) <= dlon)
    idx = np.nonzero(in_box)[0]
    if idx.size == 0:
        return []
    dist = _haversine_m_array(lat, lon, ps.lats[idx], ps.lons[idx])
    result = []
    for i, d in zip(idx, dist):
        if d <= RADIUS_M:
            result.append((float(d), ps.names[i], float(ps.lats[i]), float(ps.lons[i])))
    return result


def _nearby_green_spaces(green: _GreenSpaces, lat: float, lon: float) -> list[tuple[float, str, float, float]]:
    """Espacios verdes (polígonos) con alguna parte dentro de RADIUS_M. La
    distancia es al borde del polígono (0 si el punto está adentro), medida en
    metros sobre una proyección local; el pin que se muestra es un punto
    representativo del espacio."""
    if green.tree is None:
        return []
    dlat = RADIUS_M / _METERS_PER_DEG_LAT
    kx = _METERS_PER_DEG_LAT * math.cos(math.radians(lat))
    dlon = RADIUS_M / kx
    candidates = green.tree.query(box(lon - dlon, lat - dlat, lon + dlon, lat + dlat))
    origin = Point(0.0, 0.0)

    def to_local(coords: np.ndarray) -> np.ndarray:
        return np.column_stack(((coords[:, 0] - lon) * kx, (coords[:, 1] - lat) * _METERS_PER_DEG_LAT))

    result = []
    for i in candidates:
        geom = green.geoms[int(i)]
        distance_m = origin.distance(shapely.transform(geom, to_local))
        if distance_m > RADIUS_M:
            continue
        pin = geom.representative_point()
        result.append((float(distance_m), green.names[int(i)], float(pin.y), float(pin.x)))
    return result


def _category_pois(index: _Index, category: str, lat: float, lon: float) -> list[dict]:
    if category == "GREEN_SPACE":
        found = _nearby_green_spaces(index.green, lat, lon)
    else:
        found = _nearby_points(index.points[category], lat, lon)
    # Los más cercanos primero: el frontend muestra solo los primeros 4 de cada
    # categoría (ver LifeScore.jsx).
    found.sort(key=lambda item: item[0])
    return [{"name": name, "lat": round(plat, 6), "lon": round(plon, 6)} for _, name, plat, plon in found]


def compute_life_score(lat: float, lon: float, weights: dict[str, int]) -> dict:
    """Devuelve {"totalScore": float, "categories": [...]} según el contrato REST
    (sin cambios respecto de la versión con Overpass: el backend Java y el
    frontend no necesitaron cambios de contrato)."""
    index = _load_index(os.path.abspath(_data_dir()))

    categories = []
    weighted_sum = 0.0
    total_weight = 0

    for category in CATEGORIES:
        pois = _category_pois(index, category, lat, lon)
        count = len(pois)
        coverage = min(1.0, count / index.thresholds[category])
        category_score = round(coverage * 100)

        weight = int(weights.get(category, 0))
        weighted_sum += weight * coverage
        total_weight += weight

        categories.append({"category": category, "poiCount": count, "pois": pois, "score": category_score})

    total_score = round(100.0 * weighted_sum / total_weight, 1) if total_weight > 0 else 0.0
    return {"totalScore": total_score, "categories": categories}
