"""Tests de src/models/valuation.py -- llaman al modelo XGBoost real (no un mock),
usando los artefactos entrenados que vive en src/models/artifacts/. Reemplaza la
version anterior de este archivo, que testeaba predict_range(), la formula sintetica
placeholder que existia ANTES de integrar el modelo real (07/08/2026, ver bitacora
6.41/6.42) -- esa funcion ya no existe en valuation.py, por eso el archivo viejo
rompia la coleccion de pytest con un ImportError."""

from src.models.valuation import predict_valuation
from src.models.valuation_schemas import OperationType, PropertyType, ValuationRequest


def _request(**overrides):
    defaults = {
        "operation_type": OperationType.RENT,
        "property_type": PropertyType.APARTMENT,
        "neighborhood": "Palermo",
        "surface_m2": 45,
        "rooms": 2,
    }
    defaults.update(overrides)
    return ValuationRequest(**defaults)


def test_predict_valuation_rent_returns_min_less_than_max():
    resultado = predict_valuation(_request())
    assert resultado["min"] > 0
    assert resultado["min"] < resultado["max"]


def test_predict_valuation_sale_returns_min_less_than_max():
    resultado = predict_valuation(
        _request(operation_type=OperationType.SALE, surface_m2=50)
    )
    assert resultado["min"] > 0
    assert resultado["min"] < resultado["max"]


def test_predict_valuation_is_deterministic():
    primero = predict_valuation(_request())
    segundo = predict_valuation(_request())
    assert primero["min"] == segundo["min"]
    assert primero["max"] == segundo["max"]


def test_predict_valuation_bigger_surface_is_worth_more():
    chico = predict_valuation(_request(operation_type=OperationType.SALE, surface_m2=35))
    grande = predict_valuation(_request(operation_type=OperationType.SALE, surface_m2=90))
    assert grande["min"] > chico["min"]


def test_predict_valuation_includes_explanation():
    resultado = predict_valuation(_request())
    assert isinstance(resultado["explanation"], list)
    assert len(resultado["explanation"]) > 0
    assert isinstance(resultado["explanation_text"], str)
    assert len(resultado["explanation_text"]) > 0
