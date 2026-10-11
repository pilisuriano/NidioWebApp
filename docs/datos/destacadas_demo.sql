-- Deja 6 publicaciones destacadas "de verdad" (3 venta + 3 alquiler, de barrios
-- distintos) para probar el inicio, el mapa y la ficha. Es solo para desarrollo.
--
-- El margen de 12 h en starts_at evita que la diferencia de zona horaria
-- entre la base y la app deje el destacado como "todavía no empezó".
-- Usa source = 'INCLUDED' sin addon ni pago: no toca packs ni pasarela.

WITH ya_destacadas AS (
    SELECT property_id FROM featured_listing WHERE ends_at > now()
),
venta AS (
    SELECT DISTINCT ON (p.neighborhood_id) p.id, p.created_by_user_id
    FROM property p
    WHERE p.active AND p.operation_type = 'SALE'
      AND p.created_by_user_id IS NOT NULL
      AND p.id NOT IN (SELECT property_id FROM ya_destacadas)
    ORDER BY p.neighborhood_id, p.id
    LIMIT 3
),
alquiler AS (
    SELECT DISTINCT ON (p.neighborhood_id) p.id, p.created_by_user_id
    FROM property p
    WHERE p.active AND p.operation_type = 'RENT'
      AND p.created_by_user_id IS NOT NULL
      AND p.id NOT IN (SELECT property_id FROM ya_destacadas)
    ORDER BY p.neighborhood_id, p.id DESC
    LIMIT 3
)
INSERT INTO featured_listing (property_id, user_id, source, starts_at, ends_at)
SELECT id, created_by_user_id, 'INCLUDED', now() - interval '12 hours', now() + interval '6 days'
FROM (SELECT * FROM venta UNION ALL SELECT * FROM alquiler) elegidas
RETURNING id, property_id;

-- Para sacarlas después, borrá por los id que devolvió el INSERT (columna id):
-- DELETE FROM featured_listing WHERE id IN (/* los 6 id */);
