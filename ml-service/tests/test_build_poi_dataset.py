"""Tests de la lectura del Relevamiento de Usos del Suelo (RUS) en
scripts/build_poi_dataset.py, con un shapefile de prueba de 7 parcelas en la misma
proyección que el original (Gauss-Krüger Buenos Aires, datum Campo Inchauspe)."""

import importlib.util
import os

import pytest
from shapely.geometry import box

# El script de armado de datasets es una herramienta de desarrollo: usa pyogrio, que no está
# en requirements.txt (producción). Si no está instalado, estos tests se saltan.
gpd = pytest.importorskip("geopandas")
pytest.importorskip("pyogrio")

_GK_WKT = (
    'PROJCS["Argentina_GKBsAs",GEOGCS["GCS_Campo_Inchauspe",DATUM["D_Campo_Inchauspe",'
    'SPHEROID["International_1924",6378388.0,297.0]],PRIMEM["Greenwich",0.0],'
    'UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],'
    'PARAMETER["False_Easting",100000.0],PARAMETER["False_Northing",100000.0],'
    'PARAMETER["Central_Meridian",-58.4627],PARAMETER["Scale_Factor",0.999998],'
    'PARAMETER["Latitude_Of_Origin",-34.6297166],UNIT["Meter",1.0]]'
)


def _load_script():
    path = os.path.join(os.path.dirname(__file__), "..", "scripts", "build_poi_dataset.py")
    spec = importlib.util.spec_from_file_location("build_poi_dataset", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="module")
def script():
    return _load_script()


@pytest.fixture()
def rus_shp(tmp_path):
    # (estado, tipo1, tipo2, calle, puerta)
    rows = [
        ("ACTIVO", "UNICOMERCIAL", "VERDULERIA", "AV. CORRIENTES", "1000"),
        ("ACTIVO", "UNICOMERCIAL", "VERDULERIA", "AV. CORRIENTES", "1000"),  # mismo local cargado dos veces
        ("INACTIVO", "UNICOMERCIAL", "PANADERIA", "AV. CORRIENTES", "1002"),  # cerrado: no cuenta
        ("ACTIVO", "UNICOMERCIAL", "KIOSCO", "AV. CORRIENTES", "1004"),  # kioscos: solo con la opción
        ("ACTIVO", "UNICOMERCIAL", "CAFÉ", "AV. CORRIENTES", "1006"),
        ("ACTIVO", "UNICOMERCIAL", "BAR", "AV. CORRIENTES", "1008"),
        ("ACTIVO", "RESIDENCIAL", "MULTIFAMILIAR", "AV. CORRIENTES", "1010"),  # no es comercio
    ]
    # Parcelas de 20 m x 20 m a lo largo de una calle, alrededor del Obelisco.
    x0, y0 = 108_100.0, 102_900.0
    geoms = [box(x0 + i * 25, y0, x0 + i * 25 + 20, y0 + 20) for i in range(len(rows))]
    gdf = gpd.GeoDataFrame(
        {
            "ESTADO": [r[0] for r in rows], "TIPO1": [r[1] for r in rows], "TIPO2": [r[2] for r in rows],
            "CALLE": [r[3] for r in rows], "PUERTA": [r[4] for r in rows], "BARRIO": ["SAN NICOLAS"] * len(rows),
        },
        geometry=geoms, crs=_GK_WKT,
    )
    path = tmp_path / "rus.shp"
    gdf.to_file(path, engine="pyogrio")
    return str(path)


def _read(script, path, categories):
    report = {"fuentes": {}}
    return script.read_rus(path, categories, report), report


def test_rus_keeps_only_active_stores_of_the_selected_activities(script, rus_shp):
    rows, _ = _read(script, rus_shp, {"VERDULERIA": "COMMERCE", "PANADERIA": "COMMERCE", "CAFE": "GASTRONOMY"})
    assert sorted(r["subtype"] for r in rows) == ["cafe", "verduleria"]


def test_rus_counts_a_duplicated_store_once(script, rus_shp):
    rows, report = _read(script, rus_shp, {"VERDULERIA": "COMMERCE"})
    assert len(rows) == 1
    assert "1 tras quitar duplicados" in report["fuentes"]["rus_2022_2024"] or "-> 1 " in report["fuentes"]["rus_2022_2024"]


def test_rus_kiosks_only_count_when_asked(script, rus_shp):
    without, _ = _read(script, rus_shp, {"VERDULERIA": "COMMERCE"})
    with_kiosks, _ = _read(script, rus_shp, {"VERDULERIA": "COMMERCE", "KIOSCO": "COMMERCE"})
    assert len(with_kiosks) == len(without) + 1


def test_rus_points_are_reprojected_to_wgs84_near_the_obelisco(script, rus_shp):
    rows, _ = _read(script, rus_shp, {"VERDULERIA": "COMMERCE"})
    assert -34.62 < rows[0]["lat"] < -34.59 and -58.395 < rows[0]["lon"] < -58.365


def test_rus_names_use_activity_with_accents_and_address(script, rus_shp):
    rows, _ = _read(script, rus_shp, {"CAFE": "GASTRONOMY", "VERDULERIA": "COMMERCE"})
    names = {r["subtype"]: r["name"] for r in rows}
    assert names["cafe"] == "Café - Av. Corrientes 1006"
    assert names["verduleria"] == "Verdulería - Av. Corrientes 1000"


def test_rus_assigns_the_category_of_each_activity(script, rus_shp):
    rows, _ = _read(script, rus_shp, {"VERDULERIA": "COMMERCE", "CAFE": "GASTRONOMY", "BAR": "NIGHTLIFE"})
    assert {r["subtype"]: r["category"] for r in rows} == {
        "verduleria": "COMMERCE", "cafe": "GASTRONOMY", "bar": "NIGHTLIFE",
    }
