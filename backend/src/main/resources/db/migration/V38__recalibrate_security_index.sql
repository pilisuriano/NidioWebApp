-- Recalibra el índice de seguridad por barrio (Delitos 2023-2025, BA Data).
-- Generado con ml-service/scripts/recalibrate_security.py. Solo hurto, robo,
-- lesiones y homicidios; índice = 50 % volumen (hechos ponderados por km²) +
-- 50 % gravedad (proporción con arma). crime_count = hechos por año.
-- No toca la geometría: actualiza cada zona por su barrio (neighborhood_id, V9).
-- Si alguna zona no queda vinculada a su barrio, la migración falla a propósito.
DO $$
DECLARE
    updated INT;
BEGIN
    WITH nuevos(name, crime_count, security_index) AS (
        VALUES
        ('Palermo', 11031, 49.0),
        ('Recoleta', 5749, 24.0),
        ('Belgrano', 4262, 82.3),
        ('Núñez', 1744, 89.6),
        ('Colegiales', 1685, 56.3),
        ('Villa Urquiza', 2519, 82.3),
        ('Villa Crespo', 3749, 68.8),
        ('Caballito', 5690, 59.4),
        ('Almagro', 5088, 53.1),
        ('Balvanera', 8282, 29.2),
        ('San Telmo', 1956, 11.5),
        ('Puerto Madero', 616, 74.0),
        ('Retiro', 3558, 4.2),
        ('San Nicolás', 4924, 33.3),
        ('Monserrat', 3343, 27.1),
        ('Boedo', 1635, 31.2),
        ('Flores', 7007, 14.6),
        ('Barracas', 4482, 7.3),
        ('La Boca', 2160, 20.8),
        ('Villa Devoto', 2516, 77.1),
        ('Agronomía', 400, 97.9),
        ('Chacarita', 1798, 39.6),
        ('Coghlan', 487, 87.5),
        ('Constitución', 3464, 2.1),
        ('Floresta', 1555, 49.0),
        ('La Paternal', 812, 66.7),
        ('Liniers', 2444, 41.7),
        ('Mataderos', 2850, 45.8),
        ('Monte Castro', 977, 95.8),
        ('Nueva Pompeya', 2912, 7.3),
        ('Parque Avellaneda', 1840, 37.5),
        ('Parque Chacabuco', 3053, 16.7),
        ('Parque Chas', 506, 92.7),
        ('Parque Patricios', 2112, 24.0),
        ('Saavedra', 1903, 85.4),
        ('San Cristóbal', 1984, 18.7),
        ('Vélez Sarsfield', 1085, 53.1),
        ('Versalles', 589, 59.4),
        ('Villa del Parque', 1512, 70.8),
        ('Villa General Mitre', 1129, 64.6),
        ('Villa Lugano', 4695, 11.5),
        ('Villa Luro', 1133, 92.7),
        ('Villa Ortúzar', 668, 79.2),
        ('Villa Pueyrredón', 1230, 100.0),
        ('Villa Real', 548, 43.8),
        ('Villa Riachuelo', 607, 62.5),
        ('Villa Santa Rita', 1011, 74.0),
        ('Villa Soldati', 2829, 35.4)
    ), upd AS (
        UPDATE security_zone sz
        SET crime_count = v.crime_count, security_index = v.security_index
        FROM nuevos v JOIN neighborhood n ON n.name = v.name
        WHERE sz.neighborhood_id = n.id
        RETURNING sz.id
    )
    SELECT count(*) INTO updated FROM upd;
    IF updated <> 48 THEN
        RAISE EXCEPTION 'Se actualizaron % zonas de seguridad y se esperaban 48', updated;
    END IF;
END $$;
