"""Tests del Life Score con datasets locales, sobre una carpeta de datos chica
armada en cada test (fixtures de prueba, NO son datos del producto).

Verifican la lógica: círculo real de 800 m, orden por cercanía, polígonos de
espacios verdes, ponderación y que el cálculo no use la red.
"""

import csv
import json
import math
import socket

import pytest

from src.geo import life_score
from src.geo.life_score import CATEGORIES, RADIUS_M, compute_life_score

_LAT0, _LON0 = -34.6037, -58.3816
_M_LAT = 111_320.0
_M_LON = 111_320.0 * math.cos(math.radians(_LAT0))


def _offset(north_m: float, east_m: float) -> tuple[float, float]:
    return _LAT0 + north_m / _M_LAT, _LON0 + east_m / _M_LON


def _write_dataset(root, pois, green_features=None, thresholds=None, bus_stops=None):
    poi_dir = root / "poi"
    poi_dir.mkdir(parents=True)
    with open(poi_dir / "pois.csv", "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["category", "subtype", "name", "lat", "lon", "source"])
        for category, name, (lat, lon) in pois:
            writer.writerow([category, "x", name, lat, lon, "fixture"])
    with open(poi_dir / "green_spaces.geojson", "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": green_features or []}, f)
    full = thresholds or {c: 2 for c in CATEGORIES}
    with open(poi_dir / "thresholds.json", "w", encoding="utf-8") as f:
        json.dump({"full_coverage": full}, f)
    with open(root / "paradas-de-colectivo.csv", "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["coord_X", "coord_Y", "L1", "L2", "L3", "L4", "L5", "L6"])
        for north, east, lines in bus_stops or []:
            lat, lon = _offset(north, east)
            writer.writerow([str(lon).replace(".", ","), str(lat).replace(".", ","), *lines, *[""] * (6 - len(lines))])


@pytest.fixture
def dataset(tmp_path, monkeypatch):
    monkeypatch.setenv("LIFE_SCORE_DATA_DIR", str(tmp_path))
    life_score._load_index.cache_clear()
    yield tmp_path
    life_score._load_index.cache_clear()


def _category(result, name):
    return next(c for c in result["categories"] if c["category"] == name)


def test_only_points_inside_the_circle_count(dataset):
    pois = [
        ("HEALTH", "cerca", _offset(100, 0)),
        ("HEALTH", "borde adentro", _offset(RADIUS_M - 10, 0)),
        ("HEALTH", "borde afuera", _offset(RADIUS_M + 10, 0)),
        # Dentro del cuadrado de 800 m de lado pero fuera del círculo (~990 m).
        ("HEALTH", "esquina del cuadrado", _offset(700, 700)),
    ]
    _write_dataset(dataset, pois)
    health = _category(compute_life_score(_LAT0, _LON0, {c: 1 for c in CATEGORIES}), "HEALTH")
    assert health["poiCount"] == 2
    assert {p["name"] for p in health["pois"]} == {"cerca", "borde adentro"}


def test_pois_are_sorted_by_distance(dataset):
    pois = [
        ("EDUCATION", "lejos", _offset(0, 600)),
        ("EDUCATION", "cerca", _offset(50, 0)),
        ("EDUCATION", "medio", _offset(0, -300)),
    ]
    _write_dataset(dataset, pois)
    education = _category(compute_life_score(_LAT0, _LON0, {c: 1 for c in CATEGORIES}), "EDUCATION")
    assert [p["name"] for p in education["pois"]] == ["cerca", "medio", "lejos"]


def test_score_is_capped_and_uses_thresholds(dataset):
    pois = [("GASTRONOMY", f"g{i}", _offset(10 * i, 0)) for i in range(5)]
    _write_dataset(dataset, pois, thresholds={**{c: 2 for c in CATEGORIES}, "GASTRONOMY": 10})
    result = compute_life_score(_LAT0, _LON0, {c: 1 for c in CATEGORIES})
    gastronomy = _category(result, "GASTRONOMY")
    assert gastronomy["poiCount"] == 5
    assert gastronomy["score"] == 50  # 5 de 10
    # Sin datos cercanos la categoría queda en 0, no se inventa nada.
    assert _category(result, "NIGHTLIFE") == {"category": "NIGHTLIFE", "poiCount": 0, "pois": [], "score": 0}


def test_weights_change_the_total(dataset):
    pois = [("HEALTH", f"h{i}", _offset(10 * i, 0)) for i in range(2)]  # HEALTH al 100 %
    _write_dataset(dataset, pois)
    only_health = {c: 0 for c in CATEGORIES} | {"HEALTH": 5}
    assert compute_life_score(_LAT0, _LON0, only_health)["totalScore"] == 100.0
    only_empty = {c: 0 for c in CATEGORIES} | {"NIGHTLIFE": 5}
    assert compute_life_score(_LAT0, _LON0, only_empty)["totalScore"] == 0.0
    half = {c: 0 for c in CATEGORIES} | {"HEALTH": 1, "NIGHTLIFE": 1}
    assert compute_life_score(_LAT0, _LON0, half)["totalScore"] == 50.0


def test_zero_weights_gives_zero_total(dataset):
    _write_dataset(dataset, [("HEALTH", "h", _offset(10, 0))])
    assert compute_life_score(_LAT0, _LON0, {c: 0 for c in CATEGORIES})["totalScore"] == 0.0


def _square(north_m, east_m, side_m, name):
    corners = [
        _offset(north_m, east_m),
        _offset(north_m, east_m + side_m),
        _offset(north_m + side_m, east_m + side_m),
        _offset(north_m + side_m, east_m),
        _offset(north_m, east_m),
    ]
    ring = [[lon, lat] for lat, lon in corners]
    return {"type": "Feature", "properties": {"name": name}, "geometry": {"type": "Polygon", "coordinates": [ring]}}


def test_green_space_counts_by_distance_to_the_polygon_edge(dataset):
    features = [
        _square(500, -100, 200, "parque cercano"),      # borde a 500 m al norte
        _square(2000, 0, 200, "parque lejano"),         # a 2 km
        _square(-100, -100, 200, "parque que contiene el punto"),
    ]
    _write_dataset(dataset, [], green_features=features)
    green = _category(compute_life_score(_LAT0, _LON0, {c: 1 for c in CATEGORIES}), "GREEN_SPACE")
    assert [p["name"] for p in green["pois"]] == ["parque que contiene el punto", "parque cercano"]
    assert green["poiCount"] == 2


def test_big_park_counts_even_when_its_centroid_is_far(dataset):
    # Parque de 3 km de lado: el centro queda a ~1,5 km, pero el borde está a 100 m.
    _write_dataset(dataset, [], green_features=[_square(100, -1500, 3000, "parque grande")])
    green = _category(compute_life_score(_LAT0, _LON0, {c: 1 for c in CATEGORIES}), "GREEN_SPACE")
    assert green["poiCount"] == 1


def test_bus_stops_are_loaded_with_their_lines(dataset):
    stops = [(50, 0, ["60", "152"]), (5000, 0, ["9"])]
    _write_dataset(dataset, [], bus_stops=stops)
    transport = _category(compute_life_score(_LAT0, _LON0, {c: 1 for c in CATEGORIES}), "TRANSPORT")
    assert transport["poiCount"] == 1
    assert transport["pois"][0]["name"] == "Parada de colectivo: líneas 60, 152"


def test_calculation_does_not_use_the_network(dataset, monkeypatch):
    _write_dataset(dataset, [("HEALTH", "h", _offset(10, 0))])

    def no_network(*args, **kwargs):
        raise AssertionError("El cálculo del Life Score no debe abrir conexiones de red")

    monkeypatch.setattr(socket, "socket", no_network)
    life_score._load_index.cache_clear()
    result = compute_life_score(_LAT0, _LON0, {c: 1 for c in CATEGORIES})
    assert result["totalScore"] >= 0


def test_result_is_deterministic(dataset):
    _write_dataset(dataset, [("HEALTH", f"h{i}", _offset(10 * i, 5 * i)) for i in range(4)])
    weights = {c: 3 for c in CATEGORIES}
    assert compute_life_score(_LAT0, _LON0, weights) == compute_life_score(_LAT0, _LON0, weights)


def test_osmnx_is_no_longer_a_dependency():
    import sys

    assert "osmnx" not in sys.modules or sys.modules.get("osmnx") is None
    assert not hasattr(life_score, "ox")
