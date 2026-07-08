"""Lógica del modelo de valuación de propiedades.

IMPLEMENTACIÓN SINTÉTICA TEMPORAL: hasta que se entrene el modelo real
(Kaggle + IDECBA), el rango se deriva de una tabla de precios por m² por
barrio de CABA, con ajustes simples por tipo de propiedad y ambientes.
Es determinística para una misma entrada.
"""

import hashlib

# Precio promedio por m² (sintético): SALE en USD/m², RENT en ARS/m² mensual.
# Mantener alineado con backend/src/main/resources/db/migration/V2__seed_synthetic_caba.sql
PRICE_M2 = {
    "palermo": (3300, 15500),
    "recoleta": (3000, 14200),
    "belgrano": (3100, 14000),
    "nuñez": (3000, 13500),
    "nunez": (3000, 13500),
    "colegiales": (2800, 13000),
    "villa urquiza": (2600, 12200),
    "villa crespo": (2400, 12000),
    "caballito": (2300, 11500),
    "almagro": (2200, 11200),
    "balvanera": (1900, 10200),
    "san telmo": (2100, 10800),
    "puerto madero": (5800, 25000),
    "retiro": (2900, 13200),
    "san nicolas": (1800, 9800),
    "san nicolás": (1800, 9800),
    "monserrat": (1800, 9600),
    "boedo": (2000, 10400),
    "flores": (1900, 10000),
    "barracas": (1700, 9200),
    "la boca": (1500, 8500),
    "villa devoto": (2200, 11000),
}

# Promedio de la ciudad como fallback para barrios fuera de la tabla.
_DEFAULT_SALE = 2400
_DEFAULT_RENT = 11800

PROPERTY_TYPE_FACTOR = {"APARTMENT": 1.00, "HOUSE": 1.05, "PH": 0.97}


def predict_range(
    operation_type: str,
    property_type: str,
    neighborhood: str,
    surface_m2: float,
    rooms: int,
) -> tuple[float, float]:
    """Devuelve (min, max) del rango de precio estimado."""
    sale, rent = PRICE_M2.get(neighborhood.strip().lower(), (_DEFAULT_SALE, _DEFAULT_RENT))
    price_m2 = sale if operation_type == "SALE" else rent

    base = price_m2 * surface_m2
    base *= PROPERTY_TYPE_FACTOR.get(property_type, 1.0)

    # Unidades muy subdivididas para su superficie rinden un poco menos por m².
    density = rooms / max(surface_m2 / 30.0, 1.0)
    base *= max(0.94, min(1.06, 1.03 - 0.03 * density))

    # Corrimiento determinístico por entrada (simula la varianza del modelo).
    key = f"{operation_type}|{property_type}|{neighborhood.lower()}|{surface_m2}|{rooms}"
    digest = int(hashlib.sha256(key.encode()).hexdigest(), 16)
    base *= 0.97 + (digest % 1000) / 1000 * 0.06

    return round(base * 0.93), round(base * 1.07)
