-- Épica 4 (Life Score): lugares personales que el usuario agrega a mano
-- (ej. "casa de mis papás", "gimnasio") para sumarlos al cálculo del Life
-- Score además de las 7 categorías fijas de POIs (ver docs/architecture/erd.md
-- y LifeScoreService.calculateLifeScore/scoreCustomPlaces).
--
-- address/lat/lon quedan como TEXT porque se guardan CIFRADOS a nivel de
-- aplicación (AES-256-GCM, ver EncryptedStringConverter) -- son direcciones
-- personales del usuario, a diferencia de la dirección de una propiedad
-- publicada (pública por diseño, columna varchar sin cifrar). Por eso no es
-- un `geometry(Point,4326)` como en el resto de las tablas geoespaciales: el
-- cálculo de distancia se hace en Java (Haversine, no una consulta espacial
-- SQL contra esta tabla), así que no hace falta un tipo espacial ni su
-- índice GiST acá -- y de paso, si tuviera que consultarse por SQL, un
-- índice espacial sobre datos cifrados no serviría de nada de todos modos.
CREATE TABLE custom_place (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES "user" (id),
    label VARCHAR(120) NOT NULL,
    address TEXT NOT NULL,
    lat TEXT NOT NULL,
    lon TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_custom_place_user_id ON custom_place (user_id);
