"""Ruido ambiental de un punto (día y noche) a partir del Mapa Estratégico de Ruido
de BA Data (licencia CC-BY 2.5 AR, ver `data/README.md`).

Las capas `data/noise/noise_day.geojson` y `noise_night.geojson` son franjas de
5 dBA (`lo`-`hi`) alrededor de las calles, ya limpiadas y simplificadas por
`scripts/build_noise_layers.py`. `data/noise/thresholds.json` define los cortes de
la escala relativa a CABA (Tranquilo / Moderado / Ruidoso / Muy ruidoso): la
interfaz muestra esa escala y no los decibeles, que la gente no interpreta.

Regla de asignación (la misma que se valida en el informe):

1. Si el punto cae dentro de una o más franjas se usa la más ruidosa.
2. Si no cae dentro de ninguna, se usa la franja más cercana a 50 m o menos
   (la dirección geocodificada puede quedar unos metros fuera de la franja de la calle).
3. Si no hay ninguna, no hay dato (`None`). Nunca se inventa un valor.

Las capas se cargan perezosamente, una por vez, y se reutilizan durante la vida
del proceso (Render Free da 512 MB de RAM).
"""

from __future__ import annotations

import json
import logging
import math
import os
from dataclasses import dataclass
from functools import lru_cache

import shapely
from shapely.geometry import Point, box, shape
from shapely.strtree import STRtree

logger = logging.getLogger(__name__)

# Distancia máxima a una franja para asignarle su nivel a un punto que quedó afuera.
MAX_DISTANCE_M = 50.0

_METERS_PER_DEG_LAT = 111_320.0
_PERIODS = ("day", "night")
_FILES = {"day": "noise_day.geojson", "night": "noise_night.geojson"}
_THRESHOLD_KEYS = {"day": "dia", "night": "noche"}

_BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "noise")


def _data_dir() -> str:
    """Carpeta de datos. `NOISE_DATA_DIR` permite apuntar a otra (tests)."""
    return os.environ.get("NOISE_DATA_DIR", _BASE_DIR)


@dataclass
class _Layer:
    parts: list  # geometrías simples (Polygon), en lon/lat
    lo: list[int]
    hi: list[int]
    src: list[str]
    tree: STRtree | None


@dataclass
class _Scale:
    labels: list[str]
    cuts: list[int]

    def level(self, lo_db: float) -> int:
        """Nivel 1..4: 1 = más tranquilo. Un corte es el borde inferior de la
        franja que ya pertenece a la clase siguiente."""
        return 1 + sum(1 for c in self.cuts if lo_db >= c)


@lru_cache(maxsize=4)
def _load_scales(data_dir: str) -> dict[str, _Scale]:
    with open(os.path.join(data_dir, "thresholds.json"), encoding="utf-8") as f:
        data = json.load(f)
    labels = list(data["etiquetas"])
    scales = {}
    for period, key in _THRESHOLD_KEYS.items():
        cuts = [int(c) for c in data[key]["cortes_db"]]
        if len(cuts) != len(labels) - 1:
            raise ValueError(f"Cortes inválidos para {period} en thresholds.json: {cuts}")
        scales[period] = _Scale(labels=labels, cuts=cuts)
    return scales


@lru_cache(maxsize=4)
def _load_layer(data_dir: str, period: str) -> _Layer:
    path = os.path.join(data_dir, _FILES[period])
    parts, lo, hi, src = [], [], [], []
    if not os.path.exists(path):
        logger.warning("No existe la capa de ruido %s: el ruido quedará 'sin dato'", path)
        return _Layer([], [], [], [], None)
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    for feature in data.get("features", []):
        props = feature.get("properties") or {}
        geom = shape(feature["geometry"])
        if geom.is_empty:
            continue
        # Se separa cada MultiPolygon en sus polígonos: el índice espacial queda
        # mucho más selectivo y la consulta toca pocas geometrías.
        for part in getattr(geom, "geoms", [geom]):
            if part.is_empty:
                continue
            parts.append(part)
            lo.append(int(props["lo"]))
            hi.append(int(props["hi"]))
            src.append(str(props.get("src", "2025")))
    del data
    tree = STRtree(parts) if parts else None
    if tree is not None:
        shapely.prepare(parts)
    return _Layer(parts, lo, hi, src, tree)


def _search_box(lat: float, lon: float, meters: float):
    dlat = meters / _METERS_PER_DEG_LAT
    dlon = meters / (_METERS_PER_DEG_LAT * max(math.cos(math.radians(lat)), 1e-6))
    return box(lon - dlon, lat - dlat, lon + dlon, lat + dlat)


def _distance_m(geom, lat: float, lon: float) -> float:
    """Distancia del punto a la geometría, en metros, con proyección local plana
    (error despreciable a 50 m)."""
    kx = _METERS_PER_DEG_LAT * math.cos(math.radians(lat))
    ky = _METERS_PER_DEG_LAT
    local = shapely.transform(geom, lambda c: (c - [lon, lat]) * [kx, ky])
    return float(local.distance(Point(0.0, 0.0)))


def _lookup(layer: _Layer, scale: _Scale, lat: float, lon: float) -> dict | None:
    if layer.tree is None:
        return None
    point = Point(lon, lat)
    inside = [int(i) for i in layer.tree.query(point, predicate="intersects")]
    distance = 0.0
    if inside:
        best = max(inside, key=lambda i: (layer.hi[i], layer.src[i]))
    else:
        candidates = [int(i) for i in layer.tree.query(_search_box(lat, lon, MAX_DISTANCE_M))]
        scored = [(_distance_m(layer.parts[i], lat, lon), i) for i in candidates]
        scored = [(d, i) for d, i in scored if d <= MAX_DISTANCE_M]
        if not scored:
            return None
        # Entre franjas a distancia similar manda la más cercana; si empatan, la más ruidosa.
        distance, best = min(scored, key=lambda s: (round(s[0], 1), -layer.hi[s[1]]))
    level = scale.level(layer.lo[best])
    return {
        "dbLow": layer.lo[best],
        "dbHigh": layer.hi[best],
        "level": level,
        "label": scale.labels[level - 1],
        "source": layer.src[best],
        "distanceM": round(distance, 1),
    }


def compute_noise(lat: float, lon: float, data_dir: str | None = None) -> dict:
    """Ruido diurno y nocturno de un punto: `{"day": {...} | None, "night": {...} | None}`."""
    directory = data_dir or _data_dir()
    scales = _load_scales(directory)
    return {
        period: _lookup(_load_layer(directory, period), scales[period], lat, lon)
        for period in _PERIODS
    }
