"""Reemplaza los valores sintéticos de ruido y seguridad por datos reales.

Contexto: `noise_zone` y `security_zone` venían con valores inventados por el
equipo (ver `generate_barrio_boundaries.py` / `generate_remaining_barrios.py`,
que sí ya usan geometría real pero ruido/seguridad ilustrativos). El informe
formal del proyecto (Entrega 25%) especifica dos fuentes reales de Buenos
Aires Data para estas dos variables:

- Seguridad → dataset "Delitos" (Ministerio de Justicia y Seguridad).
  https://data.buenosaires.gob.ar/dataset/delitos
  CSV anual con una fila por incidente y columna `barrio` ya en mayúsculas
  sin acentos, lista para agrupar sin join espacial.

- Ruido → dataset "Mapa de Ruido" (Secretaría de Ambiente / APrA / DGEVA).
  https://data.buenosaires.gob.ar/dataset/mapa-ruido
  Mediciones de decibeles por eje vial (líneas), no por barrio. Se usa el
  recurso 2025 (GeoJSON) y se agrega a nivel de barrio con un promedio
  ponderado por longitud del tramo que cae dentro de cada polígono.

Metodología
-----------
Seguridad:
  1. Se descargan los CSV anuales de Delitos disponibles (2020-2025, se
     saltea el año que no exista) y se suma la columna `cantidad` por barrio.
  2. `crime_count` guardado en la DB = promedio anual (total / años usados),
     para que el número sea interpretable ("delitos por año", no un
     acumulado de varios años).
  3. Se calcula densidad = crime_count anual / área del barrio (km²), usando
     la geometría real oficial (mismo dataset "Barrios" que ya usan los
     otros dos scripts).
  4. `security_index` (0-100, más alto = más seguro) = normalización
     min-max de `log1p(densidad)` invertida y recortada a [5, 95] para que
     ningún barrio quede exactamente en el extremo.

Ruido:
  1. Se descargan los tramos de calle con nivel de ruido diurno (dataset
     2025, GeoJSON).
  2. Para cada barrio se recorta la capa de líneas contra su polígono (con
     un buffer chico para no perder calles justo en el límite) y se calcula
     el promedio de dB ponderado por la longitud de cada tramo dentro del
     polígono.
  3. Barrios sin ningún tramo cercano (puede pasar en zonas con cobertura
     rala del relevamiento) quedan con el promedio general de la ciudad, y
     se avisa por consola cuáles fueron.

Ambas partes son independientes: si la parte de ruido falla (el dataset es
más pesado y a veces tarda en descargar), la migración generada igual
reemplaza seguridad, y se puede correr el script de nuevo más tarde sólo
para ruido.

Requiere conexión a internet normal (mismo motivo que los scripts previos:
el sandbox de Claude tiene la red restringida y no llega a estos dominios).
Correr localmente:

    cd ml-service
    source .venv/bin/activate
    python scripts/generate_real_noise_security.py

Output: backend/src/main/resources/db/migration/V7__real_noise_security.sql
"""

import os
import sys
import unicodedata
from pathlib import Path

try:
    import certifi
    os.environ.setdefault("SSL_CERT_FILE", certifi.where())
    os.environ.setdefault("SSL_CERT_DIR", os.path.dirname(certifi.where()))
    os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())
    os.environ.setdefault("CURL_CA_BUNDLE", certifi.where())
except ImportError:
    print(
        "Aviso: 'certifi' no está instalado. Si falla con "
        "CERTIFICATE_VERIFY_FAILED, corré: pip install certifi",
        file=sys.stderr,
    )

import math

import geopandas as gpd
import numpy as np
import pandas as pd

BARRIOS_URL = "https://cdn.buenosaires.gob.ar/datosabiertos/datasets/barrios/barrios.geojson"

DELITOS_URL_TEMPLATE = (
    "https://cdn.buenosaires.gob.ar/datosabiertos/datasets/"
    "ministerio-de-justicia-y-seguridad/delitos/delitos_{year}.csv"
)
DELITOS_YEARS = [2020, 2021, 2022, 2023, 2024, 2025]

# Recurso "2025 - Medición de Ruido Diurno (GEOJSON)" del dataset Mapa de
# Ruido. Si el link de descarga cambia, buscar el recurso vigente en
# https://data.buenosaires.gob.ar/dataset/mapa-ruido y pasar la URL (o un
# archivo local ya descargado) como primer argumento del script.
RUIDO_URL = (
    "https://data.buenosaires.gob.ar/dataset/mapa-ruido/resource/"
    "211df56e-8601-4b5d-9057-dafff499ce13/download"
)

# Buffer en grados (~25 m) para no perder calles justo en el límite del
# barrio al recortar la capa de ruido.
NEIGHBORHOOD_BUFFER = 0.00025

# CRS métrico para calcular longitudes/áreas en Buenos Aires con precisión.
METRIC_CRS = 32721  # WGS84 / UTM zone 21S

OUTPUT_PATH = (
    Path(__file__).resolve().parents[2]
    / "backend" / "src" / "main" / "resources" / "db" / "migration"
    / "V7__real_noise_security.sql"
)

# Los 48 barrios oficiales de CABA, con el mismo criterio de alias que ya
# usaron generate_barrio_boundaries.py / generate_remaining_barrios.py para
# matchear contra el dataset oficial "Barrios".
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

# Alias BARRIO->clave oficial cuando el dataset no usa un normalize() simple.
BARRIO_ALIASES = {
    "La Boca": "BOCA",
    "Villa General Mitre": "VILLA GRAL. MITRE",
    "La Paternal": "PATERNAL",
}

# Alias específicos del dataset de Delitos (columna `barrio`), por si difiere
# del dataset "Barrios". Se completa según lo que reporte la corrida real.
DELITOS_ALIASES = {
    "La Boca": "BOCA",
    "Villa General Mitre": "VILLA GRAL. MITRE",
    "La Paternal": "PATERNAL",
}


def normalize(name: str) -> str:
    nfkd = unicodedata.normalize("NFKD", name)
    ascii_name = "".join(c for c in nfkd if not unicodedata.combining(c))
    return ascii_name.upper().strip()


def load_barrio_geometries():
    """Devuelve {nombre_seed: (geometry_4326, area_km2)} usando el dataset oficial."""
    print(f"Leyendo geometría oficial de barrios: {BARRIOS_URL}")
    gdf = gpd.read_file(BARRIOS_URL)
    if gdf.crs is not None and gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(4326)
    gdf["_key"] = gdf["BARRIO"].apply(normalize)
    by_key = {row["_key"]: row.geometry for _, row in gdf.iterrows()}

    result = {}
    missing = []
    for name in NEIGHBORHOODS:
        key = BARRIO_ALIASES.get(name, normalize(name))
        geom = by_key.get(key)
        if geom is None:
            missing.append(name)
            continue
        if geom.geom_type == "MultiPolygon":
            geom = max(geom.geoms, key=lambda g: g.area)
        area_km2 = (
            gpd.GeoSeries([geom], crs=4326).to_crs(METRIC_CRS).area.iloc[0] / 1_000_000
        )
        result[name] = (geom, area_km2)

    if missing:
        print(f"Aviso: {len(missing)} barrios sin geometría oficial (se saltean): {missing}")
    return result


def load_delitos():
    """Suma `cantidad` por barrio, sobre todos los años disponibles."""
    counts = {}
    years_used = 0
    for year in DELITOS_YEARS:
        url = DELITOS_URL_TEMPLATE.format(year=year)
        try:
            df = pd.read_csv(url)
        except Exception as exc:  # noqa: BLE001 - reporte simple para el usuario
            print(f"  Delitos {year}: no disponible ({exc})")
            continue
        years_used += 1
        df = df.dropna(subset=["barrio"])
        df["_key"] = df["barrio"].astype(str).apply(normalize)
        grouped = df.groupby("_key")["cantidad"].sum()
        for key, cantidad in grouped.items():
            counts[key] = counts.get(key, 0) + float(cantidad)
        print(f"  Delitos {year}: OK ({len(df)} filas con barrio)")

    if years_used == 0:
        raise RuntimeError("No se pudo descargar ningún año del dataset de Delitos.")

    print(f"Años de Delitos usados: {years_used}")
    return counts, years_used


def compute_security(barrio_geoms):
    print("\n--- Seguridad (Delitos) ---")
    counts, years_used = load_delitos()

    rows = {}
    unmatched = []
    for name, (geom, area_km2) in barrio_geoms.items():
        key = DELITOS_ALIASES.get(name, normalize(name))
        total = counts.get(key)
        if total is None:
            unmatched.append(name)
            continue
        avg_annual = total / years_used
        density = avg_annual / area_km2 if area_km2 > 0 else 0.0
        rows[name] = {"geom": geom, "avg_annual": avg_annual, "density": density}

    if unmatched:
        import difflib
        all_keys = sorted(counts.keys())
        print("Barrios sin match en Delitos (quedan sin actualizar seguridad):")
        for name in unmatched:
            key = DELITOS_ALIASES.get(name, normalize(name))
            candidates = difflib.get_close_matches(key, all_keys, n=3, cutoff=0.5)
            suggestion = f" (¿'{candidates[0]}'?)" if candidates else ""
            print(f"  - {name}{suggestion}")

    if not rows:
        raise RuntimeError("No se pudo calcular seguridad para ningún barrio.")

    log_densities = {name: math.log1p(r["density"]) for name, r in rows.items()}
    min_ld, max_ld = min(log_densities.values()), max(log_densities.values())
    span = max_ld - min_ld or 1.0

    for name, r in rows.items():
        pct = (log_densities[name] - min_ld) / span
        index = 100 * (1 - pct)
        r["security_index"] = round(min(95.0, max(5.0, index)), 1)
        r["crime_count"] = round(r["avg_annual"])

    print(f"Seguridad calculada para {len(rows)}/{len(barrio_geoms)} barrios.")
    return rows


def detect_noise_field(columns):
    keywords = ["laeq", "leq", "db", "nivel", "ruido", "decibel"]
    for col in columns:
        col_l = col.lower()
        if any(k in col_l for k in keywords):
            return col
    return None


def compute_noise(barrio_geoms):
    print("\n--- Ruido (Mapa de Ruido) ---")
    source = sys.argv[1] if len(sys.argv) > 1 else RUIDO_URL
    print(f"Leyendo {source} ...")
    lines = gpd.read_file(source)
    if lines.crs is not None and lines.crs.to_epsg() != 4326:
        lines = lines.to_crs(4326)

    print(f"Columnas encontradas: {list(lines.columns)}")

    # Filtra al período diurno si el recurso trae ambos (por las dudas; el
    # recurso 2025 que usamos por default ya es sólo diurno).
    periodo_col = next((c for c in lines.columns if c.lower() == "periodo"), None)
    if periodo_col is not None:
        mask = lines[periodo_col].astype(str).str.lower().str.contains("diurno")
        if mask.any():
            lines = lines[mask]

    # El recurso real trae un rango (dba_low/dba_high) en vez de un valor
    # puntual de dB. Usamos el punto medio del rango como nivel representativo.
    low_col = next((c for c in lines.columns if c.lower() == "dba_low"), None)
    high_col = next((c for c in lines.columns if c.lower() == "dba_high"), None)
    if low_col is not None and high_col is not None:
        lines["_noise_value"] = (
            pd.to_numeric(lines[low_col], errors="coerce")
            + pd.to_numeric(lines[high_col], errors="coerce")
        ) / 2
        field = "_noise_value"
        print(f"Usando punto medio de '{low_col}'/'{high_col}' como nivel de ruido.")
    else:
        field = os.environ.get("NOISE_FIELD") or detect_noise_field(lines.columns)
        if field is None:
            raise RuntimeError(
                "No pude detectar automáticamente la columna de decibeles. "
                "Volvé a correr con NOISE_FIELD=<nombre_columna> python scripts/... "
                "usando uno de los nombres de la lista de arriba."
            )
        lines[field] = pd.to_numeric(lines[field], errors="coerce")
        print(f"Usando columna de nivel de ruido: '{field}'")

    lines = lines[[field, "geometry"]].dropna(subset=[field, "geometry"])
    lines_metric = lines.to_crs(METRIC_CRS)

    rows = {}
    no_match = []
    city_weighted_sum = 0.0
    city_weight = 0.0

    for name, (geom, _area_km2) in barrio_geoms.items():
        buffered = gpd.GeoSeries([geom.buffer(NEIGHBORHOOD_BUFFER)], crs=4326).to_crs(METRIC_CRS).iloc[0]
        clipped = lines_metric[lines_metric.geometry.intersects(buffered)].copy()
        if clipped.empty:
            no_match.append(name)
            continue
        clipped["_len"] = clipped.geometry.intersection(buffered).length
        clipped = clipped[clipped["_len"] > 0]
        if clipped.empty:
            no_match.append(name)
            continue
        weighted_avg = float(np.average(clipped[field], weights=clipped["_len"]))
        rows[name] = weighted_avg
        city_weighted_sum += (clipped[field] * clipped["_len"]).sum()
        city_weight += clipped["_len"].sum()

    city_avg = city_weighted_sum / city_weight if city_weight > 0 else None
    if no_match:
        print(f"Barrios sin tramos cercanos ({len(no_match)}), se usa el promedio de la ciudad:")
        for name in no_match:
            print(f"  - {name}")
            if city_avg is not None:
                rows[name] = city_avg

    print(f"Ruido calculado para {len(rows)}/{len(barrio_geoms)} barrios.")
    return rows


def main() -> None:
    barrio_geoms = load_barrio_geometries()

    security_rows = None
    security_error = None
    try:
        security_rows = compute_security(barrio_geoms)
    except Exception as exc:  # noqa: BLE001
        security_error = exc
        print(f"\nERROR calculando seguridad: {exc}")

    noise_rows = None
    noise_error = None
    try:
        noise_rows = compute_noise(barrio_geoms)
    except Exception as exc:  # noqa: BLE001
        noise_error = exc
        print(f"\nERROR calculando ruido: {exc}")

    if security_rows is None and noise_rows is None:
        print("\nNo se generó ninguna migración: fallaron ambas partes.")
        sys.exit(1)

    lines_out = [
        "-- Reemplaza los valores sintéticos de ruido/seguridad por datos reales",
        "-- (Delitos y Mapa de Ruido, Buenos Aires Data), agregados por barrio",
        "-- sobre la geometría real ya cargada en V5/V6.",
        "-- Generado con ml-service/scripts/generate_real_noise_security.py",
        "",
    ]

    if security_rows:
        lines_out.append("-- 1) Seguridad: promedio anual de delitos (Delitos, BA Data) por barrio,")
        lines_out.append("--    normalizado por densidad (delitos/km2) a un índice 0-100.")
        lines_out.append("DELETE FROM security_zone;")
        for name, r in security_rows.items():
            escaped = name.replace("'", "''")
            geom_sql = f"ST_SetSRID(ST_GeomFromText('{r['geom'].wkt}'), 4326)"
            lines_out.append(
                f"INSERT INTO security_zone (area, crime_count, security_index) VALUES "
                f"({geom_sql}, {r['crime_count']}, {r['security_index']});"
            )
        lines_out.append("")
    else:
        lines_out.append(f"-- Seguridad NO actualizada (falló el cálculo: {security_error}).")
        lines_out.append("")

    if noise_rows:
        lines_out.append("-- 2) Ruido: promedio de dB ponderado por longitud de tramo (Mapa de")
        lines_out.append("--    Ruido, BA Data, medición diurna 2025) dentro de cada barrio.")
        lines_out.append("DELETE FROM noise_zone;")
        for name, db_value in noise_rows.items():
            geom, _ = barrio_geoms[name]
            geom_sql = f"ST_SetSRID(ST_GeomFromText('{geom.wkt}'), 4326)"
            lines_out.append(
                f"INSERT INTO noise_zone (area, noise_level) VALUES "
                f"({geom_sql}, {round(db_value, 1)});"
            )
        lines_out.append("")
    else:
        lines_out.append(f"-- Ruido NO actualizado (falló el cálculo: {noise_error}).")
        lines_out.append("")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text("\n".join(lines_out) + "\n", encoding="utf-8")
    print(f"\nGenerado: {OUTPUT_PATH}")
    if security_rows:
        print(f"  Seguridad: {len(security_rows)} barrios actualizados.")
    if noise_rows:
        print(f"  Ruido: {len(noise_rows)} barrios actualizados.")


if __name__ == "__main__":
    main()
