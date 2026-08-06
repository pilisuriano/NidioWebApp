-- Vincula cada zona de ruido/seguridad con su barrio (neighborhood), para
-- poder mostrar el nombre del barrio al hacer click en el mapa. Hasta ahora
-- noise_zone/security_zone solo tenían geometría propia, sin relación con
-- 'neighborhood' (por diseño original: no eran 1:1 con barrios). Desde V7
-- cada zona SÍ es la forma real de un barrio, así que corresponde linkearlas.
--
-- El match es espacial (ST_Contains del centroide) en vez de por nombre
-- porque la geometría de noise_zone/security_zone se generó en una corrida
-- independiente de la de neighborhood.boundary y puede no ser bit-a-bit
-- idéntica (distinta simplificación), aunque representan el mismo barrio.

ALTER TABLE noise_zone ADD COLUMN neighborhood_id BIGINT REFERENCES neighborhood (id);
ALTER TABLE security_zone ADD COLUMN neighborhood_id BIGINT REFERENCES neighborhood (id);

UPDATE noise_zone nz
SET neighborhood_id = n.id
FROM neighborhood n
WHERE ST_Contains(n.boundary, ST_Centroid(nz.area));

UPDATE security_zone sz
SET neighborhood_id = n.id
FROM neighborhood n
WHERE ST_Contains(n.boundary, ST_Centroid(sz.area));
