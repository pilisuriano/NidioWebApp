"""Genera una migración Flyway con el polígono oficial del perímetro de CABA.

Contexto: `NeighborhoodService.getCabaBoundary()` (versión anterior) armaba el
contorno de toda la ciudad en el momento, uniendo el `boundary` de los ~48
barrios con JTS. Aun con buffer/dissolve para intentar disolver los bordes
compartidos, la línea del contorno quedaba con "rayas" por dentro del área:
los barrios vienen de una digitalización barrio por barrio (mismo dataset
"Barrios" que usa generate_barrio_boundaries.py), y sus bordes compartidos no
coinciden coordenada por coordenada, así que cualquier unión en vivo de esos
~48 polígonos es frágil (es un problema común de GIS, no un bug puntual de
una técnica de unión en particular).

La fuente correcta no es derivar el perímetro de los barrios, sino usar el
polígono oficial de límite de ciudad que publica Buenos Aires Data aparte,
como dataset propio ("Perímetro", distinto de "Barrios"):
https://data.buenosaires.gob.ar/dataset/perimetro

Este script:
1. Descarga ese GeoJSON (un único Feature, MultiPolygon).
2. Se queda con la pieza más grande si viene como MultiPolygon (mismo
   criterio que generate_barrio_boundaries.py: evita islas/artefactos
   menores -- CABA es un único polígono contiguo, así que esto no debería
   descartar nada real).
3. Simplifica con la misma tolerancia que los barrios (~15m, preserva
   topología) para no generar una migración enorme sin necesidad.
4. Genera un INSERT en la tabla `city_boundary` (V28__add_city_boundary.sql
   crea esa tabla; este script sí NO crea tablas, solo carga el dato).

Requiere conexión a internet. El sandbox donde corre Claude tiene la red
restringida a un allowlist y NO puede descargar este archivo (confirmado:
ni siquiera con curl y un User-Agent de navegador, devuelve 403), por eso
hay que correrlo localmente (o en un entorno con salida a internet normal):

    cd ml-service
    source .venv/bin/activate
    python scripts/generate_caba_perimeter.py

Si la lectura directa por URL falla (algunos entornos no tienen el driver
HTTP de GDAL habilitado), descargá el GeoJSON a mano desde
https://data.buenosaires.gob.ar/dataset/perimetro (botón de descarga
"GeoJSON") y pasá la ruta local como argumento:

    python scripts/generate_caba_perimeter.py ruta/al/perimetro.geojson

Output: backend/src/main/resources/db/migration/V29__seed_caba_perimeter.sql
"""

import os
import sys
from pathlib import Path

# Mismo fix que generate_barrio_boundaries.py: macOS con Python de python.org
# no encuentra los certificados raíz del sistema y la descarga por HTTPS
# falla con CERTIFICATE_VERIFY_FAILED. Le decimos explícitamente que use el
# bundle de certificados de `certifi`.
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

SOURCE_URL = (
    "https://cdn.buenosaires.gob.ar/datosabiertos/datasets/"
    "innovacion-transformacion-digital/perimetro/perimetro.geojson"
)

# Misma tolerancia que generate_barrio_boundaries.py (~15 m): reduce el
# tamaño del polígono sin distorsionar la forma real a la escala del mapa.
SIMPLIFY_TOLERANCE = 0.00015

OUTPUT_PATH = (
    Path(__file__).resolve().parents[2]
    / "backend" / "src" / "main" / "resources" / "db" / "migration"
    / "V29__seed_caba_perimeter.sql"
)


def resolve_geometry(geom):
    if geom.geom_type == "MultiPolygon":
        # Nos quedamos con la pieza más grande (mismo criterio que barrios):
        # evita islas/artefactos menores del dataset oficial.
        geom = max(geom.geoms, key=lambda g: g.area)
    return geom.simplify(SIMPLIFY_TOLERANCE, preserve_topology=True)


def main() -> None:
    source = sys.argv[1] if len(sys.argv) > 1 else SOURCE_URL
    print(f"Leyendo {source} ...")
    gdf = gpd.read_file(source)

    if gdf.crs is not None and gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(4326)

    if len(gdf) == 1:
        row = gdf.iloc[0]
    else:
        print(
            f"Aviso: el dataset trajo {len(gdf)} features (se esperaba 1, "
            "el perímetro completo de CABA). Se usa la de mayor área.",
            file=sys.stderr,
        )
        # .area en grados (CRS geográfico) no es un área real, pero acá solo
        # se usa para comparar features entre sí (cuál es más grande), no
        # como valor -- por eso no hace falta reproyectar. geopandas tira un
        # UserWarning igual; se ignora porque es exactamente ese caso de uso.
        row = gdf.loc[gdf.geometry.area.idxmax()]
    geom = resolve_geometry(row.geometry)

    lines = [
        "-- Polígono oficial del perímetro de CABA (dataset 'Perímetro' de",
        "-- Buenos Aires Data, no derivado de unir los barrios).",
        "-- Generado con ml-service/scripts/generate_caba_perimeter.py",
        "",
        "DELETE FROM city_boundary;",
        f"INSERT INTO city_boundary (boundary) VALUES "
        f"(ST_SetSRID(ST_GeomFromText('{geom.wkt}'), 4326));",
    ]

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Generado: {OUTPUT_PATH}")
    print(f"Área: {row.get('area', 'n/d')} · Perímetro: {row.get('perimetro', 'n/d')}")


if __name__ == "__main__":
    main()
