"""Genera una migración Flyway con datos geoespaciales reales para CABA.

Contexto: en `V2__seed_synthetic_caba.sql` los polígonos de `neighborhood.boundary`
se crearon con `ST_MakeEnvelope` (rectángulos simples centrados en el centroide de
cada barrio), y las zonas de `noise_zone`/`security_zone` se crearon como otro set
de rectángulos sueltos tipo "corredor de avenida" que no respetan ningún límite
reconocible. Visualmente no calzan con la forma real de los barrios que muestra el
mapa base de OpenStreetMap, lo que hacía ilegibles las tres capas del mapa en el
frontend (se veían como bloques/manchas sin relación con la geografía real).

Este script:
1. Reemplaza `neighborhood.boundary` por el polígono oficial de cada barrio.
2. Reemplaza `noise_zone` y `security_zone` (que no tenían relación 1:1 con
   los barrios) por una zona por barrio, usando la misma geometría real, con
   valores sintéticos ilustrativos (no relevamiento real de campo — igual que
   el resto de los datos hasta que exista el pipeline real).

No toca precios (`neighborhood_price_m2`) ni el catálogo de propiedades.

Fuente oficial de geometría: Buenos Aires Data (GCBA), dataset "Barrios".
https://data.buenosaires.gob.ar/dataset/barrios

Requiere conexión a internet. El sandbox donde corre Claude tiene la red
restringida a un allowlist y NO puede descargar este archivo, por eso hay
que correrlo localmente (o en un entorno con salida a internet normal):

    cd ml-service
    source .venv/bin/activate
    python scripts/generate_barrio_boundaries.py

Si la lectura directa por URL falla (algunos entornos no tienen el driver
HTTP de GDAL habilitado), descargá el GeoJSON a mano desde
https://data.buenosaires.gob.ar/dataset/barrios (botón de descarga "GeoJSON")
y pasá la ruta local como argumento:

    python scripts/generate_barrio_boundaries.py ruta/al/barrios.geojson

Output: backend/src/main/resources/db/migration/V5__real_barrio_boundaries.sql
"""

import difflib
import os
import sys
import unicodedata
from pathlib import Path

# Fix típico de macOS con Python de python.org: no encuentra los certificados
# raíz del sistema y la descarga por HTTPS falla con CERTIFICATE_VERIFY_FAILED.
# Le decimos explícitamente que use el bundle de certificados de `certifi`.
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

import geopandas as gpd

SOURCE_URL = "https://cdn.buenosaires.gob.ar/datosabiertos/datasets/barrios/barrios.geojson"

# Ruido (dB) y seguridad (índice 0-100, más alto = más seguro) por barrio.
# Sintético/ilustrativo, informado por percepción general de cada zona
# (misma lógica que ya usaba V2 para las zonas de avenidas/parques), pero
# ahora asociado a la forma real del barrio en vez de un rectángulo suelto.
# crime_count se deriva de security_index solo para mantener el campo poblado.
NOISE_SECURITY = {
    #                  noise_db  security_index
    "Palermo":         (68.0,    75.0),
    "Recoleta":        (70.0,    80.0),
    "Belgrano":        (62.0,    82.0),
    "Núñez":           (58.0,    83.0),
    "Colegiales":      (64.0,    78.0),
    "Villa Urquiza":   (60.0,    76.0),
    "Villa Crespo":    (66.0,    68.0),
    "Caballito":       (68.0,    70.0),
    "Almagro":         (70.0,    62.0),
    "Balvanera":       (78.0,    45.0),
    "San Telmo":       (72.0,    58.0),
    "Puerto Madero":   (55.0,    88.0),
    "Retiro":          (75.0,    55.0),
    "San Nicolás":     (80.0,    52.0),
    "Monserrat":       (78.0,    48.0),
    "Boedo":           (66.0,    60.0),
    "Flores":          (72.0,    55.0),
    "Barracas":        (74.0,    50.0),
    "La Boca":         (70.0,    38.0),
    "Villa Devoto":    (52.0,    74.0),
}

# Tolerancia de simplificación en grados (~15 m). Achica el polígono sin
# distorsionar la forma real del barrio a la escala en la que se ve el mapa.
SIMPLIFY_TOLERANCE = 0.00015

OUTPUT_PATH = (
    Path(__file__).resolve().parents[2]
    / "backend" / "src" / "main" / "resources" / "db" / "migration"
    / "V5__real_barrio_boundaries.sql"
)


# Casos donde el nombre del dataset oficial no es un simple normalize() del
# nombre sembrado en V2 (ej.: el oficial usa "BOCA", sin el artículo "La").
ALIASES = {
    "La Boca": "BOCA",
}


def normalize(name: str) -> str:
    """Mayúsculas y sin acentos, para poder comparar 'Núñez' con 'NUNEZ'."""
    nfkd = unicodedata.normalize("NFKD", name)
    ascii_name = "".join(c for c in nfkd if not unicodedata.combining(c))
    return ascii_name.upper().strip()


def lookup_key(name: str) -> str:
    return ALIASES.get(name, normalize(name))


def resolve_geometry(row):
    geom = row.geometry
    if geom.geom_type == "MultiPolygon":
        # Nos quedamos con la pieza más grande (evita islas/artefactos menores).
        geom = max(geom.geoms, key=lambda g: g.area)
    return geom.simplify(SIMPLIFY_TOLERANCE, preserve_topology=True)


def main() -> None:
    source = sys.argv[1] if len(sys.argv) > 1 else SOURCE_URL
    print(f"Leyendo {source} ...")
    gdf = gpd.read_file(source)

    if gdf.crs is not None and gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(4326)

    gdf["_key"] = gdf["BARRIO"].apply(normalize)
    by_key = {row["_key"]: row for _, row in gdf.iterrows()}

    resolved = {}
    missing = []
    for name in NOISE_SECURITY:
        row = by_key.get(lookup_key(name))
        if row is None:
            missing.append(name)
            continue
        resolved[name] = resolve_geometry(row)

    lines = [
        "-- Reemplaza los rectángulos placeholder de V2 por geometría real de CABA.",
        "-- Generado con ml-service/scripts/generate_barrio_boundaries.py",
        "",
        "-- 1) Límites de barrio (antes: rectángulo centrado en el centroide).",
        "--    Los barrios no encontrados en el dataset oficial conservan el",
        "--    rectángulo de V2 (no se tocan).",
    ]
    for name, geom in resolved.items():
        escaped_name = name.replace("'", "''")
        lines.append(
            f"UPDATE neighborhood SET boundary = "
            f"ST_SetSRID(ST_GeomFromText('{geom.wkt}'), 4326) "
            f"WHERE name = '{escaped_name}';"
        )

    lines += [
        "",
        "-- 2) Ruido y seguridad: antes eran rectángulos tipo 'corredor de avenida'",
        "--    sin relación con los barrios. Ahora una zona por barrio (misma forma",
        "--    real que 'neighborhood'), con valores sintéticos ilustrativos. Para",
        "--    los barrios sin match oficial, se reusa la geometría que haya quedado",
        "--    en 'neighborhood' (real si matcheó arriba, rectángulo viejo si no) en",
        "--    vez de dejarlos sin ninguna zona.",
        "DELETE FROM noise_zone;",
        "DELETE FROM security_zone;",
    ]
    for name, (noise_db, security_index) in NOISE_SECURITY.items():
        crime_count = round((100 - security_index) * 8)
        geom = resolved.get(name)
        if geom is not None:
            area_sql = f"ST_SetSRID(ST_GeomFromText('{geom.wkt}'), 4326)"
        else:
            escaped_name = name.replace("'", "''")
            area_sql = f"(SELECT boundary FROM neighborhood WHERE name = '{escaped_name}')"
        lines.append(
            f"INSERT INTO noise_zone (area, noise_level) VALUES "
            f"({area_sql}, {noise_db});"
        )
        lines.append(
            f"INSERT INTO security_zone (area, crime_count, security_index) VALUES "
            f"({area_sql}, {crime_count}, {security_index});"
        )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Generado: {OUTPUT_PATH}")
    print(f"Barrios con polígono real: {len(resolved)}/{len(NOISE_SECURITY)}")
    if missing:
        all_keys = sorted(by_key.keys())
        print("No encontrados por nombre exacto en el dataset oficial:")
        for name in missing:
            candidates = difflib.get_close_matches(normalize(name), all_keys, n=3, cutoff=0.5)
            suggestion = f" (¿'{candidates[0]}'?)" if candidates else ""
            print(f"  - {name}{suggestion}")
        print(
            "Esos barrios conservan su rectángulo viejo (ruido/seguridad lo heredan "
            "también, no quedan sin datos). Si la sugerencia de arriba es correcta, "
            "avisame el nombre exacto y lo agrego al mapeo."
        )


if __name__ == "__main__":
    main()
