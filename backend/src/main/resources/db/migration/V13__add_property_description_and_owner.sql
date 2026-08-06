-- Soporta el flujo de "Publicar" (HU nueva): propiedades cargadas por un
-- usuario, no solo el catálogo sintético inicial. description es opcional
-- (paso "Extras" del formulario); created_by_user_id queda nullable porque
-- el catálogo sintético existente no tiene un usuario dueño.
ALTER TABLE property ADD COLUMN description TEXT;
ALTER TABLE property ADD COLUMN created_by_user_id BIGINT REFERENCES "user" (id);
