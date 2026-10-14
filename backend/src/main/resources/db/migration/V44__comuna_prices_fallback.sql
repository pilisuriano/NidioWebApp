-- Precios de referencia por COMUNA (IDECBA) para completar, en el mapa de precios, los barrios
-- sin dato propio. Segmento del mapa: 2 ambientes usados. Venta: USD por m². Alquiler: ARS por mes
-- (precio total del departamento). Último trimestre con dato de cada comuna (puede ser provisorio).
-- Alquiler: la Comuna 8 no tiene ningún valor en la serie de IDECBA (todo '///'), por eso no figura.
-- Generado con ml-service/scripts/generate_comuna_prices_migration.py.

ALTER TABLE neighborhood ADD COLUMN IF NOT EXISTS comuna INTEGER;

UPDATE neighborhood SET comuna = 15 WHERE name = 'Agronomía';
UPDATE neighborhood SET comuna = 5 WHERE name = 'Almagro';
UPDATE neighborhood SET comuna = 3 WHERE name = 'Balvanera';
UPDATE neighborhood SET comuna = 4 WHERE name = 'Barracas';
UPDATE neighborhood SET comuna = 13 WHERE name = 'Belgrano';
UPDATE neighborhood SET comuna = 5 WHERE name = 'Boedo';
UPDATE neighborhood SET comuna = 6 WHERE name = 'Caballito';
UPDATE neighborhood SET comuna = 15 WHERE name = 'Chacarita';
UPDATE neighborhood SET comuna = 12 WHERE name = 'Coghlan';
UPDATE neighborhood SET comuna = 13 WHERE name = 'Colegiales';
UPDATE neighborhood SET comuna = 1 WHERE name = 'Constitución';
UPDATE neighborhood SET comuna = 7 WHERE name = 'Flores';
UPDATE neighborhood SET comuna = 10 WHERE name = 'Floresta';
UPDATE neighborhood SET comuna = 4 WHERE name = 'La Boca';
UPDATE neighborhood SET comuna = 15 WHERE name = 'La Paternal';
UPDATE neighborhood SET comuna = 9 WHERE name = 'Liniers';
UPDATE neighborhood SET comuna = 9 WHERE name = 'Mataderos';
UPDATE neighborhood SET comuna = 1 WHERE name = 'Monserrat';
UPDATE neighborhood SET comuna = 10 WHERE name = 'Monte Castro';
UPDATE neighborhood SET comuna = 4 WHERE name = 'Nueva Pompeya';
UPDATE neighborhood SET comuna = 13 WHERE name = 'Núñez';
UPDATE neighborhood SET comuna = 14 WHERE name = 'Palermo';
UPDATE neighborhood SET comuna = 9 WHERE name = 'Parque Avellaneda';
UPDATE neighborhood SET comuna = 7 WHERE name = 'Parque Chacabuco';
UPDATE neighborhood SET comuna = 15 WHERE name = 'Parque Chas';
UPDATE neighborhood SET comuna = 4 WHERE name = 'Parque Patricios';
UPDATE neighborhood SET comuna = 1 WHERE name = 'Puerto Madero';
UPDATE neighborhood SET comuna = 2 WHERE name = 'Recoleta';
UPDATE neighborhood SET comuna = 1 WHERE name = 'Retiro';
UPDATE neighborhood SET comuna = 12 WHERE name = 'Saavedra';
UPDATE neighborhood SET comuna = 3 WHERE name = 'San Cristóbal';
UPDATE neighborhood SET comuna = 1 WHERE name = 'San Nicolás';
UPDATE neighborhood SET comuna = 1 WHERE name = 'San Telmo';
UPDATE neighborhood SET comuna = 10 WHERE name = 'Versalles';
UPDATE neighborhood SET comuna = 15 WHERE name = 'Villa Crespo';
UPDATE neighborhood SET comuna = 11 WHERE name = 'Villa Devoto';
UPDATE neighborhood SET comuna = 11 WHERE name = 'Villa General Mitre';
UPDATE neighborhood SET comuna = 8 WHERE name = 'Villa Lugano';
UPDATE neighborhood SET comuna = 10 WHERE name = 'Villa Luro';
UPDATE neighborhood SET comuna = 15 WHERE name = 'Villa Ortúzar';
UPDATE neighborhood SET comuna = 12 WHERE name = 'Villa Pueyrredón';
UPDATE neighborhood SET comuna = 10 WHERE name = 'Villa Real';
UPDATE neighborhood SET comuna = 8 WHERE name = 'Villa Riachuelo';
UPDATE neighborhood SET comuna = 11 WHERE name = 'Villa Santa Rita';
UPDATE neighborhood SET comuna = 8 WHERE name = 'Villa Soldati';
UPDATE neighborhood SET comuna = 12 WHERE name = 'Villa Urquiza';
UPDATE neighborhood SET comuna = 11 WHERE name = 'Villa del Parque';
UPDATE neighborhood SET comuna = 10 WHERE name = 'Vélez Sarsfield';

CREATE TABLE IF NOT EXISTS comuna_price_m2 (
    id BIGSERIAL PRIMARY KEY,
    comuna INTEGER NOT NULL,
    operation_type VARCHAR(20) NOT NULL,
    rooms INTEGER NOT NULL,
    condition VARCHAR(10) NOT NULL,
    avg_price_m2 NUMERIC(14,2) NOT NULL,
    period DATE NOT NULL,
    CONSTRAINT uq_comuna_price UNIQUE (comuna, operation_type, rooms, condition)
);

INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (1, 'SALE', 2, 'USED', 2318.15, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (2, 'SALE', 2, 'USED', 2679.57, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (3, 'SALE', 2, 'USED', 1720.74, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (4, 'SALE', 2, 'USED', 1769.59, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (5, 'SALE', 2, 'USED', 2084.39, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (6, 'SALE', 2, 'USED', 2316.67, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (7, 'SALE', 2, 'USED', 2059.46, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (8, 'SALE', 2, 'USED', 1535.99, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (9, 'SALE', 2, 'USED', 1839.11, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (10, 'SALE', 2, 'USED', 1935.8, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (11, 'SALE', 2, 'USED', 2254.29, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (12, 'SALE', 2, 'USED', 2783.05, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (13, 'SALE', 2, 'USED', 3009.22, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (14, 'SALE', 2, 'USED', 3118.04, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (15, 'SALE', 2, 'USED', 2545.34, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (1, 'RENT', 2, 'USED', 702921.61, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (2, 'RENT', 2, 'USED', 800626.49, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (3, 'RENT', 2, 'USED', 681858.91, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (4, 'RENT', 2, 'USED', 649493.85, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (5, 'RENT', 2, 'USED', 728540.76, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (6, 'RENT', 2, 'USED', 767391.9, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (7, 'RENT', 2, 'USED', 684566.78, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (9, 'RENT', 2, 'USED', 694176.01, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (10, 'RENT', 2, 'USED', 704743.31, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (11, 'RENT', 2, 'USED', 717302.14, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (12, 'RENT', 2, 'USED', 810739.78, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (13, 'RENT', 2, 'USED', 833490.8, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (14, 'RENT', 2, 'USED', 839052.74, '2026-04-01');
INSERT INTO comuna_price_m2 (comuna, operation_type, rooms, condition, avg_price_m2, period) VALUES (15, 'RENT', 2, 'USED', 791520.27, '2026-04-01');
