-- Ruido ambiental de cada propiedad (día y noche), para mostrar etiquetas en las
-- tarjetas y en la ficha. Se calcula en ml-service (GET /noise) con el Mapa de
-- Ruido de BA Data y se guarda acá, igual que el Life Score por categoría (V36):
-- depende solo de la ubicación, así que es determinista y se calcula al
-- publicar, al cambiar la dirección o cuando cambia datasets_version.
--
-- Se guarda una fila aunque la propiedad no tenga dato en alguno de los dos
-- períodos (columnas en NULL = "sin dato"); así el relleno no la reintenta.
-- level: 1 = tranquilo ... 4 = muy ruidoso (escala relativa a CABA, ver
-- ml-service/data/noise/thresholds.json). *_src: año del dato ('2025', o '2018'
-- para el diurno de la Comuna 1).
CREATE TABLE property_noise (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES property (id) ON DELETE CASCADE,
    day_level SMALLINT CHECK (day_level BETWEEN 1 AND 4),
    day_db_low INT,
    day_db_high INT,
    day_src VARCHAR(8),
    night_level SMALLINT CHECK (night_level BETWEEN 1 AND 4),
    night_db_low INT,
    night_db_high INT,
    night_src VARCHAR(8),
    datasets_version VARCHAR(40) NOT NULL,
    computed_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_property_noise_property UNIQUE (property_id)
);
