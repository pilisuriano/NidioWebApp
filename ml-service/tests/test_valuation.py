"""Tests de src/models/valuation.py (lógica sintética temporal del /predict)."""

from src.models.valuation import predict_range


def test_predict_range_returns_min_less_than_max():
    minimum, maximum = predict_range("RENT", "APARTMENT", "Palermo", 45, 2)
    assert minimum > 0
    assert minimum < maximum


def test_predict_range_is_deterministic():
    args = ("SALE", "APARTMENT", "Palermo", 50, 2)
    first = predict_range(*args)
    second = predict_range(*args)
    assert first == second


def test_predict_range_unknown_neighborhood_falls_back_to_city_average():
    minimum, maximum = predict_range("RENT", "APARTMENT", "Barrio Inexistente", 45, 2)
    assert minimum > 0
    assert minimum < maximum


def test_predict_range_neighborhood_lookup_is_case_insensitive():
    # La tabla de precios normaliza con .lower(), el ajuste determinístico
    # también usa .lower() (sin trim) sobre el mismo string de entrada.
    a = predict_range("SALE", "APARTMENT", "Palermo", 50, 2)
    b = predict_range("SALE", "APARTMENT", "PALERMO", 50, 2)
    assert a == b


def test_predict_range_puerto_madero_is_more_expensive_than_la_boca():
    caro_min, _ = predict_range("SALE", "APARTMENT", "Puerto Madero", 50, 2)
    barato_min, _ = predict_range("SALE", "APARTMENT", "La Boca", 50, 2)
    assert caro_min > barato_min
