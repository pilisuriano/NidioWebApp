-- La "Inmobiliaria Nidio Demo" sembrada en V17 quedó sin teléfono (solo se
-- cargó para "Marcos Ferreyra"), así que el cartel de "Publicado por" no
-- tiene nada para mostrar en esa columna. Se completa acá en vez de tocar
-- V17 (ya aplicada, no se puede editar una migración que Flyway ya corrió).
UPDATE "user" SET phone = '1147778899' WHERE email = 'inmobiliaria.demo@nidio.app';
