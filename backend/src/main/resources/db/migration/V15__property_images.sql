-- HU "Publicar": una propiedad puede tener varias fotos, no solo una.
-- Se reemplaza la columna image_url (una sola foto) por una tabla hija
-- ordenada (property_image), migrando el dato existente antes de borrar
-- la columna vieja.
CREATE TABLE property_image (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_property_image_property_id ON property_image(property_id);

INSERT INTO property_image (property_id, url, sort_order)
SELECT id, image_url, 0 FROM property WHERE image_url IS NOT NULL AND image_url <> '';

ALTER TABLE property DROP COLUMN image_url;
