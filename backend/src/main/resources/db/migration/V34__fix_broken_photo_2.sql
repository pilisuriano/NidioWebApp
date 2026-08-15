-- Nidio -- V34: corrige otra foto rota mas de la galeria (misma causa que
-- V33 -- otro id de Pexels que se sirve como .png, la migracion lo
-- linkeaba con extension .jpeg).

UPDATE property_image SET url = 'https://images.pexels.com/photos/13284214/pexels-photo-13284214.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop' WHERE url = 'https://images.pexels.com/photos/36705463/pexels-photo-36705463.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop' AND property_id = (SELECT p.id FROM property p WHERE p.title = 'CASA 7 AMB URQUIZA COCHERA TERRAZA PARRILLA PATIO' AND p.address = 'SHASKEPEARE 4966, Comuna 12, Ciudad Autónoma de Buenos Aires');
