"""Construye las capas de ruido (día y noche) a partir del Mapa de Ruido de BA Data.

Por qué existe (ver nidio-mapas-calor-hallazgos-datasets y
nidio-mapas-calor-ruido-2018-vs-2025):
  - Los archivos "2025" NO son líneas de calle sino POLÍGONOS: una banda de
    5 dBA por polígono, en franjas alrededor de las calles. V7 los trataba como
    líneas y ponderaba por .length (= perímetro) en vez de por área.
  - El diurno 2025 publicado por BA Data tiene polígonos duplicados exactos
    (comunas 2, 11 y 12), geometrías inválidas y la Comuna 1 prácticamente
    vacía. El diurno 2018 coincide con el 2025 en el 98,7 % de la superficie de
    las otras 14 comunas, así que la Comuna 1 diurna se completa con la
    publicación 2018 (se marca src = "2018").
  - El nocturno 2025 está completo y limpio.

Qué hace:
  1. Lee diurno 2025, nocturno 2025 y diurno 2018 (SHP, Gauss-Krüger Buenos
     Aires); repara geometrías, elimina duplicados exactos y arma el diurno
     final = 2025 en comunas 2-15 + 2018 en la comuna 1.
  2. Disuelve por banda de dBA (y fuente), simplifica y exporta GeoJSON
     liviano: ml-service/data/noise/noise_day.geojson y noise_night.geojson.
  3. Promedio de dB por barrio ponderado por ÁREA (dentro de las franjas) y %
     de cobertura -> ruido_por_barrio.csv y la migración V39 (noise_zone).
  4. Escala RELATIVA a CABA (4 clases, cortes en bordes de banda cercanos a los
     cuartiles del área cubierta) ->
     thresholds.json, igual criterio que el Life Score: la gente no maneja
     decibeles, así que el color depende de qué tan ruidosa es la calle
     respecto del resto de la ciudad.

Uso (desde la raíz del repo):
    python ml-service/scripts/build_noise_layers.py \\
        --dia-2025 RUTA/medicion_de_ruido_diurno.geojson.txt \\
        --noche-2025 RUTA/medicion_de_ruido_nocturno.geojson.txt \\
        --dia-2018 RUTA/mapa_de_ruido_diurno.shp
Opciones: --tolerancia 5 (metros de simplificación), --tolerancia-front 2 (versión más fina solo para
el frontend), --solo-datos (sin migración).
"""

import argparse
import gzip
import json
import re
import sys
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd
from shapely import make_valid, set_precision, wkt
from shapely.geometry import mapping
from shapely.ops import unary_union

REPO = Path(__file__).resolve().parents[2]
V7 = REPO / "backend/src/main/resources/db/migration/V7__real_noise_security.sql"
OUT_DIR = REPO / "ml-service/data/noise"
# Copia estática para el frontend (mapa integrado y mini-mapa de la ficha): se sirve
# desde public/ y se descarga solo cuando la persona prende la capa de ruido.
FRONTEND_DIR = REPO / "frontend/public/data/ruido"
OUT_MIGRATION = REPO / "backend/src/main/resources/db/migration/V39__recalibrate_noise_levels.sql"
METRIC = 32721  # WGS84 / UTM 21S
MIN_PART_M2 = 25.0
LABELS = ["Tranquilo", "Moderado", "Ruidoso", "Muy ruidoso"]

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


def polygonal(geom):
    """Repara la geometría y devuelve solo su parte poligonal (o None)."""
    if geom is None or geom.is_empty:
        return None
    g = make_valid(geom)
    if g.geom_type in ("Polygon", "MultiPolygon"):
        return g
    parts = [p for p in getattr(g, "geoms", []) if p.geom_type in ("Polygon", "MultiPolygon")]
    return unary_union(parts) if parts else None


def load(path: str, lo: str, hi: str, comuna: str, src: str, report: dict, key: str) -> gpd.GeoDataFrame:
    g = gpd.read_file(path).to_crs(METRIC)
    n_in = len(g)
    invalid = int((~g.geometry.is_valid).sum())
    g["geometry"] = g.geometry.apply(polygonal)
    g = g[g.geometry.notna()].copy()
    out = pd.DataFrame({
        "lo": pd.to_numeric(g[lo]).astype(int),
        "hi": pd.to_numeric(g[hi]).astype(int),
        "comuna": g[comuna].astype(str).str.extract(r"(\d+)")[0].astype(int),
        "src": src,
    })
    out = gpd.GeoDataFrame(out, geometry=g.geometry.values, crs=METRIC)
    out["_wkb"] = out.geometry.apply(lambda x: x.normalize().wkb_hex)
    dup = int(out.duplicated(["lo", "_wkb"]).sum())
    out = out.drop_duplicates(["lo", "_wkb"]).drop(columns="_wkb")
    report[key] = {"filas_leidas": n_in, "geometrias_invalidas_reparadas": invalid, "duplicados_exactos_eliminados": dup, "filas_finales": len(out)}
    return out


def dissolve_and_simplify(g: gpd.GeoDataFrame, tol: float) -> gpd.GeoDataFrame:
    d = g.dissolve(by=["lo", "hi", "src"]).reset_index()
    def clean(geom):
        s = geom.simplify(tol, preserve_topology=True)
        s = polygonal(s)
        if s is None:
            return None
        parts = [p for p in getattr(s, "geoms", [s]) if p.area >= MIN_PART_M2]
        return unary_union(parts) if parts else None
    d["geometry"] = d.geometry.apply(clean)
    return d[d.geometry.notna()].copy()


def _round_coords(c, nd=5):
    if isinstance(c, (list, tuple)) and c and isinstance(c[0], (int, float)):
        return [round(c[0], nd), round(c[1], nd)]
    return [_round_coords(x, nd) for x in c]


def make_disjoint(g: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """Pasa a WGS84 con grilla de 1e-5 grados (~1 m), repara y quita solapes entre
    bandas (la simplificación por banda los genera): ante un solape gana la banda
    más ruidosa, así que cada punto cae en una sola banda."""
    out = g.to_crs(4326).copy()
    out["geometry"] = out.geometry.apply(lambda x: polygonal(set_precision(x, 1e-5)))
    out = out[out.geometry.notna()].sort_values("lo", ascending=False).copy()
    done: dict[tuple[int, str], object] = {}
    geoms = []
    for _, r in out.iterrows():
        geom = r.geometry
        # los solapes aparecen entre bandas contiguas: se resta solo la banda de arriba
        for step in (5, 10):
            upper = [v for (lo, _src), v in done.items() if lo == r["lo"] + step and v is not None]
            if upper and geom is not None:
                geom = polygonal(set_precision(geom.difference(unary_union(upper)), 1e-5))
        done[(int(r["lo"]), r["src"])] = geom
        geoms.append(geom)
    out["geometry"] = geoms
    return out[out.geometry.notna()].sort_values("lo").copy()


def write_geojson(g: gpd.GeoDataFrame, path: Path) -> dict:
    """GeoJSON compacto, coordenadas a 5 decimales (~1 m). Se escribe a mano (sin GDAL)
    para poder reemplazar un archivo existente sin borrarlo antes."""
    out = g
    feats = []
    for _, r in out.iterrows():
        geom = mapping(r.geometry)
        geom = {"type": geom["type"], "coordinates": _round_coords(geom["coordinates"])}
        feats.append({"type": "Feature",
                      "properties": {"lo": int(r["lo"]), "hi": int(r["hi"]), "src": r["src"]},
                      "geometry": geom})
    raw = json.dumps({"type": "FeatureCollection", "features": feats}, separators=(",", ":")).encode("utf-8")
    with open(path, "wb") as fh:
        fh.write(raw)
    return {"bytes": len(raw), "bytes_gzip": len(gzip.compress(raw))}


def relative_scale(g: gpd.GeoDataFrame) -> dict:
    """Escala relativa a CABA en 4 clases. Como las bandas son de 5 dBA, los cortes
    caen en bordes de banda: se eligen los más cercanos a los cuartiles del área
    cubierta por las franjas (25 %, 50 % y 75 % acumulado)."""
    a = g.assign(area=g.geometry.area).groupby("lo").agg(hi=("hi", "first"), area=("area", "sum")).sort_index()
    pct = 100 * a["area"] / a["area"].sum()
    cum_end = pct.cumsum()
    cortes = []
    for q in (25, 50, 75):
        edge = int((cum_end - q).abs().idxmin()) + 5  # borde superior de esa banda
        if cortes and edge <= cortes[-1]:
            edge = cortes[-1] + 5
        cortes.append(edge)
    def clase(lo: int) -> int:
        return 1 + sum(lo >= c for c in cortes)
    bandas = [{"lo": int(lo), "hi": int(r["hi"]), "area_pct": round(float(pct[lo]), 2),
               "clase": clase(int(lo)), "etiqueta": LABELS[clase(int(lo)) - 1]} for lo, r in a.iterrows()]
    por_clase = {LABELS[c - 1]: round(sum(b["area_pct"] for b in bandas if b["clase"] == c), 1) for c in range(1, 5)}
    return {"cortes_db": cortes, "area_pct_por_clase": por_clase, "bandas": bandas}


def barrios() -> gpd.GeoDataFrame:
    text = V7.read_text(encoding="utf-8")
    rows = re.findall(
        r"INSERT INTO noise_zone \(area, noise_level\) VALUES \(ST_SetSRID\(ST_GeomFromText\('(.*?)'\), 4326\), [\d.]+\);", text)
    if len(rows) != len(NEIGHBORHOODS):
        sys.exit(f"V7 trae {len(rows)} zonas de ruido y se esperaban {len(NEIGHBORHOODS)}.")
    b = gpd.GeoDataFrame({"barrio": NEIGHBORHOODS}, geometry=[wkt.loads(r) for r in rows], crs=4326).to_crs(METRIC)
    b["km2"] = b.area / 1e6
    return b


def barrio_stats(b: gpd.GeoDataFrame, g: gpd.GeoDataFrame, prefix: str) -> pd.DataFrame:
    g = g.assign(db=(g["lo"] + g["hi"]) / 2)
    ov = gpd.overlay(b[["barrio", "geometry"]], g[["db", "src", "geometry"]], how="intersection", keep_geom_type=False)
    ov = ov[ov.geometry.area > 0].copy()
    ov["a"] = ov.geometry.area
    rows = []
    for name, x in ov.groupby("barrio"):
        rows.append({
            "barrio": name,
            f"{prefix}_db": float(np.average(x["db"], weights=x["a"])),
            f"{prefix}_cobertura_m2": float(x["a"].sum()),
            f"{prefix}_pct_2018": float(100 * x.loc[x["src"] == "2018", "a"].sum() / x["a"].sum()),
        })
    return pd.DataFrame(rows)


def load_inputs(args, report: dict):
    """Lee y limpia los tres archivos (o los toma de --cache si ya se procesaron)."""
    cache = Path(args.cache) if args.cache else None
    if cache and (cache / "dia.pkl").exists() and (cache / "noche.pkl").exists():
        report.update(json.loads((cache / "report_carga.json").read_text(encoding="utf-8")))
        return pd.read_pickle(cache / "dia.pkl"), pd.read_pickle(cache / "noche.pkl")
    d25 = load(args.dia_2025, "dba_low", "dba_high", "comuna", "2025", report, "dia_2025")
    d18 = load(args.dia_2018, "DB_LO", "DB_HI", "Comuna", "2018", report, "dia_2018")
    n25 = load(args.noche_2025, "dba_low", "dba_high", "comuna", "2025", report, "noche_2025")
    dia = pd.concat([d25[d25["comuna"] != 1], d18[d18["comuna"] == 1]], ignore_index=True)
    dia = gpd.GeoDataFrame(dia, geometry="geometry", crs=METRIC)
    report["dia_final"] = {"comunas_2_15_de_2025": int((d25["comuna"] != 1).sum()), "comuna_1_de_2018": int((d18["comuna"] == 1).sum())}
    if cache:
        cache.mkdir(parents=True, exist_ok=True)
        dia.to_pickle(cache / "dia.pkl")
        n25.to_pickle(cache / "noche.pkl")
        (cache / "report_carga.json").write_text(json.dumps(report, ensure_ascii=False), encoding="utf-8")
    return dia, n25


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dia-2025", required=True)
    ap.add_argument("--noche-2025", required=True)
    ap.add_argument("--dia-2018", required=True)
    ap.add_argument("--tolerancia", type=float, default=5.0)
    ap.add_argument("--tolerancia-front", type=float, default=0.0,
                    help="si es > 0, la copia del frontend se simplifica con esta tolerancia (m), más fina que la de "
                         "ml-service: se ve más prolija a mucho zoom y ml-service sigue liviano (Render, 512 MB)")
    ap.add_argument("--solo-datos", action="store_true", help="no genera la migración")
    ap.add_argument("--etapas", default="dia,noche,escala,barrios", help="subconjunto de: dia,noche,escala,barrios")
    ap.add_argument("--cache", help="carpeta para guardar la lectura limpia y retomar por etapas")
    args = ap.parse_args()
    etapas = set(args.etapas.split(","))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rep_path, thr_path = OUT_DIR / "build_report.json", OUT_DIR / "thresholds.json"
    report = json.loads(rep_path.read_text(encoding="utf-8")) if rep_path.exists() else {}
    report["tolerancia_m"] = args.tolerancia
    thresholds = json.loads(thr_path.read_text(encoding="utf-8")) if thr_path.exists() else {}
    thresholds.update({"metodo": "4 clases relativas a CABA: cortes en bordes de banda de 5 dBA cercanos a los cuartiles del área cubierta por las franjas; clase 1 = más tranquilo, 4 = más ruidoso.",
                       "etiquetas": LABELS})

    dia, n25 = load_inputs(args, report)
    for name, g, key in (("day", dia, "dia"), ("night", n25, "noche")):
        if key not in etapas:
            continue
        simple = make_disjoint(dissolve_and_simplify(g, args.tolerancia))
        report[f"salida_{name}"] = write_geojson(simple, OUT_DIR / f"noise_{name}.geojson")
        report[f"salida_{name}"]["km2_cubiertos"] = round(float(g.geometry.area.sum() / 1e6), 2)
        print(name, report[f"salida_{name}"], flush=True)
        if args.tolerancia_front > 0:
            FRONTEND_DIR.mkdir(parents=True, exist_ok=True)
            fine = make_disjoint(dissolve_and_simplify(g, args.tolerancia_front))
            report[f"salida_front_{name}"] = write_geojson(fine, FRONTEND_DIR / f"noise_{name}.geojson")
            print(f"{name} (frontend, tolerancia {args.tolerancia_front} m)", report[f"salida_front_{name}"], flush=True)
    if "escala" in etapas:
        thresholds["dia"], thresholds["noche"] = relative_scale(dia), relative_scale(n25)
        print("escala dia:", thresholds["dia"]["cortes_db"], thresholds["dia"]["area_pct_por_clase"])
        print("escala noche:", thresholds["noche"]["cortes_db"], thresholds["noche"]["area_pct_por_clase"])
    thr_path.write_text(json.dumps(thresholds, ensure_ascii=False, indent=2), encoding="utf-8")
    rep_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    FRONTEND_DIR.mkdir(parents=True, exist_ok=True)
    for fname in ("noise_day.geojson", "noise_night.geojson", "thresholds.json"):
        if args.tolerancia_front > 0 and fname.startswith("noise_"):
            continue  # el frontend ya recibió su versión más fina arriba
        if (OUT_DIR / fname).exists():
            (FRONTEND_DIR / fname).write_bytes((OUT_DIR / fname).read_bytes())
    if "barrios" not in etapas:
        return

    b = barrios()
    t = b[["barrio", "km2"]].merge(barrio_stats(b, dia, "dia"), on="barrio", how="left").merge(barrio_stats(b, n25, "noche"), on="barrio", how="left")
    t["dia_cobertura_pct"] = 100 * t["dia_cobertura_m2"] / 1e6 / t["km2"]
    t["noche_cobertura_pct"] = 100 * t["noche_cobertura_m2"] / 1e6 / t["km2"]
    missing = t[t[["dia_db", "noche_db"]].isna().any(axis=1)]["barrio"].tolist()
    report["barrios_sin_franjas"] = missing
    for col in ("dia_db", "noche_db"):
        t[col] = t[col].fillna(t[col].mean())
    t["dia_fuente"] = np.where(t["dia_pct_2018"] > 50, "2018", "2025")  # fuente dominante
    t["noche_fuente"] = np.where(t["noche_pct_2018"] > 50, "2018", "2025")
    cols = ["barrio", "km2", "dia_db", "dia_cobertura_pct", "dia_fuente", "dia_pct_2018", "noche_db", "noche_cobertura_pct", "noche_fuente"]
    t[cols].round(2).to_csv(OUT_DIR / "ruido_por_barrio.csv", index=False, encoding="utf-8-sig")
    print(t[cols].round(1).sort_values("dia_db").to_string(index=False))
    rep_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))

    if args.solo_datos:
        return
    values = ",\n".join(
        f"        ('{r['barrio'].replace(chr(39), chr(39) * 2)}', {r['dia_db']:.2f}, {r['noche_db']:.2f})" for _, r in t.iterrows())
    n = len(t)
    sql = f"""-- Recalcula el ruido por barrio con el Mapa de Ruido de BA Data (publicación 2025),
-- ponderando por ÁREA de las franjas (V7 ponderaba por perímetro). Agrega el nivel nocturno.
-- Diurno: 2025 + Comuna 1 de la publicación 2018 (el archivo 2025 no la trae).
-- Generado con ml-service/scripts/build_noise_layers.py. No toca la geometría.
ALTER TABLE noise_zone ADD COLUMN noise_level_night NUMERIC(6, 2);

DO $$
DECLARE
    updated INT;
BEGIN
    WITH nuevos(name, day_db, night_db) AS (
        VALUES
{values}
    ), upd AS (
        UPDATE noise_zone nz
        SET noise_level = v.day_db, noise_level_night = v.night_db
        FROM nuevos v JOIN neighborhood n ON n.name = v.name
        WHERE nz.neighborhood_id = n.id
        RETURNING nz.id
    )
    SELECT count(*) INTO updated FROM upd;
    IF updated <> {n} THEN
        RAISE EXCEPTION 'Se actualizaron % zonas de ruido y se esperaban {n}', updated;
    END IF;
END $$;
"""
    OUT_MIGRATION.write_text(sql, encoding="utf-8")
    print(f"Migración: {OUT_MIGRATION}")


if __name__ == "__main__":
    main()
