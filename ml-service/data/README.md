# Datos

- `raw/` — datasets crudos (Kaggle/IDECBA). No versionado en git.
- `processed/` — datasets limpios, listos para entrenamiento. No versionado en git.
- `paradas-de-colectivo.csv` — SÍ versionado en git (no está en `raw/` ni `processed/`, a propósito): lo usa
  `ml-service/src/geo/life_score.py` (`_load_bus_stops`) en tiempo de ejecución para la categoría TRANSPORT del
  Life Score, no es un dataset de entrenamiento.

## Fuentes

- Kaggle: TBD (link de descarga)
- IDECBA (Infraestructura de Datos Espaciales de la Ciudad de Buenos Aires): TBD (link de descarga)
- BA Data — "Colectivos: paradas" (Gobierno de la Ciudad de Buenos Aires, Secretaría de Transporte y Obras
  Públicas): https://data.buenosaires.gob.ar/dataset/colectivos-paradas — descargado el 15/08/2026 (dataset
  actualizado por su publicador el 18/06/2026). 6962 paradas, columnas `L1`-`L6` con hasta 6 líneas de
  colectivo por parada. Usado por `_load_bus_stops()` para reemplazar a OSM/Overpass en esa categoría
  puntual, porque OSM casi nunca tiene cargado con qué línea corresponde una parada de colectivo.

## Licencia / atribución

- BA Data ("Colectivos: paradas"): licencia CC-BY 2.5 AR — uso libre (incluido académico), requiere
  atribución a la fuente ("Gobierno de la Ciudad de Buenos Aires — data.buenosaires.gob.ar") en cualquier
  lugar donde se muestre o redistribuya el dato. Pendiente: agregar esa atribución visible en el frontend
  (por ejemplo, junto al mapa de Life Score) además de acá.
- Kaggle / IDECBA: TBD — completar con la licencia de cada dataset utilizado y su atribución correspondiente.
