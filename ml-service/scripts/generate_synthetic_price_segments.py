"""Repone datos sintéticos de precio/m² (por barrio, ambientes y condición)
en `neighborhood_price_m2`.

Contexto: `generate_real_idecba_prices.py` (V8) reemplaza los precios por
datos reales de IDECBA, pero si esa carga falla (red, cambio de formato del
archivo, etc.) la tabla queda vacía — la migración borra antes de insertar,
y si ninguna de las 9 series matchea barrios, no queda nada cargado. Este
script genera un V10 con el mismo criterio sintético que ya usaba el
proyecto (`PRICE_M2` en `ml-service/src/models/valuation.py`), con un
ajuste razonable por ambientes (las unidades chicas cuestan más por m²) y
por condición (a estrenar > usado), para no dejar el mapa de calor de
Precios vacío mientras se resuelve la carga real.

No requiere internet: los precios base ya están en este repo. Correr
localmente:

    cd ml-service
    source .venv/bin/activate
    python scripts/generate_synthetic_price_segments.py

Output: backend/src/main/resources/db/migration/V10__seed_synthetic_price_segments.sql
"""

import unicodedata
from pathlib import Path

# Mismos precios base (USD/m² venta, ARS/m² alquiler) que
# ml-service/src/models/valuation.py::PRICE_M2, sin las variantes con/sin
# acento (se resuelven con normalize() acá).
PRICE_M2 = {
    "palermo": (3300, 15500), "recoleta": (3000, 14200), "belgrano": (3100, 14000),
    "nunez": (3000, 13500), "colegiales": (2800, 13000), "villa urquiza": (2600, 12200),
    "villa crespo": (2400, 12000), "caballito": (2300, 11500), "almagro": (2200, 11200),
    "balvanera": (1900, 10200), "san telmo": (2100, 10800), "puerto madero": (5800, 25000),
    "retiro": (2900, 13200), "san nicolas": (1800, 9800), "monserrat": (1800, 9600),
    "boedo": (2000, 10400), "flores": (1900, 10000), "barracas": (1700, 9200),
    "la boca": (1500, 8500), "villa devoto": (2200, 11000), "agronomia": (2200, 11000),
    "chacarita": (2500, 12500), "coghlan": (2400, 11800), "constitucion": (1500, 8500),
    "floresta": (1800, 9500), "la paternal": (2000, 10200), "liniers": (1600, 8800),
    "mataderos": (1500, 8200), "monte castro": (1900, 9800), "nueva pompeya": (1300, 7500),
    "parque avellaneda": (1600, 8600), "parque chacabuco": (1900, 9700), "parque chas": (2100, 10500),
    "parque patricios": (1700, 9000), "saavedra": (2300, 11500), "san cristobal": (1700, 9200),
    "velez sarsfield": (1700, 9000), "versalles": (1700, 9000), "villa del parque": (2200, 11200),
    "villa general mitre": (2100, 10800), "villa lugano": (1200, 7000), "villa luro": (1700, 9000),
    "villa ortuzar": (2200, 11000), "villa pueyrredon": (2000, 10200), "villa real": (1700, 9000),
    "villa riachuelo": (1200, 7000), "villa santa rita": (1900, 9600), "villa soldati": (1200, 7000),
}

NEIGHBORHOODS = [
    "Palermo", "Recoleta", "Belgrano", "Núñez", "Colegiales", "Villa Urquiza",
    "Villa Crespo", "Caballito", "Almagro", "Balvanera", "San Telmo",
    "Puerto Madero", "Retiro", "San Nicolás", "Monserrat", "Boedo", "Flores",
    "Barracas", "La Boca", "Villa Devoto", "Agronomía", "Chacarita",
    "Coghlan", "Constitución", "Floresta", "La Paternal", "Liniers",
    "Mataderos", "Monte Castro", "Nueva Pompeya", "Parque Avellaneda",
    "Parque Chacabuco", "Parque Chas", "Parque Patricios", "Saavedra",
    "San Cristóbal", "Vélez Sarsfield", "Versalles", "Villa del Parque",
    "Villa General Mitre", "Villa Lugano", "Villa Luro", "Villa Ortúzar",
    "Villa Pueyrredón", "Villa Real", "Villa Riachuelo", "Villa Santa Rita",
    "Villa Soldati",
]

# Unidades chicas rinden más caras por m² que las grandes (patrón real del
# mercado); "a estrenar" tiene premio sobre "usado". Alquiler no distingue
# condición (mismo criterio que la carga real de IDECBA).
ROOMS_MULT = {1: 1.15, 2: 1.0, 3: 0.90}
CONDITION_MULT = {"USED": 1.0, "NEW": 1.12}
PERIOD = "2026-01-01"

OUTPUT_PATH = (
    Path(__file__).resolve().parents[2]
    / "backend" / "src" / "main" / "resources" / "db" / "migration"
    / "V10__seed_synthetic_price_segments.sql"
)


def normalize(name: str) -> str:
    nfkd = unicodedata.normalize("NFKD", name)
    return "".join(c for c in nfkd if not unicodedata.combining(c)).lower().strip()


def main() -> None:
    lines = [
        "-- Repone datos sintéticos de precio/m² (por barrio, ambientes y",
        "-- usado/a estrenar) porque la carga real de IDECBA (V8) no matcheó",
        "-- ningún barrio -- la tabla quedó vacía (V8 borra antes de insertar,",
        "-- y si la descarga/parseo de las 9 series falló no queda nada",
        "-- cargado). Mismo criterio sintético que ya usaba el proyecto",
        "-- (PRICE_M2 en ml-service/src/models/valuation.py) más un ajuste",
        "-- razonable por ambientes y condición, para no dejar el mapa de",
        "-- calor de Precios vacío mientras se resuelve la carga real.",
        "-- Generado con ml-service/scripts/generate_synthetic_price_segments.py",
        "",
        "DELETE FROM neighborhood_price_m2;",
        "",
    ]

    missing = []
    total = 0
    for name in NEIGHBORHOODS:
        key = normalize(name)
        if key not in PRICE_M2:
            missing.append(name)
            continue
        sale_base, rent_base = PRICE_M2[key]
        escaped = name.replace("'", "''")
        for rooms, rmult in ROOMS_MULT.items():
            for condition, cmult in CONDITION_MULT.items():
                value = round(sale_base * rmult * cmult, 2)
                lines.append(
                    f"INSERT INTO neighborhood_price_m2 "
                    f"(neighborhood_id, operation_type, rooms, condition, avg_price_m2, period) "
                    f"SELECT id, 'SALE', {rooms}, '{condition}', {value}, '{PERIOD}' "
                    f"FROM neighborhood WHERE name = '{escaped}';"
                )
                total += 1
            rent_value = round(rent_base * rmult, 2)
            lines.append(
                f"INSERT INTO neighborhood_price_m2 "
                f"(neighborhood_id, operation_type, rooms, condition, avg_price_m2, period) "
                f"SELECT id, 'RENT', {rooms}, 'USED', {rent_value}, '{PERIOD}' "
                f"FROM neighborhood WHERE name = '{escaped}';"
            )
            total += 1

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Generado: {OUTPUT_PATH}")
    print(f"Filas insertadas: {total}")
    if missing:
        print(f"Barrios sin match (no se generaron filas para estos): {missing}")


if __name__ == "__main__":
    main()
