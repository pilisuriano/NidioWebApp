"""Recalibra el índice de seguridad por barrio con los CSV de Delitos (BA Data).

Reemplaza el cálculo de V7 (generate_real_noise_security.py), que:
  - sumaba TODAS las filas del CSV, incluyendo "Vialidad" (siniestros viales)
    y "Amenazas", que no son hurtos ni robos;
  - promediaba 2020-2025 (incluye años de pandemia);
  - dividía por km² con min-max sobre log1p, de modo que los barrios grandes
    y poco densos (Villa Lugano, Villa Soldati) salían "seguros" aunque
    tuvieran muchos hechos y mucha violencia con arma.

Metodología (decisión del 10/10/2026; ver nidio-mapas-calor-hallazgos-datasets):
  1. Se usan solo los tipos Hurto, Robo, Lesiones y Homicidios, y solo filas
     con barrio. Se promedia por año sobre los CSV recibidos (por defecto
     2023, 2024 y 2025).
  2. VOLUMEN (exposición): hechos ponderados por tipo / km² del barrio.
     Pesos: Hurto 1, Robo 3, Lesiones 3, Homicidios 10.
  3. GRAVEDAD: proporción de hechos con uso de arma (columna uso_arma = SI).
  4. riesgo = 0,5 * percentil(volumen) + 0,5 * percentil(gravedad).
     Los pesos 50/50 son el supuesto neutro (no hay datos para estimarlos);
     se informa la sensibilidad con 70/30 y solo volumen.
  5. security_index (0-100, más alto = más seguro) = 100 - percentil(riesgo)
     + 100/n, redondeado a 1 decimal. crime_count = hechos por año (tipos
     filtrados), para mostrar en el mapa.

Entradas: CSV de Delitos + las geometrías de barrio de V7 (se leen del archivo
de migración, no hace falta internet). Salidas:
  - backend/src/main/resources/db/migration/V38__recalibrate_security_index.sql
    (UPDATE por nombre de barrio; no toca la geometría de security_zone)
  - docs/datos/seguridad_indice_2023_2025.csv (tabla para el informe)

Uso (desde la raíz del repo):
    python ml-service/scripts/recalibrate_security.py RUTA/delitos_2023.csv RUTA/delitos_2024.csv "RUTA/delitos_2025(1).csv"
Opciones: --solo-csv  no genera la migración, solo la tabla.
"""

import argparse
import re
import sys
import unicodedata
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd
from shapely import wkt

REPO = Path(__file__).resolve().parents[2]
V7 = REPO / "backend/src/main/resources/db/migration/V7__real_noise_security.sql"
OUT_MIGRATION = REPO / "backend/src/main/resources/db/migration/V38__recalibrate_security_index.sql"
OUT_CSV = REPO / "docs/datos/seguridad_indice_2023_2025.csv"
METRIC_CRS = 32721

# Mismo orden que generate_real_noise_security.py (así V7 inserta una fila de
# security_zone por barrio en este orden).
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
ALIASES = {"La Boca": "BOCA", "Villa General Mitre": "VILLA GRAL. MITRE", "La Paternal": "PATERNAL"}
TIPOS = {"Hurto": 1, "Robo": 3, "Lesiones": 3, "Homicidios": 10}
W_VOLUMEN = 0.5  # peso del volumen; la gravedad pesa (1 - W_VOLUMEN)


def normalize(name: str) -> str:
    nfkd = unicodedata.normalize("NFKD", str(name))
    return "".join(c for c in nfkd if not unicodedata.combining(c)).upper().strip()


def load_areas() -> pd.DataFrame:
    text = V7.read_text(encoding="utf-8")
    rows = re.findall(
        r"INSERT INTO security_zone \(area, crime_count, security_index\) VALUES "
        r"\(ST_SetSRID\(ST_GeomFromText\('(.*?)'\), 4326\), \d+, [\d.]+\);", text)
    if len(rows) != len(NEIGHBORHOODS):
        sys.exit(f"V7 trae {len(rows)} zonas de seguridad y se esperaban {len(NEIGHBORHOODS)}.")
    gdf = gpd.GeoDataFrame({"barrio": NEIGHBORHOODS}, geometry=[wkt.loads(r) for r in rows], crs=4326)
    gdf["km2"] = gdf.to_crs(METRIC_CRS).area / 1e6
    gdf["key"] = [ALIASES.get(n, normalize(n)) for n in NEIGHBORHOODS]
    return gdf.drop(columns="geometry").set_index("key")


def load_delitos(paths) -> tuple[pd.DataFrame, int]:
    frames = [pd.read_csv(p, dtype=str, keep_default_na=False, na_values=["NULL"]) for p in paths]
    d = pd.concat(frames, ignore_index=True)
    d["cantidad"] = pd.to_numeric(d["cantidad"])
    years = d["anio"].nunique()
    d = d.dropna(subset=["barrio"])
    d = d[d["tipo"].isin(TIPOS)].copy()
    d["key"] = d["barrio"].map(normalize)
    d["peso"] = d["tipo"].map(TIPOS) * d["cantidad"]
    return d, years


def pct(s: pd.Series) -> pd.Series:
    """Percentil 0-100 (el mayor valor = 100)."""
    return 100 * s.rank(pct=True)


def index_from_risk(risk: pd.Series) -> pd.Series:
    n = len(risk)
    return (100 - pct(risk) + 100 / n).clip(100 / n, 100).round(1)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("csv", nargs="+", help="CSV de Delitos (uno por año)")
    ap.add_argument("--solo-csv", action="store_true", help="no genera la migración")
    args = ap.parse_args()

    areas = load_areas()
    d, years = load_delitos(args.csv)
    print(f"Años en los CSV: {years}. Filas de hurto/robo/lesiones/homicidios con barrio: {len(d)}")

    missing = set(areas.index) - set(d["key"])
    extra = set(d["key"]) - set(areas.index)
    if missing or extra:
        sys.exit(f"Barrios sin match. Faltan: {missing}. Sobran: {extra}")

    t = areas.copy()
    t["hechos_anio"] = d.groupby("key")["cantidad"].sum() / years
    t["ponderado_anio"] = d.groupby("key")["peso"].sum() / years
    t["con_arma_anio"] = d[d["uso_arma"] == "SI"].groupby("key")["cantidad"].sum() / years
    t["pct_con_arma"] = 100 * t["con_arma_anio"] / t["hechos_anio"]
    t["volumen_km2"] = t["ponderado_anio"] / t["km2"]

    p_vol, p_grav = pct(t["volumen_km2"]), pct(t["pct_con_arma"])
    t["indice_solo_volumen"] = index_from_risk(p_vol)
    t["indice_70_30"] = index_from_risk(0.7 * p_vol + 0.3 * p_grav)
    t["security_index"] = index_from_risk(W_VOLUMEN * p_vol + (1 - W_VOLUMEN) * p_grav)
    t["crime_count"] = t["hechos_anio"].round().astype(int)

    out = t.reset_index(drop=True)[
        ["barrio", "km2", "crime_count", "pct_con_arma", "volumen_km2",
         "indice_solo_volumen", "indice_70_30", "security_index"]
    ].sort_values("security_index")
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    out.round(2).to_csv(OUT_CSV, index=False, encoding="utf-8-sig")
    print(out.round(1).to_string(index=False))
    print(f"\nTabla: {OUT_CSV}")
    rho = out[["indice_solo_volumen", "indice_70_30", "security_index"]].corr(method="spearman")
    print("Correlación de Spearman entre variantes:\n", rho.round(2))

    if args.solo_csv:
        return
    values = ",\n".join(
        f"        ('{r['barrio'].replace(chr(39), chr(39) * 2)}', {int(r['crime_count'])}, {r['security_index']})"
        for _, r in t.iterrows()
    )
    lines = [
        "-- Recalibra el índice de seguridad por barrio (Delitos 2023-2025, BA Data).",
        "-- Generado con ml-service/scripts/recalibrate_security.py. Solo hurto, robo,",
        "-- lesiones y homicidios; índice = 50 % volumen (hechos ponderados por km²) +",
        "-- 50 % gravedad (proporción con arma). crime_count = hechos por año.",
        "-- No toca la geometría: actualiza cada zona por su barrio (neighborhood_id, V9).",
        "-- Si alguna zona no queda vinculada a su barrio, la migración falla a propósito.",
        "DO $$",
        "DECLARE",
        "    updated INT;",
        "BEGIN",
        "    WITH nuevos(name, crime_count, security_index) AS (",
        "        VALUES",
        values,
        "    ), upd AS (",
        "        UPDATE security_zone sz",
        "        SET crime_count = v.crime_count, security_index = v.security_index",
        "        FROM nuevos v JOIN neighborhood n ON n.name = v.name",
        "        WHERE sz.neighborhood_id = n.id",
        "        RETURNING sz.id",
        "    )",
        f"    SELECT count(*) INTO updated FROM upd;",
        f"    IF updated <> {len(t)} THEN",
        f"        RAISE EXCEPTION 'Se actualizaron % zonas de seguridad y se esperaban {len(t)}', updated;",
        "    END IF;",
        "END $$;",
    ]
    OUT_MIGRATION.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Migración: {OUT_MIGRATION}")


if __name__ == "__main__":
    main()
