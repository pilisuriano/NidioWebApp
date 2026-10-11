-- Recalcula el ruido por barrio con el Mapa de Ruido de BA Data (publicación 2025),
-- ponderando por ÁREA de las franjas (V7 ponderaba por perímetro). Agrega el nivel nocturno.
-- Diurno: 2025 + Comuna 1 de la publicación 2018 (el archivo 2025 no la trae).
-- Generado con ml-service/scripts/build_noise_layers.py. No toca la geometría.
ALTER TABLE noise_zone ADD COLUMN noise_level_night NUMERIC(6, 2);

DO $$
DECLARE
    updated INT;
BEGIN
    WITH nuevos(name, day_db, night_db) AS (
        VALUES
        ('Palermo', 71.76, 68.38),
        ('Recoleta', 70.65, 66.05),
        ('Belgrano', 70.92, 67.15),
        ('Núñez', 69.74, 66.13),
        ('Colegiales', 68.21, 64.46),
        ('Villa Urquiza', 67.92, 61.36),
        ('Villa Crespo', 73.32, 67.32),
        ('Caballito', 72.22, 66.71),
        ('Almagro', 73.24, 67.53),
        ('Balvanera', 73.32, 68.31),
        ('San Telmo', 75.29, 70.56),
        ('Puerto Madero', 68.93, 65.14),
        ('Retiro', 69.14, 66.64),
        ('San Nicolás', 72.23, 68.15),
        ('Monserrat', 73.44, 68.46),
        ('Boedo', 72.29, 66.87),
        ('Flores', 72.00, 67.08),
        ('Barracas', 69.79, 66.51),
        ('La Boca', 68.19, 64.94),
        ('Villa Devoto', 68.26, 64.86),
        ('Agronomía', 67.63, 61.87),
        ('Chacarita', 71.73, 65.94),
        ('Coghlan', 66.74, 60.22),
        ('Constitución', 74.41, 70.02),
        ('Floresta', 71.67, 65.70),
        ('La Paternal', 71.00, 65.14),
        ('Liniers', 70.56, 63.73),
        ('Mataderos', 69.58, 62.11),
        ('Monte Castro', 69.29, 63.61),
        ('Nueva Pompeya', 71.72, 68.20),
        ('Parque Avellaneda', 71.82, 64.75),
        ('Parque Chacabuco', 71.54, 66.65),
        ('Parque Chas', 67.75, 61.53),
        ('Parque Patricios', 71.42, 68.29),
        ('Saavedra', 71.09, 64.75),
        ('San Cristóbal', 73.20, 68.20),
        ('Vélez Sarsfield', 70.24, 64.52),
        ('Versalles', 71.27, 65.35),
        ('Villa del Parque', 66.65, 63.35),
        ('Villa General Mitre', 68.65, 65.23),
        ('Villa Lugano', 71.15, 66.15),
        ('Villa Luro', 70.01, 64.73),
        ('Villa Ortúzar', 70.64, 64.50),
        ('Villa Pueyrredón', 68.83, 62.57),
        ('Villa Real', 72.41, 66.96),
        ('Villa Riachuelo', 72.30, 67.19),
        ('Villa Santa Rita', 67.35, 63.94),
        ('Villa Soldati', 70.76, 66.06)
    ), upd AS (
        UPDATE noise_zone nz
        SET noise_level = v.day_db, noise_level_night = v.night_db
        FROM nuevos v JOIN neighborhood n ON n.name = v.name
        WHERE nz.neighborhood_id = n.id
        RETURNING nz.id
    )
    SELECT count(*) INTO updated FROM upd;
    IF updated <> 48 THEN
        RAISE EXCEPTION 'Se actualizaron % zonas de ruido y se esperaban 48', updated;
    END IF;
END $$;
