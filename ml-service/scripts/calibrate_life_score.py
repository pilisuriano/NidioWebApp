"""Calibra los umbrales de cobertura plena del Life Score y escribe
`data/poi/thresholds.json`.

Para cada categoría, "cobertura plena" (100 puntos) es la cantidad de POIs dentro
de RADIUS_M que alcanza el percentil `--quantile` (por defecto 0,90) de la
distribución real de conteos sobre una muestra de ubicaciones de CABA. Con el
percentil 90, el 10 % de las ubicaciones más densas llega a 100 y el resto se
diferencia; no queda todo saturado en 100 (el problema que ya tuvo la versión
anterior, ver Ronda 5 del roadmap) ni todo cerca de 0.

Muestra de ubicaciones: las paradas de colectivo de BA Data (6.962 puntos, una
cobertura casi uniforme de la parte habitada de CABA). Se informan también el
mínimo, p25, mediana, p75, p90 y máximo de cada categoría, para que el criterio
quede a la vista en el informe y se pueda discutir.

Uso (desde ml-service/):

    python scripts/calibrate_life_score.py [--quantile 0.90] [--max-samples 3000]

Reproducible: la muestra se toma con semilla fija.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import date

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.geo import life_score  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--quantile", type=float, default=0.90)
    parser.add_argument("--max-samples", type=int, default=3000)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    data_dir = os.path.abspath(life_score._data_dir())
    index = life_score._load_index(data_dir, with_thresholds=False)

    # Solo paradas de colectivo (no subte/tren) como muestra de ubicaciones.
    bus_stops = life_score._load_bus_stops(os.path.join(data_dir, "paradas-de-colectivo.csv"))
    n_total = len(bus_stops)
    rng = np.random.default_rng(args.seed)
    chosen = rng.choice(n_total, size=min(args.max_samples, n_total), replace=False)
    sample = [(bus_stops[i][0], bus_stops[i][1]) for i in chosen]

    counts: dict[str, list[int]] = {c: [] for c in life_score.CATEGORIES}
    for lat, lon in sample:
        for category in life_score.CATEGORIES:
            counts[category].append(len(life_score._category_pois(index, category, lat, lon)))

    full_coverage: dict[str, int] = {}
    distribution: dict[str, dict[str, float]] = {}
    for category, values in counts.items():
        arr = np.array(values)
        full_coverage[category] = max(1, int(round(float(np.quantile(arr, args.quantile)))))
        distribution[category] = {
            "min": int(arr.min()),
            "p25": float(np.quantile(arr, 0.25)),
            "median": float(np.quantile(arr, 0.50)),
            "p75": float(np.quantile(arr, 0.75)),
            "p90": float(np.quantile(arr, 0.90)),
            "max": int(arr.max()),
            "share_zero": round(float((arr == 0).mean()), 3),
        }

    result = {
        "radius_m": life_score.RADIUS_M,
        "method": f"percentil {args.quantile} de la cantidad de POIs dentro de {life_score.RADIUS_M} m",
        "sample": f"{len(sample)} paradas de colectivo al azar (semilla {args.seed}) de {n_total}",
        "generated": date.today().isoformat(),
        "full_coverage": full_coverage,
        "distribution": distribution,
        "dataset_sizes": {
            **{c: len(index.points[c].names) for c in life_score.CATEGORIES if c != "GREEN_SPACE"},
            "GREEN_SPACE": len(index.green.geoms),
        },
    }
    out = os.path.join(data_dir, "poi", "thresholds.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Escrito {out}")
    print(f"{'categoría':<12}{'datos':>8}{'min':>6}{'p25':>7}{'mediana':>9}{'p75':>7}{'p90':>7}{'max':>6}{'%en 0':>8}  umbral")
    for category in life_score.CATEGORIES:
        d = distribution[category]
        print(
            f"{category:<12}{result['dataset_sizes'][category]:>8}{d['min']:>6}{d['p25']:>7.0f}"
            f"{d['median']:>9.0f}{d['p75']:>7.0f}{d['p90']:>7.0f}{d['max']:>6}{d['share_zero']*100:>7.0f}%  {full_coverage[category]}"
        )


if __name__ == "__main__":
    main()
