"""Tests de src/geo/life_score.py (lógica sintética temporal del /life-score)."""

from src.geo.life_score import CATEGORIES, compute_life_score

EQUAL_WEIGHTS = {category: 3 for category in CATEGORIES}

# Obelisco (centro de CABA).
_CENTER = (-34.6037, -58.3816)
# Punto cercano al borde de CABA (Villa Lugano aprox.), debería dar menor score.
_EDGE = (-34.68, -58.47)


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
