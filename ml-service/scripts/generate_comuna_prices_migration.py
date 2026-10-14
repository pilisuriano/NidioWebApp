"""Genera la migración V44: precios de referencia por COMUNA (IDECBA) y la
columna `comuna` de cada barrio.

Contexto: IDECBA no publica precio propio para algunos barrios (Villa Real,
Villa Soldati, Villa Riachuelo en venta de 2 ambientes usados, y 13 barrios en
alquiler de 2 ambientes usados). El mapa de precios los completa con el valor
oficial de su comuna, marcado como tal (borde punteado y leyenda "Valor de la
comuna"); si ni la comuna tiene dato (alquiler, Comuna 8), queda en gris.

Fuentes (IDECBA, Banco de Datos > Mercado Inmobiliario), solo el segmento que
usa el mapa (2 ambientes usados):
  - Venta: precio promedio de publicación del m² (USD), 2 ambientes usados, por comuna.
  - Alquiler: precio promedio de publicación (ARS por mes), 2 ambientes usados, por comuna.
Se toma el último trimestre con dato de cada comuna (puede ser provisorio).

La comuna de cada barrio sale de la columna `comuna` de los datasets de delitos
de BA Data (2023-2025), que coincide con la división oficial.

Uso (desde ml-service):
    python scripts/generate_comuna_prices_migration.py RUTA/MI_DVP_AX07.xlsx RUTA/MI_DAP_AX13.xlsx

Output: backend/src/main/resources/db/migration/V44__comuna_prices_fallback.sql
"""
import sys
from pathlib import Path

import openpyxl

OUT = Path(__file__).resolve().parents[2] / "backend/src/main/resources/db/migration/V44__comuna_prices_fallback.sql"

# Nombre del barrio en la tabla `neighborhood` -> comuna.
COMUNA_POR_BARRIO = {
    "Agronomía": 15, "Almagro": 5, "Balvanera": 3, "Barracas": 4, "Belgrano": 13, "Boedo": 5,
    "Caballito": 6, "Chacarita": 15, "Coghlan": 12, "Colegiales": 13, "Constitución": 1,
    "Flores": 7, "Floresta": 10, "La Boca": 4, "La Paternal": 15, "Liniers": 9, "Mataderos": 9,
    "Monserrat": 1, "Monte Castro": 10, "Nueva Pompeya": 4, "Núñez": 13, "Palermo": 14,
    "Parque Avellaneda": 9, "Parque Chacabuco": 7, "Parque Chas": 15, "Parque Patricios": 4,
    "Puerto Madero": 1, "Recoleta": 2, "Retiro": 1, "Saavedra": 12, "San Cristóbal": 3,
    "San Nicolás": 1, "San Telmo": 1, "Versalles": 10, "Villa Crespo": 15, "Villa del Parque": 11,
    "Villa Devoto": 11, "Villa General Mitre": 11, "Villa Lugano": 8, "Villa Luro": 10,
    "Villa Ortúzar": 15, "Villa Pueyrredón": 12, "Villa Real": 10, "Villa Riachuelo": 8,
    "Villa Santa Rita": 11, "Villa Soldati": 8, "Villa Urquiza": 12, "Vélez Sarsfield": 10,
}

# trimestre (texto del xlsx) -> mes de inicio
TRIM_MES = {"1": 1, "2": 4, "3": 7, "4": 10}


def ultimo_por_comuna(path: str):
    ws = openpyxl.load_workbook(path, read_only=True, data_only=True).worksheets[0]
    rows = [list(r) for r in ws.iter_rows(values_only=True)]
    hdr, sub = rows[1], rows[2]
    periodos, anio = [], None
    for h, s in zip(hdr[1:], sub[1:]):
        if h is not None:
            anio = int(h)
        periodos.append((anio, TRIM_MES[str(s).strip()[0]]))
    res = {}
    for r in rows[3:]:
        if not isinstance(r[0], (int, float)):
            continue  # "Total" y notas al pie
        comuna = int(r[0])
        validos = [(p, v) for p, v in zip(periodos, r[1:]) if isinstance(v, (int, float))]
        if validos:
            (a, m), v = validos[-1]
            res[comuna] = (round(float(v), 2), f"{a}-{m:02d}-01")
    return res


def main(venta_xlsx: str, alquiler_xlsx: str) -> None:
    lines = [
        "-- Precios de referencia por COMUNA (IDECBA) para completar, en el mapa de precios, los barrios",
        "-- sin dato propio. Segmento del mapa: 2 ambientes usados. Venta: USD por m². Alquiler: ARS por mes",
        "-- (precio total del departamento). Último trimestre con dato de cada comuna (puede ser provisorio).",
        "-- Alquiler: la Comuna 8 no tiene ningún valor en la serie de IDECBA (todo '///'), por eso no figura.",
        "-- Generado con ml-service/scripts/generate_comuna_prices_migration.py.",
        "",
        "ALTER TABLE neighborhood ADD COLUMN IF NOT EXISTS comuna INTEGER;",
        "",
    ]
    for barrio, comuna in sorted(COMUNA_POR_BARRIO.items()):
        lines.append(f"UPDATE neighborhood SET comuna = {comuna} WHERE name = '{barrio}';")
    lines += [
        "",
        "CREATE TABLE IF NOT EXISTS comuna_price_m2 (",
        "    id BIGSERIAL PRIMARY KEY,",
        "    comuna INTEGER NOT NULL,",
        "    operation_type VARCHAR(20) NOT NULL,",
        "    rooms INTEGER NOT NULL,",
        "    condition VARCHAR(10) NOT NULL,",
        "    avg_price_m2 NUMERIC(14,2) NOT NULL,",
        "    period DATE NOT NULL,",
        "    CONSTRAINT uq_comuna_price UNIQUE (comuna, operation_type, rooms, condition)",
        ");",
        "",
    ]
    for op, path in (("SALE", venta_xlsx), ("RENT", alquiler_xlsx)):
        for comuna, (valor, periodo) in sorted(ultimo_por_comuna(path).items()):
            lines.append(
                "INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) "
                f"VALUES ({comuna}, '{op}', 2, 'USED', {valor}, '{periodo}');"
            )
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Escrito {OUT}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
