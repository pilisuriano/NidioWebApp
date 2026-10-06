"""Arma los datasets del Life Score a partir de los archivos descargados de BA Data.

Entrada: una carpeta con los archivos originales de BA Data (GeoJSON, SHP o CSV,
tal como se descargan; se acepta la extensión `.geojson.txt` que agrega el
navegador al guardar). Ver `data/README.md` para el link y la licencia de cada uno.

Salida (en `data/poi/`):
- `pois.csv`             category, subtype, name, lat, lon, source
- `green_spaces.geojson` polígonos de espacios verdes públicos (simplificados)
- `build_report.json`    cuántos registros entraron y cuántos se descartaron, y por qué

Los criterios de qué cuenta en cada categoría están en CATEGORY_RULES más abajo
y se imprimen en el reporte, para poder justificarlos en el informe.

Uso (desde ml-service/):

    python scripts/build_poi_dataset.py --raw-dir "<carpeta con los archivos de BA Data>"

Requiere geopandas y pyogrio (ya están en requirements.txt / se usan en los otros
scripts de esta carpeta). No se ejecuta en producción: solo regenera los archivos
que se versionan en el repositorio.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import os
import re
import zipfile
from datetime import date

import geopandas as gpd
import pandas as pd
from shapely.geometry import mapping

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "poi")

# Cuadro delimitador amplio de CABA y alrededores inmediatos, solo para detectar
# errores de proyección (un punto fuera de acá casi seguro quedó mal convertido).
_BBOX = (-58.65, -34.80, -58.25, -34.45)  # lon_min, lat_min, lon_max, lat_max

# Qué cuenta en cada categoría. Se decidió siguiendo las mismas ideas que la
# versión anterior con OpenStreetMap (ver historial del roadmap, Ronda 5 y 8),
# adaptado a lo que ofrece cada dataset.
CATEGORY_RULES = {
    "TRANSPORT": "Paradas de colectivo (data/paradas-de-colectivo.csv, se carga aparte) + estaciones de subte (una por estación, uniendo líneas a menos de 100 m) + estaciones de ferrocarril.",
    "HEALTH": "Hospitales + CeSAC + centros de salud privados + farmacias.",
    "EDUCATION": "Establecimientos educativos (un punto por edificio: varios niveles en la misma dirección cuentan una vez).",
    "GASTRONOMY": "Oferta gastronómica: restaurantes, cafés, confiterías y sandwicherías.",
    "NIGHTLIFE": "Oferta gastronómica: bares, pubs y vinerías.",
    "COMMERCE": "Mercados (centros de abastecimiento) + ferias de BA Data.",
    "GREEN_SPACE": "Espacios verdes públicos, sin canteros centrales ni complejos habitacionales, y con al menos --min-green-area m².",
}

GASTRO_CATEGORY = {
    "RESTAURANTE": "GASTRONOMY",
    "CAFE": "GASTRONOMY",
    "CONFITERIA": "GASTRONOMY",
    "SANDWICHERIA": "GASTRONOMY",
    "BAR": "NIGHTLIFE",
    "PUB": "NIGHTLIFE",
    "VINERIA": "NIGHTLIFE",
}
GREEN_EXCLUDED = {"CANTERO CENTRAL", "BARRIO/COMPLEJO"}

# Relevamiento de Usos del Suelo 2022-2024 (RUS, BA Data): relevamiento observacional
# de todas las parcelas de CABA, barrio por barrio (cada barrio se relevó en 2022, 2023
# o 2024; el campo AÑO lo indica). TIPO2 es la actividad del local. No trae nombre
# comercial: los POIs se nombran "Actividad - Calle Altura".
RUS_COMMERCE = {  # comercio de abastecimiento y de proximidad
    "SUPERMERCADO", "HIPERMERCADO", "MINIMERCADO", "ALMACEN", "VERDULERIA", "CARNICERIA",
    "PANADERIA", "FIAMBRERIA Y QUESERIA", "GRANJA", "PESCADERIA", "DIETETICA", "MERCADO", "SHOPPING",
}
RUS_KIOSKS = {"KIOSCO", "MAXIKIOSCO"}  # cuentan como comercio; con --no-kiosks se excluyen
RUS_GASTRONOMY = {"RESTAURANTE", "CAFE", "CONFITERIA", "SANDWICHERIA", "PIZZERIA", "PARRILLA"}
RUS_NIGHTLIFE = {"BAR", "CERVECERIA", "DISCOTECA"}
RUS_TIPO1 = ("UNICOMERCIAL", "MULTICOMERCIAL")
# El RUS escribe las actividades en mayúsculas y sin tildes: para mostrar, con tildes.
RUS_LABEL = {
    "CAFE": "Café", "CONFITERIA": "Confitería", "SANDWICHERIA": "Sandwichería", "PIZZERIA": "Pizzería",
    "CERVECERIA": "Cervecería", "VERDULERIA": "Verdulería", "PANADERIA": "Panadería", "CARNICERIA": "Carnicería",
    "DIETETICA": "Dietética", "ALMACEN": "Almacén", "FIAMBRERIA Y QUESERIA": "Fiambrería y quesería",
    "PESCADERIA": "Pescadería", "HIPERMERCADO": "Hipermercado", "KIOSCO": "Kiosco", "MAXIKIOSCO": "Maxikiosco",
}


_READABLE = (".geojson", ".shp")


def extract_archives(raw_dir: str) -> None:
    """Descomprime los .zip descargados (shapefiles) en `<raw_dir>/_extracted/`.
    Si algún archivo se llama .zip pero en realidad es RAR (pasó con "Centros de
    salud privados"), avisa: hay que descomprimirlo a mano en esa carpeta."""
    for fname in sorted(os.listdir(raw_dir)):
        path = os.path.join(raw_dir, fname)
        if not fname.lower().endswith((".zip", ".rar")) or not os.path.isfile(path):
            continue
        target = os.path.join(raw_dir, "_extracted", os.path.splitext(fname)[0])
        if zipfile.is_zipfile(path):
            with zipfile.ZipFile(path) as z:
                z.extractall(target)
        else:
            print(f"AVISO: {fname} no es un ZIP válido (¿RAR?). Descomprimilo a mano en una subcarpeta de {raw_dir}.")


def find(raw_dir: str, *patterns: str) -> str:
    """Busca el primer GeoJSON/SHP cuyo nombre (sin `.txt` final) coincide con algún patrón."""
    for root, _dirs, files in os.walk(raw_dir):
        for fname in sorted(files):
            base = fname[:-4] if fname.lower().endswith(".txt") else fname
            if not base.lower().endswith(_READABLE):
                continue
            for pattern in patterns:
                if re.search(pattern, base, re.IGNORECASE):
                    return os.path.join(root, fname)
    raise FileNotFoundError(f"No encontré ningún archivo que calce con {patterns} en {raw_dir}")


def read_geo(path: str) -> gpd.GeoDataFrame:
    """Lee GeoJSON/SHP y lo pasa a WGS84 (lon/lat)."""
    if path.lower().endswith(".txt"):
        # pyogrio decide el driver por extensión: se lee como GeoJSON explícitamente.
        gdf = gpd.read_file(path, driver="GeoJSON")
    else:
        gdf = gpd.read_file(path)
    if gdf.crs is None:
        gdf = gdf.set_crs(4326)
    return gdf.to_crs(4326)


# Caracteres que delatan un texto mal codificado ("mojibake"): en la oferta
# gastronómica de BA Data hay nombres como "AÃƒâ€˜ARO CERO" (era "AÑARO CERO").
_MOJIBAKE = re.compile("[ÃÂƒâ€™‰‚ã]")

try:  # ftfy es opcional: solo se usa al armar los datasets, no en producción.
    from ftfy import fix_text as _ftfy_fix
except ImportError:  # pragma: no cover
    _ftfy_fix = None

MOJIBAKE_STATS = {"reparados": 0, "reemplazados_por_nombre_generico": 0}


def repair_text(text: str) -> str | None:
    """Repara texto con doble codificación. Devuelve None si sigue roto
    (en ese caso `pretty` usa un nombre genérico en vez de mostrar basura)."""
    if not _MOJIBAKE.search(text):
        return text
    fixed = _ftfy_fix(text) if _ftfy_fix else text
    if fixed != text and not _MOJIBAKE.search(fixed):
        MOJIBAKE_STATS["reparados"] += 1
        return fixed
    MOJIBAKE_STATS["reemplazados_por_nombre_generico"] += 1
    return None


def pretty(name: object, fallback: str) -> str:
    """Nombre legible: los datasets vienen muchas veces TODO EN MAYÚSCULAS."""
    if not isinstance(name, str) or not name.strip():
        return fallback
    name = re.sub(r"\s+", " ", name).strip()
    repaired = repair_text(name)
    if repaired is None:
        return fallback
    name = repaired
    if name == name.upper() or name == name.lower():
        name = re.sub(r"'([A-Z])\b", lambda m: "'" + m.group(1).lower(), name.title())
    return name


def points_of(gdf: gpd.GeoDataFrame) -> list[tuple[float, float]]:
    out = []
    for geom in gdf.geometry:
        if geom is None or geom.is_empty:
            out.append((float("nan"), float("nan")))
            continue
        p = geom if geom.geom_type == "Point" else geom.representative_point()
        out.append((p.y, p.x))
    return out


def dedupe_within(rows: list[dict], meters: float) -> list[dict]:
    """Une filas a menos de `meters` entre sí (se queda con la primera; si hay
    `merge_name`, junta los nombres). Voraz y simple: alcanza para cientos o
    pocos miles de puntos."""
    kept: list[dict] = []
    for row in rows:
        for other in kept:
            dlat = (row["lat"] - other["lat"]) * 111_320
            dlon = (row["lon"] - other["lon"]) * 111_320 * math.cos(math.radians(row["lat"]))
            if math.hypot(dlat, dlon) <= meters:
                if row.get("merge_key") and row["merge_key"] not in other.setdefault("merged", [other.get("merge_key")]):
                    other["merged"].append(row["merge_key"])
                break
        else:
            kept.append(row)
    return kept


def check_bbox(label: str, rows: list[dict], report: dict) -> list[dict]:
    ok, bad = [], 0
    for r in rows:
        if not (math.isfinite(r["lat"]) and math.isfinite(r["lon"])):
            bad += 1
        elif _BBOX[0] <= r["lon"] <= _BBOX[2] and _BBOX[1] <= r["lat"] <= _BBOX[3]:
            ok.append(r)
        else:
            bad += 1
    if bad:
        report["descartados"].append(f"{label}: {bad} sin coordenadas válidas o fuera de CABA/alrededores")
    return ok


def _norm(text: object) -> str:
    """Mayúsculas sin tildes, para comparar actividades ("CAFÉ" == "CAFE")."""
    import unicodedata
    return unicodedata.normalize("NFKD", str(text)).encode("ascii", "ignore").decode().upper().strip()


def read_rus(path: str, categories: dict[str, str], report: dict) -> list[dict]:
    """Lee el RUS 2022-2024 y devuelve un POI por local activo de las actividades
    de `categories` (TIPO2 normalizado -> categoría del Life Score).

    - Solo ESTADO = ACTIVO y TIPO1 unicomercial/multicomercial.
    - Un punto por (calle, altura, actividad): el mismo local cargado dos veces cuenta una.
    - El punto es `representative_point()` de la parcela (siempre cae dentro de ella),
      calculado en la proyección original (Gauss-Krüger, metros) y recién después
      pasado a WGS84.
    """
    tipos = ", ".join(f"'{t}'" for t in RUS_TIPO1)
    g = gpd.read_file(path, where=f"ESTADO = 'ACTIVO' AND TIPO1 IN ({tipos})",
                      columns=["ESTADO", "TIPO1", "TIPO2", "CALLE", "PUERTA", "BARRIO"])
    total_activos = len(g)
    g["_t2"] = g["TIPO2"].map(_norm)
    g = g[g["_t2"].isin(categories)].copy()
    g["geometry"] = g.geometry.representative_point()
    g = g.to_crs(4326)
    g["_cat"] = g["_t2"].map(categories)
    before = len(g)
    g = g.drop_duplicates(subset=["CALLE", "PUERTA", "_t2"])
    rows = []
    for geom, tipo2, calle, puerta, cat in zip(g.geometry, g["TIPO2"], g["CALLE"], g["PUERTA"], g["_cat"]):
        address = " ".join(x for x in (pretty(calle, ""), str(puerta).strip()) if x)
        activity = RUS_LABEL.get(_norm(tipo2)) or str(tipo2).strip().capitalize()
        rows.append({"category": cat, "subtype": _norm(tipo2).lower().replace(" ", "_"),
                     "name": f"{activity} - {address}" if address else activity,
                     "lat": geom.y, "lon": geom.x, "source": "BA Data: Relevamiento de Usos del Suelo 2022-2024"})
    report["fuentes"]["rus_2022_2024"] = (
        f"{total_activos} locales activos (uni y multicomercial) -> {before} de las actividades usadas "
        f"-> {len(rows)} tras quitar duplicados (misma calle, altura y actividad)"
    )
    report["rus_por_actividad"] = pd.Series([r["subtype"] for r in rows]).value_counts().to_dict()
    return rows


def check_rus_against_pharmacies(rus_path: str, pharmacies_path: str, report: dict) -> None:
    """Control de la reproyección del RUS: las farmacias del RUS tienen que caer cerca
    de las farmacias oficiales de BA Data. Si la mediana da cientos de metros, la
    proyección está mal. Queda registrado en build_report.json."""
    import numpy as np
    rus = read_rus_pharmacies(rus_path)
    ref = read_geo(pharmacies_path)
    ref_pts = np.array([(p.y, p.x) for p in ref.geometry if p is not None and not p.is_empty])
    dist = []
    for lat, lon in zip(rus.geometry.y, rus.geometry.x):
        dlat = (ref_pts[:, 0] - lat) * 111_320
        dlon = (ref_pts[:, 1] - lon) * 111_320 * math.cos(math.radians(lat))
        dist.append(float(np.hypot(dlat, dlon).min()))
    dist_arr = np.array(dist)
    report["validacion_rus_vs_farmacias"] = {
        "farmacias_rus": len(dist_arr),
        "distancia_mediana_a_farmacia_oficial_m": round(float(np.median(dist_arr)), 1),
        "p75_m": round(float(np.percentile(dist_arr, 75)), 1),
        "menos_de_100_m": round(float((dist_arr <= 100).mean()), 3),
    }


def read_rus_pharmacies(path: str) -> gpd.GeoDataFrame:
    g = gpd.read_file(path, where="ESTADO = 'ACTIVO' AND TIPO2 = 'FARMACIA Y PERFUMERIA'", columns=["ESTADO", "TIPO2"])
    g["geometry"] = g.geometry.representative_point()
    return g.to_crs(4326)


def build(raw_dir: str, min_green_area: float, include_pharmacies: bool,
          gastro_source: str = "rus", include_kiosks: bool = True) -> None:
    extract_archives(raw_dir)
    rules = dict(CATEGORY_RULES)
    if gastro_source == "rus":
        rules["GASTRONOMY"] = "Relevamiento de Usos del Suelo 2022-2024: restaurantes, cafés, confiterías, sandwicherías, pizzerías y parrillas (locales activos)."
        rules["NIGHTLIFE"] = "Relevamiento de Usos del Suelo 2022-2024: bares, cervecerías y discotecas (locales activos)."
    rules["COMMERCE"] = (
        "Relevamiento de Usos del Suelo 2022-2024: supermercados, minimercados, almacenes, verdulerías, carnicerías, panaderías, "
        "fiambrerías, granjas, pescaderías, dietéticas, mercados y shoppings"
        + (", kioscos y maxikioscos" if include_kiosks else " (sin kioscos)")
        + " (locales activos) + ferias y mercados de BA Data."
    )
    report: dict = {"generado": date.today().isoformat(), "reglas": rules, "fuentes": {}, "descartados": []}
    rows: list[dict] = []

    def add(category, subtype, name, lat, lon, source):
        rows.append({"category": category, "subtype": subtype, "name": name, "lat": lat, "lon": lon, "source": source})

    # --- HEALTH ---
    g = read_geo(find(raw_dir, r"^hospitales"))
    for (lat, lon), name in zip(points_of(g), g["fna"]):
        add("HEALTH", "hospital", pretty(name, "Hospital"), lat, lon, "BA Data: Hospitales")
    report["fuentes"]["hospitales"] = len(g)

    g = read_geo(find(raw_dir, r"cesac"))
    for (lat, lon), name in zip(points_of(g), g["nombre"]):
        add("HEALTH", "cesac", pretty(name, "Centro de salud (CeSAC)"), lat, lon, "BA Data: CeSAC")
    report["fuentes"]["cesac"] = len(g)

    g = read_geo(find(raw_dir, r"salud.*privados", r"privados"))
    for (lat, lon), name in zip(points_of(g), g["NOMBRE"]):
        add("HEALTH", "salud_privado", pretty(name, "Centro de salud privado"), lat, lon, "BA Data: Centros de salud privados")
    report["fuentes"]["salud_privados"] = len(g)

    g = read_geo(find(raw_dir, r"^farmacias"))
    if include_pharmacies:
        for (lat, lon), name in zip(points_of(g), g["objeto"]):
            add("HEALTH", "farmacia", pretty(name, "Farmacia"), lat, lon, "BA Data: Farmacias")
    report["fuentes"]["farmacias"] = len(g) if include_pharmacies else f"{len(g)} (excluidas por --no-pharmacies)"

    # --- EDUCATION (un punto por edificio) ---
    g = read_geo(find(raw_dir, r"establecimientos_educativos", r"educativos"))
    edu = []
    for (lat, lon), name in zip(points_of(g), g["nam"]):
        edu.append({"category": "EDUCATION", "subtype": "educativo", "name": pretty(name, "Establecimiento educativo"),
                    "lat": lat, "lon": lon, "source": "BA Data: Establecimientos educativos"})
    edu = check_bbox("educativos", edu, report)
    before = len(edu)
    edu = dedupe_within(edu, 15.0)
    report["fuentes"]["educativos"] = f"{len(g)} registros -> {len(edu)} edificios (misma dirección, a menos de 15 m, cuenta una vez; se unieron {before - len(edu)})"
    rows.extend(edu)

    # --- TRANSPORT: subte y tren (los colectivos se leen en runtime) ---
    g = read_geo(find(raw_dir, r"subte"))
    subte = []
    for (lat, lon), est, lin in zip(points_of(g), g["estacion"], g["linea"]):
        subte.append({"category": "TRANSPORT", "subtype": "subte", "name": pretty(est, "Estación de subte"),
                      "lat": lat, "lon": lon, "source": "BA Data: Estaciones de subte", "merge_key": f"{lin}"})
    subte = check_bbox("subte", subte, report)
    subte = dedupe_within(subte, 100.0)
    for s in subte:
        lines = [x for x in s.pop("merged", [s["merge_key"]]) if x]
        s["name"] = f"Subte: {s['name']} (línea{'s' if len(lines) > 1 else ''} {', '.join(sorted(set(lines)))})"
        s.pop("merge_key", None)
    report["fuentes"]["subte"] = f"{len(g)} registros (una por línea) -> {len(subte)} estaciones (se unieron combinaciones a menos de 100 m)"
    rows.extend(subte)

    g = read_geo(find(raw_dir, r"ferroviarias", r"ferrocarril"))
    for (lat, lon), name, linea in zip(points_of(g), g["nombre"], g["linea"]):
        label = f"Estación {pretty(name, '')}".strip()
        add("TRANSPORT", "tren", f"{label} ({pretty(linea, 'tren')})" if isinstance(linea, str) else label, lat, lon, "BA Data: Estaciones de ferrocarril")
    report["fuentes"]["ferrocarril"] = len(g)

    # --- GASTRONOMY / NIGHTLIFE ---
    rus_path = find(raw_dir, r"usos.*suelo")
    rus_categories = {t: "COMMERCE" for t in RUS_COMMERCE | (RUS_KIOSKS if include_kiosks else set())}
    if gastro_source == "rus":
        rus_categories.update({t: "GASTRONOMY" for t in RUS_GASTRONOMY})
        rus_categories.update({t: "NIGHTLIFE" for t in RUS_NIGHTLIFE})
    else:
        g = read_geo(find(raw_dir, r"oferta.*gastronomica"))
        skipped: dict[str, int] = {}
        for (lat, lon), name, cat in zip(points_of(g), g["nombre"], g["categoria"]):
            category = GASTRO_CATEGORY.get(str(cat).strip().upper())
            if category is None:
                skipped[str(cat)] = skipped.get(str(cat), 0) + 1
                continue
            add(category, str(cat).strip().lower(), pretty(name, str(cat).title()), lat, lon, "BA Data: Oferta gastronómica")
        report["fuentes"]["oferta_gastronomica"] = f"{len(g)} registros; categorías sin usar: {skipped or 'ninguna'}"

    rus_rows = read_rus(rus_path, rus_categories, report)
    rows.extend(rus_rows)
    check_rus_against_pharmacies(rus_path, find(raw_dir, r"^farmacias"), report)

    # --- COMMERCE: mercados y ferias de BA Data (se suman a los locales del RUS) ---
    g = read_geo(find(raw_dir, r"^mercados"))
    for (lat, lon), name in zip(points_of(g), g["nombre_map"].where(g["nombre_map"].notna(), g["nombre"])):
        add("COMMERCE", "mercado", pretty(name, "Mercado"), lat, lon, "BA Data: Mercados")
    report["fuentes"]["mercados"] = len(g)
    g = read_geo(find(raw_dir, r"^ferias"))
    for (lat, lon), name in zip(points_of(g), g["nombre"]):
        add("COMMERCE", "feria", f"Feria: {pretty(name, 'sin nombre')}", lat, lon, "BA Data: Ferias")
    report["fuentes"]["ferias"] = len(g)

    # --- validación y escritura de pois.csv ---
    dropped_by_source: dict[str, int] = {}
    kept_rows = []
    for r in rows:
        inside = (math.isfinite(r["lat"]) and math.isfinite(r["lon"])
                  and _BBOX[0] <= r["lon"] <= _BBOX[2] and _BBOX[1] <= r["lat"] <= _BBOX[3])
        if inside:
            kept_rows.append(r)
        else:
            dropped_by_source[r["source"]] = dropped_by_source.get(r["source"], 0) + 1
    rows = kept_rows
    for source, n in dropped_by_source.items():
        report["descartados"].append(f"{source}: {n} sin coordenadas válidas o fuera del recuadro de CABA y alrededores")
    for r in rows:
        r.pop("merge_key", None)
        r.pop("merged", None)
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, "pois.csv"), "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["category", "subtype", "name", "lat", "lon", "source"])
        writer.writeheader()
        for r in sorted(rows, key=lambda x: (x["category"], x["subtype"], x["name"])):
            writer.writerow({**r, "lat": round(r["lat"], 6), "lon": round(r["lon"], 6)})
    report["pois_por_categoria"] = pd.Series([r["category"] for r in rows]).value_counts().to_dict()

    # --- espacios verdes (polígonos) ---
    g = read_geo(find(raw_dir, r"espacio.*verde.*public"))
    total = len(g)
    g = g[~g["clasificac"].astype(str).str.upper().isin(GREEN_EXCLUDED)]
    after_type = len(g)
    # Área en m² con una proyección métrica local (POSGAR / Argentina 4: EPSG:5346 no
    # siempre está; se usa UTM 21S, suficiente para filtrar por tamaño).
    area_m2 = g.to_crs(32721).geometry.area
    g = g[area_m2 >= min_green_area].copy()
    # ~3 m de tolerancia (en grados) y 6 decimales (~0,1 m): reduce el archivo sin
    # cambiar de forma visible los bordes a la escala de 800 m.
    g["geometry"] = g.geometry.simplify(0.00003, preserve_topology=True)
    features = []
    for _, row in g.iterrows():
        if row.geometry is None or row.geometry.is_empty:
            continue
        name = pretty(row.get("nombre"), str(row.get("clasificac") or "Espacio verde").title())
        features.append({
            "type": "Feature",
            "properties": {"name": name, "type": str(row.get("clasificac") or "").title()},
            "geometry": mapping(row.geometry),
        })
    out_geo = os.path.join(OUT_DIR, "green_spaces.geojson")
    with open(out_geo, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": features}, f, ensure_ascii=False, separators=(",", ":"))
    # redondeo de coordenadas (re-escritura liviana)
    with open(out_geo, encoding="utf-8") as f:
        text = f.read()
    text = re.sub(r"(-?\d+\.\d{6})\d+", r"\1", text)
    with open(out_geo, "w", encoding="utf-8") as f:
        f.write(text)
    report["fuentes"]["espacios_verdes"] = (
        f"{total} registros -> {after_type} sin canteros centrales ni complejos -> {len(features)} con área >= {min_green_area:g} m²"
    )
    report["pois_por_categoria"]["GREEN_SPACE"] = len(features)

    report["nombres_mal_codificados"] = dict(MOJIBAKE_STATS)
    with open(os.path.join(OUT_DIR, "build_report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(json.dumps(report, ensure_ascii=False, indent=2))
    print(f"\npois.csv: {os.path.getsize(os.path.join(OUT_DIR, 'pois.csv')) / 1024:.0f} KB; "
          f"green_spaces.geojson: {os.path.getsize(out_geo) / 1024:.0f} KB")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw-dir", required=True, help="carpeta con los archivos descargados de BA Data")
    parser.add_argument("--min-green-area", type=float, default=200.0, help="área mínima (m²) para contar un espacio verde")
    parser.add_argument("--no-pharmacies", action="store_true", help="no contar farmacias dentro de HEALTH")
    parser.add_argument("--gastro-source", choices=["rus", "oferta"], default="rus",
                        help="fuente de GASTRONOMY y NIGHTLIFE: relevamiento de usos del suelo (rus, por defecto) u oferta gastronómica (registro turístico)")
    parser.add_argument("--no-kiosks", action="store_true", help="no contar kioscos ni maxikioscos en COMMERCE (por defecto cuentan)")
    args = parser.parse_args()
    build(args.raw_dir, args.min_green_area, include_pharmacies=not args.no_pharmacies,
          gastro_source=args.gastro_source, include_kiosks=not args.no_kiosks)
