-- Favoritos: reemplaza a "Mis búsquedas" (que mostraba el historial de
-- valuaciones/Life Score) por propiedades que el usuario marcó. UNIQUE
-- evita duplicados si se toca el corazón dos veces; ON DELETE CASCADE para
-- que no queden favoritos huérfanos si se borra el usuario o la propiedad.
CREATE TABLE favorite (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES property (id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (user_id, property_id)
);
