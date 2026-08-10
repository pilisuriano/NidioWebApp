-- Nidio -- V26: borra el catalogo sintetico original (V2/V10), reemplazado
-- por las 200 propiedades reales sembradas en V25. Solo afecta filas SIN
-- dueño (created_by_user_id IS NULL) -- las propiedades demo de V17 y las 200
-- nuevas de V25 SI tienen dueño, no se tocan.
DELETE FROM property WHERE created_by_user_id IS NULL;
