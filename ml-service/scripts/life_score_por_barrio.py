"""Puntaje de Life Score por barrio, como validación de que el índice ordena la
ciudad de forma razonable (centro alto, periferia baja).

Para cada uno de los 48 barrios oficiales (campo BARRIO del Relevamiento de Usos
del Suelo, que ya viene con los nombres oficiales) toma hasta `--sample` parcelas
al azar (semilla fija), calcula el Life Score con pesos iguales en el punto
representativo de cada parcela y informa p25, mediana y p75 del puntaje total y la
mediana del puntaje de cada categoría.

Uso (desde ml-service/):

    python scripts/life_score_por_barrio.py --raw-dir "<carpeta de BA Data>" --out life_score_por_barrio.csv

`LIFE_SCORE_DATA_DIR` permite calcular con otra carpeta de datos (por ejemplo, la
versión anterior para comparar).
"""

from __future__ import annotations

import argparse
import glob
import os
import sys

import geopandas as gpd
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.geo.life_score import CATEGORIES, compute_life_score  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw-dir", required=True, help="carpeta con el Relevamiento de Usos del Suelo (.shp, o ya descomprimido en _extracted/)")
    parser.add_argument("--out", default="life_score_por_barrio.csv")
    parser.add_argument("--sample", type=int, default=200, help="parcelas por barrio")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    shapefiles = glob.glob(os.path.join(args.raw_dir, "**", "*[Uu]sos*.shp"), recursive=True)
    if not shapefiles:
        raise FileNotFoundError(f"No encontré el shapefile del RUS en {args.raw_dir}")
    parcels = gpd.read_file(shapefiles[0], columns=["BARRIO"])
    parcels["geometry"] = parcels.geometry.representative_point()
    parcels = parcels.to_crs(4326)
    parcels["lat"] = parcels.geometry.y
    parcels["lon"] = parcels.geometry.x

    rng = np.random.default_rng(args.seed)
    weights = {c: 3 for c in CATEGORIES}
    rows = []
    for barrio, sub in parcels.groupby("BARRIO"):
        chosen = sub.iloc[rng.choice(len(sub), size=min(args.sample, len(sub)), replace=False)]
        results = [compute_life_score(la, lo, weights) for la, lo in zip(chosen.lat, chosen.lon)]
        total = np.array([r["totalScore"] for r in results])
        by_category = {
            c: float(np.median([next(x["score"] for x in r["categories"] if x["category"] == c) for r in results]))
            for c in CATEGORIES
        }
        rows.append({
            "barrio": barrio, "parcelas": len(sub), "muestra": len(chosen),
            "p25": np.percentile(total, 25), "mediana": np.median(total), "p75": np.percentile(total, 75),
            **{f"mediana_{c}": v for c, v in by_category.items()},
        })
    table = pd.DataFrame(rows).sort_values("mediana", ascending=False).round(1)
    table.to_csv(args.out, index=False)
    print(table.to_string(index=False))


if __name__ == "__main__":
    main()
