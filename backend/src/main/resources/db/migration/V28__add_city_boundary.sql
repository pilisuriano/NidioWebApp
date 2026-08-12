-- Contorno de toda CABA (límite de la ciudad), como tabla propia en vez de
-- calcularse en el momento uniendo los ~48 barrios (ver NeighborhoodService,
-- versión anterior de getCabaBoundary): los barrios vienen de una
-- digitalización barrio por barrio, así que sus bordes compartidos no
-- coinciden coordenada por coordenada, y la unión en vivo (incluso con
-- buffer/dissolve) dejaba costuras sueltas ("rayas") por dentro del área.
-- La fuente correcta es el dataset "Perímetro" de Buenos Aires Data
-- (https://data.buenosaires.gob.ar/dataset/perimetro), un único polígono
-- oficial que NO se deriva de unir los barrios -- ver
-- ml-service/scripts/generate_caba_perimeter.py, que genera la migración
-- V29 con los datos reales (una sola fila en esta tabla).
CREATE TABLE city_boundary (
    id BIGSERIAL PRIMARY KEY,
    boundary geometry(Polygon, 4326) NOT NULL
);

CREATE INDEX idx_city_boundary_boundary ON city_boundary USING GIST (boundary);
