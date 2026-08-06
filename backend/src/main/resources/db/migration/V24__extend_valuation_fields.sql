-- Nidio -- V24: extiende `property` y `valuation_request` con los campos que necesita
-- el modelo XGBoost real. CORREGIDA (07/08/2026) despues de revisar el schema real del
-- repo -- la version anterior (V18, nunca aplicada) intentaba agregar `bathrooms` y
-- `surface_total_m2`, pero esas columnas YA EXISTEN (agregadas en V16, con el nombre
-- `total_surface_m2`) -- aplicar la version vieja habria roto la migracion o duplicado
-- el dato. Esta version parte del schema real (V1 a V23 ya aplicadas) y solo agrega lo
-- que genuinamente falta.
--
-- Puramente aditiva -- todas las columnas nullable, no rompe ninguna fila existente.
-- Ajustar el numero (V24) si para cuando se aplique ya existe una migracion mas nueva.

-- `property`: caracteristicas que el modelo usa y que la tabla todavia no tiene
-- (bathrooms/total_surface_m2/age_years/orientation ya existen desde V16 -- no tocar).
ALTER TABLE property
    ADD COLUMN expenses_usd NUMERIC(10,2),
    ADD COLUMN property_condition VARCHAR(30)
        CHECK (property_condition IN ('NEW', 'USED_GOOD_CONDITION', 'NEEDS_RENOVATION', 'NOT_SPECIFIED')),
    ADD COLUMN has_pool BOOLEAN,
    ADD COLUMN has_garage BOOLEAN,
    ADD COLUMN building_amenities BOOLEAN,
    ADD COLUMN security_24h BOOLEAN,
    ADD COLUMN bright BOOLEAN,
    ADD COLUMN apto_credito BOOLEAN,
    ADD COLUMN furnished BOOLEAN,
    ADD COLUMN valuation_explanation_text TEXT,
    ADD COLUMN valuation_explanation_json JSONB;

COMMENT ON COLUMN property.expenses_usd IS 'Expensas mensuales en USD. NULL = dato desconocido O propiedad sin consorcio (Casa/PH) -- NUNCA usar 0, ver bitacora del modelo 6.40';
COMMENT ON COLUMN property.valuation_explanation_text IS 'Texto en espanol listo para mostrar al usuario (factores + rango), generado por ml-service via TreeSHAP nativo de XGBoost';
COMMENT ON COLUMN property.valuation_explanation_json IS 'Lista de factores {factor, contribution, direction} en formato JSON, para UI custom si el texto plano no alcanza';

-- `valuation_request` ("Mis busquedas", ver ValuationController/ValuationService): solo
-- se agrega el texto de explicacion para mostrarlo en el resultado de la consulta en
-- vivo. Las caracteristicas opcionales que el usuario puede cargar para una estimacion
-- mas precisa (banos, expensas, amenities, etc.) NO se persisten -- son un input
-- efimero que solo se usa para armar el pedido a ml-service, se descartan despues de
-- usarse (decision de alcance, ver CAMBIOS_JAVA_PENDIENTES.md seccion 2 -- avisar si se
-- prefiere guardarlas tambien).
ALTER TABLE valuation_request
    ADD COLUMN explanation_text TEXT;

COMMENT ON COLUMN valuation_request.explanation_text IS 'Texto en espanol generado por ml-service via TreeSHAP, mostrado en el resultado de la valuacion en vivo';
