-- Reemplaza los precios/m² sintéticos por datos reales de IDECBA,
-- segmentados por ambientes (1-3) y condición (usado/a estrenar).
-- Generado con ml-service/scripts/generate_real_idecba_prices.py

ALTER TABLE neighborhood_price_m2 ADD COLUMN rooms INT;
ALTER TABLE neighborhood_price_m2 ADD COLUMN condition VARCHAR(10);

DELETE FROM neighborhood_price_m2;

-- SALE 1amb USED NO cargado (error: Missing optional dependency 'openpyxl'.  Use pip or conda to install openpyxl.)
-- SALE 1amb NEW NO cargado (error: Missing optional dependency 'openpyxl'.  Use pip or conda to install openpyxl.)
-- SALE 2amb USED NO cargado (error: Missing optional dependency 'openpyxl'.  Use pip or conda to install openpyxl.)
-- SALE 2amb NEW NO cargado (error: Missing optional dependency 'openpyxl'.  Use pip or conda to install openpyxl.)
-- SALE 3amb USED NO cargado (error: Missing optional dependency 'openpyxl'.  Use pip or conda to install openpyxl.)
-- SALE 3amb NEW NO cargado (error: Missing optional dependency 'openpyxl'.  Use pip or conda to install openpyxl.)
-- RENT 1amb USED NO cargado (error: <urlopen error [Errno 60] Operation timed out>)
-- RENT 2amb USED NO cargado (error: Missing optional dependency 'openpyxl'.  Use pip or conda to install openpyxl.)
-- RENT 3amb USED NO cargado (error: Missing optional dependency 'openpyxl'.  Use pip or conda to install openpyxl.)
ALTER TABLE neighborhood_price_m2 ALTER COLUMN rooms SET NOT NULL;
ALTER TABLE neighborhood_price_m2 ALTER COLUMN condition SET NOT NULL;
ALTER TABLE neighborhood_price_m2 ADD CONSTRAINT chk_price_rooms CHECK (rooms BETWEEN 1 AND 3);
ALTER TABLE neighborhood_price_m2 ADD CONSTRAINT chk_price_condition CHECK (condition IN ('USED', 'NEW'));
