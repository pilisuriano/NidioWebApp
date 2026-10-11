"""Tests de src/geo/noise.py con las capas reales de data/noise/ (sin red) y con
una capa chica de prueba para la lógica fina (franja más ruidosa, 50 m, escala)."""

import json
import time

import pytest

from src.geo.noise import MAX_DISTANCE_M, compute_noise

_CENTER = (-34.6037, -58.3816)  # Obelisco
_EDGE = (-34.68, -58.47)  # Villa Lugano aprox.
_RIVER = (-34.55, -58.30)  # Río de la Plata: sin franjas


def test_center_has_day_and_night_noise():
    result = compute_noise(*_CENTER)
    for period in ("day", "night"):
        entry = result[period]
        assert entry is not None
        assert 1 <= entry["level"] <= 4
        assert entry["dbHigh"] - entry["dbLow"] == 5
        assert entry["distanceM"] <= MAX_DISTANCE_M


def test_river_point_has_no_data():
    assert compute_noise(*_RIVER) == {"day": None, "night": None}


def test_downtown_is_noisier_than_residential_edge():
    center = compute_noise(*_CENTER)["day"]["level"]
    edge = compute_noise(*_EDGE)["day"]["level"]
    assert center > edge


def test_is_deterministic_and_fast():
    compute_noise(*_CENTER)  # calienta la carga perezosa
    start = time.perf_counter()
    first = compute_noise(*_CENTER)
    second = compute_noise(*_CENTER)
    assert first == second
    assert time.perf_counter() - start < 0.5


def _write_layer(path, bands):
    features = [
        {
            "type": "Feature",
            "properties": {"lo": lo, "hi": hi, "src": "2025"},
            "geometry": {"type": "Polygon", "coordinates": [ring]},
        }
        for lo, hi, ring in bands
    ]
    path.write_text(json.dumps({"type": "FeatureCollection", "features": features}), encoding="utf-8")


@pytest.fixture
def small_dir(tmp_path):
    thresholds = {
        "etiquetas": ["Tranquilo", "Moderado", "Ruidoso", "Muy ruidoso"],
        "dia": {"cortes_db": [65, 70, 75]},
        "noche": {"cortes_db": [60, 65, 70]},
    }
    (tmp_path / "thresholds.json").write_text(json.dumps(thresholds), encoding="utf-8")
    # Dos franjas superpuestas alrededor de (lat -34.6, lon -58.4) y una chica lejos.
    big = [[-58.401, -34.601], [-58.399, -34.601], [-58.399, -34.599], [-58.401, -34.599], [-58.401, -34.601]]
    inner = [[-58.4005, -34.6005], [-58.3995, -34.6005], [-58.3995, -34.5995], [-58.4005, -34.5995], [-58.4005, -34.6005]]
    _write_layer(tmp_path / "noise_day.geojson", [(65, 70, big), (75, 80, inner)])
    _write_layer(tmp_path / "noise_night.geojson", [(55, 60, big)])
    return str(tmp_path)


def test_overlap_picks_noisiest_band(small_dir):
    result = compute_noise(-34.6, -58.4, data_dir=small_dir)
    assert result["day"]["dbLow"] == 75
    assert result["day"]["level"] == 4
    assert result["night"]["level"] == 1
    assert result["day"]["distanceM"] == 0.0


def test_outside_within_50m_uses_nearest_band(small_dir):
    # ~22 m al norte del borde de la franja grande
    result = compute_noise(-34.5988, -58.4, data_dir=small_dir)
    assert result["day"]["dbLow"] == 65
    assert result["day"]["level"] == 2
    assert 0 < result["day"]["distanceM"] <= MAX_DISTANCE_M


def test_outside_beyond_50m_has_no_data(small_dir):
    assert compute_noise(-34.597, -58.4, data_dir=small_dir) == {"day": None, "night": None}
