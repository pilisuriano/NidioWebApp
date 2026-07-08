"""Cálculo del Life Score.

IMPLEMENTACIÓN SINTÉTICA TEMPORAL: hasta integrar OSMnx/OpenStreetMap, los POIs
se generan de forma determinística alrededor del punto consultado. La densidad
baja a medida que el punto se aleja del centro de CABA, para que distintas
zonas den scores distintos y creíbles.
"""

import math
import random

# Obelisco, referencia de centralidad.
_CENTER_LAT, _CENTER_LON = -34.6037, -58.3816

CATEGORIES = [
    "TRANSPORT",
    "COMMERCE",
    "GREEN_SPACE",
    "HEALTH",
    "GASTRONOMY",
    "NIGHTLIFE",
    "EDUCATION",
]

# (multiplicador de densidad, cantidad máxima esperada en ~800 m)
_CATEGORY_DENSITY = {
    "TRANSPORT": (1.3, 12),
    "COMMERCE": (1.4, 14),
    "GREEN_SPACE": (0.7, 6),
    "HEALTH": (0.8, 7),
    "GASTRONOMY": (1.2, 12),
    "NIGHTLIFE": (0.9, 9),
    "EDUCATION": (0.9, 8),
}

_POI_NAMES = {
    "TRANSPORT": ["Subte Línea {L}", "Parada Colectivo {n}", "Estación Ecobici {q}", "Metrobus {q}"],
    "COMMERCE": ["Supermercado Coto", "Carrefour Express", "Farmacity", "Mercado {q}", "Kiosco 24hs {q}"],
    "GREEN_SPACE": ["Plaza {q}", "Parque {q}", "Plazoleta {q}", "Paseo {q}"],
    "HEALTH": ["Hospital {q}", "Sanatorio {q}", "CeSAC N° {n}", "Farmacia {q}"],
    "GASTRONOMY": ["Parrilla Don {q}", "Café {q}", "Pizzería La {q}", "Bodegón {q}", "Sushi {q}"],
    "NIGHTLIFE": ["Bar {q}", "Cervecería {q}", "Club {q}", "Vinoteca {q}"],
    "EDUCATION": ["Escuela N° {n}", "Colegio {q}", "Instituto {q}", "Jardín {q}"],
}

_QUALIFIERS = [
    "San Martín", "Belgrano", "Mitre", "Sarmiento", "Güemes", "Alsina", "Rivadavia",
    "del Sol", "Norte", "Central", "La Esquina", "Palermo", "Urquiza", "El Ombú",
]

_SUBTE_LINES = ["A", "B", "C", "D", "E", "H"]


def _distance_km(lat: float, lon: float) -> float:
    dy = (lat - _CENTER_LAT) * 111.0
    dx = (lon - _CENTER_LON) * 92.0  # ~cos(-34.6°) * 111
    return math.hypot(dx, dy)


def compute_life_score(lat: float, lon: float, weights: dict[str, int]) -> dict:
    """Devuelve {"totalScore": float, "categories": [...]} según el contrato REST."""
    rng = random.Random(f"{round(lat, 4)}:{round(lon, 4)}")

    # Densidad urbana: 1.0 en el centro, decae hacia los bordes de CABA.
    centrality = max(0.30, 1.0 - _distance_km(lat, lon) / 14.0)

    categories = []
    weighted_sum = 0.0
    total_weight = 0

    for category in CATEGORIES:
        multiplier, max_count = _CATEGORY_DENSITY[category]
        expected = centrality * multiplier * max_count
        count = max(0, min(max_count, round(rng.gauss(expected, 1.5))))

        pois = []
        for _ in range(count):
            template = rng.choice(_POI_NAMES[category])
            name = template.format(
                L=rng.choice(_SUBTE_LINES),
                n=rng.randint(1, 180),
                q=rng.choice(_QUALIFIERS),
            )
            # Hasta ~800 m alrededor del punto consultado.
            pois.append({
                "name": name,
                "lat": round(lat + rng.uniform(-0.0072, 0.0072), 6),
                "lon": round(lon + rng.uniform(-0.0087, 0.0087), 6),
            })

        weight = int(weights.get(category, 0))
        coverage = count / max_count
        weighted_sum += weight * coverage
        total_weight += weight

        categories.append({"category": category, "poiCount": count, "pois": pois})

    total_score = round(100.0 * weighted_sum / total_weight, 1) if total_weight > 0 else 0.0
    return {"totalScore": total_score, "categories": categories}
