# Datos

- `raw/` — datasets crudos de entrenamiento (Kaggle/IDECBA). No versionado en git.
- `processed/` — datasets limpios, listos para entrenamiento. No versionado en git.
- `paradas-de-colectivo.csv` — SÍ versionado: lo lee `ml-service/src/geo/life_score.py` en tiempo de ejecución
  (categoría TRANSPORT del Life Score). No es un dataset de entrenamiento.
- `poi/` — SÍ versionado: datasets del Life Score, generados desde BA Data con los scripts de `scripts/`:
  - `pois.csv` — puntos (subte, tren, salud, educación, gastronomía, vida nocturna, comercio). Lo genera
    `scripts/build_poi_dataset.py`.
  - `green_spaces.geojson` — polígonos de espacios verdes públicos (simplificados a ~3 m). Lo genera el mismo script.
  - `thresholds.json` — cantidad de POIs que da 100 puntos en cada categoría, con la distribución real de la que salió.
    Lo genera `scripts/calibrate_life_score.py`.
  - `build_report.json` — cuántos registros entraron y cuántos se descartaron, y por qué.

## Life Score: cálculo sin servicios externos

Desde octubre de 2026 el Life Score se calcula **solo con estos archivos**, sin llamar a ninguna API. Antes consultaba
OpenStreetMap vía Overpass en cada cálculo (segundos de espera, sin garantía de servicio, una caída real en producción).
El cálculo mide, en un círculo de 800 m alrededor del punto, cuántos POIs hay por categoría y lo compara con el umbral
de `thresholds.json`.

## Fuentes del Life Score (todas BA Data, Gobierno de la Ciudad de Buenos Aires)

Todas con licencia **CC-BY 2.5 AR** según la ficha de cada dataset (consultadas el 05/10/2026). Los archivos se
descargaron el 05/10/2026 de https://data.buenosaires.gob.ar/ .

| Categoría | Dataset en BA Data | Archivo usado | Registros |
|---|---|---|---|
| TRANSPORT | Colectivos: paradas (`/dataset/colectivos-paradas`) | CSV | 6.962 paradas |
| TRANSPORT | Estaciones de subte (`/dataset/subte-estaciones`) | GeoJSON | 90 (84 estaciones tras unir combinaciones) |
| TRANSPORT | Estaciones de ferrocarril (`/dataset/estaciones-ferrocarril`) | GeoJSON | 301 (156 dentro de CABA y alrededores) |
| HEALTH | Hospitales (`/dataset/hospitales`) | GeoJSON | 36 |
| HEALTH | Centros de salud y acción comunitaria, CeSAC (`/dataset/centros-salud-accion-comunitaria-cesac`) | GeoJSON | 50 |
| HEALTH | Centros de salud privados (`/dataset/centros-salud-privados`) | SHP | 65 |
| HEALTH | Farmacias (`/dataset/farmacias`) | GeoJSON | 1.240 |
| EDUCATION | Establecimientos educativos (`/dataset/establecimientos-educativos`) | GeoJSON | 2.767 (1.801 edificios) |
| GASTRONOMY y NIGHTLIFE | Relevamiento de Usos del Suelo 2022-2024 (`/dataset/relevamiento-usos-suelo`) | SHP | 6.105 gastronomía y 1.147 vida nocturna (locales activos) |
| COMMERCE | Relevamiento de Usos del Suelo 2022-2024 (mismo archivo) + Ferias y mercados (`/dataset/ferias-mercados`), recursos "Mercados" y "Ferias" | SHP | 15.688 locales + 6 mercados + 30 ferias |
| GREEN_SPACE | Espacios verdes (`/dataset/espacios-verdes`), recurso "Espacios verdes públicos" | GeoJSON | 2.176 (1.068 usados) |

El **Relevamiento de Usos del Suelo (RUS)** es un relevamiento observacional de todas las parcelas de CABA, barrio por barrio (cada barrio se
relevó en 2022, 2023 o 2024: campo AÑO). Se usan los locales con ESTADO = ACTIVO y TIPO1 unicomercial o multicomercial, por actividad (TIPO2):
GASTRONOMY = restaurante, café, confitería, sandwichería, pizzería y parrilla; NIGHTLIFE = bar, cervecería y discoteca; COMMERCE = supermercado,
hipermercado, minimercado, almacén, verdulería, carnicería, panadería, fiambrería y quesería, granja, pescadería, dietética, mercado, shopping, kiosco y maxikiosco
(`--no-kiosks` excluye los kioscos y maxikioscos). Un punto por (calle, altura, actividad). El RUS no trae nombre comercial:
los POIs se muestran como "Actividad - Calle Altura". El punto es `representative_point()` de la parcela, calculado en la proyección original
(Gauss-Krüger, datum Campo Inchauspe) y pasado a WGS84; el control contra las farmacias oficiales de BA Data da una mediana de 25 m
(`validacion_rus_vs_farmacias` en `build_report.json`). Con `--gastro-source oferta` se vuelve a la "Oferta gastronómica" (registro
orientado al turismo, con nombres, pero con 2.705 locales contra 7.252 del RUS y mucho más concentrada en el centro).

Descartados a propósito: "Establecimientos gastronómicos" del mismo dataset (111 registros, instantánea de 2019, registro
turístico), "Locales bailables" (CSV sin coordenadas y con la mayoría de las inscripciones vencidas), espacios verdes
privados y catastrales, y ferias itinerantes (aparecen un día por semana).

## Atribución

Requerida por la licencia en cualquier lugar donde se muestre o redistribuya el dato:
"Datos: Gobierno de la Ciudad de Buenos Aires, data.buenosaires.gob.ar (CC BY 2.5 AR). Procesados por Nidio."
El frontend la muestra junto al Life Score. El mapa base sigue mostrando "© OpenStreetMap contributors" (aunque el
Life Score ya no usa datos de OSM, el mapa de fondo sí).

## Regenerar los datasets

```
cd ml-service
python scripts/build_poi_dataset.py --raw-dir "<carpeta con los archivos de BA Data>"   # arma pois.csv y green_spaces.geojson
python scripts/calibrate_life_score.py                                                  # recalcula thresholds.json
pytest tests/test_life_score.py tests/test_life_score_dataset.py
```

Opcional: `pip install ftfy` repara nombres mal codificados de la oferta gastronómica, que solo se usa con `--gastro-source oferta` (65 casos en la descarga del 05/10/2026, por ejemplo "AÃƒâ€˜ARO CERO" por "AÑARO CERO"); sin ftfy, el script usa un nombre genérico para esos locales.

El RUS pesa 88 MB comprimido (565 MB descomprimido) y no se versiona: se baja de BA Data y el script lo descomprime en `_extracted/`.

Los shapefiles vienen en `.zip` (se descomprimen solos). "Centros de salud privados" se bajó como un RAR con extensión
`.zip`: hay que descomprimirlo a mano en una subcarpeta de la carpeta de descarga antes de correr el script.

## Limitaciones conocidas

- Los datasets se actualizan cada trimestre o semestre (algunos, como la oferta gastronómica, son una foto sin
  actualización periódica): el Life Score refleja el momento de la descarga.
- El RUS es un relevamiento a pie en distintas fechas (2022, 2023 o 2024 según el barrio): un local que abrió o cerró después de
  esa visita no aparece o figura mal. Los locales marcados como inactivos (18 % de los comerciales relevados) no se cuentan.
- Los POIs de gastronomía, vida nocturna y comercio del RUS no tienen nombre comercial, solo actividad y dirección.
- La licencia del RUS hay que confirmarla en la ficha del dataset (la metadata del archivo no la trae).
- Los umbrales salen del percentil 90 de la distribución sobre 3.000 paradas de colectivo al azar (semilla 42); es un
  criterio documentado, no una medición de "calidad de vida".

## Otras fuentes del proyecto (entrenamiento del modelo de valuación)

- Kaggle / IDECBA / UADE-INECO / Properati: ver la Tabla III de la entrega y `claude/nidio-licencias-datos-y-life-score-datasets.md`
  (licencias de cada dataset, algunas todavía sin verificar).
