-- Características adicionales (dataset de entrenamiento del modelo de
-- valuación trae más que superficie/ambientes/tipo) y tipo de publicador,
-- para mostrar en la ficha de detalle estilo Zonaprop. Todas nullable:
-- son datos opcionales que se cargan en "Publicar", el catálogo existente
-- no los tiene.
ALTER TABLE property ADD COLUMN bathrooms INTEGER;
ALTER TABLE property ADD COLUMN total_surface_m2 NUMERIC(10, 2);
ALTER TABLE property ADD COLUMN age_years INTEGER;
ALTER TABLE property ADD COLUMN orientation VARCHAR(20);

-- publisher_type sí es NOT NULL: toda propiedad tiene un publicador que es
-- inmobiliaria o dueño directo. Las filas existentes (catálogo sintético,
-- publicadas por usuarios individuales) quedan como OWNER por defecto.
ALTER TABLE property ADD COLUMN publisher_type VARCHAR(20) NOT NULL DEFAULT 'OWNER';
