"""Genera la migración V45: actualiza al último trimestre publicado por IDECBA los precios por BARRIO
del segmento que usa el mapa de precios (2 ambientes usados, venta y alquiler).

Contexto: V43 cargó las series hasta el 1T 2026. IDECBA publicó después el 2T 2026 (provisorio). Esta
migración reemplaza solo las filas de 2 ambientes usados (el segmento que muestra el mapa y el precio de
referencia del barrio), con las mismas reglas que V43: valor propio del barrio (sin fallbacks), último
trimestre con dato, y solo si es reciente (fecha >= MIN_FECHA). Los barrios sin dato propio no se cargan:
el mapa los completa con el valor de su comuna (V44).

Uso (desde ml-service):
    python scripts/update_idecba_prices_2amb_usados.py RUTA/MI_DVP_AX03.xlsx RUTA/MI_DAP_AX10.xlsx

Output: backend/src/main/resources/db/migration/V45__update_idecba_prices_2q2026.sql
"""
import sys
import unicodedata
from pathlib import Path

import openpyxl

MIN_FECHA = "2025-01-01"
OUT = Path(__file__).resolve().parents[2] / "backend/src/main/resources/db/migration/V45__update_idecba_prices_2q2026.sql"
TRIM_MES = {"1": 1, "2": 4, "3": 7, "4": 10}
# Nombre en el xlsx de IDECBA (sin tildes, minúsculas) -> nombre en la tabla neighborhood.
NOMBRES = {
    "agronomia": "Agronomía", "boca": "La Boca", "montserrat": "Monserrat", "la boca": "La Boca", "la paternal": "La Paternal", "nunez": "Núñez",
    "san cristobal": "San Cristóbal", "san nicolas": "San Nicolás", "velez sarsfield": "Vélez Sarsfield",
    "villa ortuzar": "Villa Ortúzar", "villa pueyrredon": "Villa Pueyrredón", "constitucion": "Constitución",
    "villa del parque": "Villa del Parque", "villa gral. mitre": "Villa General Mitre",
}


def norm(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn").lower().strip()


def ultimo_por_barrio(path: str):
    ws = openpyxl.load_workbook(path, read_only=True, data_only=True).worksheets[0]
    rows = [list(r) for r in ws.iter_rows(values_only=True)]
    hdr, sub = rows[1], rows[2]
    periodos, anio = [], None
    for h, s in zip(hdr[1:], sub[1:]):
        if h is not None:
            anio = int(h)
        periodos.append((anio, TRIM_MES.get(str(s).strip()[0]) if s else None))
    res = {}
    for r in rows[3:]:
        nombre = r[0]
        if not isinstance(nombre, str) or not nombre.strip() or nombre.strip() == "Total":
            continue
        if nombre.startswith(("*", "/", "Nota", "Solo", "Fuente")):
            continue
        validos = [(p, v) for p, v in zip(periodos, r[1:]) if p[1] and isinstance(v, (int, float))]
        if validos:
            (a, m), v = validos[-1]
            res[nombre.strip()] = (round(float(v), 2), f"{a}-{m:02d}-01")
    return res


def main(venta_xlsx: str, alquiler_xlsx: str) -> None:
    lines = [
        "-- Actualiza al 2T 2026 (provisorio) los precios por barrio de IDECBA para el segmento del mapa:",
        "-- 2 ambientes usados. Venta: USD por m². Alquiler: ARS por mes (precio total). Último trimestre con",
        "-- dato propio del barrio (sin fallbacks, solo si es posterior a %s); los demás barrios los completa el" % MIN_FECHA,
        "-- mapa con el valor de su comuna (V44).",
        "-- Generado con ml-service/scripts/update_idecba_prices_2amb_usados.py.",
        "",
        "DELETE FROM neighborhood_price_m2 WHERE rooms = 2 AND condition = 'USED';",
        "",
    ]
    for op, path in (("SALE", venta_xlsx), ("RENT", alquiler_xlsx)):
        for nombre, (valor, fecha) in sorted(ultimo_por_barrio(path).items()):
            if fecha < MIN_FECHA:
                continue
            db = NOMBRES.get(norm(nombre), nombre).replace("'", "''")
            lines.append(
                "INSERT INTO neighborhood_price_m2 (neighborhood_id, operation_type, rooms, condition, avg_price_m2, period) "
                f"SELECT id, '{op}', 2, 'USED', {valor}, '{fecha}' FROM neighborhood WHERE name = '{db}';"
            )
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Escrito {OUT}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
