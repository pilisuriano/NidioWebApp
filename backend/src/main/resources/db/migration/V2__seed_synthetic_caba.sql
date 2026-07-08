-- Nidio — datos sintéticos temporales de CABA (solo Capital Federal).
-- Barrios con polígonos aproximados (rectángulos centrados en el centroide real),
-- precios por m² inspirados en valores de mercado, zonas de ruido/seguridad y
-- un catálogo de propiedades generado proceduralmente.
-- TEMPORAL: se reemplaza cuando exista el pipeline real de datos (ml-service).

SELECT setseed(0.4242);

-- ---------------------------------------------------------------------------
-- Barrios (polígono = rectángulo centrado en el centroide aproximado real)
-- ---------------------------------------------------------------------------
WITH barrios(name, lon, lat, w, h) AS (
    VALUES
        ('Palermo',       -58.425, -34.578, 0.030, 0.022),
        ('Recoleta',      -58.395, -34.588, 0.018, 0.012),
        ('Belgrano',      -58.456, -34.562, 0.024, 0.016),
        ('Núñez',         -58.463, -34.545, 0.018, 0.012),
        ('Colegiales',    -58.449, -34.573, 0.012, 0.009),
        ('Villa Urquiza', -58.491, -34.570, 0.018, 0.013),
        ('Villa Crespo',  -58.438, -34.599, 0.014, 0.010),
        ('Caballito',     -58.442, -34.619, 0.020, 0.013),
        ('Almagro',       -58.420, -34.610, 0.013, 0.010),
        ('Balvanera',     -58.398, -34.610, 0.014, 0.010),
        ('San Telmo',     -58.372, -34.621, 0.008, 0.008),
        ('Puerto Madero', -58.362, -34.611, 0.010, 0.014),
        ('Retiro',        -58.378, -34.592, 0.012, 0.010),
        ('San Nicolás',   -58.380, -34.603, 0.010, 0.008),
        ('Monserrat',     -58.381, -34.612, 0.010, 0.008),
        ('Boedo',         -58.418, -34.626, 0.011, 0.009),
        ('Flores',        -58.463, -34.628, 0.020, 0.014),
        ('Barracas',      -58.383, -34.645, 0.018, 0.014),
        ('La Boca',       -58.362, -34.634, 0.010, 0.011),
        ('Villa Devoto',  -58.513, -34.601, 0.018, 0.013)
)
INSERT INTO neighborhood (name, boundary)
SELECT name,
       ST_SetSRID(ST_MakeEnvelope(lon - w / 2, lat - h / 2, lon + w / 2, lat + h / 2), 4326)::geometry(Polygon, 4326)
FROM barrios;

-- ---------------------------------------------------------------------------
-- Precio promedio por m²: SALE en USD/m², RENT en ARS/m² mensual.
-- Dos períodos para poder mostrar variación (el heatmap usa el último).
-- ---------------------------------------------------------------------------
WITH precios(name, sale_usd_m2, rent_ars_m2) AS (
    VALUES
        ('Palermo',       3300, 15500),
        ('Recoleta',      3000, 14200),
        ('Belgrano',      3100, 14000),
        ('Núñez',         3000, 13500),
        ('Colegiales',    2800, 13000),
        ('Villa Urquiza', 2600, 12200),
        ('Villa Crespo',  2400, 12000),
        ('Caballito',     2300, 11500),
        ('Almagro',       2200, 11200),
        ('Balvanera',     1900, 10200),
        ('San Telmo',     2100, 10800),
        ('Puerto Madero', 5800, 25000),
        ('Retiro',        2900, 13200),
        ('San Nicolás',   1800,  9800),
        ('Monserrat',     1800,  9600),
        ('Boedo',         2000, 10400),
        ('Flores',        1900, 10000),
        ('Barracas',      1700,  9200),
        ('La Boca',       1500,  8500),
        ('Villa Devoto',  2200, 11000)
)
INSERT INTO neighborhood_price_m2 (neighborhood_id, operation_type, avg_price_m2, period)
SELECT n.id, op.operation_type,
       ROUND((CASE WHEN op.operation_type = 'SALE' THEN p.sale_usd_m2 ELSE p.rent_ars_m2 END) * per.factor, 2),
       per.period
FROM precios p
JOIN neighborhood n ON n.name = p.name
CROSS JOIN (VALUES ('SALE'), ('RENT')) AS op(operation_type)
CROSS JOIN (VALUES (DATE '2026-05-01', 0.97), (DATE '2026-06-01', 1.00)) AS per(period, factor);

-- ---------------------------------------------------------------------------
-- Zonas de ruido (corredores de avenidas ruidosos, parques silenciosos). dB aprox.
-- ---------------------------------------------------------------------------
WITH zonas(xmin, ymin, xmax, ymax, db) AS (
    VALUES
        (-58.3830, -34.6120, -58.3800, -34.5900, 82.0), -- Av. 9 de Julio
        (-58.4500, -34.6045, -58.3700, -34.6029, 76.0), -- Av. Corrientes
        (-58.4700, -34.6180, -58.3900, -34.6140, 78.0), -- Av. Rivadavia
        (-58.4300, -34.5890, -58.3900, -34.5870, 74.0), -- Av. Santa Fe
        (-58.4615, -34.5750, -58.4590, -34.5450, 75.0), -- Av. Cabildo
        (-58.4600, -34.6245, -58.3800, -34.6215, 80.0), -- Autopista 25 de Mayo
        (-58.3810, -34.6100, -58.3690, -34.6000, 72.0), -- Microcentro
        (-58.4230, -34.5760, -58.4070, -34.5640, 48.0), -- Parque Tres de Febrero
        (-58.4390, -34.6090, -58.4310, -34.6030, 50.0), -- Parque Centenario
        (-58.5200, -34.6050, -58.5060, -34.5950, 52.0)  -- Villa Devoto residencial
)
INSERT INTO noise_zone (area, noise_level)
SELECT ST_SetSRID(ST_MakeEnvelope(xmin, ymin, xmax, ymax), 4326)::geometry(Polygon, 4326), db
FROM zonas;

-- ---------------------------------------------------------------------------
-- Zonas de seguridad (security_index 0-100, más alto = más seguro).
-- ---------------------------------------------------------------------------
WITH zonas(xmin, ymin, xmax, ymax, crimes, idx) AS (
    VALUES
        (-58.4750, -34.5560, -58.4450, -34.5350, 120, 82.0), -- Núñez / Belgrano norte
        (-58.4400, -34.5900, -58.4100, -34.5670, 180, 78.0), -- Palermo
        (-58.4050, -34.5950, -58.3850, -34.5820, 150, 80.0), -- Recoleta
        (-58.5000, -34.5780, -58.4420, -34.5660, 210, 75.0), -- Colegiales / Urquiza
        (-58.4520, -34.6260, -58.4300, -34.5930, 320, 68.0), -- Caballito / Villa Crespo
        (-58.4060, -34.6160, -58.3900, -34.6040, 640, 45.0), -- Balvanera / Once
        (-58.3860, -34.6080, -58.3740, -34.5980, 580, 50.0), -- Microcentro / San Nicolás
        (-58.3900, -34.6300, -58.3760, -34.6150, 760, 38.0), -- Monserrat sur / Constitución
        (-58.3920, -34.6520, -58.3560, -34.6280, 980, 35.0), -- La Boca / Barracas
        (-58.4740, -34.6360, -58.4520, -34.6210, 460, 55.0)  -- Flores
)
INSERT INTO security_zone (area, crime_count, security_index)
SELECT ST_SetSRID(ST_MakeEnvelope(xmin, ymin, xmax, ymax), 4326)::geometry(Polygon, 4326), crimes, idx
FROM zonas;

-- ---------------------------------------------------------------------------
-- Propiedades sintéticas: 4 por barrio (2 venta + 2 alquiler), ubicación
-- aleatoria dentro del polígono del barrio, precio derivado del precio m².
-- ---------------------------------------------------------------------------
WITH streets(idx, name) AS (
    VALUES
        (0, 'Av. Santa Fe'), (1, 'Gorriti'), (2, 'Thames'), (3, 'Av. Cabildo'),
        (4, 'Arribeños'), (5, 'Olleros'), (6, 'Av. Corrientes'), (7, 'Av. Rivadavia'),
        (8, 'Defensa'), (9, 'Av. Pueyrredón'), (10, 'Amenábar'), (11, 'Av. Directorio')
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
           -- índice determinístico por fila para variar tipo/ambientes/foto/calle
           (n.id * 7 + g.i * 3 + CASE WHEN op.operation_type = 'SALE' THEN 0 ELSE 1 END) AS k,
           p.avg_price_m2
    FROM neighborhood n
    CROSS JOIN (VALUES ('SALE'), ('RENT')) AS op(operation_type)
    CROSS JOIN generate_series(1, 2) AS g(i)
    JOIN neighborhood_price_m2 p
      ON p.neighborhood_id = n.id
     AND p.operation_type = op.operation_type
     AND p.period = DATE '2026-06-01'
),
calc AS (
    SELECT b.*,
           (ARRAY['APARTMENT', 'APARTMENT', 'APARTMENT', 'HOUSE', 'PH'])[1 + b.k % 5] AS property_type, -- más deptos que casas/PH
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
