"""Reemplaza los precios/m² sintéticos por datos reales de IDECBA, segmentados
por ambientes y usado/a estrenar (el mapa de calor ahora deja elegir esto en
vez de que el equipo lo promedie a mano).

Contexto: `neighborhood_price_m2` traía un único valor sintético por barrio y
tipo de operación. El documento formal cita a IDECBA como fuente para esta
variable (sección 2.1.6.2), pero IDECBA no publica "un" precio/m² por barrio:
publica una serie separada por cantidad de ambientes (1/2/3) y por condición
(usado / a estrenar), y solo para Venta — Alquiler no distingue a estrenar
porque casi no hay oferta de alquileres a estrenar.

9 series reales (confirmadas a mano navegando estadisticaciudad.gob.ar,
sección "Mercado Inmobiliario" — no hay API, son archivos .xlsx fijos):
  Venta  (USD/m²):        1, 2 y 3 ambientes × {usados, a estrenar}  = 6
  Alquiler (ARS, precio total del depto, IDECBA no lo publica por m²):
                           1, 2 y 3 ambientes, solo usados            = 3

Cada Excel tiene una fila por barrio y una columna por trimestre (el rango
exacto varía según la serie). Se toma la última columna con datos como el
valor más reciente. El layout del header puede variar levemente entre
archivos así que se detecta de forma defensiva: si no encuentra la fila con
"Barrio", corta con un mensaje claro en vez de asumir cualquier cosa.

Requiere conexión a internet normal (mismo motivo que los scripts anteriores:
el sandbox de Claude no llega a estadisticaciudad.gob.ar). Correr localmente:

    cd ml-service
    source .venv/bin/activate
    python scripts/generate_real_idecba_prices.py

Output: backend/src/main/resources/db/migration/V8__real_idecba_prices.sql
"""

import os
import re
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

import pandas as pd

# (operation_type, rooms, condition, url) — confirmados navegando el sitio,
# sección Mercado Inmobiliario > series "... por barrio".
SERIES = [
    ("SALE", 1, "USED", "https://www.estadisticaciudad.gob.ar/eyc/wp-content/uploads/2025/12/MI_DVP_AX10.xlsx"),
    ("SALE", 1, "NEW", "https://www.estadisticaciudad.gob.ar/eyc/wp-content/uploads/2025/12/MI_DVP_AX09.xlsx"),
    ("SALE", 2, "USED", "https://www.estadisticaciudad.gob.ar/eyc/wp-content/uploads/2025/12/MI_DVP_AX03.xlsx"),
    ("SALE", 2, "NEW", "https://www.estadisticaciudad.gob.ar/eyc/wp-content/uploads/2025/12/MI_DVP_AX01.xlsx"),
    ("SALE", 3, "USED", "https://www.estadisticaciudad.gob.ar/eyc/wp-content/uploads/2025/12/MI_DVP_AX04.xlsx"),
    ("SALE", 3, "NEW", "https://www.estadisticaciudad.gob.ar/eyc/wp-content/uploads/2025/12/MI_DVP_AX02.xlsx"),
    ("RENT", 1, "USED", "https://www.estadisticaciudad.gob.ar/eyc/wp-content/uploads/2025/12/MI_DAP_AX09.xlsx"),
    ("RENT", 2, "USED", "https://www.estadisticaciudad.gob.ar/eyc/wp-content/uploads/2026/01/MI_DAP_AX10.xlsx"),
    ("RENT", 3, "USED", "https://www.estadisticaciudad.gob.ar/eyc/wp-content/uploads/2026/01/MI_DAP_AX11.xlsx"),
]

# Mismos 48 barrios oficiales que ya usan generate_barrio_boundaries.py /
# generate_remaining_barrios.py / generate_real_noise_security.py.
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

# Alias nombre-seed -> clave normalizada, para cuando IDECBA no usa un
# normalize() directo (mismo criterio que los scripts anteriores; se
# completa según lo que reporte la corrida real si aparecen más casos).
ALIASES = {
    "La Boca": "BOCA",
    "Villa General Mitre": "VILLA GRAL. MITRE",
    "La Paternal": "PATERNAL",
}

OUTPUT_PATH = (
    Path(__file__).resolve().parents[2]
    / "backend" / "src" / "main" / "resources" / "db" / "migration"
    / "V8__real_idecba_prices.sql"
)


def normalize(name: str) -> str:
    nfkd = unicodedata.normalize("NFKD", str(name))
    ascii_name = "".join(c for c in nfkd if not unicodedata.combining(c))
    return ascii_name.upper().strip()


def find_header_row(raw: pd.DataFrame):
    """IDECBA suele meter filas de título/metadata antes de la tabla real;
    se busca la primera fila que contenga la palabra 'Barrio' en alguna celda."""
    limit = min(20, len(raw))
    for i in range(limit):
        row_text = raw.iloc[i].astype(str).str.upper()
        if row_text.str.contains("BARRIO", na=False).any():
            return i
    return None


def parse_period(col_label: str):
    """Intenta extraer trimestre/año del nombre de columna (ej. '1er trim.
    2026', 'T1 2026', '2026-1'). Si no puede, usa enero del año encontrado, y
    si tampoco hay año, devuelve None (se avisa y se usa un fallback)."""
    text = str(col_label)
    year_match = re.search(r"(20\d{2})", text)
    if not year_match:
        return None
    year = int(year_match.group(1))
    trim_match = re.search(r"([1-4])\s*(?:er|do|ro|to)?\s*(?:trim|T\b)", text, re.IGNORECASE)
    trimester = int(trim_match.group(1)) if trim_match else 1
    month = {1: 1, 2: 4, 3: 7, 4: 10}.get(trimester, 1)
    return f"{year:04d}-{month:02d}-01"


def load_series(url: str):
    raw = pd.read_excel(url, header=None)
    header_row = find_header_row(raw)
    if header_row is None:
        raise RuntimeError(f"No encontré una fila con 'Barrio' en las primeras filas de {url}.")

    df = pd.read_excel(url, header=header_row)
    df.columns = [str(c).strip() for c in df.columns]
    barrio_col = next((c for c in df.columns if "BARRIO" in c.upper()), None)
    if barrio_col is None:
        raise RuntimeError(f"No encontré columna de barrio en {url}. Columnas: {list(df.columns)}")

    value_cols = [c for c in df.columns if c != barrio_col]
    latest_col = None
    for c in reversed(value_cols):
        numeric = pd.to_numeric(df[c], errors="coerce")
        if numeric.notna().any():
            latest_col = c
            break
    if latest_col is None:
        raise RuntimeError(f"No encontré ninguna columna con valores numéricos en {url}.")

    period = parse_period(latest_col) or "2026-01-01"

    df["_value"] = pd.to_numeric(df[latest_col], errors="coerce")
    df["_key"] = df[barrio_col].apply(normalize)
    clean = df[["_key", "_value"]].dropna(subset=["_value"])
    return clean, latest_col, period


def main() -> None:
    lines = [
        "-- Reemplaza los precios/m² sintéticos por datos reales de IDECBA,",
        "-- segmentados por ambientes (1-3) y condición (usado/a estrenar).",
        "-- Generado con ml-service/scripts/generate_real_idecba_prices.py",
        "",
        "ALTER TABLE neighborhood_price_m2 ADD COLUMN rooms INT;",
        "ALTER TABLE neighborhood_price_m2 ADD COLUMN condition VARCHAR(10);",
        "",
        "DELETE FROM neighborhood_price_m2;",
        "",
    ]

    total_rows = 0
    for operation_type, rooms, condition, url in SERIES:
        label = f"{operation_type} {rooms}amb {condition}"
        print(f"Leyendo {label}: {url}")
        try:
            data, latest_col, period = load_series(url)
        except Exception as exc:  # noqa: BLE001
            print(f"  ERROR en {label}: {exc}")
            lines.append(f"-- {label} NO cargado (error: {exc})")
            continue

        by_key = dict(zip(data["_key"], data["_value"]))
        matched = 0
        missing = []
        for name in NEIGHBORHOODS:
            key = ALIASES.get(name, normalize(name))
            value = by_key.get(key)
            if value is None:
                missing.append(name)
                continue
            escaped = name.replace("'", "''")
            lines.append(
                f"INSERT INTO neighborhood_price_m2 "
                f"(neighborhood_id, operation_type, rooms, condition, avg_price_m2, period) "
                f"SELECT id, '{operation_type}', {rooms}, '{condition}', {value}, '{period}' "
                f"FROM neighborhood WHERE name = '{escaped}';"
            )
            matched += 1
            total_rows += 1

        print(f"  Columna usada como más reciente: '{latest_col}' -> período {period}")
        print(f"  Barrios cargados: {matched}/{len(NEIGHBORHOODS)}")
        if missing:
            print(f"  Sin match: {missing}")
        lines.append("")

    lines += [
        "ALTER TABLE neighborhood_price_m2 ALTER COLUMN rooms SET NOT NULL;",
        "ALTER TABLE neighborhood_price_m2 ALTER COLUMN condition SET NOT NULL;",
        "ALTER TABLE neighborhood_price_m2 "
        "ADD CONSTRAINT chk_price_rooms CHECK (rooms BETWEEN 1 AND 3);",
        "ALTER TABLE neighborhood_price_m2 "
        "ADD CONSTRAINT chk_price_condition CHECK (condition IN ('USED', 'NEW'));",
    ]

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\nGenerado: {OUTPUT_PATH}")
    print(f"Filas insertadas en total: {total_rows} (de un máximo de {len(SERIES) * len(NEIGHBORHOODS)})")


if __name__ == "__main__":
    main()
