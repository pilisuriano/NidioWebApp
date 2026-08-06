"""Genera una migración Flyway que completa los 28 barrios de CABA que faltan.

Contexto: `V2__seed_synthetic_caba.sql` (la seed original del proyecto) solo
cargó 20 de los 48 barrios oficiales de la Ciudad de Buenos Aires. Los otros
28 (Chacarita, Liniers, Mataderos, Villa Lugano, Constitución, etc.) nunca
tuvieron `neighborhood`, precio, ruido, seguridad ni propiedades — por eso
quedaban en blanco en el mapa.

Este script agrega esos 28 barrios con el mismo criterio que ya se usa para
los otros 20 (ver `generate_barrio_boundaries.py`, que ya corriste):
- Geometría real (Buenos Aires Data, dataset "Barrios").
- Precio/m² (SALE/RENT), ruido (dB) y seguridad (índice 0-100) sintéticos
  ilustrativos — no relevamiento real, igual que el resto de los datos
  hasta que exista el pipeline con Kaggle/IDECBA.
- Propiedades sintéticas: reutiliza EXACTAMENTE el mismo generador
  procedural de V2 (calles, fotos, ubicación aleatoria dentro del polígono,
  precio derivado del precio/m²), pero acotado a estos 28 barrios nuevos
  para no duplicar las propiedades que V2 ya creó para los otros 20.

Requiere conexión a internet (mismo motivo que el otro script: el sandbox
de Claude no llega a cdn.buenosaires.gob.ar). Correr localmente:

    cd ml-service
    source .venv/bin/activate
    python scripts/generate_remaining_barrios.py

Output: backend/src/main/resources/db/migration/V6__complete_all_caba_barrios.sql
"""

import difflib
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

import geopandas as gpd

SOURCE_URL = "https://cdn.buenosaires.gob.ar/datosabiertos/datasets/barrios/barrios.geojson"

# Los 28 barrios de CABA que V2 nunca cargó. Mismo formato que la tabla de
# NOISE_SECURITY del otro script: (sale_usd_m2, rent_ars_m2, noise_db, security_index).
# Sintético/ilustrativo (informado por percepción general de cada zona:
# barrios del sur/oeste más económicos y con índice de seguridad más bajo,
# barrios residenciales tranquilos del norte con valores más altos), NO
# relevamiento real — mismo criterio que ya usó el equipo para los otros 20.
REMAINING = {
    #                       sale   rent    noise  security
    "Agronomía":          (2200,  11000,  55.0,  78.0),
    "Chacarita":          (2500,  12500,  68.0,  65.0),
    "Coghlan":            (2400,  11800,  56.0,  80.0),
    "Constitución":       (1500,   8500,  78.0,  35.0),
    "Floresta":           (1800,   9500,  66.0,  58.0),
    "La Paternal":        (2000,  10200,  64.0,  62.0),
    "Liniers":            (1600,   8800,  70.0,  52.0),
    "Mataderos":          (1500,   8200,  62.0,  55.0),
    "Monte Castro":       (1900,   9800,  60.0,  65.0),
    "Nueva Pompeya":      (1300,   7500,  72.0,  40.0),
    "Parque Avellaneda":  (1600,   8600,  64.0,  55.0),
    "Parque Chacabuco":   (1900,   9700,  62.0,  62.0),
    "Parque Chas":        (2100,  10500,  54.0,  75.0),
    "Parque Patricios":   (1700,   9000,  68.0,  50.0),
    "Saavedra":           (2300,  11500,  56.0,  78.0),
    "San Cristóbal":      (1700,   9200,  74.0,  45.0),
    "Vélez Sarsfield":    (1700,   9000,  62.0,  58.0),
    "Versalles":          (1700,   9000,  58.0,  65.0),
    "Villa del Parque":   (2200,  11200,  62.0,  68.0),
    "Villa General Mitre": (2100, 10800,  60.0,  68.0),
    "Villa Lugano":       (1200,   7000,  66.0,  32.0),
    "Villa Luro":         (1700,   9000,  64.0,  58.0),
    "Villa Ortúzar":      (2200,  11000,  58.0,  72.0),
    "Villa Pueyrredón":   (2000,  10200,  58.0,  70.0),
    "Villa Real":         (1700,   9000,  58.0,  65.0),
    "Villa Riachuelo":    (1200,   7000,  70.0,  33.0),
    "Villa Santa Rita":   (1900,   9600,  62.0,  62.0),
    "Villa Soldati":      (1200,   7000,  68.0,  30.0),
}

SIMPLIFY_TOLERANCE = 0.00015

OUTPUT_PATH = (
    Path(__file__).resolve().parents[2]
    / "backend" / "src" / "main" / "resources" / "db" / "migration"
    / "V6__complete_all_caba_barrios.sql"
)

# El dataset oficial no siempre usa el artículo ("BOCA" en vez de "LA BOCA",
# mismo patrón que ya vimos con La Boca en el otro script).
ALIASES = {
    "La Paternal": "PATERNAL",
    "Villa General Mitre": "VILLA GRAL. MITRE",
}


def normalize(name: str) -> str:
    nfkd = unicodedata.normalize("NFKD", name)
    ascii_name = "".join(c for c in nfkd if not unicodedata.combining(c))
    return ascii_name.upper().strip()


def lookup_key(name: str) -> str:
    return ALIASES.get(name, normalize(name))


def resolve_geometry(row):
    geom = row.geometry
    if geom.geom_type == "MultiPolygon":
        geom = max(geom.geoms, key=lambda g: g.area)
    return geom.simplify(SIMPLIFY_TOLERANCE, preserve_topology=True)


PROPERTY_GENERATOR_TEMPLATE = """
-- 5) Propiedades sintéticas para estos barrios nuevos (mismo generador que
--    V2__seed_synthetic_caba.sql, acotado a los barrios de este archivo para
--    no duplicar lo que V2 ya generó para los otros 20).
WITH streets(idx, name) AS (
    VALUES
        (0, 'Av. Rivadavia'), (1, 'Av. San Martín'), (2, 'Av. Directorio'), (3, 'Av. Juan B. Justo'),
        (4, 'Av. Warnes'), (5, 'Av. Álvarez Jonte'), (6, 'Av. Gaona'), (7, 'Av. Eva Perón'),
        (8, 'Av. Cruz'), (9, 'Av. Corrientes'), (10, 'Av. Triunvirato'), (11, 'Av. de los Constituyentes')
),
images(idx, url) AS (
    VALUES
        (0, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800&h=500'),
        (1, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800&h=500'),
        (2, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800&h=500'),
        (3, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800&h=500'),
        (4, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800&h=500'),
        (5, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800&h=500'),
        (6, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800&h=500'),
        (7, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800&h=500')
),
base AS (
    SELECT n.id AS neighborhood_id,
           n.name AS neighborhood_name,
           n.boundary,
           op.operation_type,
           g.i,
           (n.id * 7 + g.i * 3 + CASE WHEN op.operation_type = 'SALE' THEN 0 ELSE 1 END) AS k,
           p.avg_price_m2
    FROM neighborhood n
    CROSS JOIN (VALUES ('SALE'), ('RENT')) AS op(operation_type)
    CROSS JOIN generate_series(1, 2) AS g(i)
    JOIN neighborhood_price_m2 p
      ON p.neighborhood_id = n.id
     AND p.operation_type = op.operation_type
     AND p.period = DATE '2026-06-01'
    WHERE n.name IN ({barrio_names_sql})
),
calc AS (
    SELECT b.*,
           (ARRAY['APARTMENT', 'APARTMENT', 'APARTMENT', 'HOUSE', 'PH'])[1 + b.k % 5] AS property_type,
           1 + (b.k % 4) AS rooms
    FROM base b
),
calc2 AS (
    SELECT c.*,
           ROUND((28 + c.rooms * 24 + random() * 18)::numeric, 0) AS surface_m2
    FROM calc c
)
INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location,
                      surface_m2, rooms, price, image_url,
                      valuation_range_min, valuation_range_max, life_score)
SELECT
    format('%s %s amb en %s',
           CASE c.property_type WHEN 'APARTMENT' THEN 'Depto' WHEN 'HOUSE' THEN 'Casa' ELSE 'PH' END,
           c.rooms, c.neighborhood_name),
    c.property_type,
    c.operation_type,
    c.neighborhood_id,
    format('%s %s', s.name, 300 + (c.k * 137) % 3400),
    ST_GeometryN(ST_GeneratePoints(c.boundary, 1, (c.k + 1)::int), 1),
    c.surface_m2,
    c.rooms,
    ROUND((c.avg_price_m2 * c.surface_m2 * (0.88 + random() * 0.24))::numeric, 0),
    i.url,
    ROUND((c.avg_price_m2 * c.surface_m2 * 0.93)::numeric, 0),
    ROUND((c.avg_price_m2 * c.surface_m2 * 1.07)::numeric, 0),
    ROUND((55 + random() * 40)::numeric, 1)
FROM calc2 c
JOIN streets s ON s.idx = c.k % 12
JOIN images i ON i.idx = c.k % 8;
"""


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
    for name in REMAINING:
        row = by_key.get(lookup_key(name))
        if row is None:
            missing.append(name)
            continue
        resolved[name] = resolve_geometry(row)

    if not resolved:
        print("No se pudo resolver ningún barrio, no se generó nada.")
        return

    lines = [
        "-- Completa los 28 barrios de CABA que V2 nunca cargó.",
        "-- Generado con ml-service/scripts/generate_remaining_barrios.py",
        "",
        "-- 1) Barrios (geometría real, fuente: Buenos Aires Data).",
    ]
    for name, geom in resolved.items():
        escaped_name = name.replace("'", "''")
        lines.append(
            f"INSERT INTO neighborhood (name, boundary) VALUES "
            f"('{escaped_name}', ST_SetSRID(ST_GeomFromText('{geom.wkt}'), 4326));"
        )

    lines += [
        "",
        "-- 2) Precio por m² (SALE en USD, RENT en ARS/mes; 2 períodos, igual que V2).",
        "WITH precios(name, sale_usd_m2, rent_ars_m2) AS (",
        "    VALUES",
    ]
    price_rows = []
    for name in resolved:
        sale, rent, _, _ = REMAINING[name]
        escaped_name = name.replace("'", "''")
        price_rows.append(f"        ('{escaped_name}', {sale}, {rent})")
    lines.append(",\n".join(price_rows))
    lines += [
        ")",
        "INSERT INTO neighborhood_price_m2 (neighborhood_id, operation_type, avg_price_m2, period)",
        "SELECT n.id, op.operation_type,",
        "       ROUND((CASE WHEN op.operation_type = 'SALE' THEN p.sale_usd_m2 ELSE p.rent_ars_m2 END) * per.factor, 2),",
        "       per.period",
        "FROM precios p",
        "JOIN neighborhood n ON n.name = p.name",
        "CROSS JOIN (VALUES ('SALE'), ('RENT')) AS op(operation_type)",
        "CROSS JOIN (VALUES (DATE '2026-05-01', 0.97), (DATE '2026-06-01', 1.00)) AS per(period, factor);",
        "",
        "-- 3) Ruido y seguridad: una zona por barrio, misma geometría real.",
    ]
    for name, geom in resolved.items():
        noise_db, security_index = REMAINING[name][2], REMAINING[name][3]
        crime_count = round((100 - security_index) * 8)
        area_sql = f"ST_SetSRID(ST_GeomFromText('{geom.wkt}'), 4326)"
        lines.append(
            f"INSERT INTO noise_zone (area, noise_level) VALUES "
            f"({area_sql}, {noise_db});"
        )
        lines.append(
            f"INSERT INTO security_zone (area, crime_count, security_index) VALUES "
            f"({area_sql}, {crime_count}, {security_index});"
        )

    barrio_names_sql = ", ".join(f"'{name.replace(chr(39), chr(39) * 2)}'" for name in resolved)
    lines.append(PROPERTY_GENERATOR_TEMPLATE.format(barrio_names_sql=barrio_names_sql))

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Generado: {OUTPUT_PATH}")
    print(f"Barrios agregados: {len(resolved)}/{len(REMAINING)}")
    if missing:
        all_keys = sorted(by_key.keys())
        print("No encontrados por nombre exacto en el dataset oficial:")
        for name in missing:
            candidates = difflib.get_close_matches(normalize(name), all_keys, n=3, cutoff=0.5)
            suggestion = f" (¿'{candidates[0]}'?)" if candidates else ""
            print(f"  - {name}{suggestion}")
        print("Esos barrios NO se agregaron esta vez. Avisame el nombre exacto y lo mapeo.")


if __name__ == "__main__":
    main()
