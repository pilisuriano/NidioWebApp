"""Tests de src/geo/life_score.py con los datasets reales de BA Data que viajan en
el repositorio (data/poi/ y data/paradas-de-colectivo.csv). No usan la red.

La lógica fina (círculo de 800 m, orden, polígonos, pesos) se prueba con datos de
prueba chicos en test_life_score_dataset.py.
"""

import time

from src.geo.life_score import CATEGORIES, compute_life_score

EQUAL_WEIGHTS = {category: 3 for category in CATEGORIES}

# Obelisco (centro de CABA).
_CENTER = (-34.6037, -58.3816)
# Punto cercano al borde de CABA (Villa Lugano aprox.), debería dar menor score.
_EDGE = (-34.68, -58.47)
# Un punto en medio del Río de la Plata: no hay nada a 800 m.
_RIVER = (-34.55, -58.30)


def test_compute_life_score_returns_all_seven_categories():
    result = compute_life_score(*_CENTER, EQUAL_WEIGHTS)
    categories = {c["category"] for c in result["categories"]}
    assert categories == set(CATEGORIES)


def test_compute_life_score_total_score_in_range():
    result = compute_life_score(*_CENTER, EQUAL_WEIGHTS)
    assert 0.0 <= result["totalScore"] <= 100.0


def test_compute_life_score_is_deterministic_for_same_point():
    first = compute_life_score(*_CENTER, EQUAL_WEIGHTS)
    second = compute_life_score(*_CENTER, EQUAL_WEIGHTS)
    assert first == second


def test_compute_life_score_center_scores_higher_than_edge():
    center_score = compute_life_score(*_CENTER, EQUAL_WEIGHTS)["totalScore"]
    edge_score = compute_life_score(*_EDGE, EQUAL_WEIGHTS)["totalScore"]
    assert center_score > edge_score


def test_compute_life_score_zero_weights_gives_zero_total():
    zero_weights = {category: 0 for category in CATEGORIES}
    result = compute_life_score(*_CENTER, zero_weights)
    assert result["totalScore"] == 0.0


def test_downtown_has_pois_in_the_main_categories():
    by_category = {c["category"]: c for c in compute_life_score(*_CENTER, EQUAL_WEIGHTS)["categories"]}
    for category in ("TRANSPORT", "HEALTH", "GASTRONOMY", "EDUCATION", "GREEN_SPACE"):
        assert by_category[category]["poiCount"] > 0, category
        assert len(by_category[category]["pois"]) == by_category[category]["poiCount"]


def test_point_without_nearby_data_scores_zero_and_invents_nothing():
    result = compute_life_score(*_RIVER, EQUAL_WEIGHTS)
    assert result["totalScore"] == 0.0
    assert all(c["poiCount"] == 0 and c["pois"] == [] and c["score"] == 0 for c in result["categories"])


def test_every_poi_has_a_name_and_coordinates():
    for category in compute_life_score(*_CENTER, EQUAL_WEIGHTS)["categories"]:
        for poi in category["pois"]:
            assert poi["name"].strip(), category["category"]
            assert -35.0 < poi["lat"] < -34.0 and -59.0 < poi["lon"] < -58.0


def test_calculation_is_fast_once_data_is_loaded():
    """Con la versión anterior (Overpass) cada cálculo tardaba segundos. Con
    archivos locales tiene que ser una fracción de segundo."""
    compute_life_score(*_CENTER, EQUAL_WEIGHTS)  # carga los datasets
    start = time.perf_counter()
    for _ in range(10):
        compute_life_score(*_CENTER, EQUAL_WEIGHTS)
    assert (time.perf_counter() - start) / 10 < 0.25
