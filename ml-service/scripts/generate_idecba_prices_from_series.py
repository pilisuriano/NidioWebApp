"""Genera la migración V43: reemplaza los precios sintéticos de
`neighborhood_price_m2` (V10) por valores REALES de IDECBA.

Contexto: V8 (carga automática desde estadisticaciudad.gob.ar) falló y V10 repuso
valores sintéticos. Este script usa las series ya descargadas y normalizadas
(`idecba_barrio_trimestral_long.csv`, una fila por barrio x segmento x trimestre,
con el valor original: USD/m² para venta, ARS por mes (precio total del aviso)
para alquiler) y toma, para cada barrio y segmento, el ÚLTIMO trimestre con dato.

Reglas:
  - Solo valores de IDECBA a nivel barrio. No se usan fallbacks (Total CABA ni
    UADE-INECO): un barrio sin dato propio queda sin color en el mapa.
  - Solo se usa el último dato si es reciente (fecha >= MIN_FECHA), para no
    mostrar como actual un valor viejo.
  - Los datos marcados "provisorio" por IDECBA se incluyen (son datos reales
    preliminares).

Uso (desde ml-service):
    python scripts/generate_idecba_prices_from_series.py RUTA/idecba_barrio_trimestral_long.csv

Output: backend/src/main/resources/db/migration/V43__real_idecba_prices_from_series.sql
"""
import sys
import unicodedata
from pathlib import Path

import pandas as pd

MIN_FECHA = "2025-01-01"
OUT = Path(__file__).resolve().parents[2] / "backend/src/main/resources/db/migration/V43__real_idecba_prices_from_series.sql"
OP = {"venta": "SALE", "alquiler": "RENT"}
COND = {"usado": "USED", "a_estrenar": "NEW"}


def esc(s: str) -> str:
    return s.replace("'", "''")


def main(path: str) -> None:
    d = pd.read_csv(path)
    d["fecha"] = pd.to_datetime(d["fecha"])
    d = d.dropna(subset=["precio"])
    last = d.sort_values("fecha").groupby(["barrio", "tema", "ambientes", "condicion"]).tail(1)
    last = last[last["fecha"] >= MIN_FECHA].sort_values(["tema", "ambientes", "condicion", "barrio"])
    lines = [
        "-- Reemplaza los precios sintéticos de neighborhood_price_m2 (V10) por valores reales de IDECBA",
        "-- (Gobierno de la Ciudad de Buenos Aires, Mercado Inmobiliario). V8 intentó la carga automática y",
        "-- falló; V10 repuso valores sintéticos para no dejar el mapa vacío.",
        "-- Venta: USD por m². Alquiler: ARS por mes (precio total del departamento; IDECBA no publica alquiler por m²,",
        "-- y solo lo publica para usados). Para cada barrio y segmento (ambientes 1-3, usado / a estrenar) se toma",
        "-- el último trimestre con dato propio del barrio (sin fallbacks); el último dato de cada serie puede estar",
        "-- marcado como provisorio por IDECBA. Los barrios sin dato propio en un segmento no aparecen en el mapa.",
        "-- Generado con ml-service/scripts/generate_idecba_prices_from_series.py (fecha mínima del dato: %s)." % MIN_FECHA,
        "",
        "DELETE FROM neighborhood_price_m2;",
        "",
    ]
    for r in last.itertuples():
        lines.append(
            "INSERT INTO neighborhood_price_m2 (neighborhood_id, operation_type, rooms, condition, avg_price_m2, period) "
            "SELECT id, '%s', %d, '%s', %.2f, '%s' FROM neighborhood WHERE name = '%s';"
            % (OP[r.tema], int(r.ambientes), COND[r.condicion], float(r.precio), r.fecha.strftime("%Y-%m-%d"), esc(r.barrio))
        )
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("filas:", len(last), "->", OUT)
    print(last.groupby(["tema", "ambientes", "condicion"]).barrio.nunique().to_string())


if __name__ == "__main__":
    main(sys.argv[1])
