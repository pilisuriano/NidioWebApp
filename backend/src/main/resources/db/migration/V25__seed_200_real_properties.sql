-- Nidio -- V25: siembra las 200 propiedades reales (Paso 2, ver roadmap.md).
-- Reemplaza el catalogo sintetico (borrado en V26) por propiedades con datos
-- reales (superficie/ambientes/precio de referencia Zonaprop, direcciones
-- verificadas via Georef) y publicadores ficticios (7 inmobiliarias + 25 dueños
-- directos, ver generar_200_propiedades_paso2.py). NO son propiedades reales
-- publicadas -- ver instructions del proyecto (sin scraping, base sintetica).
-- Generada automaticamente -- no editar a mano, volver a correr el script.


-- 7 inmobiliarias ficticias (una por zona geografica), cuenta PROFESSIONAL.

-- Password de las 32 cuentas nuevas (por si se quiere probar el login): Demo1234!

INSERT INTO "user" (name, email, password_hash, account_type, professional_type, business_name, tax_condition, cuit, logo_url, email_verified, role, active, created_at, updated_at)
VALUES ('Inmobiliaria Plaza Centro', 'plazacentro.propiedades@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', 'PROFESSIONAL', 'AGENCY', 'Inmobiliaria Plaza Centro', 'RESPONSABLE_INSCRIPTO', '30-70000001-4', 'https://api.dicebear.com/7.x/shapes/svg?seed=Inmobiliaria%20Plaza%20Centro&backgroundColor=00647c', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, account_type, professional_type, business_name, tax_condition, cuit, logo_url, email_verified, role, active, created_at, updated_at)
VALUES ('Recoleta & Once Propiedades', 'recoletayonce.propiedades@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', 'PROFESSIONAL', 'AGENCY', 'Recoleta & Once Propiedades', 'RESPONSABLE_INSCRIPTO', '30-70000002-2', 'https://api.dicebear.com/7.x/shapes/svg?seed=Recoleta%20%26%20Once%20Propiedades&backgroundColor=00647c', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, account_type, professional_type, business_name, tax_condition, cuit, logo_url, email_verified, role, active, created_at, updated_at)
VALUES ('Inmobiliaria Almagro-Caballito', 'almagrocaballito.propiedades@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', 'PROFESSIONAL', 'AGENCY', 'Inmobiliaria Almagro-Caballito', 'RESPONSABLE_INSCRIPTO', '30-70000003-0', 'https://api.dicebear.com/7.x/shapes/svg?seed=Inmobiliaria%20Almagro-Caballito&backgroundColor=00647c', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, account_type, professional_type, business_name, tax_condition, cuit, logo_url, email_verified, role, active, created_at, updated_at)
VALUES ('Sur Oeste Inmobiliaria', 'suroeste.propiedades@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', 'PROFESSIONAL', 'AGENCY', 'Sur Oeste Inmobiliaria', 'RESPONSABLE_INSCRIPTO', '30-70000004-9', 'https://api.dicebear.com/7.x/shapes/svg?seed=Sur%20Oeste%20Inmobiliaria&backgroundColor=00647c', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, account_type, professional_type, business_name, tax_condition, cuit, logo_url, email_verified, role, active, created_at, updated_at)
VALUES ('Norte CABA Bienes Raíces', 'nortecaba.propiedades@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', 'PROFESSIONAL', 'AGENCY', 'Norte CABA Bienes Raíces', 'RESPONSABLE_INSCRIPTO', '30-70000005-7', 'https://api.dicebear.com/7.x/shapes/svg?seed=Norte%20CABA%20Bienes%20Ra%C3%ADces&backgroundColor=00647c', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, account_type, professional_type, business_name, tax_condition, cuit, logo_url, email_verified, role, active, created_at, updated_at)
VALUES ('Belgrano Propiedades', 'belgrano.propiedades@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', 'PROFESSIONAL', 'AGENCY', 'Belgrano Propiedades', 'RESPONSABLE_INSCRIPTO', '30-70000006-5', 'https://api.dicebear.com/7.x/shapes/svg?seed=Belgrano%20Propiedades&backgroundColor=00647c', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, account_type, professional_type, business_name, tax_condition, cuit, logo_url, email_verified, role, active, created_at, updated_at)
VALUES ('Palermo Hollywood Real Estate', 'palermohollywood.propiedades@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', 'PROFESSIONAL', 'AGENCY', 'Palermo Hollywood Real Estate', 'RESPONSABLE_INSCRIPTO', '30-70000007-3', 'https://api.dicebear.com/7.x/shapes/svg?seed=Palermo%20Hollywood%20Real%20Estate&backgroundColor=00647c', true, 'USER', true, now(), now());


-- 25 dueños directos ficticios, cuenta PERSONAL (sin datos profesionales).

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Lucía Fernández', 'lucia.fernandez@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Martín Gómez', 'martin.gomez@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Sofía Rodríguez', 'sofia.rodriguez@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Nicolás Álvarez', 'nicolas.alvarez@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Valentina Ruiz', 'valentina.ruiz@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Tomás Díaz', 'tomas.diaz@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Camila Torres', 'camila.torres@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Federico Romero', 'federico.romero@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Julieta Sosa', 'julieta.sosa@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Agustín Molina', 'agustin.molina@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Florencia Acosta', 'florencia.acosta@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Ignacio Medina', 'ignacio.medina@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Antonella Herrera', 'antonella.herrera@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Franco Suárez', 'franco.suarez@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Milagros Castro', 'milagros.castro@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Joaquín Ortiz', 'joaquin.ortiz@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Rocío Aguirre', 'rocio.aguirre@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Emiliano Rojas', 'emiliano.rojas@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Constanza Silva', 'constanza.silva@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Bautista Núñez', 'bautista.nunez@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Abril Cabrera', 'abril.cabrera@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Santino Peralta', 'santino.peralta@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Delfina Vega', 'delfina.vega@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Maximiliano Paz', 'maximiliano.paz@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());

INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES ('Catalina Benítez', 'catalina.benitez@nidio.app', '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W', true, 'USER', true, now(), now());


-- 200 propiedades reales, cada una asociada a su publicador por email.

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta piso 4 ambientes con cochera en Liniers', 'APARTMENT', 'SALE', n.id, 'EL TREBOL 6972, Comuna 9, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.52451229075412, -34.64126141595261), 4326), 130.0, 147.0, 4.0, 2.0, 500000, 'Venta Excelente Departamento piso de 4 Ambientes en Liniers. Propiedad en 4º Piso. Acceso por ascensor / escalera. Hall de distribución con doble entrada. Detalles: Living comedor con pisos de parquet y ventilación natural al exterior mediante balcón aterrazado al frente. Toilette de recepción. Cocina comedor separada de amplias dimensiones amoblada en alacena y en bajo mesada con muebles hechos en melamina con terminaciones en aluminio, lavadero y ventilación natural mediante balcón aterrazado al contra frente. Dos dormitorios al contra frente con placares empotrados y ventilación natural al exterior. Baño completo con bañera. Revestimientos cerámicos en pisos y paredes.. Dormitorio principal al frente con vestidor y baño en suite con hidromasaje. Sobre la propiedad: Baulera · Cochera cubierta· Todos los ambientes cuentan con aire acondicionado · Losa Radiante.', u.id, 'AGENCY', true, 262.3, 'NOT_SPECIFIED', false, true, false, false, false, false, true, 205315.97465450948, 347925.33866924205, 'El rango de precio esperado para esta propiedad va de 205316 a 347925 USD, con una prediccion central de 292625 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la cochera y la superficie total. Bajan el precio: el precio de referencia de mercado en la zona y la superficie.', '[{"factor": "el barrio/zona", "contribution": -484.7022399902344, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -373.00341796875, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -317.5534362792969, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": 264.3419494628906, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 167.68919372558594, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Liniers' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-1-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-1-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-1-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = 'Venta piso 4 ambientes con cochera en Liniers'
  AND p.address = 'EL TREBOL 6972, Comuna 9, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta Gran Casa Sobre Lote de 200 m2 Con Cochera, Fondo y Quincho en Liniers', 'HOUSE', 'SALE', n.id, 'CAÑADA DE GOMEZ 898, Comuna 9, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.52070250061964, -34.64875794535455), 4326), 200.0, NULL, 4.0, 3.0, 339000, '** SE VENDE **
<br>
<br>Casa de 4 ambientes sobre lote de 8,66x37, distribuido en 3 plantas.
<br>- En planta baja cuenta con cochera pasante para varios autos, fondo libre paralizado, quincha con parrilla y dependencia de servicio.
<br>- En primer piso posee un amplio Living con ventilación al frente y al contrafrente. cocina comedor diario separada totalmente instalada con muebles en bajos y altos. sector lavadero y baño completo 
<br>En Segundo Piso encontramos 3 habitaciones. La principal con vestidor y baño en suite. hall de distribución y baño completo con bañera. 
<br>
/', u.id, 'AGENCY', true, NULL, 'NOT_SPECIFIED', false, true, false, false, true, false, true, 261839.0750695834, 443708.5279103245, 'El rango de precio esperado para esta propiedad va de 261839 a 443709 USD, con una prediccion central de 373184 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la cantidad de banos y la cochera. Bajan el precio: la superficie y el precio de referencia de mercado en la zona.', '[{"factor": "el barrio/zona", "contribution": -514.091064453125, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -442.2967834472656, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -295.4649963378906, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 215.57720947265625, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 186.11854553222656, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Liniers' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-2-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-2-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-2-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = 'Venta Gran Casa Sobre Lote de 200 m2 Con Cochera, Fondo y Quincho en Liniers'
  AND p.address = 'CAÑADA DE GOMEZ 898, Comuna 9, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Duplex en Venta - 200 m2 Totales - 4 amb  3 dorm 2 baños comp  Toilette - Cochera Patio Parrilla ', 'HOUSE', 'SALE', n.id, 'MUÑECAS 1309, Comuna 15, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.45025881550063, -34.596512998739435), 4326), 126.0, 200.0, 4.0, 3.0, 339000, 'Sólido Duplex de 4 ambientes de excelente calidad constructiva. Living-Comedor al frente, toilette de recepción y escalera de madera de diseño exclusivo.  Amplísima cocina y comedor diario con salida al patio. Galería con cerramiento. Patio con profusión de plantas y parrilla. En Planta Alta : Master suite de gran dimensión al frente con baño refaccionado a nuevo.  Dos cuartos que comparten un baño completo al contrafrente con vista al patio. Todo muy luminoso y con mucho lugar de guardado. Cochera en subsuelo con portón eléctrico. ', u.id, 'AGENCY', true, NULL, 'USED_GOOD_CONDITION', false, true, false, false, true, false, false, 285094.4865209234, 450875.7409730831, 'El rango de precio esperado para esta propiedad va de 285094 a 450876 USD, con una prediccion central de 367802 USD. El factor que mas influye en esta prediccion es la superficie total, que sube el precio. Tambien suben el precio: la cochera. Bajan el precio: el tipo de propiedad (Casa), el barrio/zona y la superficie.', '[{"factor": "la superficie total", "contribution": 424.8858947753906, "direction": "sube el precio"}, {"factor": "el tipo de propiedad (Casa)", "contribution": -364.5604486465454, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -258.7408447265625, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -217.40574645996094, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": 190.0216827392578, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Crespo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-3-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-3-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-3-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Duplex en Venta - 200 m2 Totales - 4 amb  3 dorm 2 baños comp  Toilette - Cochera Patio Parrilla '
  AND p.address = 'MUÑECAS 1309, Comuna 15, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Monoambiente a estrenar. Ideal Inversión', 'APARTMENT', 'SALE', n.id, 'FRENCH 2241, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.39752881585045, -34.5918460229836), 4326), 32.0, NULL, 1.0, 1.0, 95000, 'Lindisimo Monombiente en  a estrenar. <br>Super luminoso!<br>Cerramientos de aluminio DVH.<br>Cocina americana.<br>Baño Completo<br>Detalles de calidad.<br>El edificio cuenta con Pileta, Solaruim y Laundry. SUM con jardín en planta baja.Posibilidad de cochera fija. Seguridad las 24hs los 7 dias de la semana. Ubicado en Recoleta, con cómodos accesos y cercanía a gran variedad de medios de transporte.', u.id, 'AGENCY', true, 216.39, 'NEW', true, false, true, true, true, false, false, 92297.498300816, 160858.4481344536, 'El rango de precio esperado para esta propiedad va de 92297 a 160858 USD, con una prediccion central de 126137 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: los amenities del edificio, la seguridad 24hs, la superficie y las expensas.', '[{"factor": "el barrio/zona", "contribution": 433.59906005859375, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 231.86129760742188, "direction": "sube el precio"}, {"factor": "la seguridad 24hs", "contribution": 201.1150665283203, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 186.85504150390625, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": 174.53622436523438, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-4-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-4-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-4-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'Monoambiente a estrenar. Ideal Inversión'
  AND p.address = 'FRENCH 2241, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 3 ambientes con patio - Palermo', 'APARTMENT', 'SALE', n.id, 'REPUBLICA DE ESLOVENIA 1836, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43372590276834, -34.569716706866885), 4326), 67.0, 78.0, 3.0, 1.0, 275000, 'Departamento de 3 ambientes totalmente reciclado.<br><br>Living comedor con ventana a la calle y toilette de recepcion.<br>Dormitorio principal a la calle, en suite y con buen placard, segundo dormitorio que da a un pequeño patio.<br>Patio con parrilla.<br>Cocina con barra para desayunador, office y lavadero amplio semi-incorporada.<br>Dependencia de servicio.<br>Piso de parquet  en toda la unidad salvo en la cocina, aberturas de doble vidrio en toda la unidas. Calefaccion por losa radiante central y agua caliente central, dos aires acondicionados.<br>', u.id, 'AGENCY', true, 281.97, 'NEEDS_RENOVATION', false, false, false, false, false, false, false, 143048.64023995408, 248789.87774125178, 'El rango de precio esperado para esta propiedad va de 143049 a 248790 USD, con una prediccion central de 195151 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: las expensas. Bajan el precio: el estado de la propiedad (a reciclar), la cochera y los amenities del edificio.', '[{"factor": "el barrio/zona", "contribution": 417.2379455566406, "direction": "sube el precio"}, {"factor": "el estado de la propiedad (a reciclar)", "contribution": -198.65033876895905, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -142.83180236816406, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": 116.8250732421875, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": -97.16664123535156, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-5-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-5-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-5-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Departamento de 3 ambientes con patio - Palermo'
  AND p.address = 'REPUBLICA DE ESLOVENIA 1836, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Monoambiente en Palermo', 'APARTMENT', 'RENT', n.id, 'FRANCISCO ACUÑA DE FIGUEROA 1423, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.421245496502586, -34.59509603356532), 4326), 35.0, 35.0, 1.0, 1.0, 450000, 'Departamento monoambiente en alquiler ubicado en Palermo, Ciudad Autónoma de Buenos Aires. Desarrollado en piso alto por ascensor, con disposición contra frente y orientación al sureste. El mismo posee cocina equipada con muebles sobre y bajo mesada, un espacio principal con espacios de guardado empotrados y un baño completo. Luminoso, cuenta con balcón y muy buena ventilación natural. La propiedad tiene una superficie total de aproximadamente 35mts2, de los cuales 30mts2 son cubiertos. ', u.id, 'AGENCY', true, 91.8, 'NOT_SPECIFIED', false, false, false, false, true, false, true, 266.3723600528543, 575.1322810268521, 'El rango de precio esperado para esta propiedad va de 266 a 575 USD/mes, con una prediccion central de 401 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona y que este amoblado. Bajan el precio: la superficie total y la cantidad de banos.', '[{"factor": "la superficie", "contribution": -288.96124267578125, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -103.69563293457031, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 80.9053955078125, "direction": "sube el precio"}, {"factor": "que este amoblado", "contribution": 67.84247589111328, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": -53.971946716308594, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-6-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-6-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-6-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Monoambiente en Palermo'
  AND p.address = 'FRANCISCO ACUÑA DE FIGUEROA 1423, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta en Belgrano 4 ambientes', 'APARTMENT', 'SALE', n.id, 'SGTO EDUARDO ROMERO 2555, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.44719414277292, -34.54970080810003), 4326), 122.0, 153.0, 4.0, 2.0, 315000, '<br>Depto. con regia ubicación cerca de todos los medios de transporte, en importante edificio
<br>RECICLADO
<br>Antiguedad: 18 años
<br>Orientación: oeste
<br>Superficie cubierta: 122 m2
<br>Superficie Total: 151 m2
<br>
<br>PLANTA RECEPCIóN:
<br>LIVING / COMEDOR, BALCóN, TOILETTE, COCINA, 1 DEPENDENCIA CON BAñO
<br>PLANTA DORMITORIOS:
<br>3 DORMITORIOS (SUITE), 2 BAñOS COMPLETOS, BALCóN TERRAZA
<br>2 COCHERAS FIJAS, 1 BAULERA, SEGURIDAD
<br>
<br>PLANTA DE RECEPCóN:
<br>
<br>Palier privado 
<br>Hall de entrada
<br>Escalera con espacio para baulera en bajo escalera
<br>Living / comedor apaisado 8,3 x 4 con Aire Acond Split y salida a balcón
<br>Balcón 7,8 x 1,5
<br>Toilette
<br>Cocina 3,8 x 2,3 con zona de comedor diario 2,2 x 2,3
<br>Lavadero independiente
<br>1 Dependencia con buen baño
<br>
<br>PLANTA ALTA:
<br>
<br>Hall de escalera
<br>1er. Dormitorio 4,9 x 3,1 (suite con vestidor) con Aire Acond Split y salida al balcón terraza
<br>2do. Dormitorio 3,6 x 2,7 con salida al balcón terraza
<br>Balcón terraza 8 x 2,6
<br>3er. Dormitorio 2,9 x 2,6 
<br>2 Baños completos (uno en suite)
<br>
<br>2 COCHERAS FIJAS 
<br>1 Baulera
<br>Nro de pisos: 10
<br>Deptos por piso: 
<br>Tipo de piso: entablonado en recepción, carpeta en dormitorios
<br>Calefacción losa radiante individual 
<br>Agua caliente: central
<br>Seguridad 
<br>', u.id, 'AGENCY', true, 455.74, 'NEEDS_RENOVATION', false, true, false, true, true, false, false, 419313.192054886, 693839.9655884678, 'El rango de precio esperado para esta propiedad va de 419313 a 693840 USD, con una prediccion central de 560491 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: el barrio/zona, la superficie total y la cochera. Bajan el precio: la superficie.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 913.0115966796875, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 386.5462341308594, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 302.9410400390625, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -245.4944610595703, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": 222.65147399902344, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-7-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-7-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-7-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'Venta en Belgrano 4 ambientes'
  AND p.address = 'SGTO EDUARDO ROMERO 2555, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - San Cristóbal 3 Ambientes', 'APARTMENT', 'RENT', n.id, 'AV SAN JUAN 1939, Comuna 3, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.393252238255016, -34.62284329179572), 4326), 70.0, 70.0, 3.0, 2.0, 1200000, 'Departamento super luminoso en piso 23 en edificio Torre con pileta, gimnasio, pileta para niños, juegos, gimnasio, laundry, parque de 7500 M2.. Posee 2 dormitorios y 2 baños, balcón terraza, red de protección, living y cocina equipada. Excelente vista', u.id, 'AGENCY', true, 249.84, 'NOT_SPECIFIED', true, false, true, false, true, false, false, 308.6212377959397, 485.870836536954, 'El rango de precio esperado para esta propiedad va de 309 a 486 USD/mes, con una prediccion central de 387 USD/mes. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: los amenities del edificio. Bajan el precio: la superficie, el precio de referencia de mercado en la zona y la superficie total.', '[{"factor": "el barrio/zona", "contribution": -168.84010314941406, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -135.87554931640625, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -62.65958786010742, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": 57.933353424072266, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -40.429534912109375, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'San Cristóbal' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-8-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-8-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-8-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'Departamento - San Cristóbal 3 Ambientes'
  AND p.address = 'AV SAN JUAN 1939, Comuna 3, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta Monoambiente en San Nicolas (CABA)', 'APARTMENT', 'SALE', n.id, 'AV LA RABIDA 1799, Comuna 1, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.3920336580502, -34.6079865999534), 4326), 30.0, 30.0, 1.0, 1.0, 60000, 'Se trata de un monoambiente de 30 metros cuadrados. La zona es muy buena. Ideal inversor para turistas o jóvenes estudiantes. <br>El inmueble es muy cómodo con vista a la calle. Funcionaba como peluquería. Consta de un ambiente grande, cocina y baño completo.<br>', u.id, 'AGENCY', true, 118.03, 'NOT_SPECIFIED', false, false, false, false, false, true, false, 42635.01905609967, 76216.13437734605, 'El rango de precio esperado para esta propiedad va de 42635 a 76216 USD, con una prediccion central de 61641 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la superficie y la superficie cubierta. Bajan el precio: el barrio/zona y la superficie total.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -504.8617248535156, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 334.7149963378906, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -310.342041015625, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -173.1089630126953, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 133.70590209960938, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'San Nicolás' AND u.email = 'plazacentro.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-9-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-9-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-9-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'plazacentro.propiedades@nidio.app'
  AND p.title = 'Venta Monoambiente en San Nicolas (CABA)'
  AND p.address = 'AV LA RABIDA 1799, Comuna 1, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT '2 AMBIENTES A ESTRENAR !!!!!', 'APARTMENT', 'SALE', n.id, 'SANCHEZ DE BUSTAMANTE 310, Comuna 5, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.41492555726612, -34.60577655611955), 4326), 27.0, 27.0, 2.0, 1.0, 119000, '2 AMBIENTES A ESTRENAR !!!

Excelente ubicación !

AMPLIO LIVING COMEDOR CON COCINA INTEGRADA COMPLETA, DORMITORIO CON PLACARD CON SALIDA A UN PATIO Y ANTE-BAÑO Y BAÑO COMPLETO, CALEFACCIÓN POR ESTUFAS Y PISOS DE MADERA, EXCELENTE CALIDAD !!!

OPCIÓN COCHERA FIJA Y CUBIERTA

Edificio con SUM, TERRAZA CON PARRILLA y SOLARIUM !', u.id, 'AGENCY', true, 137.7, 'NEW', false, true, true, false, false, false, false, 63460.85724468386, 97716.69202635603, 'El rango de precio esperado para esta propiedad va de 63461 a 97717 USD, con una prediccion central de 83743 USD. El factor que mas influye en esta prediccion es la superficie, que sube el precio. Tambien suben el precio: la cochera y la superficie cubierta. Bajan el precio: el precio de referencia de mercado en la zona y la superficie total.', '[{"factor": "la superficie", "contribution": 340.7555236816406, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 314.48846435546875, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -310.99365234375, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -264.73541259765625, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 207.52650451660156, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Almagro' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-10-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-10-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-10-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = '2 AMBIENTES A ESTRENAR !!!!!'
  AND p.address = 'SANCHEZ DE BUSTAMANTE 310, Comuna 5, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 2 ambientes al frente, Belgrano, Cochera, Balcón Aterrazado, Amenities', 'APARTMENT', 'SALE', n.id, 'DRAGONES 2500, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.444277351093, -34.5490100127366), 4326), 38.0, 47.0, 2.0, 1.0, 250000, 'Cómodo y luminoso departamento de 2 ambientes, con balcón aterrazado al frente.<br>Es un edificio de 11 pisos y 7 años de antigüedad.<br>El departamento dispone de un dormitorio, un baño completo, cocina semi-integrada, living comedor y balcón aterrazado.<br>La unidad se encuentra en el 7º piso al frente.<br>Cuenta con una cochera fija y semi cubierta en planta baja.<br>APTO PROFESIONAL.<br>Amenities: SUM, Parrila, Piscina, Laundry.<br>', u.id, 'AGENCY', true, 144.26, 'USED_GOOD_CONDITION', true, true, true, false, true, false, false, 142901.56647842165, 236460.0490674471, 'El rango de precio esperado para esta propiedad va de 142902 a 236460 USD, con una prediccion central de 191015 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: el barrio/zona, la superficie, la cochera y la superficie cubierta.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 720.862548828125, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 394.8157653808594, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 378.4359130859375, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 327.40435791015625, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 204.6165313720703, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-11-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-11-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-11-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'Departamento de 2 ambientes al frente, Belgrano, Cochera, Balcón Aterrazado, Amenities'
  AND p.address = 'DRAGONES 2500, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 3 ambientes en Venta en Villa crespo', 'APARTMENT', 'SALE', n.id, 'GODOY CRUZ 1357, Comuna 15, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43756688882026, -34.589928746387486), 4326), 77.0, 87.0, 3.0, 2.0, 85000, 'Excelente departamento de tres ambientes con dependencia amplia. Muy buena distribucion. Edificio de de muy buena calidad constructiva con orientacion Norte. Departamento muy luminoso. Cercar de colegios y de principales medios de trasportes. Zona inmejorable!! - Oportunidad!', u.id, 'AGENCY', true, 109.51, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 168545.34032632742, 266553.7525279926, 'El rango de precio esperado para esta propiedad va de 168545 a 266554 USD, con una prediccion central de 217441 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: la cantidad de banos. Bajan el precio: el barrio/zona, la superficie y las expensas.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 187.603759765625, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -167.26197814941406, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -133.96620178222656, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -131.9331817626953, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 104.56373596191406, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Crespo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-12-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-12-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-12-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Departamento de 3 ambientes en Venta en Villa crespo'
  AND p.address = 'GODOY CRUZ 1357, Comuna 15, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento 2 amb en alquiler', 'APARTMENT', 'RENT', n.id, 'AV ANTARTIDA ARGENTINA 1607, Comuna 1, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.373457932449845, -34.58242502262469), 4326), 59.0, 59.0, 2.0, 1.0, 1067500, 'Amplio 2 Amb amoblado y equipado - Ideal para familias o grupos pequeños - max 4 personas - seguridad 24hs. Caracteristicas: - Piso alto y espectacular vista a toda la ciudad. - Living comedor muy amplio y luminoso. - Cocina semi integrada equipada con electrodomésticos y vajilla. - Baño completo. - Dormitorio con dos camas twin individuales actualmente que pueden unirse y formar una cama queen. - Sofá cama adicional para 2 personas. - Cerradura digital de ultima generación. ', u.id, 'AGENCY', true, 163.93, 'NOT_SPECIFIED', false, false, false, true, true, false, true, 406.43153807136633, 939.7419660344962, 'El rango de precio esperado para esta propiedad va de 406 a 940 USD/mes, con una prediccion central de 662 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona y que este amoblado. Bajan el precio: la cantidad de banos y la superficie total.', '[{"factor": "la superficie", "contribution": -200.36260986328125, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 178.48092651367188, "direction": "sube el precio"}, {"factor": "que este amoblado", "contribution": 98.46235656738281, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": -55.62049865722656, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -54.50984191894531, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Retiro' AND u.email = 'plazacentro.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-13-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-13-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-13-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'plazacentro.propiedades@nidio.app'
  AND p.title = 'Departamento 2 amb en alquiler'
  AND p.address = 'AV ANTARTIDA ARGENTINA 1607, Comuna 1, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT '2AMB C/ BALCON TERRAZA-FULL AMENITIES', 'APARTMENT', 'SALE', n.id, 'AV AVELLANEDA 253, Comuna 6, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43400897365873, -34.612487564062654), 4326), 42.0, 53.0, 2.0, 1.0, 110000, 'Exclusivo departamento de 2 ambientes en pleno barrio de Caballito. Edificio full amenities (SUM, Pileta, Solarium, Gym, Sector parrillas, Sala de juegos para niños y Laundry y cocheras de cortesías).  Departamento en excelente estado, amplio, muy luminoso y con un gran balcón terraza! <br><br>Requisitos: <br>-Garantía propietaria de CABA.<br>-Aumento semestral del 17%.<br>-Recibo de sueldo y/o inscripción al monotributo.<br><br>Transportes cercanos: <br>Colectivos: 1, 2, 5, 8, 25, 36, 44, 49, 53, 55, 76, 84, 85, 86, 88, 92, 96, 99, 104, 113, 132, 133, 136, 141, 163, 172, 181<br>Subtes (Metro): CARABOBO (Línea A).<br><br><br><br><br>Adriana Gentile Propiedades le brinda a sus clientes la posibilidad de una financiación  del 50% de la propiedad y el resto hasta en 84 cuotas igual al 1.2% mensual.', u.id, 'AGENCY', true, 124.59, 'USED_GOOD_CONDITION', true, false, true, false, true, false, false, 108382.30544521227, 177692.18320269848, 'El rango de precio esperado para esta propiedad va de 108382 a 177692 USD, con una prediccion central de 145620 USD. El factor que mas influye en esta prediccion es la superficie, que sube el precio. Tambien suben el precio: el precio de referencia de mercado en la zona, la superficie cubierta y los amenities del edificio. Bajan el precio: el barrio/zona.', '[{"factor": "la superficie", "contribution": 266.232421875, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 218.44190979003906, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 180.5001983642578, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 166.31246948242188, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -162.3075714111328, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Caballito' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-14-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-14-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-14-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = '2AMB C/ BALCON TERRAZA-FULL AMENITIES'
  AND p.address = 'AV AVELLANEDA 253, Comuna 6, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - Villa Devoto', 'APARTMENT', 'SALE', n.id, 'CERVANTES 3899, Comuna 11, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.5269651180302, -34.6080972567488), 4326), 48.0, 48.0, 2.0, 1.0, 125000, 'Excelentes unidades en Villa Devoto: Emprendimiento ya terminado con posesión.<br><br>• 8 unidades con terraza propia y parrilla<br>• Instalaciones de primer nivel<br>• 2 cuerpos de ascensores<br>• Cocheras fijas (opcional )<br>• Bauleras (opcional)<br>• 2 Salón de usos múltiples (SUM) equipados<br>• Piscina, Solárium<br>• Parrillas en terraza<br>• Salón Fitness con equipos de última generación<br>• Laundry<br>• Grupo Electrógeno<br>- Accesos y ascensores codificados<br>-SEGURIDAD 24 HS<br><br>MATERIALES E INSTALACIONES<br>Carpintería de Aluminio A30 con vidrios laminados<br>Pisos de Porcelanato simil madera PAMESA (español)<br>Modernos Cielorrasos de hormigón vistos<br>Instalaciones para Split frío/calor previstas<br>Griferías mono-comando. Cocina Atma Campana Spar<br>Sistemas de seguridad.<br><br>', u.id, 'AGENCY', true, 150.82, 'NEW', true, true, true, false, false, false, false, 120762.61310034565, 213102.1649091742, 'El rango de precio esperado para esta propiedad va de 120763 a 213102 USD, con una prediccion central de 165437 USD. El factor que mas influye en esta prediccion es la cochera, que sube el precio. Tambien suben el precio: la superficie y los amenities del edificio. Bajan el precio: el barrio/zona y la superficie total.', '[{"factor": "la cochera", "contribution": 303.9190673828125, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -174.1356964111328, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 158.52435302734375, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 129.38165283203125, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -128.5541229248047, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Devoto' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-15-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-15-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-15-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = 'Departamento - Villa Devoto'
  AND p.address = 'CERVANTES 3899, Comuna 11, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 7 ambientes en venta en San Telmo', 'APARTMENT', 'SALE', n.id, 'AV ESPAÑA 1842, Comuna 4, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.3553279742686, -34.619171146550045), 4326), 228.0, 228.0, 7.0, 3.0, 525000, 'Excepcional 7 ambientes con Dependencias!! La unidad se haya desarrollada en un Amplio Hall de Entrada, Living y Comedor al frente, Toilette de Recepción, Living Intimo, Cocina con Comedor Diario, Hall Intimo, Baño Completo, Tres Dormitorios, el principal con Vestidor y Baño en Suite, Entrada de Servicio, Lavadero, Dependencia de Servicio y Baño de Servicio. Posee pisos de parquet de roble. La unidad cuenta con una caldera individual que le provee de agua caliente y calefacción por radiadores y tiene una excelente luminosidad, destacándose la calidad de los trabajos de renovación y reciclado manteniendo el estilo desarrollados en la misma. Su ubicación es exclusiva ya que se encuentra a muy pocas cuadras del Parque Lezama con frente a la Avenida Caseros, una de las más emblemáticas de San Telmo, a pocos minutos del Centro y del distrito financiero de la ciudad. San Telmo es el barrio más antiguo y representativo de la ciudad y se ha convertido en un epicentro cultural-creativo de gran vitalidad.  Supercifies: -Cubierta: 225 m2. -Descubierta: 3 m2. ambientes: - Recepción 3, 45 x 2, 45. - Living 4, 65 x 4, 60. - Comedor 6, 75 x 4, 95. - Pasillo 3, 75 x 1. - Toilette de recepción 1, 95 x 1, 30. - Living Intimo 4, 25 x 4, 250. - Cocina en L 4, 65 x 3, 90 +1, 65 x 1, 55. - Baño Completo 2, 60 x 2, 15. - Hall Intimo 6, 85 x 2, 20. - Dormitorio #1 3, 90 x 3, 15 + Placard: 1, 90 x 0, 60. - Dormitorio #2 3, 90 x 3, 65 + Placard: 1, 90 x 0, 60. - Dormitorio principal #3 4, 90 x 3, 60. - Vestidor 3, 60 x 2, 70. - Baño en suite 2, 90 x 1, 70. - Lavadero 1, 75 x 1, 60. - Entrada de Servicio 1, 60 x 1, 45. - Dependencia de Servicio 2, 30 x 1, 90. - Baño de Servicio 2', u.id, 'AGENCY', true, NULL, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 269138.66807951377, 510527.31527720345, 'El rango de precio esperado para esta propiedad va de 269139 a 510527 USD, con una prediccion central de 392859 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la superficie total y la cantidad de banos. Bajan el precio: la superficie y el barrio/zona.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -540.3109130859375, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -535.1693115234375, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -482.99163818359375, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 336.7572021484375, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 230.5074005126953, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'San Telmo' AND u.email = 'plazacentro.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-16-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-16-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-16-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'plazacentro.propiedades@nidio.app'
  AND p.title = 'Departamento de 7 ambientes en venta en San Telmo'
  AND p.address = 'AV ESPAÑA 1842, Comuna 4, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - Belgrano', 'APARTMENT', 'RENT', n.id, 'CMRO CLODOMIRO URTUBEY 2399, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.470470265808, -34.5659623120671), 4326), 180.0, NULL, 4.0, 5.0, 4575000, 'Hermoso depto de 3 dorm mas dep con dos cocheras en la exclusiva Torre Town House Barrancas con 5.000 metros de terreno y amenities de lujo.<br>Se entrega sin muebles,  Ya disponible<br><br>Town House Barrancas.<br>Complejo unico en el mejor barrio de la capital. <br>media manzana de amenities premium.<br>Pileta  al aire libre y pileta in out.<br>Gym de ulitma generacion.<br>Spa<br>Cancha de tenis<br>Salones de fiestas<br>Parrilleros<br>Galeria de arte<br>Mirador y jacuzzi  en ultimo piso<br>Dos habitaciones de hotel para visitas.<br>Cancha de futbol y plaza para niños<br>Sala Profesional de musica<br>Salon Kids', u.id, 'AGENCY', true, 721.31, 'NOT_SPECIFIED', true, true, true, false, false, false, false, 2603.0820098712643, 5406.681034380585, 'El rango de precio esperado para esta propiedad va de 2603 a 5407 USD/mes, con una prediccion central de 4020 USD/mes. El factor que mas influye en esta prediccion es la superficie, que sube el precio. Tambien suben el precio: la cantidad de banos, las expensas, los amenities del edificio y la superficie cubierta.', '[{"factor": "la superficie", "contribution": 1227.1278076171875, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 787.55224609375, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": 320.2987976074219, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 312.4132995605469, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 231.67434692382812, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-17-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-17-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-17-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'Departamento - Belgrano'
  AND p.address = 'CMRO CLODOMIRO URTUBEY 2399, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 7 ambientes en alquiler en Recoleta ', 'APARTMENT', 'RENT', n.id, 'FRENCH 2910, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.40421600100929, -34.58793912225541), 4326), 270.0, 270.0, 7.0, 4.0, 8997500, 'Precioso duplex piso alto, moderno a nuevo con excelente calidad de materiales, de Pallier Privado, en primera planta: Toilette, living a Balcón y comedor en L y escritorio; master suite a amplios ventanales, con Vestidor, Hall, Baño con Bañera a ventanal, con Pisos de Roble de Eslavonia; amplia cocina con isla a amplios Ventanales en L todo externo lleno de Luz y Sol, office, Lavadero separado, habitación Y baño de Servicio. En segunda planta: por Escalera, Living Intimo y distribución dos suites con excelentes placares y un dormitorio, todo a ventanales con excelente luz en todos los ambientes. Cochera Fija. La torre ganó un Premio a la Estructura, todos los ambientes son externos a las cuatro orientaciones. Vigilancia las 24hs. Una Ubicación cómoda próxima a centro de compras, y Restó y Bares de primera línea en el entorno, con Salas de Cine, Teatros, conecta con Av. Alvear; Av. Del Libertador; 9 de Julio; Plaza Francia, Parque Thays, con todos los medios de transporte cercanos. ', u.id, 'AGENCY', true, 590.16, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 1985.5168013361163, 4229.572861126621, 'El rango de precio esperado para esta propiedad va de 1986 a 4230 USD/mes, con una prediccion central de 3003 USD/mes. El factor que mas influye en esta prediccion es la superficie, que sube el precio. Tambien suben el precio: la superficie total, la cantidad de banos y la superficie cubierta. Bajan el precio: el barrio/zona.', '[{"factor": "la superficie", "contribution": 1906.106689453125, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 365.2563781738281, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 233.7764129638672, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 214.2867889404297, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -185.76150512695312, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-18-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-18-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-18-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'Departamento de 7 ambientes en alquiler en Recoleta '
  AND p.address = 'FRENCH 2910, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Divino 3amb c/bcon Tza suite c/vestidor y 2 Cocheras en Edif c/Piscina y Parrilla - Caballito-Venta ', 'APARTMENT', 'SALE', n.id, 'DEL BARCO CENTENERA 635, Comuna 6, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.44071862404837, -34.626978700618274), 4326), 69.0, 78.0, 3.0, 2.0, 200000, 'Ubicado en edificio de Categoria con Seguridad , Piscina , Parrilla, Loundry, dos ascensores (uno camillero) encontramos este divino 3 ambientes y medio con balcón Terraza.
<br>
<br>Amplio Living comedor con salida al Balcon Terraza , Dos dormitorios (1 en suite con vestidor ) , Escritorio en Hall de distribución , 2Baños , Cocina con Barra pasa plato y lavadero incorporado. Cochera para 2 Autos y Baulera   ', u.id, 'AGENCY', true, 157.38, 'NOT_SPECIFIED', true, true, true, true, false, false, false, 211094.27208528176, 346087.8776691047, 'El rango de precio esperado para esta propiedad va de 211094 a 346088 USD, con una prediccion central de 283622 USD. El factor que mas influye en esta prediccion es la cochera, que sube el precio. Tambien suben el precio: el precio de referencia de mercado en la zona, la seguridad 24hs y los amenities del edificio. Bajan el precio: el barrio/zona.', '[{"factor": "la cochera", "contribution": 329.77978515625, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 276.9191589355469, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -256.304931640625, "direction": "baja el precio"}, {"factor": "la seguridad 24hs", "contribution": 245.6366729736328, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 191.33335876464844, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Caballito' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-19-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-19-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-19-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'Divino 3amb c/bcon Tza suite c/vestidor y 2 Cocheras en Edif c/Piscina y Parrilla - Caballito-Venta '
  AND p.address = 'DEL BARCO CENTENERA 635, Comuna 6, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en Venta', 'APARTMENT', 'SALE', n.id, 'TEMPERLEY 1154, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.445769388258576, -34.552236288427835), 4326), 57.0, 57.0, 2.0, 1.0, 119000, 'Muy lindo departamento de 3 ambientes. El departamento se compone de Living Comedor, 2 dormitorios baño completo y amplia cocina con lavadero.Buen estado en general, con detalles para mejorar a tu gusto y dejarlo a tu estilo.', u.id, 'AGENCY', true, 85.25, 'USED_GOOD_CONDITION', false, false, false, false, false, false, false, 148606.30771674644, 245899.71740960667, 'El rango de precio esperado para esta propiedad va de 148606 a 245900 USD, con una prediccion central de 198640 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: el barrio/zona. Bajan el precio: la superficie total, las expensas y la cantidad de banos.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 861.1822509765625, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 334.68060302734375, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -153.40261840820312, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -147.67880249023438, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -111.57545471191406, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-20-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-20-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-20-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'Departamento en Venta'
  AND p.address = 'TEMPERLEY 1154, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta - Departamento', 'APARTMENT', 'SALE', n.id, 'BAEZ 799, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4363159896704, -34.5690377243846), 4326), 135.0, 164.0, 5.0, 1.0, 325000, 'Semipiso. Living/Comedor. 4 dormitorio(s) 1 en suite, 3 con placard. 1 baño(s).Habitación de servicio. 1 cochera(s). Entre medianeras. Al contrafrente. A reciclar. Orientación Este. Antigüedad 40 años.      ', u.id, 'AGENCY', true, 426.23, 'NEEDS_RENOVATION', false, true, false, false, false, false, false, 296032.71399129013, 514859.43940299895, 'El rango de precio esperado para esta propiedad va de 296033 a 514859 USD, con una prediccion central de 403856 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la cochera, la superficie total y las expensas. Bajan el precio: la superficie.', '[{"factor": "el barrio/zona", "contribution": 476.8645324707031, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -418.1159973144531, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": 319.6224365234375, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 222.8478546142578, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": 155.3566436767578, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-21-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-21-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-21-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Venta - Departamento'
  AND p.address = 'BAEZ 799, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Liniers PH 3amb ', 'PH', 'SALE', n.id, 'BOQUERON 6837, Comuna 9, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.5220521183177, -34.64646423479865), 4326), 110.0, 130.0, 3.0, 2.0, 180000, 'PH en PB de 3 ambientes, al frente. Superficie total de 130m2, cubierta de 110m2 y descubierta de 20m2. Dos dormitorios, dos baños. Entrada independiente. Todos los servicios son individuales. 2 unidades en el lote. Antiguedad 40 años. Sin expensas. Excelente estado, muy luminoso. Apto crédito. Pisos de cerámica. 
<br>
<br>PB: hall de entrada, living comedor, cocina con salida al patio interno, pasillo distribuidor, baño principal completo, habitación principal en suite (con hidromasaje) y vestidor, segunda habitación, patio interno con ventilación y techo de policarbonato. PA: Quincho con salida a terraza, parrilla.
<br>
<br>Colectivos: 4, 47, 113, 117.', u.id, 'AGENCY', true, NULL, 'USED_GOOD_CONDITION', false, false, false, false, true, true, false, 148079.56998189876, 250933.3948449114, 'El rango de precio esperado para esta propiedad va de 148080 a 250933 USD, con una prediccion central de 211049 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie total. Bajan el precio: el precio de referencia de mercado en la zona, la superficie y el tipo de propiedad (PH).', '[{"factor": "el barrio/zona", "contribution": -454.1614685058594, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -295.46722412109375, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -257.9437255859375, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 226.6520233154297, "direction": "sube el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -184.72290760278702, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Liniers' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-22-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-22-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-22-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = 'Liniers PH 3amb '
  AND p.address = 'BOQUERON 6837, Comuna 9, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento 2 Ambientes', 'APARTMENT', 'RENT', n.id, 'AV TOMAS A EDISON 2300, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.3804399879288, -34.5754254567578), 4326), 70.0, 70.0, 2.0, NULL, 850000, 'Depto pb tipo loft 70 M2', u.id, 'AGENCY', true, 144.26, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 264.8939634896116, 564.2804524736246, 'El rango de precio esperado para esta propiedad va de 265 a 564 USD/mes, con una prediccion central de 401 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Bajan el precio: la superficie total, que este amoblado, el precio de referencia de mercado en la zona y los amenities del edificio.', '[{"factor": "la superficie", "contribution": -146.1593780517578, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -43.75046157836914, "direction": "baja el precio"}, {"factor": "que este amoblado", "contribution": -38.75654220581055, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -32.3283805847168, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": -28.68283462524414, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-23-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-23-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-23-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'Departamento 2 Ambientes'
  AND p.address = 'AV TOMAS A EDISON 2300, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamentos Monoambientes con balcon y parrilla en Montecastro', 'APARTMENT', 'SALE', n.id, 'FELIPE VALLESE 3906, Comuna 10, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.48522182728542, -34.62632941720109), 4326), 36.0, 36.0, 1.0, 1.0, 64000, 'Caracteristicas Generales: <br>Puertas de entrada de seguridad, pisos y zòcalos de porcelanato. Paredes y cielos rasos enlucidos de yeso tradicional con molduras. Placard con frente espejado e interior completo, puertas interiores con terminaciòn en roble, acero y con modernos herrajes. Carpinterìa de aluminio anodizado linea modena de primera calidad. <br><br>Servicios: <br>Aire Acondicionado split frìo/calor. <br>Bocas de telefonìa y TV convenientemente ubicadas. <br>Agua caliente central por termotanques de alta recuperaciòn. <br>Cañerìa de agua frìa y caliente por termofusiòn c/ garantìa. <br><br>BAÑOS: <br>Mesada y bacha construida a medida in situ en màrmol travertino. <br>Revestimiento ceràmico hasta cielorraso. <br>Artefactos sanitarios y griferias de primera calidad. <br>Extractor. <br>Espejo a medidas. <br>Inodoro a vàlvula.', u.id, 'AGENCY', true, 36.07, 'NEW', false, false, false, false, false, false, false, 49647.77793814521, 81273.25067978902, 'El rango de precio esperado para esta propiedad va de 49648 a 81273 USD, con una prediccion central de 64315 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie. Bajan el precio: el precio de referencia de mercado en la zona, la superficie total y las expensas.', '[{"factor": "el barrio/zona", "contribution": -418.2367248535156, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -360.71502685546875, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -194.8657989501953, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 188.3430938720703, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -125.91595458984375, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Floresta' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-24-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-24-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-24-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = 'Departamentos Monoambientes con balcon y parrilla en Montecastro'
  AND p.address = 'FELIPE VALLESE 3906, Comuna 10, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en venta en Belgrano', 'APARTMENT', 'SALE', n.id, 'GRAL MARTINEZ ENRIQUE 2399, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4708977482785, -34.5662514518316), 4326), 105.0, 165.0, 3.0, 2.0, 225000, 'Excelente piso de 165m2 refaccionado con el mejor y más moderno de los estilos. Unidad en esquina, con dos enormes balcones terraza (60m2 descubiertos). MUY luminoso, ya que todos los ambientes dan al exterior. La unidad cuenta con 105m2 cubiertos, con 2 amplias habitaciones más un 3º dormitorio o escritorio. Cuenta además con 2 baños completos más un toilette. Las habitaciones dan a gran balcon de 8,30x3mts mientras que el LIVING da a otro balcon terraza de 16,50 metros de largo! Imponente cocina, moderna, elegante, diseñada para ser vivida cotidianamente, integrada por una puerta ventana interna de madera y vidrio, lo que otorga estética cálida y moderna muy alineada al estilo general del departamento. Calefacción y agua caliente central. Ascensor principal y de servicio.<br>', u.id, 'AGENCY', true, 104.92, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 342798.27023344353, 567230.2816349878, 'El rango de precio esperado para esta propiedad va de 342798 a 567230 USD, con una prediccion central de 458214 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: la superficie total y el barrio/zona. Bajan el precio: las expensas y la superficie.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 996.953369140625, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 455.520751953125, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 412.8628845214844, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -310.5740966796875, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -169.2218780517578, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-25-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-25-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-25-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'Departamento en venta en Belgrano'
  AND p.address = 'GRAL MARTINEZ ENRIQUE 2399, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en Alquiler en Belgrano. ', 'APARTMENT', 'RENT', n.id, 'DR PEDRO IGNACIO RIVERA 2823, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.46509424693158, -34.55905305684347), 4326), 35.0, 35.0, 2.0, 1.0, 490000, '**no se permiten mascotas** Departamento de 2 ambientes en gran zona de belgrano. Pisos de parquet, cocina independiente, dormitorio con placard y persianas. *estado del bien*: El departamento se entrega pintado y al finalizar el Contrato se deberá entregar pintado y con los colores actuales. requisitos A tener en cuenta para reservar. 1. Tener capacidad para contratar (mayor de 21 años, no estar inhabilitado) 2. Garantía finaer o Si tienen recibo de sueldo los propietarios aceptan Garantía propietaria de caba (se deberá presenta informe de dominio e inhibición del inmueble en garantía) 3. El titular del contrato debe contar con ingresos comprobable (recibo de sueldo) 4. U$S 650, - de depósito de garantía en dólares. 5. Contrato de 2 años. 6. Ajuste trimestral por ipc. 7. Se entrega factura de afip. Edificio cuenta con rampa para personas con discapacidad física ley 5115.', u.id, 'AGENCY', true, 163.93, 'USED_GOOD_CONDITION', false, false, false, false, false, false, false, 184.85682119192373, 383.9532774703804, 'El rango de precio esperado para esta propiedad va de 185 a 384 USD/mes, con una prediccion central de 285 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Bajan el precio: la superficie total, la cantidad de banos, la superficie cubierta y los amenities del edificio.', '[{"factor": "la superficie", "contribution": -237.72555541992188, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -87.88025665283203, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -47.072052001953125, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -40.96833419799805, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": -26.82617950439453, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-26-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-26-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-26-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'Departamento en Alquiler en Belgrano. '
  AND p.address = 'DR PEDRO IGNACIO RIVERA 2823, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 4 ambientes en venta', 'APARTMENT', 'SALE', n.id, 'CESPEDES 3761, Comuna 15, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.45649206398299, -34.58182831770473), 4326), 156.0, 156.0, 4.0, 2.0, 358000, 'Venta. Departamento en Chacarita. Espectacular unidad de 4 ambientes al frente en duplex + terraza verde propia con parrilla. 107 m2 cubiertos + 49, 8 m2 semi/descubiertos (balcón + terraza) Cocheras y bauleras disponibles de forma optativa. - Pisos de madera en living y dormitorios. - Cocina completa, anafe a gas y horno convector. -Habitación principal en suite con vestidor y placards- Baño completo con bañera y sanitarios de primera calidad. - Cuenta con ventilación cruzada con ventanas al pulmón interno del edificio. -Terraza propia con vista panorámica, espacio para huerta y parrillaConsultá por planes de financiaciónEntrega: diciembre 2025chacaritael emprendimiento se encuentra en uno de los mejores barrios para vivir y disfrutar de la ciudad. Ubicado en el pujante barrio de Chacarita, rodeado de amplios espacios verdes, una amplia oferta gastronómica- cultural y gran conectividad por transporte público. Cocheras fijas cubiertas en subsuelo y planta baja. El edificio se basa en unidades amplias con cómodos espacios, priorizando la luz natural en todos los ambientes, la ventilación cruzada y la eficiencia energética. Un proyecto pensado desde la calidad y la nobleza de sus materiales, reduciendo el consumo energético y procurando departamentos de bajo costo de mantenimiento. Estudios profesionales para que puedas disfrutar de un lugar único en una ubicación privilegiada. A pocas cuadras de Subte B, Avenidas Corrientes, Córdoba, Federico Lacroze y Dorrego. Las unidadescuentan con unas dimensiones únicas, aprovechando al máximo la luz natural y el frente único que proporciona el lote de 25 ms. Con pisos de madera en todas las unidades, balcones amplios con espacio verde para huerta propia, pensados para que puedas disfrutar al máximo de los espacios abiertos. Ventanales de doble vidriado hermético (dvh) para mayor eficiencia energética y control de sonidos. Cuentan con la mejor calidad de sanitarios, griferías, cocinas de primera marca y hornos convectores. Preparados para recibir equipos de aire acondicionado. Amenitiesamenities únicos y pensados para su uso diario reduciendo costos de expensas. - Amplio espacio de coworking en el piso 7mo con amplia vista abierta. - Sum equipado con cocina y baño completo. - Espacio de terraza con pérgola para disfrutar de un asado con amigos y familia. - Amplia terraza verde con especies de plantas nativas con solarium. - Espacio para guardado de bicicletas dentro del edificio. - Taller preparado para la reparación de bicis y para poder arreglar lo que necesites o realizar tus hobbies. - Cocheras cubiertas y semicubiertas. -Laundry completo- Servicio de lockers para recepción de E-Commerce. - Amplias bauleras opcionales en subsuelo- Espacios arbolados y de plantas nativas en pb como en terrazas verdes. - Garita de seguridad con posibilidad de tótem 24 hs ', u.id, 'AGENCY', true, 131.15, 'NEW', false, false, false, false, false, false, false, 317080.05220248655, 516803.26660610456, 'El rango de precio esperado para esta propiedad va de 317080 a 516803 USD, con una prediccion central de 423866 USD. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: la superficie total y el precio de referencia de mercado en la zona. Bajan el precio: el barrio/zona y la superficie cubierta.', '[{"factor": "la superficie", "contribution": -319.05950927734375, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 258.73150634765625, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 249.60125732421875, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -154.82110595703125, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -136.2714385986328, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Chacarita' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-27-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-27-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-27-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Departamento de 4 ambientes en venta'
  AND p.address = 'CESPEDES 3761, Comuna 15, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Hermoso departamento muy cuidado', 'APARTMENT', 'SALE', n.id, 'NICANOR MENDEZ 2524, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4479482507482, -34.550920613611936), 4326), 58.0, 58.0, 2.0, 1.0, 110000, 'Exelente  departamento,muy luminoso muy ventilado  living amplio cocina comoda y muy luminosa, el cuarto el pasillo y el living el piso es parket,la cocina y el baño todo remodelado con piso de porcelanato ,la calefaccion por estufas a gas, vista abierta  en todos los ambientes ', u.id, 'AGENCY', true, 124.59, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 155101.57729647306, 256647.4775733161, 'El rango de precio esperado para esta propiedad va de 155102 a 256647 USD, con una prediccion central de 207322 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: el barrio/zona. Bajan el precio: la superficie total, las expensas y la cochera.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 867.3768920898438, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 324.1192321777344, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -131.0044403076172, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -129.22784423828125, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -107.21836853027344, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-28-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-28-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-28-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'Hermoso departamento muy cuidado'
  AND p.address = 'NICANOR MENDEZ 2524, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en Venta', 'APARTMENT', 'SALE', n.id, 'AV PTE FIGUEROA ALCORTA 6400, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.434109898943, -34.5539571483481), 4326), 64.0, 70.0, 2.0, 2.0, 210000, '•Edificio: Torre de lujo con amenities; muy buena construcción y categoría, 2 torres de 17 pisos c/u con 3 departamentos por piso c/u; amplia entrada principal de portón eléctrico doble, y entrada a cocheras separada, 4 ascensores marca Thysen; grupo electrógeno. Vigilancia 24 hs c/control de accesos y cocheras cortesía. •Unidad: Estar-comedor de 6 x 3 mts, dormitorio principal de 3.50 x 3 con ventana a jardines, en suite (baño completo) con vestidor, de 2 x 2 mts, 2º dormitorio de 3 x 3 mts. y placard, con salida a balcón terraza de 3 x 2 mts, baño completo, apertura, tipo americana, al estar, y lavadero.•Detalles: Pisos flotantes y carpintería de aluminio, calefacción por caldera italiana para losa radiante individual y agua caliente, refrigeración por ductos de aire AMENITIES: GYM equipado con aparatos, splits, TV y dispenser de agua, con vista al patio inglés, baños y saunas- SUM DE CATEGORIA- con cocina equipada con vajilla- cocina industrial y parrillas- baños compartimentados- Laundry Piscinas climatizadas todo el año- baños y duchas en piscinas- gran parque- perimetral de seguridad- 2 garitas- juegos para niños- estacionamiento de cortesía- fuente para armonizar. Unidad en perfecto estado. Mucha luz. Superficie: 64 m2 cubiertos más 6 m2 de balcón terraza.', u.id, 'AGENCY', true, 190.16, 'NOT_SPECIFIED', false, true, true, true, false, false, false, 221183.17248751567, 384681.28287892416, 'El rango de precio esperado para esta propiedad va de 221183 a 384681 USD, con una prediccion central de 301744 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la cochera, los amenities del edificio, la seguridad 24hs y la superficie cubierta.', '[{"factor": "el barrio/zona", "contribution": 601.3348999023438, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 393.47869873046875, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 331.2800598144531, "direction": "sube el precio"}, {"factor": "la seguridad 24hs", "contribution": 253.0221710205078, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 104.6825942993164, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-29-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-29-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-29-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Departamento en Venta'
  AND p.address = 'AV PTE FIGUEROA ALCORTA 6400, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta Departamento 4 Ambientes con Balcon Palermo', 'APARTMENT', 'SALE', n.id, 'VIDT 2200, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4116217609348, -34.5867803139726), 4326), 126.0, 126.0, 4.0, 2.0, 189000, 'Departamento en Venta - Piso 6 con Baulera. Características del inmueble: 4 ambientes al frente con escritorio y dependencia. Todos los ambientes dan al fretne, ya que es un edificio en esquina. Mucha Luz! Hermosa vista abierta. Ambientes: Amplio living comedor con hermosa vista, amplios ventanales, cortinas de enrollar tipo barrio. Balcón corrido. Tres dormitorios con placard. Dormitorio principal con balcón. Escritorio. Cocina comedor separada, muy espaciosa. Dependencia de servicio. Calefacción con caldera individual. Baño competo, toilette y baño de servicio. Este departamento ofrece gran luminosidad y vistas despejadas, ideal para disfrutar de la ciudad. ', u.id, 'AGENCY', true, 87.87, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 231219.41828758072, 402136.29930823745, 'El rango de precio esperado para esta propiedad va de 231219 a 402136 USD, con una prediccion central de 315436 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la superficie total. Bajan el precio: la superficie, las expensas y los amenities del edificio.', '[{"factor": "el barrio/zona", "contribution": 355.6143493652344, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -315.0213317871094, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -299.43865966796875, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 168.27362060546875, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": -151.22344970703125, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-30-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-30-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-30-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Venta Departamento 4 Ambientes con Balcon Palermo'
  AND p.address = 'VIDT 2200, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'EXCELENTE PH 3AMB NUEVO, CON DISEÑO Y CALIDAD', 'PH', 'SALE', n.id, 'CONCEPCION ARENAL 3077, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.44337966914671, -34.57990631681112), 4326), 77.7, NULL, 3.0, 1.0, 180000, 'Venta de PH 3 AMBIENTES en Colegiales, Capital Federal

HERMOSO PH DE 3 AMBIENTES NUEVO.

Único PH de 3 ambientes ubicado en la mejor zona de Chacarita. Excelente zona sumamente solicitada.

La unidad se encuentra ubicada en Planta Baja en un complejo en excelente estado de únicamente cuatro unidades (2 en planta baja y 2 en planta alta).

Ingresamos al living comedor, muy cómodo y cálido con iluminación led embutida. La unidad en si tiene gran cantidad de espacios de guardado tanto en el living como en cada uno de sus ambientes, los cuales todos poseen pisos de porcerlanato simil madera;

Continuamos con la espaciosa cocina integrada en L, con silestone y griferías de alta calidad. La misma posee anafe electricto vitroceramico y horno empotrado. Cuenta con espacio para lavaropas. Es muy luminosa gracias al gran ventanal orientado hacia nuestro patio el cual se encuentra revestido en su totalidad con Tarquini.

Antebaño , con mesada paraíso, bacha sobre mesada y baño completo realmente muy espacioso, con detalles de diseño en revestimiento y griferías.

Dormitorios de cómodas dimensiones muy luminosos, ambos al frente, con aberturas  DVH totalmente herméticas, lo que las hace muy silenciosas, con cortinas Balck out a medida y amplios Placares.

Producto remodelado integro a nuevo, con diseño y calidad. Unica oportunidad en el mercado, llevate el producto mas buscado al mejor precio.', u.id, 'AGENCY', true, 49.18, 'NEW', false, false, false, false, false, false, false, 165008.47164082696, 260673.0014543762, 'El rango de precio esperado para esta propiedad va de 165008 a 260673 USD, con una prediccion central de 212508 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Bajan el precio: el tipo de propiedad (PH), la cantidad de banos, la superficie y la cochera.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 224.8494110107422, "direction": "sube el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -123.03047609329224, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -95.82951354980469, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -85.48530578613281, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -74.19573974609375, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Colegiales' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-31-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-31-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-31-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'EXCELENTE PH 3AMB NUEVO, CON DISEÑO Y CALIDAD'
  AND p.address = 'CONCEPCION ARENAL 3077, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta Dúplex 2 Ambientes Planta Baja en Mataderos', 'PH', 'SALE', n.id, 'JUAN B PRIMOLI 7497, Comuna 9, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.51597541003745, -34.66313613423762), 4326), 39.0, 52.0, 2.0, 1.0, 79000, 'Venta Dúplex 2 Ambientes Planta Baja en Mataderos<br><br>Excelente ubicación<br>Unidad en Planta Baja, Interno.<br><br>Detalles<br>• Ingreso a la propiedad através del Patio<br>• Living Comedor, con la cocina separada, amoblada en alacena y en bajomesada. Generosos espacios de guardado. Todo ventila al patio de entrada<br>• Toilette de recepción con revestimientos cerámicos en pisos y paredes<br>• Escalera de acceso a planta alta, revestida en madera<br><br>Planta Alta:<br>• Dormitorio principal con pisos de madera, placard empotrado y espacios de guardado sobre escalera<br>• Baño completo con bañera. Revestimientos cerámicos en pisos y paredes<br>• Balcón con lavadero cubierto<br><br> ', u.id, 'AGENCY', true, NULL, 'NOT_SPECIFIED', false, false, false, false, false, false, true, 55878.066234698796, 104304.79685224891, 'El rango de precio esperado para esta propiedad va de 55878 a 104305 USD, con una prediccion central de 84167 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie, la superficie cubierta y que este amoblado. Bajan el precio: el precio de referencia de mercado en la zona.', '[{"factor": "el barrio/zona", "contribution": -533.2031860351562, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -529.1696166992188, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 279.701171875, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 181.34048461914062, "direction": "sube el precio"}, {"factor": "que este amoblado", "contribution": 122.39390563964844, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Mataderos' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-32-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-32-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-32-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = 'Venta Dúplex 2 Ambientes Planta Baja en Mataderos'
  AND p.address = 'JUAN B PRIMOLI 7497, Comuna 9, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Amplio 3 amb en Excelente Zona - Lavadero propio', 'APARTMENT', 'RENT', n.id, 'TEGUCIGALPA 1449, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4513326900461, -34.55161792690689), 4326), 53.0, 53.0, 3.0, 1.0, 850000, 'Excelente zona. Lineas cercanas de colectivos: 19, 44, 65, 67, 80, 113, 151, 168, 184. Se trata de un 3 ambientes muy comodo, con dos dormitorios el principal de generosas dimensiones, ambos con placard y cortinas de enrollar, cocina con lavadero independiente y un baño. El departamento cuenta con cocina con muebles nuevos y baño de época en muy buen estado de conservación. Pisos de parquet en living y dormitorios en excelente estado. Cocina con muebles bajo mesada y alacenas. Servicios individuales, agua caliente por termotanque eléctrico y calefacción por placa tipo ecosol. Living 5.00x3.15 Dormitorio principal 3.93x3.30 + placard Segundo dormitorio 2.93x2.52 + placard Cocina 2.52x1.93 Baño 2.15x1.56 Lavadero 2.52x0.82 Pasillo 1.52x0.92', u.id, 'AGENCY', true, 147.65, 'USED_GOOD_CONDITION', false, false, false, false, false, false, true, 243.68740851040099, 506.14620857669325, 'El rango de precio esperado para esta propiedad va de 244 a 506 USD/mes, con una prediccion central de 376 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: que este amoblado. Bajan el precio: la superficie total, la cantidad de banos y la superficie cubierta.', '[{"factor": "la superficie", "contribution": -224.806396484375, "direction": "baja el precio"}, {"factor": "que este amoblado", "contribution": 90.0339584350586, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -68.67948913574219, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -56.420166015625, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -39.85303497314453, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-33-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-33-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-33-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'Amplio 3 amb en Excelente Zona - Lavadero propio'
  AND p.address = 'TEGUCIGALPA 1449, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - Caballito', 'APARTMENT', 'RENT', n.id, 'CENTENARIO 156, Comuna 6, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43336402073421, -34.61402624959876), 4326), 47.0, 52.0, 2.0, 1.0, 890000, 'Hermosa unidad de dos ambientes a contra frente con balcón. Gran living .Cocina con comedor diario. Lavadero incoporado. Dormitorio con placard. Baño completo. Cochera fija cubierta. Las expensas incluyen el AYSA y Cochera. SIN MASCOTAS.<br>Un mes de depósito.<br><br>', u.id, 'AGENCY', true, 209.84, 'NOT_SPECIFIED', false, true, false, false, true, false, false, 286.26861691880663, 482.7346458029969, 'El rango de precio esperado para esta propiedad va de 286 a 483 USD/mes, con una prediccion central de 375 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: la cochera. Bajan el precio: el barrio/zona, la superficie total y la superficie cubierta.', '[{"factor": "la superficie", "contribution": -156.05291748046875, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -128.0817108154297, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": 52.04151916503906, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -42.36874771118164, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -39.2491569519043, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Caballito' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-34-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-34-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-34-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'Departamento - Caballito'
  AND p.address = 'CENTENARIO 156, Comuna 6, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en ALQUILER en Recoleta', 'APARTMENT', 'RENT', n.id, 'GALLO 1537, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.409478628151, -34.59239479759185), 4326), 100.0, 100.0, 4.0, 2.0, 1150000, 'Departamento exclusivo en zona destacada de Recoleta con un comfort y calidad único. Palier privado. Living y comedor con salida al balcón. Tres dormitorios, dos baños.  Cocina amplia, lavadero, dependencia de servicio. Todos los cuartos con ventilador.Dos entradas ( principal y de servicio ) .Cercano a centros comerciales y puntos de interés.', u.id, 'AGENCY', true, 260.98, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 362.61404609282914, 772.4450014149826, 'El rango de precio esperado para esta propiedad va de 363 a 772 USD/mes, con una prediccion central de 549 USD/mes. El factor que mas influye en esta prediccion es los amenities del edificio, que baja el precio. Tambien suben el precio: la superficie. Bajan el precio: la cantidad de ambientes, el precio de referencia de mercado en la zona y que este amoblado.', '[{"factor": "los amenities del edificio", "contribution": -65.55257415771484, "direction": "baja el precio"}, {"factor": "la cantidad de ambientes", "contribution": -62.03593444824219, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -56.6523323059082, "direction": "baja el precio"}, {"factor": "que este amoblado", "contribution": -56.51581573486328, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 54.88808059692383, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-35-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-35-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-35-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'Departamento en ALQUILER en Recoleta'
  AND p.address = 'GALLO 1537, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta Departamento 2 Ambientes Nuñez a estrenar ', 'APARTMENT', 'SALE', n.id, 'NUÑEZ 2306, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4665262690355, -34.549212387027225), 4326), 41.0, 41.0, 2.0, 1.0, 148000, 'Gran oportunidad! Excelente unidad 2 ambientes a estrenar. Piso Alto. Cocina integrada al living comedor. Amplio balcón corrido con salida desde el living y dormitorio. Dormitorio con placard. Baño completo. Full Amenities: Rooftop con Gran Piscina - Solarium - Terraza con Sky View - Parrillas - sum - Gimnasio - Laundry - Bicicleteros - Cocheras - Seguridad. El emprendimiento se sitúa en el barrio de Nuñez sobre un terreno de mas de 1000 mts de superficie. ', u.id, 'AGENCY', true, 115.87, 'NEW', true, true, true, true, true, false, false, 123749.20149114009, 212353.81582894424, 'El rango de precio esperado para esta propiedad va de 123749 a 212354 USD, con una prediccion central de 168579 USD. El factor que mas influye en esta prediccion es la cochera, que sube el precio. Tambien suben el precio: el barrio/zona, los amenities del edificio y la seguridad 24hs. Bajan el precio: la superficie total.', '[{"factor": "la cochera", "contribution": 338.63006591796875, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 303.94677734375, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 291.1988525390625, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -279.6105651855469, "direction": "baja el precio"}, {"factor": "la seguridad 24hs", "contribution": 259.208251953125, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Núñez' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-36-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-36-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-36-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'Venta Departamento 2 Ambientes Nuñez a estrenar '
  AND p.address = 'NUÑEZ 2306, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Palermo - Capital Federal', 'APARTMENT', 'SALE', n.id, 'RUFINO DE ELIZALDE 2900, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4017261990675, -34.5800189592199), 4326), 351.0, 351.0, 5.0, 3.0, 2600000, 'Departamento 351m² 5 ambientes con Cloaca, Palermo', u.id, 'AGENCY', true, NULL, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 1267430.7426135475, 2204312.735663859, 'El rango de precio esperado para esta propiedad va de 1267431 a 2204313 USD, con una prediccion central de 1729065 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la superficie total y la cantidad de banos. Bajan el precio: los amenities del edificio y la superficie.', '[{"factor": "el barrio/zona", "contribution": 994.0604858398438, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 721.76611328125, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 439.56109619140625, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": -191.64906311035156, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -111.59357452392578, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-37-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-37-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-37-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Palermo - Capital Federal'
  AND p.address = 'RUFINO DE ELIZALDE 2900, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en Venta', 'APARTMENT', 'SALE', n.id, 'FARADAY 1586, Comuna 7, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.44021465075491, -34.63866281996114), 4326), 43.0, 52.0, 1.0, 1.0, 122000, 'Un hermoso departamento de 1 ambiente de 52.53 M2 totales. Constan de amplios ambientes muy luminosos con doble altura, a estrenar.', u.id, 'AGENCY', true, 98.36, 'NEW', false, false, false, false, true, false, false, 66208.70744243725, 122349.49968286233, 'El rango de precio esperado para esta propiedad va de 66209 a 122349 USD, con una prediccion central de 100681 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie y la superficie cubierta. Bajan el precio: la cantidad de ambientes y el precio de referencia de mercado en la zona.', '[{"factor": "el barrio/zona", "contribution": -360.88250732421875, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 175.59046936035156, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 135.0720977783203, "direction": "sube el precio"}, {"factor": "la cantidad de ambientes", "contribution": -134.44639587402344, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -109.39165496826172, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Parque Chacabuco' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-38-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-38-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-38-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'Departamento en Venta'
  AND p.address = 'FARADAY 1586, Comuna 7, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 4 ambientes con dependencia en venta Recoleta', 'APARTMENT', 'SALE', n.id, 'JOSE A CABRERA 3264, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.41254334945198, -34.59684697826049), 4326), 148.0, 155.0, 4.0, 3.0, 505000, 'En una de las mejores zonas de Buenos Aires, en el barrio de Recoleta, les ofrecemos a la  venta amplio piso de 4 ambientes con dependencia de servicio 2 bauleras.Edificio de estilo Francés de época.Gran living comedor con doble circulación y excelente luz natural, sala de estar/ playroom, amplia cocina comedor diario independiente con lavadero integrado, un toilette. Dormitorio principal en suite , segundo dormitorio con escritorio, tercer dormitorio, baño completo. La unidad cuenta con un vistoso patio propio, dependencia, pisos de roble americano ,entrada y ascensor de servicio. 2 amplias bauleras.', u.id, 'AGENCY', true, 393.44, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 310922.3797230936, 541883.5007804969, 'El rango de precio esperado para esta propiedad va de 310922 a 541884 USD, con una prediccion central de 424919 USD. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el barrio/zona, la superficie total y la cantidad de banos. Bajan el precio: los amenities del edificio.', '[{"factor": "la superficie", "contribution": -287.5498046875, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": 281.5854187011719, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 206.53602600097656, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 197.40809631347656, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": -156.91537475585938, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-39-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-39-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-39-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'Departamento de 4 ambientes con dependencia en venta Recoleta'
  AND p.address = 'JOSE A CABRERA 3264, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT '4 amb. al fte. c/ bcón. ', 'APARTMENT', 'SALE', n.id, 'CACHIMAYO 600, Comuna 6, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4413440971013, -34.6278219138407), 4326), 60.0, 64.0, 4.0, 2.0, 125000, 'Oportunidad!! Departamento de 4 ambientes al frente con balcón. Muy Luminoso.<br>Medidas y descripción de los ambientes:<br>Living: 6,20 x 2,90  mtrs; <br>Cocina: 3,00 x 1,60 mtrs., equipada con muebles alto y bajo mesada, cocina y calefón a gas natural;<br>Lavadero independiente: 1,70 x 0,80 mtrs.;<br>Toilette: 1,50 x 0,90 mtrs.;<br>Baño completo:  1,90 x 1,50 mtrs.;<br>Primer Dormitorio:  2,90 x 2,40 mtrs. más placard;<br>Segundo Dormitorio: 3 x 2,90 mtrs. más placard;<br>Tercer Dormitorio 3,30 x 2,00 mtrs.  más placard;<br>Superficie aprox. cubierta 60m2, descubierta 4m2, total 64m2. Expensas aprox. $ 4.500.-<br>Todos los ambientes tienen pisos cerámicos. Orientación oeste.<br>Edificio de 13 Pisos, 5 departamentos por Piso, 2 ascensores, cuenta con Parque cerrado con jardines y paseos.  Salón de fiestas, Estacionamiento Común de todos los condóminos en Planta baja.  El predio tiene cerramiento perimetral con rejas lo que otorga gran seguridad al Jardín y a los edificios. <br>', u.id, 'AGENCY', true, 150.82, 'NOT_SPECIFIED', false, false, false, false, true, false, true, 137651.8666143327, 225679.46492881983, 'El rango de precio esperado para esta propiedad va de 137652 a 225679 USD, con una prediccion central de 184946 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: la cantidad de banos y que este amoblado. Bajan el precio: la cochera y el barrio/zona.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 279.98077392578125, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": -110.0208740234375, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -105.92172241210938, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 90.63511657714844, "direction": "sube el precio"}, {"factor": "que este amoblado", "contribution": 73.82563781738281, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Caballito' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-40-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-40-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-40-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = '4 amb. al fte. c/ bcón. '
  AND p.address = 'CACHIMAYO 600, Comuna 6, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departameto en Venta de 117 M2 en Caballito!!!! Excelente ubicación! ', 'APARTMENT', 'SALE', n.id, 'GRAL MARTIN DE GAINZA 1100, Comuna 6, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4465136343117, -34.6077288692412), 4326), 117.0, 117.0, 4.0, 2.0, 200000, 'Departamento a reciclar de 117M2 en caballito, cuenta con 3 dormitorios, 1 baño completo,1 de ellos en suite con vestidor, dependencia de servicio con baño, amplia cocina,living comedor, lavadero, baulera, muy luminoso', u.id, 'AGENCY', true, 229.51, 'NEEDS_RENOVATION', false, false, false, false, true, false, false, 235305.3313774393, 385781.77387846506, 'El rango de precio esperado para esta propiedad va de 235305 a 385782 USD, con una prediccion central de 316151 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: la superficie total. Bajan el precio: la superficie, el estado de la propiedad (a reciclar) y el barrio/zona.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 325.03009033203125, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -271.3079833984375, "direction": "baja el precio"}, {"factor": "el estado de la propiedad (a reciclar)", "contribution": -190.32298123836517, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -125.83460998535156, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 113.75596618652344, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Caballito' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-41-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-41-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-41-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'Departameto en Venta de 117 M2 en Caballito!!!! Excelente ubicación! '
  AND p.address = 'GRAL MARTIN DE GAINZA 1100, Comuna 6, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Muy Lindo Monoambiente en Villa del Parque con Balcon ', 'APARTMENT', 'RENT', n.id, 'NAZARRE 3639, Comuna 11, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.49907751855861, -34.6048761525206), 4326), 34.0, 34.0, 1.0, 1.0, 500000, 'Hermoso depto con balcón en alquiler próximo a metrobus-agronomía. Edificio a estrenar en funcionamiento. Muy luminoso, amplio, con excelentes terminaciones y materiales de calidad. Aire acondicionado f/c. Edificio cuenta con parrilla y laundry, agua caliente central, cocina eléctrica. Colectivos: 47, 57, 78, 105, 113, 133, 146.', u.id, 'AGENCY', true, 118.03, 'NEW', false, false, true, false, true, false, false, 467.35520550519186, 780.9883181937133, 'El rango de precio esperado para esta propiedad va de 467 a 781 USD/mes, con una prediccion central de 611 USD/mes. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: el estado de la propiedad (a estrenar). Bajan el precio: la superficie, el barrio/zona y la superficie total.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 270.8126525878906, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -262.6724548339844, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -125.77598571777344, "direction": "baja el precio"}, {"factor": "el estado de la propiedad (a estrenar)", "contribution": 106.96539670228958, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -76.22914123535156, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa del Parque' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-42-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-42-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-42-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = 'Muy Lindo Monoambiente en Villa del Parque con Balcon '
  AND p.address = 'NAZARRE 3639, Comuna 11, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'V Del Parque Casa 4amb', 'HOUSE', 'SALE', n.id, 'LA ESPIGA 2714, Comuna 11, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.481678247103176, -34.60700445909027), 4326), 146.0, NULL, 4.0, 3.0, 190000, 'Venta de Casa 4 AMBIENTES en Villa del Parque, Capital Federal

Casa reciclada de 4 ambientes en esquina. Lote propio. Superficie total de 200m², cubierta de 145m² y descubierta de 55m². Actualmente distribuido en tres monoambientes con cocinas y baños independientes. Patio y gran terraza con parrilla y habitación de guardado. Gran potencial en cuanto a reformas para unificar en una casa. Muy buen estado, luminoso. Pisos de cerámica. 

Antigüedad 50 años. 

Colectivos: 24, 63, 84, 109, 110, 113, 124, 133, 134, 135.', u.id, 'AGENCY', true, 124.59, 'NEEDS_RENOVATION', false, false, false, false, true, false, false, 273824.77393999585, 429901.70917953254, 'El rango de precio esperado para esta propiedad va de 273825 a 429902 USD, con una prediccion central de 350425 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la cantidad de banos y el precio de referencia de mercado en la zona. Bajan el precio: el tipo de propiedad (Casa) y la superficie.', '[{"factor": "el barrio/zona", "contribution": -276.1067810058594, "direction": "baja el precio"}, {"factor": "el tipo de propiedad (Casa)", "contribution": -242.70577788352966, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -220.61398315429688, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 211.77386474609375, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 197.5812225341797, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa del Parque' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-43-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-43-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-43-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = 'V Del Parque Casa 4amb'
  AND p.address = 'LA ESPIGA 2714, Comuna 11, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Negociable. Venta. Ph 4 Ambientes.', 'PH', 'SALE', n.id, 'THOMPSON 885, Comuna 7, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43834706588826, -34.6298549686936), 4326), 95.0, 95.0, 4.0, 2.0, 169000, 'CARACTERÍSTICAS- Superficie total: 95 m².- Ambientes: 4.- Dormitorios: 3.- Dormitorios en suite: 1.- Cocina con comedor diario.- Living Comedor.- Lavadero.- Baños: 2.- Terraza de uso común.- Entrada de servicio.- Sin expensas.- Negociable.- Financiación.- Permuta.', u.id, 'AGENCY', true, 42.62, 'NEEDS_RENOVATION', false, false, false, false, false, false, false, 108756.46495887876, 200975.06187632857, 'El rango de precio esperado para esta propiedad va de 108756 a 200975 USD, con una prediccion central de 165382 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Bajan el precio: la superficie, el estado de la propiedad (a reciclar), el tipo de propiedad (PH) y el precio de referencia de mercado en la zona.', '[{"factor": "el barrio/zona", "contribution": -328.9630126953125, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -228.68919372558594, "direction": "baja el precio"}, {"factor": "el estado de la propiedad (a reciclar)", "contribution": -221.86030864715576, "direction": "baja el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -175.82575917243958, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -105.46895599365234, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Parque Chacabuco' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-44-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-44-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-44-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'Negociable. Venta. Ph 4 Ambientes.'
  AND p.address = 'THOMPSON 885, Comuna 7, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - Palermo', 'APARTMENT', 'SALE', n.id, 'ARENALES 3772, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.41474120872388, -34.58470374292041), 4326), 104.0, 108.0, 3.0, 2.0, 320000, 'Muy lindo departamento de dos dormitorios mas dependencias. Dos baños, cocina, lavadero y cochera"<br><br>Tiene una portería de mucha confianza que casi funciona como la recepción de un Hotel.<br><br>El gran bloque tiene planta baja, con una entrada para cada cuerpo, y doce pisos de viviendas. El jardín está densamente arbolado, e incluye un sector de juegos para niños y varias estatuas que ornamentan. En los subsuelos se encuentran depósitos, las calderas y un gran estacionamiento bajo el parque.<br><br>', u.id, 'AGENCY', true, 262.3, 'NOT_SPECIFIED', false, true, false, false, false, false, false, 282831.60278410633, 491900.09607911453, 'El rango de precio esperado para esta propiedad va de 282832 a 491900 USD, con una prediccion central de 385847 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la cochera y la superficie total. Bajan el precio: la superficie y los amenities del edificio.', '[{"factor": "el barrio/zona", "contribution": 510.6634521484375, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 359.538818359375, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -226.75209045410156, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": -133.7650604248047, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 119.92545318603516, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-45-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-45-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-45-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Departamento - Palermo'
  AND p.address = 'ARENALES 3772, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta Departamento Monoambiente en Villa Urquiza ', 'APARTMENT', 'SALE', n.id, 'MEDEYROS 3547, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.50679759684017, -34.56940318229813), 4326), 30.0, 30.0, 1.0, 1.0, 65000, 'Departamento monoambiente en venta (Villa Urquiza, Ciudad Autónoma de Buenos Aires). Desarrollado en piso alto por ascensor, con disposición contra frente y orientación al este. _ El mismo posee cocina equipada con muebles sobre y bajo mesada, un espacio principal con espacios de guardado empotrados y un baño completo con bañera. Luminoso, cuenta con balcón y equipo de aire acondicionado. _ La propiedad tiene una superficie total de aproximadamente 30mts2, de los cuales 27. 5mts2 son cubiertos.', u.id, 'AGENCY', true, 61.18, 'NOT_SPECIFIED', false, false, false, false, true, false, true, 59812.99212585011, 98843.65258771964, 'El rango de precio esperado para esta propiedad va de 59813 a 98844 USD, con una prediccion central de 82431 USD. El factor que mas influye en esta prediccion es la superficie, que sube el precio. Tambien suben el precio: la superficie cubierta. Bajan el precio: la superficie total, las expensas y la cochera.', '[{"factor": "la superficie", "contribution": 304.1697082519531, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -202.94400024414062, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 151.11912536621094, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -114.04210662841797, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -102.71720886230469, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Urquiza' AND u.email = 'nortecaba.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-46-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-46-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-46-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'nortecaba.propiedades@nidio.app'
  AND p.title = 'Venta Departamento Monoambiente en Villa Urquiza '
  AND p.address = 'MEDEYROS 3547, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'San Cristóbal PH 4amb', 'PH', 'SALE', n.id, 'CATAMARCA 1182, Comuna 3, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.40406739751951, -34.62378801229627), 4326), 44.0, 50.0, 4.0, 1.0, 99000, 'PH reciclado de 4 ambientes, al frente. 1o piso por escalera. Superficie total de 48m2, cubierta de 44m2 y descubierta de 8m2. Tres dormitorios, un baño completo. Living-comedor, cocina. Patio. Balcón. Medidas: Living de 4.50 x 4 m. Cocina de 1.60 x 2 m. Habitación 1 de 1.60 x 2.50 m. Habitación 2 de 2.80 x 1.40 m. Habitación 3 que da al patio, de 2x 2.30 m. Baño de 1.50 x 2 m. Patio de 2 x 2.30 m. Pasillo distribuidor de 1 x 3m. Balcón a la calle 1.20 x 3m. Muy buen estado, luminoso. Pisos de cerámica. 
<br>', u.id, 'AGENCY', true, 73.44, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 74600.72950783824, 119954.70751303235, 'El rango de precio esperado para esta propiedad va de 74601 a 119955 USD, con una prediccion central de 103324 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie y la superficie cubierta. Bajan el precio: el precio de referencia de mercado en la zona y las expensas.', '[{"factor": "el barrio/zona", "contribution": -411.1316833496094, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -224.53981018066406, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 202.52809143066406, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 178.18609619140625, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -98.10809326171875, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'San Cristóbal' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-47-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-47-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-47-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'San Cristóbal PH 4amb'
  AND p.address = 'CATAMARCA 1182, Comuna 3, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA PH 3 AMBIENTES NUÑEZ  CON PATIO Y PARRILLA', 'PH', 'SALE', n.id, 'VEDIA 2254, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4732824505268, -34.539145948367505), 4326), 134.0, 160.0, 3.0, 2.0, 234000, '<br><br>TOTALMENTE RECICLADO!!!! SIN EXPENSAS!!!!<br>PH en planta baja.<br>Desarrollado en tres niveles.<br><br>Hall Recibidor<br>Living (3.70 x 8.20) con salida al patio.<br>Amplio comedor (4.85 x 3.83) con ventanales al patio. Estufa a leña. Aire acondicionado F/C<br>Cocina integrada con isla, también con ventanales al patio. Anafe a gas y horno eléctrico. Espacio para lavavajillas. <br>Toilette con ducha.<br>Sala de estudio.<br>Dormitorio (4x4) con vestidor (3.70 x 2.70). Aire acondicionado F/C<br>Baño completo con ducha y bañera.<br>Patio de uso exclusivo con parrilla.<br>Lavadero con espacio lavarropas, bacha y lugar de guardado artículos de limpieza..<br><br>Todas las aberturas con doble vidrio y mosquiteros<br><br>Agua caliente por termotanque.<br><br>ABL: $ 602 (Junio 2020)<br>Superficie cubierta: 133.63 m2 - Superficie total: 160 m2 - Superficie total por escritura: 109 m2<br><br>', u.id, 'AGENCY', true, NULL, 'NEEDS_RENOVATION', false, false, false, false, false, false, false, 242064.40343280122, 415382.88026038365, 'El rango de precio esperado para esta propiedad va de 242064 a 415383 USD, con una prediccion central de 329755 USD. El factor que mas influye en esta prediccion es el tipo de propiedad (PH), que baja el precio. Tambien suben el precio: la superficie total y el barrio/zona. Bajan el precio: la superficie y el estado de la propiedad (a reciclar).', '[{"factor": "el tipo de propiedad (PH)", "contribution": -315.24477338790894, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 290.2435607910156, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -246.9122314453125, "direction": "baja el precio"}, {"factor": "el estado de la propiedad (a reciclar)", "contribution": -242.58486485481262, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": 239.05093383789062, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Núñez' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-48-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-48-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-48-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'VENTA PH 3 AMBIENTES NUÑEZ  CON PATIO Y PARRILLA'
  AND p.address = 'VEDIA 2254, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Piso alto vista cuidad y rio 7 amb. 5 coch. Seg 24 h. Full amenities - Puerto Madero', 'APARTMENT', 'SALE', n.id, 'BO RODRIGO BUENO 8 1711, Comuna 1, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.351572469545495, -34.617015854952456), 4326), 400.0, 400.0, 7.0, 5.0, 6500000, '<br><br>Importante Piso de  400 m2 totales en PUERTO MADERO, una de las torres más prestigiosa, ubicada en dique 2 de  Puerto Madero. Muy alto  con vistas panorámicas a  Ciudad y Río. Presenta, Palier privado, LC de medidas generosas, toilette y placard de recepción, 5 Dormitorios ( 4 de ellos en suite)  mas Family, 5 Baños, comedor diario, cocina completa, Dependencia de servicio . cuenta con 5 Cocheras fijas cubiertas. FULL AMENITIES: 2 piscinas climatizadas, una al aire libre y otra cubierta, hidromasaje, Solarium, Cancha de tenis, Salón de fiestas,SUM equipado, Sala de música, Microcine, Salón Bar , Sector de juegos exteriores, Sala de musculación y fitness con deck exterior, Sala de masajes, sauna seco y húmedo, Peluquería, Restaurant, Guardería infantil, Laundry, Seguridad 24 hs. Servicio de conserjería. Estacionamiento de cortesía.<br><br>Las superficies y medidas son aproximadas y surgirán del titulo de propiedad respectivo.', u.id, 'AGENCY', true, NULL, 'NOT_SPECIFIED', true, true, true, true, false, false, false, 2424977.7653083815, 4002146.173261719, 'El rango de precio esperado para esta propiedad va de 2424978 a 4002146 USD, con una prediccion central de 3189775 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: el precio de referencia de mercado en la zona, la superficie total y la cantidad de banos. Bajan el precio: la superficie.', '[{"factor": "el barrio/zona", "contribution": 1685.593994140625, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 1042.9447021484375, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 1039.985595703125, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 706.9146728515625, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -348.5707702636719, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Puerto Madero' AND u.email = 'plazacentro.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-49-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-49-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-49-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'plazacentro.propiedades@nidio.app'
  AND p.title = 'Piso alto vista cuidad y rio 7 amb. 5 coch. Seg 24 h. Full amenities - Puerto Madero'
  AND p.address = 'BO RODRIGO BUENO 8 1711, Comuna 1, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta: Monoambiente de 48 m2 con todos los amenities!!', 'APARTMENT', 'RENT', n.id, 'TTE BENJAMIN MATIENZO 2812, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.44300620970211, -34.57612944008645), 4326), 42.0, 48.0, 1.0, 1.0, 900000, 'Monoambiente de 48 m2 a estrenar en edificio de gran categoría con todos los amenities. Súper luminoso!<br>Amplio ambiente de 8.20x3.50 con cocina completa con barra, y salida a balcón (3.50x1.30) al frente. Recepción de 3x1.40 con gran placard. Baño completo.<br>El edificio cuenta con todos los amenities: SUM, gran piscina con solárium en planta baja, gimnasio, quincho con parrilla, laundry, seguridad 24 horas.<br>Características: Pisos de madera flotante. Aire acondicionado split frío / calor. Cocina/horno eléctrico. <br><br>', u.id, 'AGENCY', true, 118.03, 'NEW', true, false, true, true, true, false, false, 335.3116150122031, 604.4051666669363, 'El rango de precio esperado para esta propiedad va de 335 a 604 USD/mes, con una prediccion central de 446 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el estado de la propiedad (a estrenar) y los amenities del edificio. Bajan el precio: la superficie total y el barrio/zona.', '[{"factor": "la superficie", "contribution": -272.91253662109375, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -74.29569244384766, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -65.66279602050781, "direction": "baja el precio"}, {"factor": "el estado de la propiedad (a estrenar)", "contribution": 65.63639670610428, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 49.87391662597656, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Colegiales' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-50-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-50-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-50-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'Venta: Monoambiente de 48 m2 con todos los amenities!!'
  AND p.address = 'TTE BENJAMIN MATIENZO 2812, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'ALQUILER 2 AMB CON PATIO A ESTRENAR + COCHERA', 'APARTMENT', 'RENT', n.id, 'DEL SIGNO 4015, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.417428058480645, -34.59062439156739), 4326), 37.0, 65.0, 2.0, 1.0, 750000, '<br><br>El edificio fue terminado en el año 2018. <br><br>Es una planta baja super luminosa. Cuenta con cocina integrada, con espacio para heladera y lavarropas. Muebles bajo mesada. <br><br>Patio propio de 30 metros. <br><br>Amplia habitación 3 x 2,5 mas placar<br><br>Baño completo con bañera. <br><br>Cochera cubierta exclusiva. <br><br>', u.id, 'AGENCY', true, 163.93, 'NEW', false, true, false, false, false, false, false, 404.377409019647, 873.1029811015328, 'El rango de precio esperado para esta propiedad va de 404 a 873 USD/mes, con una prediccion central de 609 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona, el estado de la propiedad (a estrenar) y la cochera. Bajan el precio: la superficie cubierta.', '[{"factor": "la superficie", "contribution": -295.740966796875, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 117.77342224121094, "direction": "sube el precio"}, {"factor": "el estado de la propiedad (a estrenar)", "contribution": 89.02989539504051, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 74.7918930053711, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": -54.53643035888672, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-51-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-51-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-51-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'ALQUILER 2 AMB CON PATIO A ESTRENAR + COCHERA'
  AND p.address = 'DEL SIGNO 4015, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Monoambiente Muy Luminoso en Tribunales ', 'APARTMENT', 'RENT', n.id, 'AV CORRIENTES 1799, Comuna 1, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.3922864764726, -34.6044361287989), 4326), 27.0, 27.0, 1.0, 1.0, 400000, '27 M2 organizados de manera cómoda y funcional. El ambiente es muy luminoso y bien ventilado. El departamento tiene una ubicación privilegiada y excelentes conexiones de transporte. Requisitos para ingresar: - Seguro de caución. - Ingresos comprobables. - Mes de depósito y mes de adelanto. - ', u.id, 'AGENCY', true, 121.31, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 244.21100668809765, 439.8847444645808, 'El rango de precio esperado para esta propiedad va de 244 a 440 USD/mes, con una prediccion central de 332 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona. Bajan el precio: el barrio/zona, la superficie total y la superficie cubierta.', '[{"factor": "la superficie", "contribution": -186.42910766601562, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -114.87284851074219, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -79.96434783935547, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 69.35710144042969, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": -42.53340148925781, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'San Nicolás' AND u.email = 'plazacentro.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-52-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-52-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-52-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'plazacentro.propiedades@nidio.app'
  AND p.title = 'Monoambiente Muy Luminoso en Tribunales '
  AND p.address = 'AV CORRIENTES 1799, Comuna 1, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Casa · 223m² Cubiertos · 4 Ambientes ·1 Cocheras', 'HOUSE', 'SALE', n.id, 'GUAYAQUIL 639, Comuna 6, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4376751797357, -34.6213413595876), 4326), 359.0, NULL, 4.0, 3.0, 130000, 'Casa ubicada en el barrio de Caballito ', u.id, 'AGENCY', true, NULL, 'NOT_SPECIFIED', false, true, false, false, false, false, false, 638935.7498668778, 1047531.586025273, 'El rango de precio esperado para esta propiedad va de 638936 a 1047532 USD, con una prediccion central de 858461 USD. El factor que mas influye en esta prediccion es el tipo de propiedad (Casa), que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona y la cochera. Bajan el precio: la superficie y el barrio/zona.', '[{"factor": "el tipo de propiedad (Casa)", "contribution": -349.6531753540039, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -345.7367248535156, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -292.33380126953125, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 229.43646240234375, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 181.1923065185547, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Caballito' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-53-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-53-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-53-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'Casa · 223m² Cubiertos · 4 Ambientes ·1 Cocheras'
  AND p.address = 'GUAYAQUIL 639, Comuna 6, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'TORRE EN VENTA', 'APARTMENT', 'SALE', n.id, 'GODOY CRUZ 3263, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.42080854750535, -34.57282886335752), 4326), 200.0, 200.0, 4.0, 4.0, 379000, 'TORRE
<br>A ESTRENAR
<br>
<br>200 m2 
<br>LLENO DE LUZ , DIVINO !!
<br>Palier Privado 
<br>Amplio hall de recepcion a deslumbrante living comedor con balcón corrido con buena vista lleno de luz 
<br>Toilette de recepcion 
<br>3 dormitorios .Master suite con muy buen baño
<br>Amplia y luminosa cocina con comedor diario
<br>Dependencia de servicio . Lavadero
<br>Seguridad 24 hs 
<br>Pileta Gym y SUM muy bien equipados ', u.id, 'AGENCY', true, NULL, 'NEW', true, false, true, true, true, false, false, 917710.9283406307, 1596080.8105598914, 'El rango de precio esperado para esta propiedad va de 917711 a 1596081 USD, con una prediccion central de 1251967 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la cantidad de banos, la superficie total y los amenities del edificio. Bajan el precio: la superficie.', '[{"factor": "el barrio/zona", "contribution": 1017.468505859375, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 861.3642578125, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 626.43798828125, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 547.26416015625, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -361.19964599609375, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-54-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-54-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-54-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'TORRE EN VENTA'
  AND p.address = 'GODOY CRUZ 3263, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Monoambiente con Balcon', 'APARTMENT', 'RENT', n.id, 'AV MEDRANO 1612, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.418994736242816, -34.590694875909534), 4326), 47.0, 47.0, 1.0, 1.0, 600000, 'Departamento de monoambiente en alquiler, a estrenar, en Concepción Palermo. La unidad tiene una superficie de 47, 04 m2 y se alquila amoblado. Muy luminoso y funcional, cuenta con un balcón y ofrece una vista cautivadora a la piscina. Por sus medidas, resulta ideal para aquellos que proyectan una vida en pareja. *El departamento cuenta con*: - Living comedor con cocina integrada. - Anafe de dos placas eléctricas y horno eléctrico. - Mesada de silestone color gris oscuro y mueble bajo mesada. - Placard. - Baño completo. - Aire acondicionado frío/calor. - Balcón. - Muy luminoso. - Amoblado.', u.id, 'AGENCY', true, 262.3, 'NEW', true, false, true, false, true, false, true, 433.1089162999783, 935.1380109980195, 'El rango de precio esperado para esta propiedad va de 433 a 935 USD/mes, con una prediccion central de 652 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona, el estado de la propiedad (a estrenar) y que este amoblado. Bajan el precio: la superficie total.', '[{"factor": "la superficie", "contribution": -333.94281005859375, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 130.08677673339844, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -91.90607452392578, "direction": "baja el precio"}, {"factor": "el estado de la propiedad (a estrenar)", "contribution": 67.04108762741089, "direction": "sube el precio"}, {"factor": "que este amoblado", "contribution": 66.99658966064453, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-55-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-55-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-55-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Monoambiente con Balcon'
  AND p.address = 'AV MEDRANO 1612, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - Caballito', 'APARTMENT', 'RENT', n.id, 'ORTEGA 817, Comuna 6, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.44338834736276, -34.614313158357604), 4326), 32.0, 35.0, 1.0, 1.0, 450000, '<br>Juan B Alberdi 1600 - Alquiler Monoambiente - Caballito<br><br>*** SE ALQUILA SIN MUEBLES ***<br><br>Hermoso monoambiente con balcón, placard, cocina integrada con desayunador, baño completo, split frío/calor.<br>Edificio con jacuzzi, s.u.m, parrilla y laundry. (Aysa incluido en expensas)<br><br>CONDICIONES DE CONTRATACION:<br>* GARANTIA PROPIETARIA DE C.A.B.A. o SEGURO DE CAUCION<br>* COMPROBACIÓN DE INGRESOS<br>* NO MASCOTAS<br><br><br>*** SE ALQUILA SIN MUEBLES ***<br><br>', u.id, 'AGENCY', true, 174.43, 'NOT_SPECIFIED', false, false, true, false, false, false, false, 253.6648342561705, 427.75490109717214, 'El rango de precio esperado para esta propiedad va de 254 a 428 USD/mes, con una prediccion central de 332 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: los amenities del edificio. Bajan el precio: el barrio/zona, la superficie total y la cantidad de banos.', '[{"factor": "la superficie", "contribution": -219.93763732910156, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -119.62660217285156, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -72.42304229736328, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": 53.018089294433594, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": -40.92784118652344, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Caballito' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-56-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-56-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-56-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'Departamento - Caballito'
  AND p.address = 'ORTEGA 817, Comuna 6, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - Puerto Madero ', 'APARTMENT', 'RENT', n.id, 'LOLA MORA 484, Comuna 1, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.3598406197324, -34.61900374407777), 4326), 75.0, 75.0, 2.0, 1.0, 1982500, 'Ubicado en la exclusiva zona de Puerto Madero, este moderno monoambiente a estrenar ofrece una experiencia de vida única en una de las áreas más emblemáticas de Capital Federal. Esta propiedad es ideal tanto para vivir como para trabajar, ya que cuenta con la aprobación para uso profesional. El espacio se compone de un dormitorio, un baño y un encantador balcón que brinda vistas al entorno urbano. Entre las características destacadas de este monoambiente se incluyen aire acondicionado, conexión WiFi e Internet, así como una heladera y lavadero que añaden comodidad al día a día. La seguridad y el acceso son garantizados por un moderno ascensor que facilita el desplazamiento dentro del edificio. Con una superficie total de 60 m², donde 15 m² es cubierto y 1 m² descubierto, este monoambiente es perfecto para quienes buscan un espacio funcional y elegante en una de las zonas más codiciadas de la ciudad. No pierda la oportunidad de vivir en un entorno que combina comodidad, modernidad y exclusividad.', u.id, 'AGENCY', true, 262.3, 'NEW', false, false, false, false, false, false, false, 778.383291779205, 2011.9001871138175, 'El rango de precio esperado para esta propiedad va de 778 a 2012 USD/mes, con una prediccion central de 1316 USD/mes. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: el precio de referencia de mercado en la zona y el estado de la propiedad (a estrenar). Bajan el precio: la superficie y que este amoblado.', '[{"factor": "el barrio/zona", "contribution": 684.6090698242188, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 100.31681823730469, "direction": "sube el precio"}, {"factor": "el estado de la propiedad (a estrenar)", "contribution": 91.6829686164856, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -72.58628845214844, "direction": "baja el precio"}, {"factor": "que este amoblado", "contribution": -65.8359603881836, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Puerto Madero' AND u.email = 'plazacentro.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-57-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-57-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-57-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'plazacentro.propiedades@nidio.app'
  AND p.title = 'Departamento - Puerto Madero '
  AND p.address = 'LOLA MORA 484, Comuna 1, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en Monserrat ', 'APARTMENT', 'SALE', n.id, 'AV 9 DE JULIO 1999, Comuna 1, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.3812182717641, -34.6130922857776), 4326), 32.0, 32.0, 1.0, 1.0, 46000, 'Este departamento ofrece una ubicación inmejorable. Ideal para estudiantes y profesionales, fácil acceso a una amplia gama de opciones de transporte público y estarás cerca de importantes universidades como uade. También es una buena opción como inversión para alquiler temporal. El monoambiente está situado al frente y cuenta con luz todo el día y un excelente balcón, perfecto para disfrutar de tu espacio al aire libre. ', u.id, 'AGENCY', true, 114.75, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 51809.33069571642, 90008.22470321078, 'El rango de precio esperado para esta propiedad va de 51809 a 90008 USD, con una prediccion central de 69769 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie y la superficie cubierta. Bajan el precio: el precio de referencia de mercado en la zona y la superficie total.', '[{"factor": "el barrio/zona", "contribution": -351.4947814941406, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -296.3860778808594, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 281.7842102050781, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -192.37696838378906, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 137.2217254638672, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Monserrat' AND u.email = 'plazacentro.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-58-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-58-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-58-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'plazacentro.propiedades@nidio.app'
  AND p.title = 'Departamento en Monserrat '
  AND p.address = 'AV 9 DE JULIO 1999, Comuna 1, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'ALQUILER DEPARTAMENTO AMOBLADO 2 AMBIENTES,MICROCENTRO', 'APARTMENT', 'RENT', n.id, 'TALCAHUANO 660, Comuna 1, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.38532232960444, -34.600937035109844), 4326), 50.0, 50.0, 2.0, 1.0, 550000, '<br>Piso 3<br>Balcón corrido a la calle.<br>50 metros.<br>Amoblado y equipado<br>', u.id, 'AGENCY', true, 104.92, 'NOT_SPECIFIED', false, false, false, false, false, false, true, 302.40743890393725, 544.7109890355737, 'El rango de precio esperado para esta propiedad va de 302 a 545 USD/mes, con una prediccion central de 411 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona y que este amoblado. Bajan el precio: el barrio/zona y la superficie total.', '[{"factor": "la superficie", "contribution": -167.63229370117188, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -139.71054077148438, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 72.48565673828125, "direction": "sube el precio"}, {"factor": "que este amoblado", "contribution": 58.802799224853516, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -50.43641662597656, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'San Nicolás' AND u.email = 'plazacentro.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-59-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-59-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-59-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'plazacentro.propiedades@nidio.app'
  AND p.title = 'ALQUILER DEPARTAMENTO AMOBLADO 2 AMBIENTES,MICROCENTRO'
  AND p.address = 'TALCAHUANO 660, Comuna 1, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT '3 AMBIENTES', 'APARTMENT', 'SALE', n.id, 'GERONIMO CORTES 797, Comuna 9, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.49838932286627, -34.64574778913806), 4326), 51.1, NULL, 3.0, 2.0, 57000, '-- Mataderos / Capital Federal --&nbsp;
Venta de Departamento 3 AMBIENTES c/balcon al frente;

Actualmente alquilado (con renta);

Departamento 3 ambientes a dividir ( 72 mts cuad totales );

;Living Comedor super amplio y cómodo;

;Cocina Integrada;

;Balcón al frente corrido 8 mts. longitud;

;Toilette de recepción&nbsp;;

;Dormitorio; en suite c/vestidor;



&nbsp;Geolocalizacion:&nbsp;

&nbsp;Sobre Avda. Escalada&nbsp;

&nbsp;1 1/2 cdas. Avda. Bruix&nbsp;

&nbsp;2&nbsp; 1/2 cdas. Avda. Juan B. Alberdi&nbsp;

&nbsp;4 1/2 cdas. AU Perito Moreno&nbsp;



&nbsp;Matr. CMCPLM No.   768&nbsp;

&nbsp;Matr. CUCICBA  No. 6481

 XINTEL(FAU-FAU-1503)', u.id, 'AGENCY', true, 91.8, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 68585.99142951774, 128026.04644402642, 'El rango de precio esperado para esta propiedad va de 68586 a 128026 USD, con una prediccion central de 103309 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la cantidad de banos, la superficie cubierta y la superficie. Bajan el precio: el precio de referencia de mercado en la zona.', '[{"factor": "el barrio/zona", "contribution": -530.0498657226562, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -516.2549438476562, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 142.25294494628906, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 106.04435729980469, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 85.30174255371094, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Mataderos' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-60-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-60-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-60-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = '3 AMBIENTES'
  AND p.address = 'GERONIMO CORTES 797, Comuna 9, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'DEPARTAMENTO 1 AMBIENTE - SAAVEDRA, CAPITAL FEDERAL ', 'APARTMENT', 'SALE', n.id, 'LUGONES 4999, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4968482203513, -34.5488052104903), 4326), 60.0, 60.0, 1.0, 1.0, 105000, 'En la zona más residencial de Saavedra: barrio arbolado, tranquilo y silencioso pero a la vez atravesado por importantes arterias que comunican rápidamente hacia cualquier destino. Se trata de un monoambiente muy amplio en 3° piso contrafrente. Cocina semi integrada con barra desayunadora. Balcon muy aprovechable, de 3. 90 * 1. 44 m. , con vista hacia el pulmón de manzana, muy verde y amplio. Baño completo. Placard. Conexion para lavarropas. Las unidades están equipadas con cocina a gas, termotanque eléctrico, aire acondicionado frío calor, carpinterias de aluminio. En el último piso el edificio cuenta con Pileta, solarium, sum, parrilla, laundry, cocina y baño.', u.id, 'AGENCY', true, 32.79, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 91267.02417846638, 147935.4799397752, 'El rango de precio esperado para esta propiedad va de 91267 a 147935 USD, con una prediccion central de 120582 USD. El factor que mas influye en esta prediccion es las expensas, que baja el precio. Bajan el precio: la cantidad de ambientes, el precio de referencia de mercado en la zona, la superficie y la cochera.', '[{"factor": "las expensas", "contribution": -187.9149627685547, "direction": "baja el precio"}, {"factor": "la cantidad de ambientes", "contribution": -178.396240234375, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -111.21862030029297, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -108.38983154296875, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -101.83456420898438, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Saavedra' AND u.email = 'nortecaba.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-61-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-61-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-61-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'nortecaba.propiedades@nidio.app'
  AND p.title = 'DEPARTAMENTO 1 AMBIENTE - SAAVEDRA, CAPITAL FEDERAL '
  AND p.address = 'LUGONES 4999, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 5 ambientes en alquiler en Monserrat', 'APARTMENT', 'RENT', n.id, '5 DE JULIO 429, Comuna 1, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.37119079679999, -34.612759632308745), 4326), 110.0, 110.0, 5.0, 1.0, 1350000, 'Hermoso departamento de época. Amueblado, 5 ambientes, con terraza compartida. Muy luminoso. Edificio estilo frances reciclado. Metros: 110Baños: 1 (con bañadera) Toilette: 1Lavarropas: síCalefacción: estufas eléctricasAire acondicionado: noVentiladores: síCochera: noMascotas: noTiene Lavarropas y estufas electricas. Muy luminoso. Edificio frances reciclado. ', u.id, 'AGENCY', true, 177.05, 'USED_GOOD_CONDITION', false, false, false, false, true, false, true, 349.7451191851579, 667.4966352059081, 'El rango de precio esperado para esta propiedad va de 350 a 667 USD/mes, con una prediccion central de 476 USD/mes. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie y que este amoblado. Bajan el precio: la cantidad de ambientes y la cantidad de banos.', '[{"factor": "el barrio/zona", "contribution": -290.056396484375, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 151.04183959960938, "direction": "sube el precio"}, {"factor": "que este amoblado", "contribution": 93.743408203125, "direction": "sube el precio"}, {"factor": "la cantidad de ambientes", "contribution": -89.91753387451172, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -68.09514617919922, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Monserrat' AND u.email = 'plazacentro.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-62-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-62-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-62-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'plazacentro.propiedades@nidio.app'
  AND p.title = 'Departamento de 5 ambientes en alquiler en Monserrat'
  AND p.address = '5 DE JULIO 429, Comuna 1, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Magnifico PH de 5 amb + estudio independiente - con terraza propia', 'PH', 'SALE', n.id, 'ARAOZ 618, Comuna 15, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4346695334466, -34.598389020551245), 4326), 158.0, 193.0, 4.0, 3.0, 259250, 'Entrar a esta propiedad es sumergirse en una atmósfera única. La calidez es su principal anfitriona. Late al ritmo de la ciudad, del corazón de Villa Crespo y tiene la amabilidad y energía específica de la zona en que se encuentra.
<br>La solemnidad de la escalera de mármol nos da la bienvenida y nos convida con 2 puertas, una nos da ingreso al consultorio, escritorio, lugar de homeoffice, con baño privado, y ventilación exterior e intimidad profunda con el resto de la casa. La otra puerta nos permite entrar a la vivienda propiamente dicha, y todo el lenguaje de la madera de la puerta de entrada parece tímida al entrar al living comedor de generalísimas medidas envueltas en buen gusto y materiales nobles. La madera luce soberbia en el piso y en las aberturas que parecen cuadros en las paredes amables que custodian el lugar. En esa planta también encontramos la habitación principal con vestidor (medida 5.35 x 4.05) con salida al balcón por donde se adentra toda la luz natural que baña el ambiente. 
<br>La cocina y el baño lucen separadas del ala social pero se imponen con gran protagonismo ocupando cada uno de los espacios acordes a sus virtudes. 
<br>Al ingresar a la planta alta el paisaje cambia, es más descontracturado  pero igual de abrazador. En ella encontramos los 3 amplísimos dormitorios, un exquisito baño compartimentado y moderno, y un espacio para terminar de diseñar una pequeña kichinet que se imponga en esta planta.
<br>Un pasillo lateral nos guía a la maravillosa terraza, que entre cielo y edificios nos hacen sentir la bondad de la naturaleza, el exterior y el bienestar verdadero, conquistan estando tan cerquita del centro de la ciudad de Buenos Aires. Revive en ella un extenso lavadero que permite ser intervenido y transformado en quincho si así se deseara.', u.id, 'AGENCY', true, NULL, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 273299.750656023, 432222.415412266, 'El rango de precio esperado para esta propiedad va de 273300 a 432222 USD, con una prediccion central de 352586 USD. El factor que mas influye en esta prediccion es el tipo de propiedad (PH), que baja el precio. Tambien suben el precio: la superficie total y la cantidad de banos. Bajan el precio: la superficie y el barrio/zona.', '[{"factor": "el tipo de propiedad (PH)", "contribution": -465.9100556373596, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 297.3264465332031, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -291.3489074707031, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -273.92889404296875, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 178.73175048828125, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Crespo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-63-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-63-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-63-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Magnifico PH de 5 amb + estudio independiente - con terraza propia'
  AND p.address = 'ARAOZ 618, Comuna 15, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Casa 4 ambientes Floresta', 'HOUSE', 'SALE', n.id, 'MIRAMAR 4362, Comuna 10, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.49298766506026, -34.6249105442832), 4326), 165.0, 260.0, 4.0, 1.0, 360000, 'Excelente Casa de 4 Ambientes con cochera cubierta , jardín y quincho.<br><br>Disposición y distribución funcional de  los ambientes en dos plantas.<br>Cocina y comedor diario con acceso independiente a continuación se encuentra el lavadero cubierto. <br>Living Comedor con vista al jardín y acceso a quincho/ jardín de invierno. <br>Toilette de recepción<br>El acceso a la planta alta es desde el living por escalera hacia los 3 dormitorios y terraza.<br>Dormitorio principal en Suite y con vestidor. <br>Escritorio y espacio de estudio en el acceso a la terraza.<br><br><br>', u.id, 'AGENCY', true, NULL, 'NOT_SPECIFIED', false, true, false, false, false, false, false, 233717.64777492647, 382595.0277083412, 'El rango de precio esperado para esta propiedad va de 233718 a 382595 USD, con una prediccion central de 302764 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie total y la cochera. Bajan el precio: la superficie y el precio de referencia de mercado en la zona.', '[{"factor": "el barrio/zona", "contribution": -562.3613891601562, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -387.7135925292969, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 375.8153991699219, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -336.09381103515625, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": 177.20089721679688, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Floresta' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-64-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-64-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-64-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = 'Casa 4 ambientes Floresta'
  AND p.address = 'MIRAMAR 4362, Comuna 10, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'PH 4 ambientes V. Pueyrredón', 'PH', 'SALE', n.id, 'F LOPEZ MERINO 4119, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4943438254945, -34.588109744414986), 4326), 82.0, 95.0, 4.0, 1.0, 210000, 'Tipología: PH.<br>Ambientes: Cuatro (4).<br>Dormitorios: Tres (3)<br>Living independiente: Uno (1)<br>Cocina y Comedor : Uno (1)<br>Baños: Uno completo. (1)<br>Toilettes: Uno (1)<br>Metros cuadrados totales: Noventa y cinco (95 m2) (82 m2 cubiertos(*) + 13 m2 descubiertos)<br>(*) Incluye 27 m2 ampliación superficie cubierta, <br>Orientación: Sud-Oeste, Interna.<br><br><br><br>PH de cuatro ambientes en dos plantas. Se ingresa por un pasillo que conduce a dos entradas del inmueble, una por el patio y otra por el living.<br>En la planta baja se encuentra; el living, el comedor, la cocina, el baño completo, un dormitorio y un estudio.<br>En la planta alta se ubican dos dormitorios, uno de ellos con toilette;<br>y un pasillo de distribución que conecta los dormitorios y dos terrazas. <br>Los dormitorios y el toilette de la planta alta no figuran en el titulo de propiedad.<br>', u.id, 'AGENCY', true, 9.84, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 123620.4881647732, 208187.75434083835, 'El rango de precio esperado para esta propiedad va de 123620 a 208188 USD, con una prediccion central de 166087 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la superficie total. Bajan el precio: la superficie, el tipo de propiedad (PH) y las expensas.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -315.67041015625, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -177.4713897705078, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 157.7373046875, "direction": "sube el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -146.92487716674805, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -133.41493225097656, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Pueyrredón' AND u.email = 'nortecaba.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-65-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-65-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-65-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'nortecaba.propiedades@nidio.app'
  AND p.title = 'PH 4 ambientes V. Pueyrredón'
  AND p.address = 'F LOPEZ MERINO 4119, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Se Vende 4 Ambientes', 'APARTMENT', 'SALE', n.id, 'AV CABILDO 731, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.44434790471655, -34.57021629348598), 4326), 97.0, 97.0, 4.0, 3.0, 310000, 'Impecable departamento 2 dormitorios C/ dependencia - cochera Y amenities- Living comedor con salida a balcón aterrazado y cerramiento Balconfort- Dos dormitorios en suite - principal con amplio vestidor y salida a balcón- Toilette de recepción - Cocina con doble mesada- Lavadero independiente - Dependencia de servicio con baño completo (o 3º dormitorio) - 1 cochera fija cubierta - baulera - Full amenities: Vigilancia 24 hs., piscina con. Solarium, gym, juego para niñosExcelente estado,! ', u.id, 'AGENCY', true, 524.59, 'USED_GOOD_CONDITION', true, true, true, true, false, false, false, 361748.7323279956, 629152.5926983096, 'El rango de precio esperado para esta propiedad va de 361749 a 629153 USD, con una prediccion central de 493508 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la cantidad de banos, los amenities del edificio y la cochera. Bajan el precio: la superficie.', '[{"factor": "el barrio/zona", "contribution": 730.5466918945312, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 380.3744812011719, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 332.74163818359375, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 270.9611511230469, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -255.76824951171875, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-66-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-66-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-66-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Se Vende 4 Ambientes'
  AND p.address = 'AV CABILDO 731, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 3 ambientes en Venta en Almagro', 'APARTMENT', 'SALE', n.id, 'COLOMBRES 184, Comuna 5, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.41872617490733, -34.61405340377538), 4326), 58.0, 67.0, 3.0, 1.0, 115000, 'Impecable 3 ambientes con opcion de compra cochera fija cubierta. Orientacion norte al contrafrente con 2 balcones , living-comedor con salida al balcon con cerramiento, dormitorios con placard, uno de ellos con salida al balcon completamente cerrado con hermoso ventanal, baño con bañera y mampara, la unidad esta equipada con 1 aire split en living, y tiene sistema de caldera individual. La torre cuenta con seguridad privada 24 hs, y amenities: SUM, Parrillas, Gimnasio, Loundry, Pileta grande y de niños, Jardin con juegos.', u.id, 'AGENCY', true, 76.72, 'USED_GOOD_CONDITION', false, false, true, true, true, false, false, 113915.93304112912, 175407.15063075355, 'El rango de precio esperado para esta propiedad va de 113916 a 175407 USD, con una prediccion central de 150323 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: los amenities del edificio y la seguridad 24hs. Bajan el precio: el barrio/zona y la cochera.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -343.2580261230469, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": 231.84332275390625, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -197.4701690673828, "direction": "baja el precio"}, {"factor": "la seguridad 24hs", "contribution": 124.43364715576172, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": -104.3096923828125, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Almagro' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-67-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-67-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-67-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'Departamento de 3 ambientes en Venta en Almagro'
  AND p.address = 'COLOMBRES 184, Comuna 5, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Dúplex 2 Ambientes con Gran Terraza en Villa Ortúzar', 'APARTMENT', 'SALE', n.id, 'URDININEA 1792, Comuna 15, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.47558766817958, -34.57729760554404), 4326), 49.0, 78.0, 2.0, 1.0, 163000, 'Excelente Dúplex Todo Luz y Sol de 2 Ambientes con Espectacular Terraza Propia. Piso 3º: Espacioso Living Comedor con Cocina Integrada. Dormitorio con Regio Placard Completo. Espacio de Escritorio con Balcón. Amplio Baño Completo con Luz y Ventilación Natural. Piso 4º: Gran Terraza de 27 M2. Lavadero Cubierto Independiente. Edificio con Ascensor. 2 Departamentos por Piso.', u.id, 'AGENCY', true, 193.44, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 110907.19345548919, 176898.89818691564, 'El rango de precio esperado para esta propiedad va de 110907 a 176899 USD, con una prediccion central de 150889 USD. El factor que mas influye en esta prediccion es la superficie total, que sube el precio. Tambien suben el precio: la superficie y la superficie cubierta. Bajan el precio: el barrio/zona y la cochera.', '[{"factor": "la superficie total", "contribution": 208.35003662109375, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 173.6143035888672, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -168.0953369140625, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 109.95658111572266, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": -91.86404418945312, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Ortúzar' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-68-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-68-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-68-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Dúplex 2 Ambientes con Gran Terraza en Villa Ortúzar'
  AND p.address = 'URDININEA 1792, Comuna 15, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'venta Departamento 2 ambientes con balcón  Flores', 'APARTMENT', 'SALE', n.id, 'CNEL MARTINIANO CHILAVERT 1905, Comuna 7, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43198119194175, -34.648691622957124), 4326), 44.0, 46.0, 2.0, 1.0, 57000, 'Departamento de dos ambientes al frente y con balcon <br><br>El mismo se desarrolla en una planta con todos sus ambientes muy bien ventilados e iluminados <br>al ingresar encontramos un hall que nos permite acceder al living y la cocina , esta ultima de generosas dimensiones con grandes ventanas , espacio para lavadero y conexión para lavarropas  , el living con vista abierta hacia la calle muchísima luz natural y un pintoresco balcón ,el mismo recibe sol directo de mañana hasta entrada la tarde  al igual que el dormitorio ya que la ventana también es al frente , este posee placar empotrado y pisos de madera , por ultimo el baño ingeniosamente colocado entre el living y la habitación  con fácil acceso desde el living y la privacidad del dormitorio , el edificio esta muy bien mantenido con frente y pisos de porcelanato  una sala de estar espejada en planta baja.', u.id, 'AGENCY', true, 118.03, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 61443.00556375857, 103635.57104025364, 'El rango de precio esperado para esta propiedad va de 61443 a 103636 USD, con una prediccion central de 85024 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la superficie y la superficie cubierta. Bajan el precio: el barrio/zona y la superficie total.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -499.74822998046875, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -378.9975891113281, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 165.71092224121094, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -101.19738006591797, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 93.23917388916016, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Flores' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-69-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-69-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-69-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'venta Departamento 2 ambientes con balcón  Flores'
  AND p.address = 'CNEL MARTINIANO CHILAVERT 1905, Comuna 7, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA 3 AMBIENTES EN PALERMO- EXCELENTE UBICACION', 'APARTMENT', 'SALE', n.id, '11 DE SEPTIEMBRE DE 1888 873, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.44094381378172, -34.56959514293729), 4326), 66.0, 71.0, 3.0, 1.0, 140000, 'VENTA HERMOSO 3 AMBIENTES CON EXCELENTES DIMENSIONES Y UBICACION<br>PRIMER PISO POR ESCALERA Y BAJAS EXPENSAS<br><br>IDEAL PARA LOS AMANTES DE LOS AMBIENTES AMPLIOS!<br><br>Al ingresar a la propiedad nos encontramos con un amplio living comedor que se comunica con una amplia cocina con piso de granito de época en perfecto estado con una puerta adicional de servicio.<br><br>Cuenta con un hermoso balcón a la calle que ilumina la habitación principal y la segunda habitación-<br>Amabas habitaciones se encuentran divididas por un baño completo con ducha completamente actualizado y tienen una amplia capacidad de guardado, con placares de techo a pared.<br><br>EL DEPARTAMENTO CUENTA CON PISO DE PARQUET EN PERFECTO ESTADO.<br><br>La vivienda cuenta con gas natural.<br><br>', u.id, 'AGENCY', true, 121.31, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 128265.82281220552, 223079.63446769438, 'El rango de precio esperado para esta propiedad va de 128266 a 223080 USD, con una prediccion central de 174984 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Bajan el precio: las expensas, la cochera, la superficie y la cantidad de banos.', '[{"factor": "el barrio/zona", "contribution": 334.287109375, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -184.99111938476562, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -142.2349090576172, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -105.50956726074219, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -98.03746032714844, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-70-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-70-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-70-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'VENTA 3 AMBIENTES EN PALERMO- EXCELENTE UBICACION'
  AND p.address = '11 DE SEPTIEMBRE DE 1888 873, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA DE DEPARTAMENTO 3 AMB A RECICLAR ', 'APARTMENT', 'SALE', n.id, 'VIAMONTE 2347, Comuna 3, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.40035662992163, -34.60113785546639), 4326), 50.0, 50.0, 3.0, 1.0, 75000, 'Venta de Departamento 3 AMBIENTES al FRENTE a RECICLAR en Balvanera, Capital Federal. El departamento consta de 50 m2 de superficie total, todos metros cubiertos, es primer piso al frente y tiene 2 dormitorios con placard, un baño completo y living comedor con cocina integrada. El estado del departamento es a Reciclar. ', u.id, 'AGENCY', true, 87.25, 'NEEDS_RENOVATION', false, false, false, false, false, false, false, 56351.22997952046, 92979.05828642806, 'El rango de precio esperado para esta propiedad va de 56351 a 92979 USD, con una prediccion central de 75116 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Bajan el precio: el barrio/zona, el estado de la propiedad (a reciclar), la superficie total y las expensas.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -554.5961303710938, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -414.4989013671875, "direction": "baja el precio"}, {"factor": "el estado de la propiedad (a reciclar)", "contribution": -189.008824467659, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -116.44709014892578, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -78.03401184082031, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Balvanera' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-71-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-71-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-71-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'VENTA DE DEPARTAMENTO 3 AMB A RECICLAR '
  AND p.address = 'VIAMONTE 2347, Comuna 3, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta 4 Ambientes Palermo ', 'APARTMENT', 'SALE', n.id, 'AV INFANTA ISABEL 310, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.42075478153101, -34.570262031836755), 4326), 100.0, 100.0, 4.0, 1.0, 174000, 'Semipiso de cuatro ambientes al frente con salida a balcón. Hall, living comedor y toilette. Cocina separada con comedor diario + lavadero independiente con doble circulación y dependencia de servicio con baño. Tres dormitorios y baño completo.', u.id, 'AGENCY', true, 347.54, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 204803.99408715253, 356194.6521434413, 'El rango de precio esperado para esta propiedad va de 204804 a 356195 USD, con una prediccion central de 279399 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: las expensas. Bajan el precio: la superficie, la cantidad de banos y la cochera.', '[{"factor": "el barrio/zona", "contribution": 396.87158203125, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -357.6490478515625, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": 171.78594970703125, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": -127.80901336669922, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -110.67414093017578, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-72-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-72-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-72-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Venta 4 Ambientes Palermo '
  AND p.address = 'AV INFANTA ISABEL 310, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 1 ambiente en Venta', 'APARTMENT', 'SALE', n.id, 'PARAGUAY 2026, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.39624859499124, -34.59867863756954), 4326), 29.0, 34.0, 1.0, 1.0, 85000, 'EDIFICIO DE CATEGORIA CON MATERIALES Y ACCESORIOS DE 1RA CALIDAD- SPLIT FRIO -CALOR - EL DEPARTAMENTO CONSTA CON BAULERA. EL EDIFICIO CONTIENE GIMNASIO - SALA DE JUEGOS - SAUNA - PISCINA CON SOLARIUM - SUM CON ESPACIO VERDE Y LAUNDRY - UBICADO EN ZON ESTRATEGICA -EDIFICADO POR CONSTRUCTORA DE ALTA TRAYECTORIA.', u.id, 'AGENCY', true, 180.69, 'NOT_SPECIFIED', true, false, true, false, false, false, false, 79263.1451407514, 138141.84302202804, 'El rango de precio esperado para esta propiedad va de 79263 a 138142 USD, con una prediccion central de 108324 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la superficie, los amenities del edificio, la pileta y la superficie cubierta.', '[{"factor": "el barrio/zona", "contribution": 323.44073486328125, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 274.8665771484375, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 265.93243408203125, "direction": "sube el precio"}, {"factor": "la pileta", "contribution": 161.65411376953125, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 159.87521362304688, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-73-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-73-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-73-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'Departamento de 1 ambiente en Venta'
  AND p.address = 'PARAGUAY 2026, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Monoambientes - Almagro', 'APARTMENT', 'RENT', n.id, 'ANGEL PELUFFO 3906, Comuna 5, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.42136587347353, -34.610098889906816), 4326), 26.0, 30.0, 1.0, 1.0, 450000, 'Hermoso departamento en muy buenas condiciones! ubicado en un segundo piso (edificio doble altura, seria como un tercer piso en altura). <br>Placard amplio espejado con interiores hechos en madera de excelente calidad. Amplio baño completo todo revestido en Porccelanato. <br>Con balcón. Todo eléctrico (Horno mas anafe, aire frió calor,  Agua caliente central. <br>Espacio especial diseñado para empotrar la heladera.  Depto muy luminoso. <br><br>El edificio con unos 6 añios aproximadamente de antigüedad cuenta con amplio espacio de pileta y solárium, Laundry (2 maquinas de lavado y 2 maquinas de secado, encargado, SUM). <br><br>Se pide:<br>-Ingresos comprobables.<br>-Garantía propietaria de familiar directo.<br><br>', u.id, 'AGENCY', true, 133.77, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 213.1995056928675, 347.0547170798543, 'El rango de precio esperado para esta propiedad va de 213 a 347 USD/mes, con una prediccion central de 284 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Bajan el precio: el barrio/zona, la superficie total, la superficie cubierta y la cantidad de banos.', '[{"factor": "la superficie", "contribution": -176.310546875, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -112.80180358886719, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -79.88865661621094, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -36.03211975097656, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -36.01654052734375, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Almagro' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-74-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-74-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-74-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'Monoambientes - Almagro'
  AND p.address = 'ANGEL PELUFFO 3906, Comuna 5, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta NEGOCIABLE. Departamento 3 ambientes. Palermo.', 'APARTMENT', 'SALE', n.id, 'REPUBLICA DOMINICANA 3334, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.41304530142212, -34.59140336098845), 4326), 75.0, NULL, 3.0, 2.0, 215000, '- Piso 11. Contrafrente.<br />
- Ambientes:3.<br />
- Superficie total: 75m&sup2;.<br />
- Living Comedor.<br />
- Dormitorio 1 en suite.<br />
- Dormitorio 2 con placard.<br />
- Cocina independiente.<br />
- Lavadero.<br />
- Ba&ntilde;o.<br />
- Toilette.<br />
- Balc&oacute;n.<br />
- Amenities: Pileta. SUM.<br />
- Seguridad.<br />
- Grupo electr&oacute;geno.<br />
<br />
- NEGOCIABLE<br /><br />
 - Piscina\n- Parrilla\n- SUM\n- Seguridad\n <br />', u.id, 'AGENCY', true, 249.18, 'NOT_SPECIFIED', true, false, true, true, false, false, false, 245821.12195677805, 427531.549934737, 'El rango de precio esperado para esta propiedad va de 245821 a 427532 USD, con una prediccion central de 335356 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: los amenities del edificio, la seguridad 24hs y la pileta. Bajan el precio: la cochera.', '[{"factor": "el barrio/zona", "contribution": 591.63427734375, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 308.2301025390625, "direction": "sube el precio"}, {"factor": "la seguridad 24hs", "contribution": 245.3726806640625, "direction": "sube el precio"}, {"factor": "la pileta", "contribution": 238.57957458496094, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": -161.44837951660156, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-75-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-75-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-75-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Venta NEGOCIABLE. Departamento 3 ambientes. Palermo.'
  AND p.address = 'REPUBLICA DOMINICANA 3334, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT '4 amb - Cochera y Dep. - Palermo', 'APARTMENT', 'RENT', n.id, 'JUAN MARIA GUTIERREZ 3816, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.413737651508136, -34.58077308776392), 4326), 145.0, 145.0, 4.0, 2.0, 2440000, 'Palermo4 ambientes + Cochera.145 m2 TotalesOrientación: Este.Disposición: Frente.Palier privado.Living comedor con pisos de madera.Amplio ventanal. Balcón con cerramiento.Toilette.Cocina separada con muebles de alacena y bajomesada.Cocina de 4 hornallas a gas. Horno elé diario. Conexión para lavavajillas.Entrada de servicio.Dependencia de servicio con su baño.Lavadero con conexión para lavarropas.Dormitorio principal en suite con vestidor y placard de puertas espejadas.Baño completo con hidromasaje.Segundo y tercer dormitorio con amplio placard.Segundo baño completo con bañera.Ventanas con persianas de madera en todos los ambientes.Rejas y cortinas black out.Aire acondicionado en todos los ambientes.Agua caliente y losa por caldera individual.', u.id, 'AGENCY', true, 350.82, 'NOT_SPECIFIED', false, true, false, false, false, false, true, 1471.05933779024, 3176.206841810746, 'El rango de precio esperado para esta propiedad va de 1471 a 3176 USD/mes, con una prediccion central de 2214 USD/mes. El factor que mas influye en esta prediccion es la superficie, que sube el precio. Tambien suben el precio: que este amoblado, la superficie total y el barrio/zona. Bajan el precio: las expensas.', '[{"factor": "la superficie", "contribution": 692.6968994140625, "direction": "sube el precio"}, {"factor": "que este amoblado", "contribution": 258.55682373046875, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 187.24562072753906, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 168.80482482910156, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -109.9914321899414, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-76-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-76-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-76-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = '4 amb - Cochera y Dep. - Palermo'
  AND p.address = 'JUAN MARIA GUTIERREZ 3816, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT '2 amplios ambientes en excelente PH', 'PH', 'SALE', n.id, 'PADRE CARLOS MUJICA 3499, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4017767610915, -34.5731550480454), 4326), 55.0, 55.0, 2.0, 1.0, 115000, 'Dormitorio integrado al living con posibilidad de dividir. Cuenta con un espacio para estudio/ escritorio pequeñoSuper luminoso,reciclado y alegreVestidor  con muy buenos placaresBaño completoCocina y lavadero independiente. Claraboyas en baño y cocina. Servicios individuales', u.id, 'AGENCY', true, 108.2, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 92653.96183156081, 161479.70192169337, 'El rango de precio esperado para esta propiedad va de 92654 a 161480 USD, con una prediccion central de 126625 USD. El factor que mas influye en esta prediccion es el tipo de propiedad (PH), que baja el precio. Tambien suben el precio: el barrio/zona. Bajan el precio: las expensas, el precio de referencia de mercado en la zona y los amenities del edificio.', '[{"factor": "el tipo de propiedad (PH)", "contribution": -215.1646142601967, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": 170.5758056640625, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -158.0071258544922, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -104.8146743774414, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": -100.84512329101562, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-77-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-77-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-77-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = '2 amplios ambientes en excelente PH'
  AND p.address = 'PADRE CARLOS MUJICA 3499, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Alquiler SIN muebles MUDATE YA!', 'APARTMENT', 'RENT', n.id, 'VICTORIA OCAMPO 400, Comuna 1, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.363672753173, -34.6019847674371), 4326), 103.0, 110.0, 3.0, 3.0, 2300000, 'Impecable departamento de 3 amb
<br>2 dormitorios en suite
<br>Toilette de recepción
<br>Cocina semi integrada
<br>Cochera y baulera opcional USD 200
<br>El precio del alquiler no incluye expensas y abl
<br>Edificio full amenities', u.id, 'AGENCY', true, 511.48, 'USED_GOOD_CONDITION', true, false, true, true, false, false, false, 1013.2887581848663, 2619.0642370195383, 'El rango de precio esperado para esta propiedad va de 1013 a 2619 USD/mes, con una prediccion central de 1713 USD/mes. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: las expensas, la superficie y los amenities del edificio. Bajan el precio: que este amoblado.', '[{"factor": "el barrio/zona", "contribution": 396.3426513671875, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": 212.548095703125, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 209.42172241210938, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 146.74581909179688, "direction": "sube el precio"}, {"factor": "que este amoblado", "contribution": -83.66925811767578, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Puerto Madero' AND u.email = 'plazacentro.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-78-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-78-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-78-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'plazacentro.propiedades@nidio.app'
  AND p.title = 'Alquiler SIN muebles MUDATE YA!'
  AND p.address = 'VICTORIA OCAMPO 400, Comuna 1, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - Nuñez ', 'APARTMENT', 'RENT', n.id, 'CAMPOS SALLES 1504, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.45653674380408, -34.54737983461931), 4326), 42.0, 42.0, 2.0, 1.0, 650000, 'Departamento de 2 ambientes Y medio en alquiler en excelente ubicacion. Es un 2do piso al frente con balcon, orientacion oeste. el living comedor hoy se encuentra dividido, dando lugar A un espacio con mueble placard que puede ser utilizado como dormitorio O escritorio. Cocina separada con lavadero incorporado, dormitorio con gran placard. baño completo. excelente estado general. requisitos; ingresos demostrables. seguro de caucion O garantia propietaria. mes de adelanto. mes de deposito.', u.id, 'AGENCY', true, 55.74, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 255.04915237335558, 483.77928397019156, 'El rango de precio esperado para esta propiedad va de 255 a 484 USD/mes, con una prediccion central de 368 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona. Bajan el precio: la superficie total, la cantidad de banos y la superficie cubierta.', '[{"factor": "la superficie", "contribution": -239.29104614257812, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 87.73774719238281, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -76.5619125366211, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -47.25041198730469, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -40.644779205322266, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Núñez' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-79-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-79-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-79-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'Departamento - Nuñez '
  AND p.address = 'CAMPOS SALLES 1504, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - Palermo', 'APARTMENT', 'RENT', n.id, 'TTE BENJAMIN MATIENZO 1520, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43239627753781, -34.566346276023644), 4326), 145.0, 145.0, 4.0, 3.0, 5337500, 'Luminoso departamento. <br>145m2, palier privado, - livin comedor -  toilet - 3 dormitorios - 1 en suite - vestidor.<br>Cocina con comedor diario - dependencias completas- lavadero independiente.<br>Aire acondicionado en todos los ambientes.<br>Cochera y baulera.<br>Vigilancia las 24hrs. - sistema de cámaras.<br>Amenities: piscina climatizada- piscina para niños con servicio de guarda vidas.<br>Canchas de tennis - padlle- football - vóley - basquet- sauna y gimnacio.<br>Sala de juegos y guardería. SUM para adultos y chicos.<br>Fabuloso parque de 3.000m2<br>', u.id, 'AGENCY', true, 852.46, 'NOT_SPECIFIED', true, true, true, true, true, false, false, 2216.6065433099475, 4785.939416311581, 'El rango de precio esperado para esta propiedad va de 2217 a 4786 USD/mes, con una prediccion central de 3336 USD/mes. El factor que mas influye en esta prediccion es las expensas, que sube el precio. Tambien suben el precio: la superficie, la superficie total, los amenities del edificio y el barrio/zona.', '[{"factor": "las expensas", "contribution": 874.3325805664062, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 758.1785278320312, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 214.9114532470703, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 205.60365295410156, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 199.5475616455078, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-80-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-80-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-80-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Departamento - Palermo'
  AND p.address = 'TTE BENJAMIN MATIENZO 1520, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Casa - Belgrano', 'HOUSE', 'SALE', n.id, 'JOSE BORCHES 1070, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.441010024723, -34.5561230995185), 4326), 570.0, NULL, 9.0, 4.0, 1200000, 'Excepcional casa en Belgrano en lote propio de 8.66 x 41, 00 desarrollada en 4 plantas, con portón de acceso corredizo para entrada vehicular y entrada peatonal con estacionamiento para 2 autos. acceso principal a living de 6.00 x 3.95, y escritorio de 3.50 x 2.25, toilette de  comedor con vista a quincho y jardín de 8.50 x 2.80 con cava semicircular vidriada, iluminada, cocina y comedor diario de 6.80 x 5.20, y amplio quincho y fondo de 14.75 x 8.15, completamente ambientado y parquizado.<br>en desnivel a planta baja se encuentran la dependencia de servicio, sala de planchado, amplísimo play room, y gran ambiente al frente ambientado como sala de cine. En plantas superiores se encuentran los dormitorios,  uno en suite  con vista a jardín de invierno de 4.60 x 3.30, segundo dormitorio con vista al frente  de 3.80 x 3.50 con vestidor y tercer dormitorio con vista al fondo parquizado de 4.25 x 3.25 con placard, todos ellos de amplísimas medidas, y dormitorio principal en la planta superior, con baño en suite  de 3.80 x 3.30 con dos vestidores. Pisos de madera entarugada.<br><br>', u.id, 'AGENCY', true, NULL, 'NOT_SPECIFIED', false, true, false, false, false, false, false, 1989765.0407189333, 3292475.728263875, 'El rango de precio esperado para esta propiedad va de 1989765 a 3292476 USD, con una prediccion central de 2659694 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: el barrio/zona y la cantidad de banos. Bajan el precio: el tipo de propiedad (Casa) y la cantidad de ambientes.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 1173.758544921875, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 646.0746459960938, "direction": "sube el precio"}, {"factor": "el tipo de propiedad (Casa)", "contribution": -398.0151844024658, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 296.6809387207031, "direction": "sube el precio"}, {"factor": "la cantidad de ambientes", "contribution": -117.5119400024414, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-81-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-81-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-81-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'Casa - Belgrano'
  AND p.address = 'JOSE BORCHES 1070, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'HERMOSO DEPARTAMENTO RECIEN RECICLADO!! - Caballito', 'APARTMENT', 'SALE', n.id, 'ANGEL M GIMENEZ 59, Comuna 6, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43750068123133, -34.61940334191959), 4326), 32.0, 32.0, 2.0, 1.0, 75000, 'OPORTUNIDAD!!<br>Departamento 2 Ambientes <br>- Muy buen departamento de 2 ambientes <br>- luminoso <br>- Cómodo living comedor <br>- Baño y cocina modernizados <br>- Lavadero independiente <br>- Dormitorio con pisos de parquet y espacioso placard<br>- 2do piso por escalera<br>-', u.id, 'AGENCY', true, 111.48, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 71118.5949147882, 116598.538338947, 'El rango de precio esperado para esta propiedad va de 71119 a 116599 USD, con una prediccion central de 95553 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: la superficie y la superficie cubierta. Bajan el precio: la superficie total y la cochera.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 290.846435546875, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 280.4051208496094, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -269.20684814453125, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 156.6555938720703, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": -109.71519470214844, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Caballito' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-82-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-82-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-82-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'HERMOSO DEPARTAMENTO RECIEN RECICLADO!! - Caballito'
  AND p.address = 'ANGEL M GIMENEZ 59, Comuna 6, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 3 ambientes en Venta en Almagro', 'APARTMENT', 'SALE', n.id, 'GUARDIA VIEJA 4098, Comuna 5, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.422195126028335, -34.600541343394205), 4326), 70.0, 81.0, 3.0, 2.0, 97000, '3 AMBIENTES C-DEPENDENCIA. AL FRENTE CON BALCON CORRIDO.81 MTS.TOTALES. INMEJORABLE UBICACION  NO APTO CREDITO.', u.id, 'AGENCY', true, 150.82, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 124718.08463558574, 192040.24646977882, 'El rango de precio esperado para esta propiedad va de 124718 a 192040 USD, con una prediccion central de 164578 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la cantidad de banos. Bajan el precio: el barrio/zona, la cochera y la superficie.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -351.08074951171875, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -177.86993408203125, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -88.0074691772461, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -78.48762512207031, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 71.83890533447266, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Almagro' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-83-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-83-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-83-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'Departamento de 3 ambientes en Venta en Almagro'
  AND p.address = 'GUARDIA VIEJA 4098, Comuna 5, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta Depto 2 Amb, Villa Devoto ', 'APARTMENT', 'SALE', n.id, 'AV LINCOLN 4700, Comuna 11, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.5216178644744, -34.5982552388456), 4326), 56.0, 56.0, 2.0, 1.0, 82900, 'Departamento de un dormitorio en venta (Villa Devoto, Ciudad Autónoma de Buenos Aires). Desarrollado en piso alto por ascensor, con disposición contra frente y orientación al oeste. _ El mismo posee cocina equipada con muebles sobre y bajo mesada, living comedor, un dormitorio con placard empotrado y un baño completo. Amplio y luminoso, cuenta con balcón. _ La propiedad tiene una superficie total de aproximadamente 56. 65mts2, de los cuales 52. 5mts2 son cubiertos.', u.id, 'AGENCY', true, 62.3, 'NOT_SPECIFIED', false, false, false, false, true, false, true, 104634.74596329338, 184642.33521488344, 'El rango de precio esperado para esta propiedad va de 104635 a 184642 USD, con una prediccion central de 143343 USD. El factor que mas influye en esta prediccion es las expensas, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona. Bajan el precio: el barrio/zona, la cochera y la cantidad de banos.', '[{"factor": "las expensas", "contribution": -144.4152374267578, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -112.53933715820312, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 111.90148162841797, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": -111.2554702758789, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -89.2647476196289, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Devoto' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-84-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-84-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-84-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = 'Venta Depto 2 Amb, Villa Devoto '
  AND p.address = 'AV LINCOLN 4700, Comuna 11, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento 2 Ambientes - Villa Urquiza, Capital Federal', 'APARTMENT', 'RENT', n.id, 'MENDOZA 3907, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.47215021125312, -34.569826890388946), 4326), 43.0, 43.0, 2.0, 1.0, 600000, 'Alquiler de departamento de 2 ambientes al frente con balcón. Cocina completa. Dormitorio en suite y toilette de recepción. Muy luminoso.', u.id, 'AGENCY', true, 131.15, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 297.02570819075487, 477.28521239922395, 'El rango de precio esperado para esta propiedad va de 297 a 477 USD/mes, con una prediccion central de 380 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona. Bajan el precio: el barrio/zona, la superficie total y la cantidad de banos.', '[{"factor": "la superficie", "contribution": -180.36732482910156, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -113.56558227539062, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 90.66178131103516, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -53.67546081542969, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -39.49314880371094, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Urquiza' AND u.email = 'nortecaba.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-85-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-85-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-85-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'nortecaba.propiedades@nidio.app'
  AND p.title = 'Departamento 2 Ambientes - Villa Urquiza, Capital Federal'
  AND p.address = 'MENDOZA 3907, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - Coghlan', 'APARTMENT', 'SALE', n.id, 'JUANA AZURDUY 3357, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.47510231500576, -34.55548297579875), 4326), 42.0, 42.0, 1.0, 1.0, 125000, 'A ESTRENAR. MONOAMBIENTE. CONTRAFRENTE. 42 M2. BALCON. VISTA ABIERTA. TODO SOL. APTO PROFESIONAL. BAÑO COMPLETO. COCINA INTEGRADA. SERVICIOS INDIVIDUALES. LAVADERO INCORPORADO. TODO ELECTRICO. EDIFICIO DE 4 PISOS,ASCENSOR. (HAY OTROS).<br><br><br><br>', u.id, 'AGENCY', true, 68.2, 'NEW', false, false, false, false, true, false, false, 77756.10425737945, 122631.71524472527, 'El rango de precio esperado para esta propiedad va de 77756 a 122632 USD, con una prediccion central de 104759 USD. El factor que mas influye en esta prediccion es la superficie total, que baja el precio. Tambien suben el precio: la superficie. Bajan el precio: las expensas, la cantidad de ambientes y la cochera.', '[{"factor": "la superficie total", "contribution": -218.9014434814453, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -125.36730194091797, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 125.31099700927734, "direction": "sube el precio"}, {"factor": "la cantidad de ambientes", "contribution": -107.44296264648438, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -93.44754791259766, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Coghlan' AND u.email = 'nortecaba.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-86-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-86-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-86-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'nortecaba.propiedades@nidio.app'
  AND p.title = 'Departamento - Coghlan'
  AND p.address = 'JUANA AZURDUY 3357, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA 4 amb c/dep+cochera "RECOLETA"', 'APARTMENT', 'SALE', n.id, 'DR NORBERTO QUIRNO COSTA 1294, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.40513078300888, -34.59479149567793), 4326), 121.0, 130.0, 4.0, 2.0, 220000, '<br><br>Amplio departamento c/dependencia y cochera, RECICLADO TOTALMENTE<br>Nota: Superficies <br>Cubierta: 120. 63 metros cuadrados.<br>Total aprox.: 130.10 metros cuadrados.<br><br>Ubicación:<br>-  HERMOSA ZONA  DE "RECOLETA" <br><br><br>', u.id, 'AGENCY', true, 360.66, 'USED_GOOD_CONDITION', false, true, false, false, false, false, false, 285277.6619893862, 497189.2287424236, 'El rango de precio esperado para esta propiedad va de 285278 a 497189 USD, con una prediccion central de 389872 USD. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: la cochera, el barrio/zona y la superficie total. Bajan el precio: los amenities del edificio.', '[{"factor": "la superficie", "contribution": -289.7160339355469, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": 261.2998046875, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 245.2772216796875, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 194.9805145263672, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": -135.5799560546875, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-87-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-87-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-87-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'VENTA 4 amb c/dep+cochera "RECOLETA"'
  AND p.address = 'DR NORBERTO QUIRNO COSTA 1294, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'CASA 7 AMB URQUIZA COCHERA TERRAZA PARRILLA PATIO', 'HOUSE', 'SALE', n.id, 'SHASKEPEARE 4966, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.49014558516114, -34.563251891660805), 4326), 282.0, 282.0, 7.0, 3.0, 680000, '<br><br>DESCRIPCIÓN:<br>Muy buena casa sobre lote propio de 177,64 m2 en Villa Urquiza (8.66 X 19.98). <br>Desarrollada en 3 Plantas. Cochera cubierta. Terraza con parrilla. Dos Patios. 7 ambientes.<br>Dependencia de servicio<br>Puertas Blindadas<br><br>PLANTA BAJA<br>Cochera cubierta con acceso directo a la casa.<br>Gran Living-Comedor con hogar<br>Toilette de recepción<br>Patio cubierto con luz natural que hoy se usa como comedor.<br>Amplia Cocina - Comedor diario con salida a pequeño Patio con Parrilla y con escalera hacia la Dependencia de Servicio.<br>Amplio ambiente con placares que se puede utilizar como dormitorio o escritorio que también tiene salida al mismo Patio. <br>Amplio Hall con escalera para acceder a la planta alta con carpintería y biblioteca de madera.<br><br>PRIMERA PLANTA: <br>Dormitorio Principal en Suite con Vestidor y Baño completo.<br>3 Dormitorios (uno de ellos doble) con amplios placares<br>Baño completo compartimentado.<br><br>Todos los dormitorios con pisos de madera flotante alemanes nuevos.<br><br>Dependencia de servicio con ingreso directo por escalera desde la cocina y también desde la otra escalera que va a la Planta Alta.<br><br>SEGUNDA PLANTA <br>Lavadero con acceso a un amplio depósito o baulera <br>Gran Terraza con parrilla.<br><br>La casa posee 3 split frío/calor. <br><br>Superficie Cubierta: 282 m2<br>Lote de 177,64 m2 (8,66 x 21,60)<br>Nuevo código: USAB 2<br>Altura permitida: 11.20 m más 1 retiro<br>PB + 3 PISOS + 1 RETIRO<br><br>Ubicada en la mejor zona de Villa Urquiza, zona comercial, accesible al tránsito y de establecimientos educativos.', u.id, 'AGENCY', true, NULL, 'NOT_SPECIFIED', false, true, false, false, false, false, false, 390353.9653765549, 645077.4383387452, 'El rango de precio esperado para esta propiedad va de 390354 a 645077 USD, con una prediccion central de 537963 USD. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: la superficie total. Bajan el precio: el tipo de propiedad (Casa), la superficie cubierta y el barrio/zona.', '[{"factor": "la superficie", "contribution": -449.72674560546875, "direction": "baja el precio"}, {"factor": "el tipo de propiedad (Casa)", "contribution": -401.7315330505371, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -346.32135009765625, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 300.1833190917969, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -284.34808349609375, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Urquiza' AND u.email = 'nortecaba.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-88-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-88-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-88-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'nortecaba.propiedades@nidio.app'
  AND p.title = 'CASA 7 AMB URQUIZA COCHERA TERRAZA PARRILLA PATIO'
  AND p.address = 'SHASKEPEARE 4966, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT '4 amb con Garage 2 autos', 'APARTMENT', 'SALE', n.id, 'MANUEL ALVAREZ PRADO 2494, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.507968268569336, -34.57193470701864), 4326), 118.0, 177.0, 4.0, 2.0, 320000, '4 AMBIENTES en 2 plantas con Garaje para 2 autos en Villa Pueyrredón, Capital Federal<br><br>En planta baja Living comedor en doble altura, Gran cocina con salida a patio. Toilette de recepción. Cochera con espacio para dos autos.<br><br>En piso superior se encuentran tres dormitorios, dos de ellos con salida a balcón con vista a patio. Baño completo con bañera.<br><br>Segundo piso lavadero y acceso a terraza de uso privado.<br>', u.id, 'AGENCY', true, 189.51, 'NOT_SPECIFIED', false, true, false, false, false, false, false, 222224.8686840708, 374246.1873177418, 'El rango de precio esperado para esta propiedad va de 222225 a 374246 USD, con una prediccion central de 298563 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la cochera y la superficie total. Bajan el precio: la superficie y el barrio/zona.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -390.5342102050781, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": 279.0566101074219, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 257.4603576660156, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -254.56727600097656, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -203.8732452392578, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Pueyrredón' AND u.email = 'nortecaba.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-89-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-89-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-89-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'nortecaba.propiedades@nidio.app'
  AND p.title = '4 amb con Garage 2 autos'
  AND p.address = 'MANUEL ALVAREZ PRADO 2494, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta - 5 Ambientes con Balcón - Dependencia - Espacio Guardacoche - Baulera - Belgrano ', 'APARTMENT', 'SALE', n.id, 'WASHINGTON 1981, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.46848839861764, -34.57075536352124), 4326), 211.0, 211.0, 5.0, 2.0, 550000, 'Excelente piso. Son 211 m2 totales, con 2 cocheras en 2do. Subsuelo. 2 bauleras amplias. Doble circulacion completa, alfombra, recien pintado. Palier privado, hall de entrada 3x1, 40 con placard Amplio living 10x5, 50 con balcon aterrazado al frente 7x1, 20 y contrafrente. Comedor 3, 50x3, 30 a balcon, escritorio 4, 50x3, 50 a balcon o 4º dormitorio. Toilette de recepción. Dormitorio principal en suite 5x5 con 2 placares y baño compartimentado. 2º dormitorio 4x4 con placard y 4x3 con placard, todos los dormitorios a balcon. 2º baño completo. Cocina 5x2, 30 con horno y anafe al frente. Lavadero separado. Dependencia de servicio con baño. Servicios centrales, losa radiante y agua central.', u.id, 'AGENCY', true, 459.02, 'USED_GOOD_CONDITION', false, true, false, true, false, false, false, 623281.1964017758, 1031347.0028072491, 'El rango de precio esperado para esta propiedad va de 623281 a 1031347 USD, con una prediccion central de 833132 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: el barrio/zona y la superficie total. Bajan el precio: la superficie y la cantidad de ambientes.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 840.0162353515625, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 457.2489013671875, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -422.420166015625, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 306.0154113769531, "direction": "sube el precio"}, {"factor": "la cantidad de ambientes", "contribution": -144.01083374023438, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-90-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-90-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-90-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'Venta - 5 Ambientes con Balcón - Dependencia - Espacio Guardacoche - Baulera - Belgrano '
  AND p.address = 'WASHINGTON 1981, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'PH.tipo casa de 4 ambientes en Venta en Palermo', 'PH', 'SALE', n.id, 'AV CASARES 4014, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.408068613739474, -34.57075976292648), 4326), 100.0, 100.0, 4.0, 1.0, 160000, 'Hermoso y nuevo PH 3 ambientes (posibilidad de ser 4 ambientes) en Palermo. Baño y Toilette. Cocina completa. Lavadero Independiente 4 terrazas. Muy luminoso y tranquilo. Bajas expensas. Totalmente reciclado. Excelente distribución. Unico en la zona. Imperdible oportunidad.', u.id, 'AGENCY', true, NULL, 'NEEDS_RENOVATION', false, false, false, false, true, false, false, 185197.2927096436, 322094.72060660704, 'El rango de precio esperado para esta propiedad va de 185197 a 322095 USD, con una prediccion central de 252651 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la superficie total. Bajan el precio: la superficie, el tipo de propiedad (PH) y el estado de la propiedad (a reciclar).', '[{"factor": "el barrio/zona", "contribution": 458.0239562988281, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -271.7868347167969, "direction": "baja el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -186.7078878879547, "direction": "baja el precio"}, {"factor": "el estado de la propiedad (a reciclar)", "contribution": -163.04151244461536, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 133.19349670410156, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-91-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-91-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-91-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'PH.tipo casa de 4 ambientes en Venta en Palermo'
  AND p.address = 'AV CASARES 4014, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT '2 AMBIENTES EN ALQUILER CON COCHERA', 'APARTMENT', 'RENT', n.id, 'AV ING HUERGO 337, Comuna 1, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.36721091756042, -34.611425635481936), 4326), 67.0, 67.0, 2.0, 1.0, 1800000, '2 AMBIENTES EN ALQUILER  AMOBLADO, CON COCHERA <br>DISPONE DE LIVING COMEDOR, DORMITORIO EN SUITE, COCINA INTEGRADA, BALCÓN, TOILETTE.<br><br>AMENITIES: SOLARIUM, SPA, SAUNA, HIDROMASAJE, BAR CHILL OUT, PUTTING GREEN, JUEGOS PARA NIÑOS, MICROCINE, SALONES DE USOS MÚLTIPLES, VESTUARIOS, LAUNDRY, PISCINA CLIMATIZADA, PISCINA DE NATACIÓN, GIMNASIO, SEGURIDAD 24 HORAS, BUSINESS CENTER, ZENCITY KIDS, JARDINES Y CASCADAS DE AGUA.<br><br>', u.id, 'OWNER', true, 380.33, 'NOT_SPECIFIED', true, true, true, true, false, false, true, 755.4158202473867, 1952.535783020848, 'El rango de precio esperado para esta propiedad va de 755 a 1953 USD/mes, con una prediccion central de 1277 USD/mes. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: que este amoblado y el precio de referencia de mercado en la zona. Bajan el precio: la superficie y la superficie cubierta.', '[{"factor": "el barrio/zona", "contribution": 465.1266784667969, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -186.6712188720703, "direction": "baja el precio"}, {"factor": "que este amoblado", "contribution": 168.18968200683594, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 117.84815216064453, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": -82.74905395507812, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Puerto Madero' AND u.email = 'lucia.fernandez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-92-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-92-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-92-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'lucia.fernandez@nidio.app'
  AND p.title = '2 AMBIENTES EN ALQUILER CON COCHERA'
  AND p.address = 'AV ING HUERGO 337, Comuna 1, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Impresionante 2 amb con 2 baños en Torre . VISTA PANORAMICA .  Full Amenities. ', 'APARTMENT', 'SALE', n.id, 'CUBA 4900, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4731669838575, -34.5383600463774), 4326), 50.0, 55.0, 2.0, 2.0, 178000, 'Hermoso departamento de 2 ambientes. Living Comedor apaisado 6.15 x 4.20 con comodo espacio para escritorio a Balcon el cual posee lavadero.Cocina Americana Dormotirio en Suite con vestidor . Toilette de recepcion.El edificio cuenta con los siguientes amenities: - Piscina climatizada en planta baja; - Sector de solarium; - SUM totalmente equipado con mesas y sillas, cocina completa, toilettes para hombres y mujeres, y aire acondicionado frío-calor; - GYM equipado con aire acondicionado frío-calor; - Parrilla; - Sector de juegos para chicos; - Laundry; - Grupo electrógeno; - Estacionamiento de cortesía;', u.id, 'AGENCY', true, 139.02, 'NOT_SPECIFIED', true, true, true, false, false, false, false, 159232.61315748066, 273243.4036014857, 'El rango de precio esperado para esta propiedad va de 159233 a 273243 USD, con una prediccion central de 216917 USD. El factor que mas influye en esta prediccion es la cochera, que sube el precio. Tambien suben el precio: los amenities del edificio, el barrio/zona, la superficie y la pileta.', '[{"factor": "la cochera", "contribution": 334.3929748535156, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 305.9136047363281, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 304.3746643066406, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 149.569091796875, "direction": "sube el precio"}, {"factor": "la pileta", "contribution": 145.69906616210938, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Núñez' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-93-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-93-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-93-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'Impresionante 2 amb con 2 baños en Torre . VISTA PANORAMICA .  Full Amenities. '
  AND p.address = 'CUBA 4900, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta PH 3 amb sin expensas con terraza V. Devoto', 'PH', 'SALE', n.id, 'GONZALEZ CATAN 4521, Comuna 11, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.509705349391005, -34.610649919415415), 4326), 60.0, 118.0, 3.0, 1.0, 175000, 'Venta PH de 3 ambientes en Villa Devoto. <br>Patio de acceso, comedor con cocina integrada, hall de distribución, 2 dormitorios amplios, baño completo y terraza. <br>Contrafrente, luminoso y ventilado. <br>Baño y cocina reciclados. <br><br>', u.id, 'AGENCY', true, 26.23, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 139750.17119613002, 246608.3108319042, 'El rango de precio esperado para esta propiedad va de 139750 a 246608 USD, con una prediccion central de 191449 USD. El factor que mas influye en esta prediccion es la superficie total, que sube el precio. Tambien suben el precio: la superficie cubierta y el precio de referencia de mercado en la zona. Bajan el precio: el tipo de propiedad (PH) y las expensas.', '[{"factor": "la superficie total", "contribution": 422.0110778808594, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 149.71139526367188, "direction": "sube el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -146.96818190813065, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -139.84744262695312, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 118.62738800048828, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Devoto' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-94-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-94-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-94-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = 'Venta PH 3 amb sin expensas con terraza V. Devoto'
  AND p.address = 'GONZALEZ CATAN 4521, Comuna 11, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta PH 4 ambientes con terraza', 'PH', 'SALE', n.id, 'AVELINO DIAZ 2599, Comuna 7, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4524685486263, -34.6451452195326), 4326), 61.0, 102.0, 4.0, 2.0, 105000, 'La unidad se desarrolla en 102 m2.  por pasillo al contrafrente, Se ingresa al living comedor, a la derecha encontramos un pequeño hall que distribuye a dos dormitorios y baño. uno de los dormitorios cuenta con un patio semicubierto.<br>Desde la cocina se accede a la escalera que lleva a la terraza, donde hay un tercer dormitorio con baño.<br>Todo en excelente estado, listo para mudarse.<br><br>', u.id, 'AGENCY', true, NULL, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 101125.60279352513, 170567.9840388288, 'El rango de precio esperado para esta propiedad va de 101126 a 170568 USD, con una prediccion central de 139936 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la superficie total y la superficie cubierta. Bajan el precio: el barrio/zona y el tipo de propiedad (PH).', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -476.41162109375, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -431.9674377441406, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 234.05206298828125, "direction": "sube el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -146.95909750461578, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 117.0674057006836, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Flores' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-95-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-95-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-95-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'Venta PH 4 ambientes con terraza'
  AND p.address = 'AVELINO DIAZ 2599, Comuna 7, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta, 4 ambientes con cochera en Villa Urquiza.', 'APARTMENT', 'SALE', n.id, 'MANUEL PADILLA 4005, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4711280702427, -34.572642021690434), 4326), 73.0, NULL, 4.0, 2.0, 210000, 'Muy buen departamento de 4 ambientes con cochera en Villa Urquiza.<br><br>En tercer piso al contra frente.<br> <br>Luminoso, con muy buena distribución, cómodo y funcional.<br><br>Hall de recepción con placard.<br>Living comedor con salida al balcón.<br>Cocina comedor.<br>Lavadero integrado a la cocina.<br>3 dormitorios, todos con placard de piso a techo.<br>1 baño completo.<br>Toilette.<br>Baulera en el departamento.<br>Cochera fija y cubierta.<br><br>', u.id, 'AGENCY', true, 209.84, 'USED_GOOD_CONDITION', false, true, false, false, true, false, false, 169219.0172429743, 279642.01684488397, 'El rango de precio esperado para esta propiedad va de 169219 a 279642 USD, con una prediccion central de 233208 USD. El factor que mas influye en esta prediccion es la cochera, que sube el precio. Tambien suben el precio: la superficie cubierta y la cantidad de banos. Bajan el precio: el barrio/zona y los amenities del edificio.', '[{"factor": "la cochera", "contribution": 323.7646789550781, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 86.03607177734375, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 70.62818145751953, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -64.44520568847656, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": -52.75678634643555, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Urquiza' AND u.email = 'nortecaba.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-96-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-96-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-96-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'nortecaba.propiedades@nidio.app'
  AND p.title = 'Venta, 4 ambientes con cochera en Villa Urquiza.'
  AND p.address = 'MANUEL PADILLA 4005, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT '3 Ambientes - Bajas Expensas! ', 'APARTMENT', 'SALE', n.id, 'CANTILO 1703, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.39739894788418, -34.58879915444941), 4326), 50.0, 50.0, 3.0, 1.0, 105000, 'Impecable 3 Ambientes reciclado de categoria en Venta. Inmejorable ubicación. 5to piso con mucha luz. Living comedor de generosas dimensiones con vista al contrafrente. Cocina independiente de gran tamaño con lavadero separado. Baño completo con ducha y ventilación natural. ', u.id, 'AGENCY', true, 60.33, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 95379.19250358507, 166229.30385869797, 'El rango de precio esperado para esta propiedad va de 95379 a 166229 USD, con una prediccion central de 130349 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Bajan el precio: las expensas, la superficie total, la cochera y los amenities del edificio.', '[{"factor": "el barrio/zona", "contribution": 232.70343017578125, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -192.80809020996094, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -117.40770721435547, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -110.4586181640625, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": -98.486572265625, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-97-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-97-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-97-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = '3 Ambientes - Bajas Expensas! '
  AND p.address = 'CANTILO 1703, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA excelente PH CABALLITO', 'PH', 'SALE', n.id, 'EPUYEN 573, Comuna 6, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43164898687372, -34.6090156277532), 4326), 140.0, 228.0, 4.0, 1.0, 155000, '<br><br>Increíble ph en Caballito Norte en excelente estado sin expensas.<br>Entrada independiente.  Primer piso por escalera con detalles de terminación de época.  Escalones de mármol Carrara y molduras.<br><br>Accedemos a la propiedad a través de un hall de distribución con piso en damero blanco y negro y carpinterías de hierro de vidrio repartido. Toilette de recepción en el mismo ambiente. Techos altos.<br><br>El hall distribuidor nos conduce al estar comedor con cocina integrada. Este gran ambiente da al frente y tiene balcones de época. Todos los pisos son de pinotea en excelente estado y las carpinterías antiguas  de madera con vidrio repartido.<br><br>En la misma planta encontramos dos habitaciones muy amplias con plena luz y salida a un patio exterior. Una de las habitaciones con baño en suite de grandes dimensiones. <br><br>A través del patio exterior accedemos por una escalera a una habitación de servicio en donde se encuentra el lavadero y un pequeño baño.<br><br>En el ultimo piso nos encontramos con una inmensa terraza en perfecto estado de mantenimiento con pérgola de hormigón original de época. Una serie de bancos perimetrales van generando diferentes espacios de descanso.  <br><br>La terraza cuenta con ducha exterior y parrilla completa.', u.id, 'AGENCY', true, NULL, 'USED_GOOD_CONDITION', false, false, false, false, false, false, false, 256036.94689061522, 419771.1414853146, 'El rango de precio esperado para esta propiedad va de 256037 a 419771 USD, con una prediccion central de 344006 USD. El factor que mas influye en esta prediccion es la superficie total, que sube el precio. Tambien suben el precio: el precio de referencia de mercado en la zona. Bajan el precio: el tipo de propiedad (PH), la superficie y el barrio/zona.', '[{"factor": "la superficie total", "contribution": 453.2598876953125, "direction": "sube el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -345.9417681694031, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -341.25921630859375, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 216.53109741210938, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -179.39341735839844, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Caballito' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-98-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-98-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-98-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'VENTA excelente PH CABALLITO'
  AND p.address = 'EPUYEN 573, Comuna 6, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Casa 5 amb c/terraza  - Saavedra', 'HOUSE', 'SALE', n.id, 'AROMO 4848, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.49330252470789, -34.556659984642025), 4326), 230.0, 280.0, 5.0, 1.0, 340000, 'Venta Casa en lote propio de 7,66 x 11, 16.  230 mts cubiertos construidos. <br><br>La casa se recicló en su totalidad. Cuenta con 280m2 y está desarrollada en dos plantas con patio central en planta baja y una amplia terraza. Mucha luz natural y ventilación.<br><br>En Planta baja:<br>Hall con recibidor y bodega.<br>Living/comedor con salamandra a leña.<br>Estudio de grabación, escritorio o dormitorio.<br>Toilette.<br>Cocina con comedor diario.<br>Patio Central con parrilla.<br>Opción hacer Cochera.<br><br>En Primer piso:<br>Playroom de estar común.<br>Dormitorio principal en suite con vestidor.<br>2do. dormitorio con placard.<br>Baño completo a terminar.<br>Cuarto de Guardado o quincho.<br>Terraza con parrilla al frente.<br><br>', u.id, 'AGENCY', true, NULL, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 342272.218765154, 554791.8912537687, 'El rango de precio esperado para esta propiedad va de 342272 a 554792 USD, con una prediccion central de 452212 USD. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: la superficie total. Bajan el precio: la superficie cubierta, el barrio/zona y el tipo de propiedad (Casa).', '[{"factor": "la superficie", "contribution": -464.8345642089844, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 360.44610595703125, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": -226.65603637695312, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -213.79067993164062, "direction": "baja el precio"}, {"factor": "el tipo de propiedad (Casa)", "contribution": -190.42527747154236, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Saavedra' AND u.email = 'nortecaba.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-99-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-99-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-99-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'nortecaba.propiedades@nidio.app'
  AND p.title = 'Casa 5 amb c/terraza  - Saavedra'
  AND p.address = 'AROMO 4848, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta Departamento 2 Ambientes con Cochera en Palermo', 'APARTMENT', 'SALE', n.id, 'MIGUEL CANE 3059, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.40032269940886, -34.57715619108413), 4326), 57.0, 57.0, 2.0, 1.0, 158000, 'Departamento 2 Ambientes: Cocina integrada, amplio living comedor con salida al balcón, baño completo, dormitorio principal con vestidor. Unidad moderna y funcional apta alquiler temporario: • Cerraduras electrónicas de acceso al edificio y a cada departamento. • Barra desayunadora. • Balcón con parasoles corredizos y espacio chill-out. • Baulera en subsuelo. soul redefine los espacios comunes: • chill areas Rooftop Garden | Piscina | Solárium• social points Lounge; Cowork | Fogonero | Parrilla• gym• laundry• cocheras subterráneas', u.id, 'AGENCY', true, 201.97, 'NEW', true, true, true, false, false, false, false, 164057.09373209512, 285327.7334459627, 'El rango de precio esperado para esta propiedad va de 164057 a 285328 USD, con una prediccion central de 223811 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la cochera, los amenities del edificio y las expensas. Bajan el precio: la cantidad de banos.', '[{"factor": "el barrio/zona", "contribution": 532.4969482421875, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 330.2220764160156, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 216.91256713867188, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": -166.60296630859375, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": 149.14122009277344, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-100-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-100-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-100-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Venta Departamento 2 Ambientes con Cochera en Palermo'
  AND p.address = 'MIGUEL CANE 3059, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'PH 5 ambientes en venta en Boedo A REFACCIONAR', 'PH', 'SALE', n.id, 'AVALLE 2298, Comuna 5, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.41526505092661, -34.63806703709528), 4326), 130.0, 135.0, 5.0, 1.0, 175000, '<br><br>Amplio PH con posibilidad de mejoras. OPORTUNIDAD!<br>Superficie Total: 135 m2<br>Superficie Cubierta: 130 m2<br>Superficie total según escritura: 115 m2<br><br>Se ingresa por pasillo de uso común. La vivienda cuenta con generosas dimensiones en cada uno de sus ambientes<br>-Patio cubierto: 5,75 x 2,70<br>-Habitación: 4 x 4<br>-Living: 4 x 4<br>-Cocina: 2,60 x 1,45<br>-Baño: 2,60 x 1,23<br><br>Al subir la escalera nos encontramos con una habitación en entrepiso, ideal para escritorio y/o estudio.<br>Dimensiones: 2,80 x 2,27<br><br>PLANTA ALTA<br>- Lavadero amplio independiente (4,30 x 1,90).<br>- Habitación (4,05 x 3,60).<br>- Habitación (4,05 x 2,80).<br>- Pequeño balcón (4,55 x 1,55).', u.id, 'AGENCY', true, NULL, 'NEEDS_RENOVATION', false, false, false, false, false, false, false, 123423.25192146137, 193712.77127101625, 'El rango de precio esperado para esta propiedad va de 123423 a 193713 USD, con una prediccion central de 164336 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la superficie total. Bajan el precio: el barrio/zona, la superficie y el estado de la propiedad (a reciclar).', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -436.84796142578125, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -400.6322021484375, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -366.52203369140625, "direction": "baja el precio"}, {"factor": "el estado de la propiedad (a reciclar)", "contribution": -225.54457032680511, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 192.5361785888672, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Boedo' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-101-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-101-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-101-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'PH 5 ambientes en venta en Boedo A REFACCIONAR'
  AND p.address = 'AVALLE 2298, Comuna 5, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Casa en Venta', 'HOUSE', 'SALE', n.id, 'AV SEGUROLA 3554, Comuna 11, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.5140645910229, -34.60542962035258), 4326), 234.0, 284.0, 5.0, 4.0, 320000, 'Excelente casa. tipo triplex. completamente reciclado con muy buen gustoPLANTA BAJA:- Cochera para 2 autos.- Playroom / Quincho con salida al patio.- Baño completo con deck,  ducha escocesa impecable- Patio trasero con lavadero.- ParrillaPRIMER PLANTA: - Al frente aberturas en madera, vidrio repartido.- Living comedor con excelentes pisos de diseño en pinotea romboidal, muy luminoso,- Toilette cómodo de buenas dimensiones.- Cocina separada de generosas dimensiones. mucha mesada y aventanamientos hacia el parque.PLANTA ALTA: - 3 Dormitorios, principal al frente 2 al contrafrente, todos con balcòn, 2 baños.- Ducha escocesa computarizada en deck hermético.ALTILLO: con cuarto dormitorio, escritorio, playroom o sala de huéspedes.', u.id, 'AGENCY', true, NULL, 'USED_GOOD_CONDITION', false, true, false, false, true, false, false, 371966.3696608861, 656385.5866738787, 'El rango de precio esperado para esta propiedad va de 371966 a 656386 USD, con una prediccion central de 509570 USD. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: la superficie total. Bajan el precio: el tipo de propiedad (Casa), la superficie cubierta y el barrio/zona.', '[{"factor": "la superficie", "contribution": -452.894775390625, "direction": "baja el precio"}, {"factor": "el tipo de propiedad (Casa)", "contribution": -393.32556533813477, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -341.223388671875, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 337.4698181152344, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -247.3965301513672, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Devoto' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-102-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-102-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-102-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = 'Casa en Venta'
  AND p.address = 'AV SEGUROLA 3554, Comuna 11, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en Puerto Madero', 'APARTMENT', 'SALE', n.id, 'BO RODRIGO BUENO 8 1721, Comuna 1, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.3515361808694, -34.61710757062381), 4326), 165.0, 165.0, 4.0, 4.0, 508000, 'Venta le parc puerto madero - excelente semipiso de 3 dormitorios y dependencia de servicio en un piso Altísimo. Excelente distribución de ambientes. Vistas abiertas al rio Y A la ciudad! Con el signo de Le Parc, la amplitud de sus ambientes logran un confort inmejorable. Le Parc Puerto Madero es un complejo localizado en el dique 3, con frentes al Boulevard Azucena Villaflor y Aimé Painé, rodeado de naturaleza con vista al río, a minutos del centro de la ciudad de Buenos Aires, y a pasos de los restaurantes, centros de entretenimiento y recreación de la zona. El complejo cuenta con sistema de seguridad de ultima generación y control de accesos las 24 hs. , 3 piscinas climatizadas para adultos y para niños rodeadas de amplios jardines parquizados, solarium con espejo de agua y barra-bar, juegos al aire libre y sala de juegos para niños, Fitness center: Gimnasio- Spa- Sauna-Salón exclusivo para deportes, salón de usos múltiples con vistas al jardín del complejo y terrazas propias, un lujoso hall de entrada con doble altura, lavandería, lavadero de autos, estacionamiento de cortesía para visitas, cocheras fijas y bauleras, entre otras comodidades. * Venta Supeditada a la Tramitación del coti por parte del Propietario. Los metros aquí publicados son aproximados. Los reales surgen de la escritura. Esta publicidad respeta lo establecido en el art. 4 y 8 de la ley 24. 240* * Se requiere identificación para Ingresar *', u.id, 'OWNER', true, 278.03, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 804991.8164621899, 1328546.1680723715, 'El rango de precio esperado para esta propiedad va de 804992 a 1328546 USD, con una prediccion central de 1058873 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: el precio de referencia de mercado en la zona, la cantidad de banos y la superficie total. Bajan el precio: la superficie.', '[{"factor": "el barrio/zona", "contribution": 1646.9771728515625, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 1623.5208740234375, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 466.9700927734375, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -321.4933776855469, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 264.3808288574219, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Puerto Madero' AND u.email = 'martin.gomez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-103-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-103-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-103-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'martin.gomez@nidio.app'
  AND p.title = 'Departamento en Puerto Madero'
  AND p.address = 'BO RODRIGO BUENO 8 1721, Comuna 1, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - Recoleta ', 'APARTMENT', 'RENT', n.id, 'DR NORBERTO QUIRNO COSTA 1213, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.40554284126598, -34.59561714478619), 4326), 134.0, 148.0, 4.0, 2.0, 3050000, 'Zona de bares, restoranes, librerías. Mucha seguridad. <br>Palier privado.Living doble. Comedor separado. Contrafrente abierto al jardín del piso 1°, los laterales también dan al jardín del piso 1°. Split A/C en el living.<br>Con 134 m2 cubiertos y 15 m2 de balcón. Cochera fija en el 2° subsuelo, próxima al ascensor principal, de gran comodidad y practicidad.<br>Consta de 2 dormitorios, el principal en suite, con ventanas de doble vidrio hermético (DVH). Split A/C en el dormitorio principal. <br>Tiene dependencia de servicio con amplio baño con ducha. Se puede usar como 3er dormitorio.<br>1 baño completo adicional.Mosquitero en todas las aberturas laterales.<br>Cocina con comedor diario y doble circulación. Lavadero separado con lavarropas. Secarropas del edificio.<br>1 ascensor principal automático y  2 ascensores de servicio. Edificio de 30 años de antigüedad.<br><br>', u.id, 'AGENCY', true, NULL, 'NOT_SPECIFIED', false, false, false, false, false, false, true, 990.8379336155505, 2110.6954274952386, 'El rango de precio esperado para esta propiedad va de 991 a 2111 USD/mes, con una prediccion central de 1499 USD/mes. El factor que mas influye en esta prediccion es la superficie, que sube el precio. Tambien suben el precio: que este amoblado y la superficie total. Bajan el precio: el barrio/zona y el precio de referencia de mercado en la zona.', '[{"factor": "la superficie", "contribution": 516.7247314453125, "direction": "sube el precio"}, {"factor": "que este amoblado", "contribution": 206.9631805419922, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 166.0323486328125, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -90.83560180664062, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -88.6585922241211, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-104-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-104-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-104-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'Departamento - Recoleta '
  AND p.address = 'DR NORBERTO QUIRNO COSTA 1213, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT '3 amb (Amoblado) y Cochera ', 'APARTMENT', 'RENT', n.id, 'AV LACROZE FEDERICO 2317, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.44390501106791, -34.56894645644063), 4326), 70.0, 75.0, 3.0, 2.0, 600000, '3 amb y cochera - Palermo. El precio incluye alquiler, expensas y ABL. 3 ambientes amobladoCochera fija cubierta.Baulera en primer subsuelo.Disposición: Frente.Orientación: Oeste.75 m2 totalesLiving comedor con pisos de madera.Puerta blindada Pentágono.Amplio ventanal. Salida a balcón con cerramiento.Aire acondicionado split.Balcón con cerramiento de vidrio y deck.Dormitorio principal en suite con pisos de madera.Con sommier matrimonial. Vestidor en pasillo.Aire acondicionado split.Baño completo con bañera y mampara de vidrio.Segundo dormitorio con pisos de madera.Aire acondicionado split.Segundo baño completo con bañera.Cocina independiente con pisos de cerámicaLavavajillas. Detector de humo y gas. Muebles de alacena y bajo mesada. Calefacción por loza radiante individual.', u.id, 'AGENCY', true, 85.25, 'NOT_SPECIFIED', false, true, false, false, false, false, true, 792.6449266819867, 1711.4226289714027, 'El rango de precio esperado para esta propiedad va de 793 a 1711 USD/mes, con una prediccion central de 1193 USD/mes. El factor que mas influye en esta prediccion es que este amoblado, que sube el precio. Tambien suben el precio: la cochera, el precio de referencia de mercado en la zona y el barrio/zona. Bajan el precio: la superficie.', '[{"factor": "que este amoblado", "contribution": 205.24476623535156, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 142.77572631835938, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 115.4630355834961, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -106.50532531738281, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": 91.6907958984375, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-105-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-105-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-105-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = '3 amb (Amoblado) y Cochera '
  AND p.address = 'AV LACROZE FEDERICO 2317, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA 153 m2 1 master suite, 1 cochera  Muebles italianos y decoración P. Stark', 'APARTMENT', 'SALE', n.id, 'JUANA MANSO 1900, Comuna 1, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.3612880614676, -34.6212602925512), 4326), 153.0, 153.0, 2.0, 1.0, 1100000, 'Venta amoblado y decorado
<br>
<br>DUPLEX:
<br>RECEPCIóN: LIVING/ COMEDOR, TOILETTE, BALCóN, COCINA AMERICANA CON COMEDOR DIARIO
<br>PLANTA ALTA: 1 MASTER SUITE CON VESTIDOR Y BAñO
<br>1 COCHERA FIJA, 1 BAULERA, SEG. 24 HS, AMENITIES
<br>
<br>DUPLEX con vista al RIO, Parque Micaela Bastidas
<br>Se vende amoblado y decorado con lujo y calidad
<br>Antiguedad:
<br>Orientación: noreste
<br>Superficie cubierta: 152.13m2
<br>Superficie descubierta: balcón 11,9 m2
<br>
<br>
<br>PLANTA BAJA:
<br>Palier 
<br>Living / comedor, a balcón
<br>Balcón
<br>Toilette
<br>Cocina americana con comedor diario
<br>Escalera
<br>
<br>PLANTA ALTA
<br>Hall de escalera
<br>1 Master suite con box de ducha y gran vestidor
<br>
<br>
<br>1 COCHERA FIJA
<br>1 Baulera
<br>Nro de pisos: 8
<br>Deptos por piso: madera estacionada de Lapacho
<br>Grupo electrógeno
<br>2 Ascensores
<br>Calefacción y Aire Acond: central por ductos y torre de enfriamiento
<br>Agua caliente central. 
<br>Seguridad 24 hs y Prefectura Adicional
<br>Conserjería 24 hs
<br>Internet por consorcio
<br>AMENITIES: gym, sala de reuniones, Pileta en la terraza, sauna, spa
<br>Servicio de mucama y mayordomo adicional.
<br>Intendencia y mantenimiento interno
<br>Se puede acceder a todos los servicios de FAENA HOTEL UNIVERSE: sevicio de mucama, servicio de limpieza a seco, in residence delivery, in residence cuisine, tratamientos de belleza o masajes en el spa, beauty corner o en su residencia.
<br>Laundry
<br>
<br>Planta con cerramientos de cristales templados, ventanales en aluminio bronce, doble vidrio con cámara de aire. Mobiliario italiano y decoración importada, Arañas de Bohemia.', u.id, 'OWNER', true, NULL, 'NOT_SPECIFIED', false, true, true, true, false, false, true, 791592.6908468705, 1306432.4563206334, 'El rango de precio esperado para esta propiedad va de 791593 a 1306432 USD, con una prediccion central de 1041248 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: el precio de referencia de mercado en la zona y la superficie total. Bajan el precio: la superficie y la cantidad de banos.', '[{"factor": "el barrio/zona", "contribution": 1704.4588623046875, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 1405.3702392578125, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 462.52154541015625, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -344.7994384765625, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -239.0651092529297, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Puerto Madero' AND u.email = 'sofia.rodriguez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-106-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-106-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-106-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'sofia.rodriguez@nidio.app'
  AND p.title = 'VENTA 153 m2 1 master suite, 1 cochera  Muebles italianos y decoración P. Stark'
  AND p.address = 'JUANA MANSO 1900, Comuna 1, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Casa en Venta en Flores, Capital federal', 'HOUSE', 'SALE', n.id, 'AV GAONA 3467, Comuna 7, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.47377973698917, -34.62028550419605), 4326), 194.0, NULL, 7.0, 2.0, 150000, 'Excelente propiedad de Estilo antiguo sobre lote 6,70 m de frente x 35,80 m de fondo con 194 m2 cubiertos, desarrollados en planta sotano, planta baja, 1º y 2º piso. El inmueble es apto para todo destino, ideal para usos comerciales o profesionales. La propiedad estructuralmente esta en muy buenas condiciones, con techos altos, molduras, pisos de madera con marqueteria, escaleras de marmol y madera, etc. ', u.id, 'AGENCY', true, NULL, 'USED_GOOD_CONDITION', false, false, false, false, false, false, false, 225327.79597863666, 380059.12297463615, 'El rango de precio esperado para esta propiedad va de 225328 a 380059 USD, con una prediccion central de 311804 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la cantidad de banos. Bajan el precio: la superficie, el precio de referencia de mercado en la zona y la superficie cubierta.', '[{"factor": "el barrio/zona", "contribution": -425.8706970214844, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -424.21820068359375, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -390.9369201660156, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -113.08936309814453, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 72.66236877441406, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Flores' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-107-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-107-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-107-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'Casa en Venta en Flores, Capital federal'
  AND p.address = 'AV GAONA 3467, Comuna 7, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA 2 AMB AMPLIO', 'APARTMENT', 'SALE', n.id, 'CARLOS E ZUBERBUHLER 1799, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4588310898793, -34.5694832080334), 4326), 52.0, 61.0, 2.0, 1.0, 133000, '**VENTA AMPLIO 2 AMB A ESTRENAR - CON BALCÓN DOS BALCONES**<br> EXCELENTE CALIDAD DE CONSTRUCCIÓN<br><br>› Dormitorio principal en suite<br>› Living comedor con salida al balcón<br>› Cocina independiente<br>› Toilette de recepción<br>› Balcón  chico con salida del living <br>› Balcón  grande con salida de la cocina <br><br>DETALLES UNIDAD:<br>› Puertas de seguridad Pentagon<br>› Dos equipos de aire split frío-calor marca Electra <br>› Pisos de porcelanato en el living <br>› Puertas de alacena y mesada línea Alto Brillo <br>› Se entrega sin pisos en el dormitorio<br><br>', u.id, 'AGENCY', true, 79.34, 'NEW', false, false, false, false, false, false, false, 152003.5317580187, 251521.1236914871, 'El rango de precio esperado para esta propiedad va de 152004 a 251521 USD, con una prediccion central de 203181 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: el barrio/zona. Bajan el precio: las expensas, la cantidad de banos y la cochera.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 918.4121704101562, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 343.2908630371094, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -123.236572265625, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -97.86067199707031, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -95.83141326904297, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-108-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-108-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-108-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'VENTA 2 AMB AMPLIO'
  AND p.address = 'CARLOS E ZUBERBUHLER 1799, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Alquiler - Palermo', 'APARTMENT', 'RENT', n.id, 'DARWIN 1512, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43606373537043, -34.58706245113136), 4326), 73.0, 73.0, 2.0, 1.0, 1525000, 'Exclusivo depto de 2 amb con balcon terraza. Orientado al este, mucho sol de mañana y vista abierta. Living comedor con salida a Amplio balcon terraza. Baño y toilette. Cocina separada y sector lavadero. Superficie Total 73, 50. Apto para uso profesional (aptos por reglamentos). El edificio posee en Planta Baja Piscina con deck de madera tratada. . Sector de parrilla con expansión verde en Planta Baja. . Cocheras de cortesía y Vigilancia 24 hs. Sum, Gimnasio, Laundry. . Tres subsuelos de cocheras. No se aceptan mascotas. ', u.id, 'AGENCY', true, 393.44, 'NOT_SPECIFIED', true, false, true, true, true, false, false, 578.1762993842971, 1248.3572013048722, 'El rango de precio esperado para esta propiedad va de 578 a 1248 USD/mes, con una prediccion central de 870 USD/mes. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: los amenities del edificio y la pileta. Bajan el precio: la superficie y la cantidad de banos.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 144.06161499023438, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -132.78085327148438, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": 86.38361358642578, "direction": "sube el precio"}, {"factor": "la pileta", "contribution": 64.84012603759766, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": -56.39500427246094, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-109-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-109-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-109-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Alquiler - Palermo'
  AND p.address = 'DARWIN 1512, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Amplio Monoambiente con Balcón Amoblado | Recoleta ', 'APARTMENT', 'RENT', n.id, 'DR LUIS AGOTE 2415, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.39523741189665, -34.58583386768883), 4326), 32.0, 32.0, 1.0, 1.0, 490000, 'alquiler monoambiente en recoleta con balcón. Monoambiente en recoleta con balcón en piso 5, contrafrente. Divino monoambiente amoblado tal cual las imagenes en un quinto piso con balcón al contrafrente, ubicado sobre junin entre las heras Y vicente lópez. contrato tradicional. Características de la propiedad: Una propiedad que vale la pena visitar, no solo por su ubicación, sino por la distribución cómoda que posee. -Cocina comedor con anafe eléctrico, con muebles bajo mesada, alacenas. -Baño completo en buen estado, con bañadera. -Aire acondicionado frio/calor. -Balcón con una cálida vista al contrafrente con lavarropas. -Placard. -Placar divisorio entre el living y dormitorio. Características del Edificio: -Edificio de 10 pisos. -3departamentos por pisos hasta el piso 8 y luego 2 por pisos. -Cuenta con 2 ascensores. -Encargado.', u.id, 'AGENCY', true, 196.72, 'NOT_SPECIFIED', false, false, false, false, false, false, true, 227.08657402620588, 483.7426759527421, 'El rango de precio esperado para esta propiedad va de 227 a 484 USD/mes, con una prediccion central de 344 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: que este amoblado. Bajan el precio: la superficie total, la cantidad de banos y la superficie cubierta.', '[{"factor": "la superficie", "contribution": -248.04542541503906, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -98.4049301147461, "direction": "baja el precio"}, {"factor": "que este amoblado", "contribution": 73.43174743652344, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": -49.43537902832031, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -39.13187026977539, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-110-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-110-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-110-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'Amplio Monoambiente con Balcón Amoblado | Recoleta '
  AND p.address = 'DR LUIS AGOTE 2415, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en Retiro ', 'APARTMENT', 'SALE', n.id, 'MONTEVIDEO 1999, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.3838435656555, -34.5876792238071), 4326), 124.0, 124.0, 4.0, 3.0, 250000, 'Departamento en Edificio de categoría, con vistas únicas. Luminoso. Palier privado. Hall de entrada. Living comedor. Dormitorio principal en suite. Dos dormitorio más con salida al balcón, que comparten baño completo con ventilación natural. Doble circulación. Cocina con comedor diario. Lavadero y dependencia de servicio. Entrada de servicio. Portero con vivienda en el edificio. Agua caliente central. Calefacción individual. Listo para mudarse.', u.id, 'OWNER', true, 360.66, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 209152.57858579938, 398217.97189595527, 'El rango de precio esperado para esta propiedad va de 209153 a 398218 USD, con una prediccion central de 307027 USD. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: la cantidad de banos, la superficie total y las expensas. Bajan el precio: el precio de referencia de mercado en la zona.', '[{"factor": "la superficie", "contribution": -293.340576171875, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -248.68218994140625, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 178.49900817871094, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 125.64093017578125, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": 115.87135314941406, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Retiro' AND u.email = 'nicolas.alvarez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-111-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-111-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-111-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'nicolas.alvarez@nidio.app'
  AND p.title = 'Departamento en Retiro '
  AND p.address = 'MONTEVIDEO 1999, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA PH 3 AMB. SIN EXPENSAS RECICLADO NUEVO PURA LUZ ', 'PH', 'SALE', n.id, 'SAN CARLOS 67, Comuna 5, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.42407525946052, -34.61429594420514), 4326), 69.0, 91.0, 3.0, 2.0, 139900, 'EXCELENTE PH RECICLADO A NUEVOSIN EXPENSASCONTRAFRENTE SUPER LUMINOSO Y MODERNOPH de 8,71m de fte. x 46,76 m de fondo5 Unidades funcionales en totalSu distribución es la siguiente, en PB, Hall de entrada descubiertoCocina integrada completa con mueble bajo mesada y alacenaMesada de Acero inoxidable y  pisos de Porccelanato.Living comedor con pisos de Parquet.Dormitorio amplio y luminoso con un gran ventanal con salida a un patio.Baño completo con ducha. Artefactos de primera calidad.Escalera con descanso amplio como un escritorio.PA: Suite PrincipalAmplia terraza con parrilla de uso exclusivo.La propiedad se encuentra reciclado con materiales de primeras marcas y detalles en las terminaciones de gran calidad. Excelente Oportunidad para entrar a vivir YA!Es una zona céntrica con innumerables locales de uso comercial.', u.id, 'AGENCY', true, NULL, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 131156.81852853717, 201954.57483176925, 'El rango de precio esperado para esta propiedad va de 131157 a 201955 USD, con una prediccion central de 173074 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la superficie total y la cantidad de banos. Bajan el precio: el barrio/zona y el tipo de propiedad (PH).', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -315.7574462890625, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -223.39862060546875, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 180.42556762695312, "direction": "sube el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -133.13037037849426, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 78.35857391357422, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Almagro' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-112-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-112-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-112-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'VENTA PH 3 AMB. SIN EXPENSAS RECICLADO NUEVO PURA LUZ '
  AND p.address = 'SAN CARLOS 67, Comuna 5, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en Venta', 'APARTMENT', 'SALE', n.id, 'CNEL ROHDE 3509, Comuna 11, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.49263613616995, -34.61036483610017), 4326), 44.0, 44.0, 1.0, 1.0, 110000, 'Departamento de 2 ambientes lateral amplias medidas con cochera a metros del parque Rivadavia,  cocina integrada separa por una isla con desayunadora, refaccionado hace 7 años a nuevo, losa radiante central, muy luminoso, apto credito.', u.id, 'AGENCY', true, 138.45, 'USED_GOOD_CONDITION', false, true, false, false, true, true, false, 103403.51814607928, 162342.32040639795, 'El rango de precio esperado para esta propiedad va de 103404 a 162342 USD, con una prediccion central de 132330 USD. El factor que mas influye en esta prediccion es la cochera, que sube el precio. Tambien suben el precio: el precio de referencia de mercado en la zona y la superficie. Bajan el precio: el barrio/zona y la superficie total.', '[{"factor": "la cochera", "contribution": 323.4301452636719, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -279.4123229980469, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 184.92803955078125, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -152.1576385498047, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 126.21878814697266, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa del Parque' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-113-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-113-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-113-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = 'Departamento en Venta'
  AND p.address = 'CNEL ROHDE 3509, Comuna 11, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'ALQUILER semipiso ALTO muy buena vista 2 dormit depend cochera ', 'APARTMENT', 'RENT', n.id, 'AV TOMAS A EDISON 2625, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.384877674951774, -34.57290230748747), 4326), 112.0, 112.0, 3.0, 1.0, 1784250, 'Expensas:$ 16.000ABL: $ 3.500Posibilidad de valor en pesos. Consultar tipo de transferenciaLIVING / COMEDOR, BALCÓN, TOILETTE, 2 DORMITORIOS, 1 BAÑO, 1 DEPENDENCIA CON BAÑO, COCINA, BAULERA, 1 COCHERA FIJA, VIG 24 HS.Muy buen semipiso cfte. en edificio tradicional de Posadas.Vista abierta a pulmón arboladoExcelente luz y solAmplios ambientesRECICLADO A FULL (a estrenar)Antigüedad: 60 añosOrientación: esteSuperficie cubierta: 107,23 m2Superficie Total: 112,4 m2Palier privadoHallLiving / comedor 6,5 x 4,5 con Biblioteca y Aire Acond Split f/c, a balcón aterrazadoBalcón 4 x 2 con cerramiento vidriado desmontableToilette1er. Dormitorio 5 x 4 con Aire Acond Split f/c2do. Dormitorio 5 x 4 con Aire Acond Split f/c1 Baño completo con duchaCocinaLavadero independiente1 Dependencia 3 x 2,3 con buen bañoPuerta de servicio1 COCHERA FIJA1 BauleraNro de pisos: 11Deptos por piso: 2Tipo de piso: parquet de robleServicios individuales:    Calefacción: losa radiante por caldera individual nueva    Agua caliente: caldera individual nuevaSeguridad 24 hs.Carpinterías de aluminio nuevas. Placares a nuevo. Mesadas de Decton. Lavarropas y lavavajillas nuevo a estrenar. Cocina con anafe a gas, horno eléctrico, campana y lavavajilla a estrenar. Maquina de lavar a estrenar.', u.id, 'AGENCY', true, 327.87, 'NEW', false, true, false, true, true, false, false, 759.6643147021884, 1618.2464771230161, 'El rango de precio esperado para esta propiedad va de 760 a 1618 USD/mes, con una prediccion central de 1149 USD/mes. El factor que mas influye en esta prediccion es la superficie, que sube el precio. Tambien suben el precio: el estado de la propiedad (a estrenar), las expensas y la superficie total. Bajan el precio: el barrio/zona.', '[{"factor": "la superficie", "contribution": 222.1138916015625, "direction": "sube el precio"}, {"factor": "el estado de la propiedad (a estrenar)", "contribution": 157.78130221366882, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": 96.28895568847656, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 65.2415542602539, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -64.36951446533203, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-114-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-114-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-114-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'ALQUILER semipiso ALTO muy buena vista 2 dormit depend cochera '
  AND p.address = 'AV TOMAS A EDISON 2625, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA DEPARTAMENTO 2 AMBIENTES BELGRANO C LUMINOSO BALCON', 'APARTMENT', 'SALE', n.id, 'CMRO CLODOMIRO URTUBEY 2392, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.470305222688495, -34.565964740620764), 4326), 37.0, 46.0, 2.0, 1.0, 69900, 'REAL OPORTUNIDAD! DEPARTAMENTO 2 AMBIENTES CON BALCON Y COCINA INTEGRADA.Amplio Living/Comedor con Aire Acondicionado Frío/Calor.Cocina Integrada con barra desayunadora, aparato de cocina eléctrico nuevo.Dormitorios con vista a balcón y piso flotante.Pisos de Porcelanato en Cocina y Living/Comedor.Baño Completo con Ducha, Reciclado.Lavadero.Agua Caliente individual por Termotanque Eléctrico.Instalaciones sanitarias y eléctricas a nuevo.APTO PROFESIONAL // APTO CREDITO // APTO MASCOTASEn edificio de 15 pisos. 4 Ascensores. Amplia terraza de uso compartido.Seguridad las 24 hs (presencial + pantalla).Cocheras disponibles en alquiler en el mismo edificio.', u.id, 'AGENCY', true, 88.52, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 115077.0177837084, 190418.60731302825, 'El rango de precio esperado para esta propiedad va de 115077 a 190419 USD, con una prediccion central de 153822 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: el barrio/zona, la superficie y la superficie cubierta. Bajan el precio: las expensas.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 949.4478759765625, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 336.93585205078125, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 326.6438293457031, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 224.80850219726562, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -158.05792236328125, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-115-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-115-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-115-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'VENTA DEPARTAMENTO 2 AMBIENTES BELGRANO C LUMINOSO BALCON'
  AND p.address = 'CMRO CLODOMIRO URTUBEY 2392, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta Departamento de 3 Ambiente en Palermo', 'APARTMENT', 'SALE', n.id, 'JOSE LEON PAGANO 2708, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.39998680723108, -34.58359887251282), 4326), 70.0, 70.0, 3.0, 1.0, 120000, 'Departamento en venta 3 Ambientes. Superficie cubierta: 5to piso, al frenteBalcón con salida tanto desde el living como desde la habitación principalPiso plastificado original de parquet en todo el departamentoPiso del balcón nuevo, de porcelanatoBaño completo con ventilación natural y bañadera nuevaDependencia o escritorioDoble circulación en la cocinaMuebles de cocina hechos a medidaPlacares en todos los ambientesBaulera incluidaTodas las ventanas tienen protección para niños.', u.id, 'AGENCY', true, 102.95, 'USED_GOOD_CONDITION', false, false, false, false, false, false, false, 129489.49577159708, 225207.8437638585, 'El rango de precio esperado para esta propiedad va de 129489 a 225208 USD, con una prediccion central de 176653 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Bajan el precio: las expensas, la superficie, la cochera y la cantidad de banos.', '[{"factor": "el barrio/zona", "contribution": 334.56219482421875, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -216.6031036376953, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -148.609130859375, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -142.19898986816406, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -126.5174789428711, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-116-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-116-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-116-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Venta Departamento de 3 Ambiente en Palermo'
  AND p.address = 'JOSE LEON PAGANO 2708, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'MONOAMBIENTE', 'APARTMENT', 'SALE', n.id, 'DR GERARDO ARMAUER HANSEN 1753, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43584210458024, -34.554485018961095), 4326), 21.0, 21.0, 1.0, 1.0, 75000, 'MONOAMBIENTE <br><br>21m2 Totales<br><br>Muy LUMINOSO. Una de las zonas mas buscadas de Capital Federal.<br><br>Pisos de PARQUET plastificado <br>Lindo y moderno Placard <br>Aire acondicionado<br>Muy bien mantenido, para mudarse !!<br><br>El edificio cuenta con encargado, cerradura electrónica con tarjeta<br><br>', u.id, 'AGENCY', true, 46.56, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 68653.47965318443, 113601.31010106388, 'El rango de precio esperado para esta propiedad va de 68653 a 113601 USD, con una prediccion central de 91768 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: la superficie, el barrio/zona y la superficie cubierta. Bajan el precio: la superficie total.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 1069.8516845703125, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 678.9555053710938, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -394.1434020996094, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": 324.49603271484375, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 247.43565368652344, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-117-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-117-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-117-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'MONOAMBIENTE'
  AND p.address = 'DR GERARDO ARMAUER HANSEN 1753, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 1 ambiente en Venta en Almagro', 'APARTMENT', 'SALE', n.id, 'LAVALLE 4100, Comuna 5, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4233672471967, -34.5977487384833), 4326), 44.0, 49.0, 1.0, 1.0, 55000, 'MONOAMBIENTE A ESTRENAR DIVISIBLE 49 METOS TOTALES . MUY AMPLIO Y ADAPTABLE . OPORTUNIDAD PRECIO INVERSOR', u.id, 'AGENCY', true, 45.9, 'NEW', false, false, false, false, false, false, false, 68368.55289014844, 105273.53580011585, 'El rango de precio esperado para esta propiedad va de 68369 a 105274 USD, con una prediccion central de 90219 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la superficie. Bajan el precio: el barrio/zona, las expensas y la cantidad de ambientes.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -334.4530029296875, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -161.20126342773438, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -133.64527893066406, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 133.08242797851562, "direction": "sube el precio"}, {"factor": "la cantidad de ambientes", "contribution": -128.2963409423828, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Almagro' AND u.email = 'almagrocaballito.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-118-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-118-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-118-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'almagrocaballito.propiedades@nidio.app'
  AND p.title = 'Departamento de 1 ambiente en Venta en Almagro'
  AND p.address = 'LAVALLE 4100, Comuna 5, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Recoleta-Torre con Amenities', 'APARTMENT', 'SALE', n.id, 'AV PTE FIGUEROA ALCORTA 2840, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.3964043116874, -34.58148438088486), 4326), 160.0, 182.0, 4.0, 3.0, 950000, 'Excelente semipiso en Torre con Amenities ( SUM , GYM, Piscina, Solarium ).Palier privado, living comedor con balcón , toilette de recepción ,dormitorio principal en suite, vestidor , segundo y tercer dormitorio comparten baño completo, comedor diario, cocina , lavadero y dependencia de servicio.Dos cocheras.El departamento tiene doble circulación, piso alto que da a un contra-frente abierto.Seguridad 24 hrs, estacionamiento de cortesía.', u.id, 'AGENCY', true, 721.31, 'NOT_SPECIFIED', true, true, true, true, false, false, false, 621110.3641513868, 1082487.078598685, 'El rango de precio esperado para esta propiedad va de 621110 a 1082487 USD, con una prediccion central de 848835 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: los amenities del edificio, la superficie total, la cantidad de banos y la pileta.', '[{"factor": "el barrio/zona", "contribution": 490.5655212402344, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 432.9529113769531, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 414.93798828125, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 280.1329345703125, "direction": "sube el precio"}, {"factor": "la pileta", "contribution": 241.69322204589844, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-119-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-119-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-119-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'Recoleta-Torre con Amenities'
  AND p.address = 'AV PTE FIGUEROA ALCORTA 2840, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'PH en Venta ubicado en Saavedra', 'PH', 'SALE', n.id, 'ZAPIOLA 4919, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4807407630435, -34.5407449060472), 4326), 104.0, NULL, 2.0, NULL, 332000, 'Venta - PH - Argentina, Buenos Aires, Capital Federal, Saavedra<br>Se trata de un PH, de un total de 3 PH. El del frente tiene entrada independiente y los otros 2 por pasillo.El Ph es luminoso. Accedes a un Patio que le da mucha luz al Living. Hall de entrada, hacia la izquierda del mismo tenemos  un Lindo Living con ventana hacia el patio de entrada, de 4 x 4 y hacia la derecha un comedor de 4 x 4,25 y una cocina incorporada al comedor. Toilete con bañera, muy canchero. Cocina con muebles de alto y bajo mesada y ventana hacia el pasillo. Los pisos de planta baja son de cerámicos tipo terraza. Del costado de la cocina sale la escalera hacia el primer piso donde tenemos un hall de distribución. A la derecha un lindo lavadero de buenas medidas con salida a una terraza de 4 x 2,50 con parilla. Dormitorio principal amplio  con pisos de madera ,  placard y baño en suite.Segundo dormitorio de 3,50  x 3 con un baño tipo toilette, en suite. ', u.id, 'AGENCY', true, NULL, 'NOT_SPECIFIED', false, false, false, false, true, false, true, 161900.90387819987, 262426.52407588746, 'El rango de precio esperado para esta propiedad va de 161901 a 262427 USD, con una prediccion central de 213904 USD. El factor que mas influye en esta prediccion es el tipo de propiedad (PH), que baja el precio. Bajan el precio: la superficie, el barrio/zona, el precio de referencia de mercado en la zona y la cantidad de ambientes.', '[{"factor": "el tipo de propiedad (PH)", "contribution": -220.87563824653625, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -208.02151489257812, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -187.75486755371094, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -114.51860809326172, "direction": "baja el precio"}, {"factor": "la cantidad de ambientes", "contribution": -105.82295989990234, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Saavedra' AND u.email = 'nortecaba.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-120-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-120-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-120-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'nortecaba.propiedades@nidio.app'
  AND p.title = 'PH en Venta ubicado en Saavedra'
  AND p.address = 'ZAPIOLA 4919, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - Almagro', 'APARTMENT', 'RENT', n.id, 'QUERANDIES 4312, Comuna 5, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.42753351565607, -34.61133161467834), 4326), 35.0, 35.0, 2.0, 1.0, 480000, 'DEPARTAMENTO 2 AMBIENTES LATERAL.<br><br>Para ingresar pedimos un mes de depósito, un mes de adelanto y una garantía propietaria de capital federal o de Provincia de Bs.As. si es de un familiar directo (mismo apellido). Además necesitamos que el locatario presente recibos de sueldo o una demostración de ingresos acorde al valor del alquiler. El contrato es por dos años con una actualización del 17% semestral. ', u.id, 'OWNER', true, 154.1, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 221.92749048026565, 361.26248121712865, 'El rango de precio esperado para esta propiedad va de 222 a 361 USD/mes, con una prediccion central de 295 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Bajan el precio: el barrio/zona, la superficie total, la cantidad de banos y la superficie cubierta.', '[{"factor": "la superficie", "contribution": -173.28994750976562, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -116.0506591796875, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -68.64155578613281, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -40.370399475097656, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -35.764888763427734, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Almagro' AND u.email = 'valentina.ruiz@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-121-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-121-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-121-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'valentina.ruiz@nidio.app'
  AND p.title = 'Departamento - Almagro'
  AND p.address = 'QUERANDIES 4312, Comuna 5, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT '2 Amb Muy Lum Coc Abta Lav Placards Caba ', 'APARTMENT', 'RENT', n.id, 'DR EMILIO RAVIGNANI 2391, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43293612833784, -34.57611124457231), 4326), 42.0, 42.0, 2.0, 1.0, 550000, 'Excelente dos ambiente en Palermo! Con balcòn. Super Luminoso, Vista abierta, sol de tarde!! Cocina integrada!! Todo electrico. Lugar para lavarropas. ', u.id, 'AGENCY', true, 144.26, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 257.53962597057364, 556.0612689314617, 'El rango de precio esperado para esta propiedad va de 258 a 556 USD/mes, con una prediccion central de 388 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona. Bajan el precio: la superficie total, la superficie cubierta y la cantidad de banos.', '[{"factor": "la superficie", "contribution": -250.69261169433594, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 92.70952606201172, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -79.4394302368164, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -47.25542449951172, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -47.18069839477539, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-122-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-122-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-122-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = '2 Amb Muy Lum Coc Abta Lav Placards Caba '
  AND p.address = 'DR EMILIO RAVIGNANI 2391, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta Amplio 2 Amb a Estrenar en Recoleta ', 'APARTMENT', 'SALE', n.id, 'AV GRAL GELLY Y OBES 2400, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.3962355119977, -34.5845397207432), 4326), 56.0, 56.0, 2.0, 2.0, 126000, 'Excelente departamento a estrenar en la mejor zona de Recoleta. Duplex Super luminoso. Edificio nuevo de gran categoria con fachada completa en marmol. . Pileta y solarium. Bajas expensas. Living Comedor esquinero con excelente vista abierta. Palier Privado. 2 baños. Gran dormitorio en planta alta con doble ventanal y buen placard. Escalera minimalista de diseño. Oportunidad única. ', u.id, 'AGENCY', true, 176.39, 'NEW', true, false, true, false, true, false, false, 149872.4510432955, 261201.55298638513, 'El rango de precio esperado para esta propiedad va de 149872 a 261202 USD, con una prediccion central de 204822 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: los amenities del edificio y la pileta. Bajan el precio: la superficie total y la cochera.', '[{"factor": "el barrio/zona", "contribution": 396.7008056640625, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 285.9222412109375, "direction": "sube el precio"}, {"factor": "la pileta", "contribution": 130.08021545410156, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -121.18158721923828, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -100.29544067382812, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-123-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-123-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-123-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'Venta Amplio 2 Amb a Estrenar en Recoleta '
  AND p.address = 'AV GRAL GELLY Y OBES 2400, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Excelente departamento de 2 ambientes al Frente con Balcón Terraza', 'APARTMENT', 'SALE', n.id, 'RODRIGUEZ PEÑA 1687, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.38905848394215, -34.59095005183097), 4326), 49.0, 61.0, 2.0, 1.0, 79500, 'Excelente departamento de 2 ambientes al Frente con Balcón Terraza. Súper luminoso. Amplio living-comedor. Cómodo Dormitorio con placard. Cocina separada con lavadero incorporado. Baño completo. Todos los ambientes ventilan al exterior. Inmejorable ubicación.', u.id, 'AGENCY', true, 163.93, 'NOT_SPECIFIED', false, false, false, false, true, false, true, 109707.96433595702, 191201.85504438536, 'El rango de precio esperado para esta propiedad va de 109708 a 191202 USD, con una prediccion central de 149931 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la superficie. Bajan el precio: la cochera, el precio de referencia de mercado en la zona y los amenities del edificio.', '[{"factor": "el barrio/zona", "contribution": 228.25392150878906, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": -114.8770751953125, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -110.46783447265625, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 109.87065887451172, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": -99.78960418701172, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-124-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-124-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-124-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'Excelente departamento de 2 ambientes al Frente con Balcón Terraza'
  AND p.address = 'RODRIGUEZ PEÑA 1687, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'PH - Parque Patricios', 'PH', 'SALE', n.id, 'PEDRO ECHAGUE 1866, Comuna 4, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.391256439068094, -34.63061582186327), 4326), 70.0, 135.0, 3.0, 1.0, 138000, 'Hermosos PH a estrenar,  cuatro (4) unidades en dúplex, todas  al frente. Dos (2) unidades en planta alta y dos (2)  unidades en planta baja. Construidos con materiales y acabados de primera categoría, muy buena distribución,  luminosos y de fácil acceso.<br>Las dos Unidades de planta baja cuentan con cochera descubierta, patio de 32m² con parrilla, lavadero, cocina comedor y dos dormitorios. Los metros cubiertos son 70m² aproximado más 10 m² sami cubiertos y 55 m² descubiertos entre patio y cochera. Haciendo un total de  135 m² totales aproximados.', u.id, 'AGENCY', true, 21.64, 'NEW', false, true, false, false, true, false, false, 110376.25916281817, 189999.24800884444, 'El rango de precio esperado para esta propiedad va de 110376 a 189999 USD, con una prediccion central de 149413 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie total y la cochera. Bajan el precio: el precio de referencia de mercado en la zona y el tipo de propiedad (PH).', '[{"factor": "el barrio/zona", "contribution": -621.9810180664062, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -522.91455078125, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 357.8370056152344, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 231.00025939941406, "direction": "sube el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -142.14115192741156, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Parque Patricios' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-125-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-125-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-125-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = 'PH - Parque Patricios'
  AND p.address = 'PEDRO ECHAGUE 1866, Comuna 4, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'PH.tipo casa de 2 ambientes en Venta en Palermo', 'PH', 'SALE', n.id, 'JUAN A BUSCHIAZZO 3006, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.42077568195888, -34.57376156285396), 4326), 51.0, 51.0, 2.0, 1.0, 117000, 'Excelente PH de dos ambientes, segundo piso por escalera, ubicado al contra frente (Muy tranquilo) con amplios ventanales orientados hacia el oeste y norte. El presente se accede por entrada común que se comparte con solo otras tres propiedades y posee una terraza construida y utilizada por el propietario exclusivamente (aunque POR REGLAMENTO ES UN ESPACIO COMUN). Ambos propietarios del ultimo piso construyeron las terrazas para uso propio mediante acuerdo verbal con las dos unidades restantes. Se aclara que no se ha modificado la escritura ni el reglamento, y dicho espacio NO es propiedad del PH exclusivamente.. Todo reciclado a nuevo, en muy buen estado de conservación.OPORTUNIDAD!!!! Mts2 cubierto:50.62 mas 52 mts2 Terraza compartida.', u.id, 'AGENCY', true, 32.79, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 93591.95181611033, 162774.91495785426, 'El rango de precio esperado para esta propiedad va de 93592 a 162775 USD, con una prediccion central de 127681 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Bajan el precio: las expensas, el tipo de propiedad (PH), la cochera y la superficie total.', '[{"factor": "el barrio/zona", "contribution": 342.0295104980469, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -206.70664978027344, "direction": "baja el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -165.92559856176376, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -132.82850646972656, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -132.64468383789062, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-126-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-126-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-126-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'PH.tipo casa de 2 ambientes en Venta en Palermo'
  AND p.address = 'JUAN A BUSCHIAZZO 3006, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA DEPTO 3 AMB. VILLA CRESPO 73 m2', 'APARTMENT', 'SALE', n.id, 'ESTADO DE PALESTINA (EX RAWSON) 1134, Comuna 15, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.42485767827878, -34.597165863584635), 4326), 40.0, 72.0, 3.0, 1.0, 68000, '<br><br>IMPECABLE DEPARTAMENTO DE 3 AMBIENTES CON UN ESPECTACULAR BALCÓN ATERRAZADO. <br>MUY LUMINOSO. APTO PROFESIONAL.<br><br><br>- Living.<br>- Cocina<br>- Baños completo.<br>- 2 Dormitorios.<br>- Balcón aterrazado.<br><br>Transportes Cercanos<br>Colectivos:    55, 65, 71, 127, 166, 34, 106, 110 y otros.<br>Subtes (Metro): MALABIA - PUGLIESE (Línea B)<br><br>Datos útiles<br>Barrio:     Villa Crespo<br>Comuna:     Comuna 15<br>Área Hospitalaria:     HTAL. DR. C.G. DURAND<br>Comisaría Comunal:     15<br>Comisaría Vecinal:     15B<br>Distrito Escolar:     Distrito Escolar II<br>Código Postal:     1185<br>Código Postal Argentino:     C1185AAE<br><br>----------------------------------------------------------------------------------------------------------------------------------------------------------<br><br>', u.id, 'AGENCY', true, 52.46, 'USED_GOOD_CONDITION', false, false, false, false, false, false, false, 112831.60904332901, 178442.71895052085, 'El rango de precio esperado para esta propiedad va de 112832 a 178443 USD, con una prediccion central de 145565 USD. El factor que mas influye en esta prediccion es la superficie, que sube el precio. Tambien suben el precio: la superficie total, la superficie cubierta y el precio de referencia de mercado en la zona. Bajan el precio: el barrio/zona.', '[{"factor": "la superficie", "contribution": 403.34503173828125, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 375.7188415527344, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 199.1070098876953, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 190.37969970703125, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -164.88258361816406, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Crespo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-127-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-127-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-127-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'VENTA DEPTO 3 AMB. VILLA CRESPO 73 m2'
  AND p.address = 'ESTADO DE PALESTINA (EX RAWSON) 1134, Comuna 15, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Lindo Monoambiente en Recoleta ', 'APARTMENT', 'RENT', n.id, 'AV PUEYRREDON 1359, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.40254161954036, -34.59500699001989), 4326), 23.0, 23.0, 1.0, 1.0, 390000, 'Excelente monoambiente amueblado!! El departamento en un cómodo monoambiente interno, muy tranquilo en edificio clásico de la zona en excelente estado de mantenimiento. Se encuentra amueblado, 2 camas, aire acondicionado frio calor, anafe, heladera bajo mesada, Internet, listo para ocupar. Precio paquete 360 usd todo incluido menos electricidad', u.id, 'AGENCY', true, 113.44, 'USED_GOOD_CONDITION', false, false, false, false, false, false, true, 211.2641463410612, 450.03754150654026, 'El rango de precio esperado para esta propiedad va de 211 a 450 USD/mes, con una prediccion central de 320 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: que este amoblado. Bajan el precio: la superficie total, la cantidad de banos y la superficie cubierta.', '[{"factor": "la superficie", "contribution": -251.4888458251953, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -111.00243377685547, "direction": "baja el precio"}, {"factor": "que este amoblado", "contribution": 72.9371337890625, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": -51.622989654541016, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -36.68629455566406, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-128-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-128-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-128-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'Lindo Monoambiente en Recoleta '
  AND p.address = 'AV PUEYRREDON 1359, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 3 ambientes en Venta', 'APARTMENT', 'SALE', n.id, 'DR NICOLAS REPETTO 1400, Comuna 6, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4507387962004, -34.6064941014472), 4326), 68.0, 73.0, 3.0, 1.0, 129000, 'Excelente 3 ambientes 73m2 totaes, al contrafrente con balcon corrido (8.66 x 1.10)  +baulera + cochera, en muy buen estado!, super luminoso, living y cocina amplia. Tiene Calefaccion central por losa, 1 aire f/c, lavadero independiente, Placares en pasillo y dormitorios, baño completo con ventilacion. Puerta de ingreso de seguridad.  Excelente ubicacion!', u.id, 'OWNER', true, 72.13, 'USED_GOOD_CONDITION', false, true, false, false, true, false, false, 162486.74510045024, 266396.1092153978, 'El rango de precio esperado para esta propiedad va de 162487 a 266396 USD, con una prediccion central de 218314 USD. El factor que mas influye en esta prediccion es la cochera, que sube el precio. Tambien suben el precio: el precio de referencia de mercado en la zona. Bajan el precio: la superficie, el barrio/zona y las expensas.', '[{"factor": "la cochera", "contribution": 353.0298156738281, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 269.32794189453125, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -133.13980102539062, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -117.32685852050781, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -114.8367691040039, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Caballito' AND u.email = 'tomas.diaz@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-129-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-129-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-129-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'tomas.diaz@nidio.app'
  AND p.title = 'Departamento de 3 ambientes en Venta'
  AND p.address = 'DR NICOLAS REPETTO 1400, Comuna 6, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT '¡MUY BARATO! PH 3 1/2 Ambientes - Amplia Terraza- Por escalera', 'PH', 'SALE', n.id, 'RUFINO JOSE CUERVO 2676, Comuna 11, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.49880153101401, -34.60727360781368), 4326), 65.0, 130.0, 3.0, 1.0, 103000, '3 1/2 Ambientes 1er Piso por escalera - Superficie aproximada total 130 m2 - 65 m2 descubiertos - Hall de distribución - 2 Dormitorios de 4x4 - otra habitación más pequeña o 3er dormitorio -Comedor - Cocina independiente - Baño completo - Amplia terraza con parrilla con acceso por afuera de la unidad - Lavadero', u.id, 'AGENCY', true, 36.72, 'NOT_SPECIFIED', false, false, false, false, false, true, false, 144547.36955338536, 226937.68841391642, 'El rango de precio esperado para esta propiedad va de 144547 a 226938 USD, con una prediccion central de 184983 USD. El factor que mas influye en esta prediccion es la superficie total, que sube el precio. Tambien suben el precio: el precio de referencia de mercado en la zona. Bajan el precio: el barrio/zona, el tipo de propiedad (PH) y las expensas.', '[{"factor": "la superficie total", "contribution": 394.0769958496094, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -249.00787353515625, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 200.09808349609375, "direction": "sube el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -172.97071194648743, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -138.31520080566406, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa del Parque' AND u.email = 'suroeste.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-130-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-130-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-130-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'suroeste.propiedades@nidio.app'
  AND p.title = '¡MUY BARATO! PH 3 1/2 Ambientes - Amplia Terraza- Por escalera'
  AND p.address = 'RUFINO JOSE CUERVO 2676, Comuna 11, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta Departamento 2 Amb Saavedra', 'APARTMENT', 'SALE', n.id, '20 DE FEBRERO 5877, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.50248654841966, -34.56572176944359), 4326), 62.0, 62.0, 2.0, 1.0, 132700, 'Este departamento de 2 ambientes frente cuenta con balcón, baño, toilette y 1 dormitorio, por lo que proporciona espacio al aire libre y brindando privacidad y comodidad, con la oportunidad de aprovechar un espacio eficiente y versátilEstas características combinan comodidad y funcionalidad en un diseño pensado para que puedas disfrutar cada uno de sus espacios.', u.id, 'OWNER', true, NULL, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 117641.12042239645, 190685.4722940146, 'El rango de precio esperado para esta propiedad va de 117641 a 190685 USD, con una prediccion central de 155428 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Bajan el precio: la cochera, el precio de referencia de mercado en la zona, la cantidad de banos y los amenities del edificio.', '[{"factor": "el barrio/zona", "contribution": -131.055908203125, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -94.96322631835938, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -88.91018676757812, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -86.4112548828125, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": -51.495670318603516, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Saavedra' AND u.email = 'camila.torres@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-131-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-131-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-131-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'camila.torres@nidio.app'
  AND p.title = 'Venta Departamento 2 Amb Saavedra'
  AND p.address = '20 DE FEBRERO 5877, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento 3 amb reciclado - Almagro', 'APARTMENT', 'SALE', n.id, 'CARLOS SPEGAZZINI 576, Comuna 5, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.42617319609234, -34.62022472519111), 4326), 71.0, 71.0, 3.0, 2.0, 140000, 'Excelente edificio Racionalista de Categoría. Terraza Común - Baulera en subsuelo.<br>Muy lindo departamento - Muy luminoso<br>Living comedor - 2 dormitorios uno en suite.<br>Amplia cocina - comedor con lavadero incorporado.', u.id, 'OWNER', true, NULL, 'NEEDS_RENOVATION', false, false, true, false, true, false, false, 124697.60256001994, 192008.7082782538, 'El rango de precio esperado para esta propiedad va de 124698 a 192009 USD, con una prediccion central de 164551 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: los amenities del edificio. Bajan el precio: el barrio/zona, el estado de la propiedad (a reciclar) y la superficie.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -297.75164794921875, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -276.23541259765625, "direction": "baja el precio"}, {"factor": "el estado de la propiedad (a reciclar)", "contribution": -263.5050305724144, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": 235.8046417236328, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -130.60501098632812, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Almagro' AND u.email = 'federico.romero@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-132-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-132-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-132-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'federico.romero@nidio.app'
  AND p.title = 'Departamento 3 amb reciclado - Almagro'
  AND p.address = 'CARLOS SPEGAZZINI 576, Comuna 5, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - Paternal', 'APARTMENT', 'SALE', n.id, 'DR ADOLFO DICKMAN 992, Comuna 15, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.462581164939735, -34.5973289801665), 4326), 32.0, 35.0, 1.0, 1.0, 100500, 'Monoambiente divisible  <br>2 piso contra frente<br>Excelente financiación.<br>Diseño:<br>Con un estilo moderno y audaz, su fachada original prolonga sus líneas en espaciosos balcones, produciendo un efecto visual de movimiento y sobriedad. Su hall de entrada en doble altura combina vegetación, cañas y piedra en una agradable ambientación natural.<br><br>Unidades:<br>1. Grandes ventanales y amplios balcones con vidrios laminados de seguridad.<br>2. Carpinterías de Aluminio de alta prestación con DVH.<br>3. Cocinas completamente equipadas de diseño moderno y exclusivo.<br>4. Frentes de placard completos con cajoneras.<br>5. Conexión para equipos de aire acondicionado multisplit frío-calor en todos los ambientes.<br>6. Artefactos Sanitarios Roca y griferías FV con cierre cerámico línea TRIADES.<br>Solados de porcelanato rectificados de primera en todos los ambientes.<br>Vanitorys de diseño exlusivo, incluye los espejos con cajonera y la iluminación.<br>Conexión para lavarropas en todas las unidades.<br>Tablero eléctrico individual equipados con varios circuitos protegidos con llaves termomagnéticas y disyuntor.<br>Termotanque central de alta recuperación para la alimentación de agua caliente.<br>Pintura de primera calidad con acabado final satinado.<br>', u.id, 'AGENCY', true, 19.67, 'NEW', false, true, false, false, false, false, false, 51350.31720252515, 77542.39509278467, 'El rango de precio esperado para esta propiedad va de 51350 a 77542 USD, con una prediccion central de 64918 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la superficie y la cochera. Bajan el precio: el barrio/zona y la superficie total.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -572.1202392578125, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -450.00604248046875, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 279.4566345214844, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 263.32025146484375, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -162.2323760986328, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'La Paternal' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-133-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-133-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-133-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Departamento - Paternal'
  AND p.address = 'DR ADOLFO DICKMAN 992, Comuna 15, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'SOÑADA EN LA CIUDAD  !!! CON TERRAZA - QUINCHO-SPA -SALA DE JUEGOS-', 'APARTMENT', 'SALE', n.id, 'RODRIGUEZ PEÑA 1642, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.38951110590742, -34.591349540496765), 4326), 345.0, 525.0, 5.0, 3.0, 750000, 'DIGNO DE VER !! úNICO en la zona, !  dos pisos mas terraza. Super adaptable y plantas flexibles.
<br>El Living en L  , con comedor , mas comedor diario, todos con salida a un balcón terraza,  cocina y dependencias de servicio.1 suite y 3 dormitorios con 2 baños. En caso de necesitarse se pueden hacer dos dormitorios en suite.  En el último piso tiene  un QUINCHO/PUB  con parrilla y kichinet  , baños y sector para gimnasio y Spa , ademas cuenta con una terraza única en la ciudad. 
<br>El edificio cuenta en la planta baja el edificio tiene un bar restaurante privado para uso de los propietarios. 
<br>Es una propiedad con mucho potencial , puede adaptarse para dos familias, para consultorios, para oficinas, para trabajar y vivir , el estado del inmueble es impecable, tiene asensor de servicio , son dos pisos unificados mas la terraza. ', u.id, 'AGENCY', true, NULL, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 907233.1687865312, 1581149.243628134, 'El rango de precio esperado para esta propiedad va de 907233 a 1581149 USD, con una prediccion central de 1239862 USD. El factor que mas influye en esta prediccion es la superficie total, que sube el precio. Tambien suben el precio: el barrio/zona y la cantidad de banos. Bajan el precio: la superficie y el precio de referencia de mercado en la zona.', '[{"factor": "la superficie total", "contribution": 629.1687622070312, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -301.5709228515625, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": 280.5423889160156, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 253.8046112060547, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -179.01649475097656, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'recoletayonce.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-134-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-134-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-134-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'recoletayonce.propiedades@nidio.app'
  AND p.title = 'SOÑADA EN LA CIUDAD  !!! CON TERRAZA - QUINCHO-SPA -SALA DE JUEGOS-'
  AND p.address = 'RODRIGUEZ PEÑA 1642, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA HERMOSO DEPARTAMENTO EN ALMAGRO', 'APARTMENT', 'SALE', n.id, 'POTOSI 4276, Comuna 5, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.42736153312118, -34.60728347633322), 4326), 45.0, 49.0, 2.0, 1.0, 94500, 'Venta de Departamento 2 AMBIENTES a Estrenar en Almagro, Límite con Caballito--------------- ¡¡¡ OPORTUNIDAD !!! --------------OPCIONAL COMPLETAMENTE AMUEBLADO Y LISTO PARA VIVIR O SIN AMUEBLARDepartamento de 2 Ambientes al Contrafrente a EstrenarLiving comedor con pisos de porcelanato.Aire acondicionado Frío Calor.Cocina separada con muebles bajo mesada y alacena.Baño completo.Dormitorio con pisos de porcelanato, placard empotrado con interiores completos y aire acondicionado frío calor.Balcón al Contrafrente.- Vista de Pulmón de Manzana.Superficie Cubierta: 45 m2 - Superficie Descubierta (Balcón): 4 m2 - Superficie Total: 49 m2Antigüedad: 3 Años.Excelente Estado y Cuidado del Edificio.Terraza con Jacuzzi y 2 Parrillas.Listo para vivir.Cantidad pisos en edificio: 10Número de ascensores: 2.*OPCIONAL AMUEBLADO*Incluye. Cama de 2 Plazas - Centro de Entretenimiento Negro y Blanco - Sillon Cama - Utensillos de Cocina Completo - Espejos - 2 Tvs - Cocina - Horno - Heladera - Microondas - Comoda y Mesas de Luz, - Etc.', u.id, 'OWNER', true, NULL, 'NEW', false, false, false, false, false, false, true, 78959.58630522405, 121581.55298418069, 'El rango de precio esperado para esta propiedad va de 78960 a 121582 USD, con una prediccion central de 104195 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la superficie y la superficie cubierta. Bajan el precio: el barrio/zona y la superficie total.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -316.16424560546875, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -247.57620239257812, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 129.48809814453125, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 120.33270263671875, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -118.51016235351562, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Almagro' AND u.email = 'julieta.sosa@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-135-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-135-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-135-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'julieta.sosa@nidio.app'
  AND p.title = 'VENTA HERMOSO DEPARTAMENTO EN ALMAGRO'
  AND p.address = 'POTOSI 4276, Comuna 5, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - Parque Patricios', 'APARTMENT', 'SALE', n.id, 'LOS PATOS 2885, Comuna 4, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.40274200876947, -34.64034826167304), 4326), 26.0, 30.0, 1.0, 1.0, 78000, 'OPORTUNIDAD, IDEAL INVERSION!!! <br><br>Departamento a  ESTRENAR de 1 ambiente al frente con balcón aterrazado <br>living comedor cocina de 6.60 x 2.75 mts,   hall 1.60x1.80, Balcón de 1,35 x 2.75 mts y Baño completo con bañera 2.30x1.60<br>Contará con excelentes detalles de terminación y calidad.<br>Unidad ubicada en quinto piso en edificio de nueve pisos  de muy buena categoría<br>AMENITIES<br> Solarium, SUM y Laundry. Todas las unidades con vista externa y balcones salientes corridos.<br>ESPECIFICACIONES TECNICAS<br>Doble pared exterior. Muros divisorios entre Unidades Funcionales de ladrillos macizos. Revestimientos de Porcellanato pulido marca Cerro Negro o similar de grandes medidas. Puertas de seguridad modelo Pentahome marca Pentágono o similar. Ventanas de carpintería integral de aluminio. Instalación interna de cañerías de cobre, eléctrica y desagües de condensado para la posterior instalación de equipos Split frio - calor.<br>Obra ya iniciada, con posibilidad de recibir pesos. <br>FINANCIACION!<br>', u.id, 'OWNER', true, 65.57, 'NEW', false, false, true, false, false, false, false, 37643.54596325196, 64798.766325771474, 'El rango de precio esperado para esta propiedad va de 37644 a 64799 USD, con una prediccion central de 50957 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie y la superficie cubierta. Bajan el precio: el precio de referencia de mercado en la zona y la superficie total.', '[{"factor": "el barrio/zona", "contribution": -582.0396118164062, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -484.6903076171875, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 329.2330322265625, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -193.08334350585938, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 182.25338745117188, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Parque Patricios' AND u.email = 'agustin.molina@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-136-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-136-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-136-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'agustin.molina@nidio.app'
  AND p.title = 'Departamento - Parque Patricios'
  AND p.address = 'LOS PATOS 2885, Comuna 4, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'PH - Belgrano', 'PH', 'SALE', n.id, 'MUNICH 1799, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4539159109022, -34.5553974960321), 4326), 75.0, 75.0, 3.0, 2.0, 265000, 'PH MODERNO ENTRDA INDEPENDIENTE, NUEVO(10 AÑOS), FUNCIONAL, MUY LUMINOSO, ENTRADA INDEPENDIENTE BUENA DISTRIBUCIÓN.<br>Dormitorio principal en suite y balcón, segundo dormitorio en PB.<br>Un simpatico escritorio y dos baños completos uno por planta.<br>La cocina integrada al living crea un espacio ideal para la actividad social.<br>Buenos espacios de guardado. Superficie: 74 - (64 cubiertos y 10 descubiertos).<br>Administracion de consorcio propia.<br>MUY LINDA PROPIEDAD<br><br>', u.id, 'AGENCY', true, 32.79, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 187620.55586329472, 310456.81960523163, 'El rango de precio esperado para esta propiedad va de 187621 a 310457 USD, con una prediccion central de 250790 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: el barrio/zona. Bajan el precio: el tipo de propiedad (PH), las expensas y la superficie.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 744.01806640625, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 314.3852233886719, "direction": "sube el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -273.8145102262497, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -202.34234619140625, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -139.44949340820312, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'belgrano.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-137-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-137-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-137-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'belgrano.propiedades@nidio.app'
  AND p.title = 'PH - Belgrano'
  AND p.address = 'MUNICH 1799, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'EXCELENTE 2 AMBIENTES EN TORRE FULL AMENITIES', 'APARTMENT', 'RENT', n.id, 'REPUBLICA DE LA INDIA 2993, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.41484448049208, -34.578364925050494), 4326), 59.0, 59.0, 2.0, 1.0, 1000000, 'EXCELENTE 2 AMBIENTES CON BALCON Y COCHERA EN TORRE A ESTRENAR. 
<br>EDIFICIO DE 21 PISOS. 
<br>CALEFACCION POR LOSA INDIVIDUAL, AGUA CALIENTE CENTRAL Y AIRE ACONDICIONADO CON EQUIPO PROPIO.-
<br>CARACTERISTICAS DEL EDIFICIO:
<br>- 2 ascensores principales y un ascensor camillero. 
<br>- Moderno diseño con dos subsuelos de cocheras y bauleras, con construcción tradicional de primer nivel. 
<br>- Salón de Usos Múltiples. 
<br>- Guest Room 
<br>- Vestuarios, Gimnasio, Sala de masajes, Relax y Sauna 
<br>- Sky Club con Terraza-Mirador e hidromasaje 
<br>- Sky living 
<br>- Casilla de Vigilancia. 
<br>- Vestuarios para personal de mantenimiento y mucamas. 
<br>- Laundry general. 
<br>- Sala de Ensayo 
<br>- áreas de esparcimiento 
<br>- Sector Juego de Niños 
<br>- Pileta Climatizada 16,30 x 3,65 mts 
<br>- Sector Parrillas 
<br>- Bicicletas Town House', u.id, 'AGENCY', true, 229.51, 'NEW', false, true, true, true, false, false, false, 487.2056177098664, 1051.9397665244712, 'El rango de precio esperado para esta propiedad va de 487 a 1052 USD/mes, con una prediccion central de 733 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona, el estado de la propiedad (a estrenar), la cochera y los amenities del edificio.', '[{"factor": "la superficie", "contribution": -268.2547607421875, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 116.73641967773438, "direction": "sube el precio"}, {"factor": "el estado de la propiedad (a estrenar)", "contribution": 83.0155491232872, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 71.9071273803711, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 71.87260437011719, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-138-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-138-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-138-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'EXCELENTE 2 AMBIENTES EN TORRE FULL AMENITIES'
  AND p.address = 'REPUBLICA DE LA INDIA 2993, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA  2 AMBIENTES, BALVANERA OPORTUNIDAD', 'APARTMENT', 'SALE', n.id, 'AGRELO 3297, Comuna 3, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.41265324481429, -34.61806531572865), 4326), 56.0, 56.0, 2.0, 1.0, 52000, 'Venta de departamento.<br><br>*Edificio tradicional de la ciudad, se accede al departamento subiendo un piso por escalera y nos encontramos con un amplio living comedor. La cocina con muebles bajo mesada recientemente refaccionada. Lavadero con espacio para lavarropas. Hall de distribución con placard .Baño con bañadera hecho a nuevo. Aire acondicionado y estufa tiro balanceado. Todos los ambientes son muy luminosos y aireados. Terraza de uso común<br><br>*Cercano a multiples lineas de colectivos<br>', u.id, 'OWNER', true, 34.1, 'USED_GOOD_CONDITION', false, false, false, false, true, false, true, 66594.2922349645, 109880.02536073269, 'El rango de precio esperado para esta propiedad va de 66594 a 109880 USD, con una prediccion central de 88771 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Bajan el precio: el barrio/zona, las expensas, la cochera y la superficie total.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -575.4420166015625, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -432.0315246582031, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -146.18408203125, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -82.44190216064453, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -76.90327453613281, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Balvanera' AND u.email = 'florencia.acosta@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-139-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-139-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-139-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'florencia.acosta@nidio.app'
  AND p.title = 'VENTA  2 AMBIENTES, BALVANERA OPORTUNIDAD'
  AND p.address = 'AGRELO 3297, Comuna 3, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 1 ambiente en Venta en Palermo', 'APARTMENT', 'SALE', n.id, 'DARWIN 1416, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43698721333099, -34.58807188828926), 4326), 34.0, 34.0, 1.0, 1.0, 87000, 'DEPARTAMENTO MONOAMBIENTE AL FRENTE A ESTRENAR EDIFICIO DE CATEGORIA.Cuentan con amplios balcones con parrilla y ventanales en todos sus ambientesque permiten una luminosidad natural.Al frente, cuenta con un living rooftop con fogón, terraza verdey vistas a la ciudad.Cuenta también con una piscina de diseño con revestimientos exclusivos y solárium.Todas las unidades cuentan con calefacción por piso radiante y agua caliente, ambosde consumo individualizado. Pisos de madera natural prefinished y porcelanato de alta calidad.Parrilla y deck en los balcones. Carpinterías DVH para aislar temperatura y sonido exterior.Moderno hall de acceso con doble puerta.· Portero eléctrico con cámara.· Fachada de hormigón visto y vidrio en equilibrio natural.· En su mayoría, balcones con parrilla y barandas de vidrio templado.· Salón de usos múltiples temático, con toilette, cocina y parrilla.· Piscina con solárium.· Living rooftop con fogón y terraza verde.· Cocheras cubiertas (opcional).· Bauleras en primer subsuelo (opcional).· Dormitorios y living con pisos de madera prefinished para mayor diseño y calidez.· Deck de Hormigón premoldeado simil-madera en balcones.· Pisos y revestimientos de porcelanato de primera calidad en cocinas y baños.· Sanitarios, bachas y griferías de vanguardia.· Mesadas en baños y toilletes de mármol carrara con bachas incorporadas.· Diseño moderno de muebles de cocina y placares. Interiores completos y herrajes de primera calidad.· Anafes y hornos eléctricos. Preinstalación para campanas de extracción con salida de humos al exterior· Mesadas de cocina en granito negro Brasil, silestone o similar.· Amplias piletas de cocina de acero inoxidable marca Johnson o similar.· Puertas laqueadas con herrajes de bronce platil de primera línea.· Carpinterías de aluminio A40 o similar DVH (doble vidrio con cámara de aire), que optimizan la aislación térmica y acústica de los ambientes.· Agua caliente y calefacción consumo individualizado.· Calefacción por piso radiante.· Instalación preparada para Aire Acondicionado - multisplit.· Ascensor electromecánico de última generación con puertas automáticas, cabinas en acero inoxidable con detalles de revestimientos y espejos.· Preinstalación para circuito de cámaras de seguridad CCTV y alarma.· Preinstalación para TV, TE e internet con conexiones en cocina, living y dormitorios.· Ascensor monta-coches para cocheras a 1SS.', u.id, 'AGENCY', true, 98.36, 'NEW', true, false, true, false, true, false, false, 79089.39987747138, 137552.10880116644, 'El rango de precio esperado para esta propiedad va de 79089 a 137552 USD, con una prediccion central de 107896 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: los amenities del edificio y la superficie. Bajan el precio: la superficie total y la cantidad de banos.', '[{"factor": "el barrio/zona", "contribution": 430.3193359375, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -285.4300842285156, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": 221.107421875, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 216.12307739257812, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": -159.39913940429688, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'palermohollywood.propiedades@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-140-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-140-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-140-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'palermohollywood.propiedades@nidio.app'
  AND p.title = 'Departamento de 1 ambiente en Venta en Palermo'
  AND p.address = 'DARWIN 1416, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 4 ambientes en Venta en Villa crespo', 'APARTMENT', 'SALE', n.id, 'GURRUCHAGA 902, Comuna 15, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43703054354644, -34.59432485892985), 4326), 118.0, 181.0, 4.0, 3.0, 170000, 'Espectacular departamento, al frente, en venta en Villa Crespo, living-comedor con piso tarugado, cocina con salida al patio con lavadero, 3 dormitorios (2 con placard) y el 3ro con baño completo en suite, 2do baño completo con ducha y balcón con cerramiento .  En la misma planta patio de 27 m2 con parrilla. Terraza a cielo abierto de 80 m2, con hermoso quincho de 25 m2,  pileta  con deck de madera y ducha  y amplio espacio para tomar sol, quincho de 25 m2 , 2do lavadero, 3er baño y espacio disponible para  dependencia de servicio. 2do. piso por escalera!!! y MUY BIEN UBICADO !!! ', u.id, 'OWNER', true, 229.51, 'USED_GOOD_CONDITION', true, false, false, false, false, false, false, 269368.98173257755, 426005.92075963324, 'El rango de precio esperado para esta propiedad va de 269369 a 426006 USD, con una prediccion central de 347514 USD. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: la cantidad de banos, la superficie total y el precio de referencia de mercado en la zona. Bajan el precio: el barrio/zona.', '[{"factor": "la superficie", "contribution": -262.4968566894531, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 242.87977600097656, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -240.98789978027344, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 200.07398986816406, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 179.00013732910156, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Crespo' AND u.email = 'ignacio.medina@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-141-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-141-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-141-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'ignacio.medina@nidio.app'
  AND p.title = 'Departamento de 4 ambientes en Venta en Villa crespo'
  AND p.address = 'GURRUCHAGA 902, Comuna 15, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Monoambiente excelente estado', 'APARTMENT', 'RENT', n.id, 'CANUELAS 237, Comuna 15, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.44679183767088, -34.59726670920203), 4326), 21.0, 21.0, 1.0, 1.0, 650000, 'ALQUILER! Monoambiente de 21 mts en inmejorable ubicación! Lavalleja 245, Villa Crespo. A menos de una cuadra de Av. Corrientes y dos de Av. A. Gallardo. <br>Super luminoso!!! Piso 8. <br>Cocina independiente. Baño completo. Pisos de parquet. <br><br><br>Edificio con PILETA en PB.<br>', u.id, 'OWNER', true, 59.02, 'USED_GOOD_CONDITION', true, false, true, false, true, false, false, 453.28987999756976, 743.5700299544927, 'El rango de precio esperado para esta propiedad va de 453 a 744 USD/mes, con una prediccion central de 569 USD/mes. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: la pileta. Bajan el precio: la superficie, el barrio/zona y la superficie total.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 266.8290100097656, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -257.5293884277344, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -115.66559600830078, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -72.75082397460938, "direction": "baja el precio"}, {"factor": "la pileta", "contribution": 54.97807312011719, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Crespo' AND u.email = 'antonella.herrera@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-142-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-142-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-142-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'antonella.herrera@nidio.app'
  AND p.title = 'Monoambiente excelente estado'
  AND p.address = 'CANUELAS 237, Comuna 15, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - Villa Devoto', 'APARTMENT', 'RENT', n.id, 'DESEADO 5274, Comuna 11, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.51868759725521, -34.618530495765675), 4326), 38.0, NULL, 1.0, 1.0, 780000, 'Excelente y amplio mono ambiente al frente  PB.Super Luminoso y Moderno.<br>Cocina equipada con spar, bacha de acero inoxidable, alacenas y muebles bajo mesada en nogal habana, pisos de porcelanato, baño completo con deposito de doble descarga.<br>Edificio cuenta con amplio Sum, Parrillas y Terraza Verde.<br>No se aceptan mascotas.<br>', u.id, 'OWNER', true, 80.0, 'USED_GOOD_CONDITION', false, false, true, false, true, false, false, 296.3520795287244, 539.4029786524586, 'El rango de precio esperado para esta propiedad va de 296 a 539 USD/mes, con una prediccion central de 393 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona y los amenities del edificio. Bajan el precio: el barrio/zona y la superficie total.', '[{"factor": "la superficie", "contribution": -237.88014221191406, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -110.24440002441406, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 98.2645263671875, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 63.023048400878906, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -59.921424865722656, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Devoto' AND u.email = 'franco.suarez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-143-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-143-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-143-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'franco.suarez@nidio.app'
  AND p.title = 'Departamento - Villa Devoto'
  AND p.address = 'DESEADO 5274, Comuna 11, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Monoambiente ', 'APARTMENT', 'RENT', n.id, 'PASO 316, Comuna 3, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.40354828478784, -34.60613796065421), 4326), 30.0, 30.0, 1.0, 1.0, 380000, 'Departamento independiente. en residencia estudiantil. ! - Apartamento hasta 3 personas. - Cama de 1 plaza (para cada uno) - Escritorio (uno por persona) con sus respectivas sillas. - Mesa de Luz. - Placares. - Baño Privado. - Tv smart. - Wifi. - Cocina. - Heladera.', u.id, 'OWNER', true, 196.72, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 216.76528222572801, 362.26369835084745, 'El rango de precio esperado para esta propiedad va de 217 a 362 USD/mes, con una prediccion central de 281 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Bajan el precio: el barrio/zona, la superficie total, la cantidad de banos y la superficie cubierta.', '[{"factor": "la superficie", "contribution": -172.19284057617188, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -119.98204040527344, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -78.13504791259766, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -37.96449279785156, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -36.24921798706055, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Balvanera' AND u.email = 'milagros.castro@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-144-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-144-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-144-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'milagros.castro@nidio.app'
  AND p.title = 'Monoambiente '
  AND p.address = 'PASO 316, Comuna 3, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento  2 ambientes y 1/2 con cochera - Caballito', 'APARTMENT', 'SALE', n.id, 'SAN JOSE DE CALASANZ 716, Comuna 6, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4374022476187, -34.62744607009197), 4326), 58.0, 62.0, 2.0, 1.0, 140000, 'Semipiso de 2 ambientes y 1/2 con cochera en Caballito. <br>Excelente ubicación <br>El departamento es un semipiso cómodo al frente. La propiedad se destaca por su luminosidad y distribución. Tiene un living comedor cómodo, una cocina separada con lavadero independiente ,  dormitorio con placard ( mas placard de apoyo en el hall ) y baño completo con ventilación. <br>Tiene cochera en planta baja. <br>Puerta blindada. <br>Excelente estado !', u.id, 'OWNER', true, 345.57, 'NOT_SPECIFIED', false, true, false, false, true, false, false, 164470.7050046968, 269648.80037493765, 'El rango de precio esperado para esta propiedad va de 164471 a 269649 USD, con una prediccion central de 220979 USD. El factor que mas influye en esta prediccion es la cochera, que sube el precio. Tambien suben el precio: las expensas, el precio de referencia de mercado en la zona y la superficie cubierta. Bajan el precio: el barrio/zona.', '[{"factor": "la cochera", "contribution": 346.9078369140625, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": 327.98681640625, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 274.3984375, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -117.48070526123047, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 89.94497680664062, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Caballito' AND u.email = 'joaquin.ortiz@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-145-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-145-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-145-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'joaquin.ortiz@nidio.app'
  AND p.title = 'Departamento  2 ambientes y 1/2 con cochera - Caballito'
  AND p.address = 'SAN JOSE DE CALASANZ 716, Comuna 6, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'PH 2 ambientes con balcon a estrenar en Villa Luro', 'PH', 'SALE', n.id, 'GARCIA DE COSSIO 5573, Comuna 10, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.509006455475976, -34.64033257107045), 4326), 45.0, 49.0, 2.0, 1.0, 110000, 'Excelente PH de Dos Ambientes con Balcón/ sin expensas!!!<br><br>Hermoso y super luminoso PH de dos ambientes 45 m2 cubiertos/49 m2 totales.<br><br>Primer piso por escalera.<br><br>Cocina Integrada de 2.85m de largo,o<br><br>Living Comedor 5.15 m x 5.36 m con detalles de terminación en cielorraso.<br><br>Amplio baño de 1.5m x 2.95 m.<br><br>Dormitorio con iluminación natural por pulmón de 3.55m x 2.85m. con placard completo.<br><br>Balcon de 1 m x 4m<br><br><br>Detalles:<br><br>Paredes de yeso de ultima generación super resistentes.<br><br>Molduras de terminación y spot led en cielorraso.<br><br>Revestimientos de 1era calidad.<br><br>Griferia Fv y Piazza.<br><br>Accesorios Capea/ Ferrum.<br><br>Termotanque a Gas.<br><br>Cocina completa marca Domec a Gas.<br><br>Mesada Verde UbaTuba.<br><br>Sin ascensor<br><br>Honorarios de gestión inmobiliaria: 4% de la operación, + IVA<br>AVISO LEGAL: Venta supeditada al cumplimiento por parte del propietario de los requisitos de la Resolución General 2371 de la AFIP.<br>Las descripciones arquitectónicas y funcionales, valores de expensas, impuestos y servicios, fotos y medidas de este inmueble son aproximados. Las medidas son orientativas, las definitivas saldrán del título de propiedad.<br><br>Los datos fueron proporcionados por el propietario y pueden no estar actualizados a la hora de la visualización de este aviso por lo cual pueden arrojar inexactitudes y discordancias con las que surgen de los las facturas, títulos y planos legales del inmueble.<br><br><br><br><br>La información aquí contenida fue obtenida de los propietarios o de otras fuentes que juzgamos confiables. No poseemos razón para dudar de la exactitud, pero no la garantizamos. Esta información no deberá ser considerada como una oferta vinculante. Todas las propiedades están sujetas a cambios o retiros previo sin aviso. Matrícula CUCICBA No. 6853', u.id, 'OWNER', true, 13.11, 'NEW', false, false, false, false, true, false, false, 73767.48684087039, 130589.81741963259, 'El rango de precio esperado para esta propiedad va de 73767 a 130590 USD, con una prediccion central de 104162 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie y la superficie cubierta. Bajan el precio: el tipo de propiedad (PH) y las expensas.', '[{"factor": "el barrio/zona", "contribution": -259.5466613769531, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 155.25364685058594, "direction": "sube el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -146.4214230775833, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 129.0630645751953, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -113.64484405517578, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Luro' AND u.email = 'rocio.aguirre@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-146-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-146-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-146-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'rocio.aguirre@nidio.app'
  AND p.title = 'PH 2 ambientes con balcon a estrenar en Villa Luro'
  AND p.address = 'GARCIA DE COSSIO 5573, Comuna 10, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA ESPECTACULAR PH DE 4 AMBIENTES CON INMENSA TERRAZA Y QUINCHO EN CABALLITO', 'PH', 'SALE', n.id, 'DR GREGORIO ARAOZ ALFARO 300, Comuna 6, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4352706797689, -34.6151724676878), 4326), 189.0, 189.0, 4.0, 2.0, 185000, 'VENTA HERMOSO PH DE 4 AMBIENTES CON ENORME TERRAZA,QUINCHO CERRADO Y PATIO EN 189 MTS TOTALES<br><br>NO PAGA EXPENSAS!!<br><br>OPORTUNIDAD INCREIBLE!!!<br><br>La PB consta de<br><br>:-Living Comedor super amplio y luminoso con Equipo Split de Aire Acondicionado<br><br>-Patio abierto muy pintoresco<br><br>-Cocina Independiente separada del Living con Gran Barra<br><br>-Muchisimo lugar de guardado en Alacenas y Bajo Mesada<br><br>-Horno Industrial<br><br>-Gran Espacio para Comedor Diario<br><br>-Lavadero Independiente<br><br>-Toilette de Recepción<br><br>-Baulera<br><br>PRIMER PLANTA:<br><br>-3 Cómodos Dormitorios de generosas dimensiones con Placares grandes y Equipo Split de Aire Acondicionado.<br><br>-Piso de Madera Flotante en cada ambiente<br><br>-Precioso Balcón con mesa y sillas de madera en Dormitorio Principal<br><br>-Baño Completo<br><br>-Escritorio<br><br>-Patio interno<br><br>SEGUNDA PLANTA:<br><br>-Inmensa Terraza de 49 Mts<br><br>- Amplio Quincho Cerrado Super luminoso con Ventana que da a la Terraza<br><br>-Gran Parrilla, Equipo Split de Aire Acondicionado y Calefón Eléctrico<br><br>-Lugar de Guardado en Alacenas y Bajo Mesada<br><br>-Mesa y Sillas de Madera para 12/14 personas aproximadamente<br><br>Estufas de Tiro Balanceado en todos los Ambientes<br><br>PROPIEDAD SUPER LUMINOSA!!!<br><br>EXCELENTE UBICACION CERCA DE VARIAS AVENIDAS Y RODEADA DE MEDIOS DE TRANSPORTE<br><br>BARRIO MUY TRANQUILO!<br><br><br>', u.id, 'OWNER', true, NULL, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 269247.4667791556, 441429.7149082985, 'El rango de precio esperado para esta propiedad va de 269247 a 441430 USD, con una prediccion central de 361755 USD. El factor que mas influye en esta prediccion es el tipo de propiedad (PH), que baja el precio. Tambien suben el precio: la superficie total. Bajan el precio: la superficie, la superficie cubierta y el barrio/zona.', '[{"factor": "el tipo de propiedad (PH)", "contribution": -458.55509090423584, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -436.14666748046875, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -320.3294982910156, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 242.18499755859375, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -203.25270080566406, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Caballito' AND u.email = 'emiliano.rojas@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-147-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-147-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-147-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'emiliano.rojas@nidio.app'
  AND p.title = 'VENTA ESPECTACULAR PH DE 4 AMBIENTES CON INMENSA TERRAZA Y QUINCHO EN CABALLITO'
  AND p.address = 'DR GREGORIO ARAOZ ALFARO 300, Comuna 6, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Lujoso 4 Ambientes', 'APARTMENT', 'RENT', n.id, 'GELLY 3376, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.405128154979394, -34.57710262796361), 4326), 140.0, 140.0, 4.0, 3.0, 5337500, 'Hermoso 4 ambientes mas dependencia con increíble vista al río. Enmarcado por los espacios verdes más amplios de la ciudad. Sobre un terreno de 5800 m2 con todos los Servicios y Amenities! - Amplio Living/Comedor apaisado. - Balcón con increíbles vistas. - Toilette. - 3 Dormitorios. El Principal en Suite. - Baño completo. - Cocina independiente. - Dependencia con baño. - Lavadero. - Cochera fija y cubierta. - Doble circulación. - Entrada Principal y de Servicio. - Grandes Ventanales con excelentes vistas. Amenities Y servicios: • Cancha de Fútbol. • Cancha de Tenis. • Cancha de Paddle. • Piscina adultos con solarium. • Piscina niños. • Gimnasio. • Vestuarios y Sauna. • Quincho con parrilla. • Salón usos múltiples. • Juegos de niños en jardín. • Sala de niños. • Lavadero de autos. • Vestuario para personal. • Laundry. • Conserjería, seguridad y control. • Estacionamiento de cortesía. • ', u.id, 'OWNER', true, 852.46, 'NOT_SPECIFIED', false, true, true, false, false, false, false, 2098.3817325317095, 4530.67680166431, 'El rango de precio esperado para esta propiedad va de 2098 a 4531 USD/mes, con una prediccion central de 3158 USD/mes. El factor que mas influye en esta prediccion es las expensas, que sube el precio. Tambien suben el precio: la superficie, los amenities del edificio, el barrio/zona y la superficie total.', '[{"factor": "las expensas", "contribution": 906.9736328125, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 669.4141845703125, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 280.88031005859375, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 170.33316040039062, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 161.73902893066406, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'constanza.silva@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-148-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-148-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-148-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'constanza.silva@nidio.app'
  AND p.title = 'Lujoso 4 Ambientes'
  AND p.address = 'GELLY 3376, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA Monoambiente con Balcón - Flores', 'APARTMENT', 'SALE', n.id, 'DR JUAN F ARANGUREN 2451, Comuna 7, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.46592952283247, -34.623298309888895), 4326), 29.0, 32.0, 1.0, 1.0, 45000, '<br><br>Luminoso y cómodo monoambiente de 32, 6 metros totales con Balcón al pulmón del edificio.<br>El Balcón cuenta con espacio para lavarropas. <br>El ambiente un Aire Acondicionado.<br>Cocina integrada con anafe eléctrico y espacio de guardado!<br>Baño completo con bañadera<br>Muy buena ubicación. <br>Cerca de todos los medios de transporte.<br>', u.id, 'OWNER', true, 56.39, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 42722.717613566245, 72060.16690832263, 'El rango de precio esperado para esta propiedad va de 42723 a 72060 USD, con una prediccion central de 59119 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la superficie y la superficie cubierta. Bajan el precio: el barrio/zona y la superficie total.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -521.3870239257812, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 369.36810302734375, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -347.7351989746094, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -169.02105712890625, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 151.22091674804688, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Flores' AND u.email = 'bautista.nunez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-149-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-149-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-149-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'bautista.nunez@nidio.app'
  AND p.title = 'VENTA Monoambiente con Balcón - Flores'
  AND p.address = 'DR JUAN F ARANGUREN 2451, Comuna 7, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 5 ambientes en Venta', 'APARTMENT', 'SALE', n.id, 'THOMPSON 504, Comuna 6, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.439257879144506, -34.624902255465145), 4326), 200.0, 210.0, 5.0, 2.0, 280000, 'Excelente Piso de 5 ambientes con cochera y baulera grande, con 200 m2 totales, totalmente refaccionado a nuevo!, se compone de 4 dormitorios amplios, 2 baños completos (1 en suite con jacuzzi c/ hidromasajes), 1 baño de servicio y 1 toilette, cocina completa muy amplia con comedor diario, living muy amplio y comodo todo luz!, todos los ambientes con mucho espacio y super luminosos!, balcon corrido al frente aterrazado, y balcon al contrafrente con cerramiento lo que permite ampliar dormitorios. Sistema de calefaccion por losa radiante, la propiedad tiene termotanque para los baños y calefon para la cocina, piso alisado de cemento en toda la propiedad y madera solo en living. La puerta principal de ingreso es de seguridad blindada. Doble circulacion en toda la propiedad.', u.id, 'OWNER', true, 327.87, 'USED_GOOD_CONDITION', false, true, false, false, true, false, false, 385208.7847381053, 631547.646710406, 'El rango de precio esperado para esta propiedad va de 385209 a 631548 USD, con una prediccion central de 517558 USD. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona, la superficie total y la cochera. Bajan el precio: la superficie cubierta.', '[{"factor": "la superficie", "contribution": -520.2695922851562, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 306.8848876953125, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": -297.83026123046875, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 209.3081817626953, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 203.7485809326172, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Caballito' AND u.email = 'abril.cabrera@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-150-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-150-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-150-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'abril.cabrera@nidio.app'
  AND p.title = 'Departamento de 5 ambientes en Venta'
  AND p.address = 'THOMPSON 504, Comuna 6, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento - San Telmo', 'APARTMENT', 'RENT', n.id, 'DEFENSA 1766, Comuna 1, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.37070935278913, -34.62882625293259), 4326), 75.0, 75.0, 3.0, 1.0, 850000, 'Excelente departamento de 3 ambientes luminoso - living comedor con salida a balcón a la calle- cocina con lavadero - ambos dormitorios con placares - pisos de parquet - baño completo y bañera con mampara de vidrio - termotanque - el edificio cuenta con 2 ascensores - 3 departamentos por piso. Parques y universidades cercanas - Linea C de subte y metrobus cercano - Zona gastronómica.<br><br>Requisitos :<br>1 mes de alquiler - 1 mes de deposito y firmas en escribanía<br>El Contrato es x 3 años y el aumento es por año según Ley<br><br>Documentación :<br>Garantía propietaria y recibos de sueldo<br>', u.id, 'OWNER', true, 132.46, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 240.53879463719971, 511.1256955468534, 'El rango de precio esperado para esta propiedad va de 241 a 511 USD/mes, con una prediccion central de 366 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Bajan el precio: el barrio/zona, la cantidad de banos, que este amoblado y el precio de referencia de mercado en la zona.', '[{"factor": "la superficie", "contribution": -101.53445434570312, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -77.30619049072266, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -41.025909423828125, "direction": "baja el precio"}, {"factor": "que este amoblado", "contribution": -35.95342254638672, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -31.019285202026367, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'San Telmo' AND u.email = 'santino.peralta@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-151-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-151-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-151-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'santino.peralta@nidio.app'
  AND p.title = 'Departamento - San Telmo'
  AND p.address = 'DEFENSA 1766, Comuna 1, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta - Departamento de 2 ambientes c/balcón y baño en suite - Villa Crespo', 'APARTMENT', 'SALE', n.id, 'LOYOLA 519, Comuna 15, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43548614662203, -34.59599246237245), 4326), 46.0, 50.0, 2.0, 1.0, 160000, 'Departamento de 2 ambientes con  baño en suite y balcón en 5° piso "C"<br><br>Edificio de 10 pisos  con alto poder de reventa y cotización en el mercado<br>Detalles de categoría y calidad. <br><br>SUM en Terraza con espacio verde, Cocheras en PB,  Laundry y Parrilla<br>Excelente relación precio-calidad<br>', u.id, 'OWNER', true, NULL, 'NEW', false, true, true, false, false, false, false, 113263.54883717957, 179125.82993237372, 'El rango de precio esperado para esta propiedad va de 113264 a 179126 USD, con una prediccion central de 146122 USD. El factor que mas influye en esta prediccion es la cochera, que sube el precio. Tambien suben el precio: el precio de referencia de mercado en la zona, la superficie cubierta y la superficie. Bajan el precio: el barrio/zona.', '[{"factor": "la cochera", "contribution": 264.072509765625, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -262.0609436035156, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 143.97816467285156, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 135.0006866455078, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 132.93350219726562, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Crespo' AND u.email = 'delfina.vega@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-152-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-152-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-152-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'delfina.vega@nidio.app'
  AND p.title = 'Venta - Departamento de 2 ambientes c/balcón y baño en suite - Villa Crespo'
  AND p.address = 'LOYOLA 519, Comuna 15, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Monoambiente en Alquiler - Flores', 'APARTMENT', 'RENT', n.id, 'AGUSTIN DE VEDIA 2700, Comuna 7, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4305895487044, -34.6497569750169), 4326), 30.0, 30.0, 1.0, 1.0, 550000, 'Monoambiente en Alquiler con Cochera.<br>Medidas:<br><br>Ambiente: 5,20x4,40<br>Cocina: 1,50x1,60<br>Baño: 2,20x1,50 <br><br><br>
<br>', u.id, 'OWNER', true, 157.38, 'NOT_SPECIFIED', false, true, false, false, false, false, false, 292.92401027859705, 478.82496579336095, 'El rango de precio esperado para esta propiedad va de 293 a 479 USD/mes, con una prediccion central de 385 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona y la cochera. Bajan el precio: el barrio/zona y la superficie total.', '[{"factor": "la superficie", "contribution": -181.84002685546875, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -137.2334747314453, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -84.67666625976562, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 71.22825622558594, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 57.14857482910156, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Flores' AND u.email = 'maximiliano.paz@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-153-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-153-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-153-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'maximiliano.paz@nidio.app'
  AND p.title = 'Monoambiente en Alquiler - Flores'
  AND p.address = 'AGUSTIN DE VEDIA 2700, Comuna 7, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'OPORTUNIDAD, PH 4 AMB CON TERRAZA PROPIA', 'PH', 'SALE', n.id, 'CESPEDES 3984, Comuna 15, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.45799651752796, -34.58424337879258), 4326), 126.0, NULL, 4.0, 2.0, 170000, '#OPORTUNIDAD#    PH DE 4 AMBIENTES AL FRENTE CON BALCÓN Y TERRAZA PROPIA CON PARRILLA !!!

2 PLANTAS, EN 2DO PISO: AL FRENTE Y APAISADO LIVING COMEDOR CON DOBLE VENTANAL AL BALCÓN CON PISOS DE PINOTEA, TOILETTE, COCINA COMPLETA CON BARRA, COMEDOR DIARIO APARTE O ESCRITORIO Y DEPENDENCIA DE SERVICIO. EN 3ER PISO: HALL DE DISTRIBUCIÓN, BAÑO COMPLETO, 3 DORMITORIOS CON PLACARD Y SALIDA A LA TERRAZA PROPIA CON PARRILLA DE 15 M2.  

UN POCO DE PINTURA Y ENTRAR A VIVIR.', u.id, 'OWNER', true, NULL, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 252817.79300699919, 412063.32714593434, 'El rango de precio esperado para esta propiedad va de 252818 a 412063 USD, con una prediccion central de 337962 USD. El factor que mas influye en esta prediccion es el tipo de propiedad (PH), que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona. Bajan el precio: la superficie, el barrio/zona y los amenities del edificio.', '[{"factor": "el tipo de propiedad (PH)", "contribution": -254.3609495162964, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 187.60105895996094, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -186.7389373779297, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -130.64767456054688, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": -78.3660659790039, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Chacarita' AND u.email = 'catalina.benitez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-154-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-154-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-154-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'catalina.benitez@nidio.app'
  AND p.title = 'OPORTUNIDAD, PH 4 AMB CON TERRAZA PROPIA'
  AND p.address = 'CESPEDES 3984, Comuna 15, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'PH RETASADO 3 AMB  EDIFICABLE, SE ACEPTA PERMUTA!!', 'PH', 'SALE', n.id, 'HAITI 4064, Comuna 10, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.490088910198224, -34.62426610706603), 4326), 100.0, 157.0, 4.0, 1.0, 139000, 'Entramos y nos encotramos con un pasillo BIEN  ancho, con lugar de guardado en mitad de acceso a la casa, llegamos a un patio con una hermosa enredadera y un arbol.  Entrada por la cocina, si bien hay acceso por todos los cuartos, ya  que los mismos dan al patio,entramos por la cocina comedor con muebles bajo y sobre mesada,  cuartos con piso de pinotea original, ambientes super generosos, en el domirtorio principal tenemos un entrepiso que funciona como estudio,baño del tamaño del un cuarto. Terraza, parrilla.<br>UNICO!!!<br>', u.id, 'OWNER', true, NULL, 'NOT_SPECIFIED', false, false, false, false, false, false, true, 131286.58147593337, 214915.70600560703, 'El rango de precio esperado para esta propiedad va de 131287 a 214916 USD, con una prediccion central de 170072 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie total. Bajan el precio: el precio de referencia de mercado en la zona, la superficie y el tipo de propiedad (PH).', '[{"factor": "el barrio/zona", "contribution": -530.85791015625, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -341.32171630859375, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -270.12359619140625, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 266.63897705078125, "direction": "sube el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -201.484610080719, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Floresta' AND u.email = 'lucia.fernandez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-155-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-155-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-155-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'lucia.fernandez@nidio.app'
  AND p.title = 'PH RETASADO 3 AMB  EDIFICABLE, SE ACEPTA PERMUTA!!'
  AND p.address = 'HAITI 4064, Comuna 10, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT ' BELGRANO - ALQUILER - DOS AMBIENTES EXCELENTE UBICACIÓN', 'APARTMENT', 'RENT', n.id, 'LEOPOLDO BASAVILBASO 975, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.44446813349106, -34.54835243200972), 4326), 31.0, 31.0, 2.0, 1.0, 580000, 'Departamento de dos ambientes con buena distribución, luminoso y en excelente ubicación en Belgrano. Se ingresa a un amplio living comedor con balcón francés. Cocina independiente y amplia con espacio para lavadero o desayunador. Dormitorio principal con generoso placard de techo a piso con buen espacio de guardado. Un baño completo. La unidad se encuentra en excelente estado de mantenimiento y recien pintada, pisos de parquet. Edificio de buena categoría, apto profesional. Inmejorable ubicación en Belgrano. No apto mascotas.Se requiere garantía propietaria de CABA y acreditación de ingresos.', u.id, 'OWNER', true, 88.52, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 168.4060057386652, 349.7844300910284, 'El rango de precio esperado para esta propiedad va de 168 a 350 USD/mes, con una prediccion central de 260 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Bajan el precio: la superficie total, la cantidad de banos, la superficie cubierta y los amenities del edificio.', '[{"factor": "la superficie", "contribution": -245.80569458007812, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -99.08037567138672, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -42.23471450805664, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -39.91023254394531, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": -27.119007110595703, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'martin.gomez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-156-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-156-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-156-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'martin.gomez@nidio.app'
  AND p.title = ' BELGRANO - ALQUILER - DOS AMBIENTES EXCELENTE UBICACIÓN'
  AND p.address = 'LEOPOLDO BASAVILBASO 975, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en Venta en San cristobal, Capital federal', 'APARTMENT', 'SALE', n.id, 'DANEL 1489, Comuna 3, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.41093200754257, -34.62883154358355), 4326), 30.0, NULL, 2.0, 1.0, 48000, 'Cómodo 2 ambientes

Living comedor.

Dormitorio con vestidor

y baño completo en suite.

Cocina independiente. 

Todos los ambientes con ventilación natural. 

Por escalera.', u.id, 'OWNER', true, 83.28, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 50889.59626353624, 81828.24317565694, 'El rango de precio esperado para esta propiedad va de 50890 a 81828 USD, con una prediccion central de 70483 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie y la superficie cubierta. Bajan el precio: el precio de referencia de mercado en la zona y la cantidad de banos.', '[{"factor": "el barrio/zona", "contribution": -487.7734069824219, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 301.7042236328125, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -241.30284118652344, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 159.32391357421875, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": -88.82789611816406, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'San Cristóbal' AND u.email = 'sofia.rodriguez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-157-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-157-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-157-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'sofia.rodriguez@nidio.app'
  AND p.title = 'Departamento en Venta en San cristobal, Capital federal'
  AND p.address = 'DANEL 1489, Comuna 3, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Alquiler 5 ambientes en edificio de categoria', 'APARTMENT', 'SALE', n.id, 'MALABIA 1908, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4241797557082, -34.58887487319217), 4326), 184.0, 190.0, 5.0, 3.0, 439000, 'Alquiler 5 ambientes en edificio de categoría <br><br>Descripción: <br>Living (10,334x4,455) <br>Sala de estar (2.992x3,723) o posible habitación <br>Toilette <br>Cocina independiente <br>Lavadero <br>Dependencia de servicio con baño <br>Comedor diario <br>Dos Baños completos <br>Dormitorio principal (3.53x3146) <br>Segundo Dormitorio (1 3x3) <br>Tercer Dormitorio (3x3) <br><br>Cochera: cubierta <br>Baulera con muy buena dimensiones <br><br>Edificio de categoría con seguridad <br>', u.id, 'OWNER', true, 236.07, 'NOT_SPECIFIED', false, true, false, true, false, false, false, 423479.3433401562, 736514.3344166952, 'El rango de precio esperado para esta propiedad va de 423479 a 736514 USD, con una prediccion central de 577723 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la cochera. Bajan el precio: la superficie, las expensas y los amenities del edificio.', '[{"factor": "el barrio/zona", "contribution": 516.3673095703125, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -386.42303466796875, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -257.90203857421875, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": -257.2392883300781, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": 254.13182067871094, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'nicolas.alvarez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-158-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-158-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-158-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'nicolas.alvarez@nidio.app'
  AND p.title = 'Alquiler 5 ambientes en edificio de categoria'
  AND p.address = 'MALABIA 1908, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta de Casa', 'HOUSE', 'SALE', n.id, 'ACASSUSO 7700, Comuna 9, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.5226945324692, -34.6571125259859), 4326), 206.0, 215.0, 5.0, 1.0, 139990, 'Principales Características de la propiedad:<br>Se trata de una casa de 5 ambientes con local al frente y entrada de autos con garaje cubierto mas patio, a refaccionar, la propiedad está conformada por una construccion al frente y otra al contrafrente.<br>Al frente posee una entrada de autos con portón y puerta de entrada que da a una cochera semicubierta con acceso al patio central, posee un local al frente de entrada independiente actualmente con renta, en primer piso tiene 2 habitaciones a refaccionar, y terraza con posibilidad de construir un piso mas, <br>Al contrafrente tiene una construcción de 4 ambientes con baño completo y cocina más un living comedor y dos habitaciones.<br>', u.id, 'OWNER', true, NULL, 'NEEDS_RENOVATION', false, true, false, false, false, false, false, 139225.44039230904, 259885.1795584683, 'El rango de precio esperado para esta propiedad va de 139225 a 259885 USD, con una prediccion central de 209711 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie total. Bajan el precio: la superficie, el precio de referencia de mercado en la zona y el estado de la propiedad (a reciclar).', '[{"factor": "el barrio/zona", "contribution": -650.3406982421875, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -558.7514038085938, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -445.6376037597656, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 266.0195007324219, "direction": "sube el precio"}, {"factor": "el estado de la propiedad (a reciclar)", "contribution": -198.70116186141968, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Mataderos' AND u.email = 'valentina.ruiz@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-159-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-159-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-159-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'valentina.ruiz@nidio.app'
  AND p.title = 'Venta de Casa'
  AND p.address = 'ACASSUSO 7700, Comuna 9, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en Venta', 'APARTMENT', 'SALE', n.id, 'GIBSON 4181, Comuna 5, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.42229115488772, -34.63890353969708), 4326), 23.0, 31.0, 1.0, 1.0, 64000, 'Venta en pozo c/amenitoes. Luminoso. 1 y 2 amb c/balcón. 2do PisoEdificio de categoría PB, SS y 12 pisos 2 studios y 4 deptos de 1 amb por piso. 2 ascensores automáticos (1 camillero de2 x 1,20 mts). Viviendas apto profesional. Muy bajas expensas.Amenities: Parking bicicletas, laundry y Salón de Usos Múltiples.', u.id, 'OWNER', true, NULL, 'NEW', false, false, true, false, true, true, false, 42137.272492917735, 66134.44145515762, 'El rango de precio esperado para esta propiedad va de 42137 a 66134 USD, con una prediccion central de 56105 USD. El factor que mas influye en esta prediccion es la superficie, que sube el precio. Tambien suben el precio: la superficie cubierta. Bajan el precio: el precio de referencia de mercado en la zona, el barrio/zona y la superficie total.', '[{"factor": "la superficie", "contribution": 488.3369445800781, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -452.1976623535156, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -398.0867614746094, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 195.0609893798828, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -177.3900909423828, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Boedo' AND u.email = 'tomas.diaz@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-160-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-160-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-160-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'tomas.diaz@nidio.app'
  AND p.title = 'Departamento en Venta'
  AND p.address = 'GIBSON 4181, Comuna 5, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Excelente Departamento Semipiso en Venta en el Centro', 'APARTMENT', 'SALE', n.id, '25 DE MAYO 794, Comuna 1, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.37141552248109, -34.598477591016184), 4326), 92.0, 100.0, 4.0, 3.0, 85000, 'Hermoso Semipiso  de 4 ambientes con dependencia. Al frente. Habitación de servicio con dos placares grandes y baño completo. Doble entrada al departamento. Puertas blindadas. Balcón corrido en living y 2 habitaciones. Lavadero independiente. Losa radiante. Apto profesional. Se aceptan mascotas. Cerca de líneas de subte A-B-D-H y de una gran cantidad de líneas de Colectivos.', u.id, 'OWNER', true, 249.18, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 126536.34528425212, 226201.63680736208, 'El rango de precio esperado para esta propiedad va de 126536 a 226202 USD, con una prediccion central de 182945 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la cantidad de banos y la superficie total. Bajan el precio: el barrio/zona y la superficie.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -528.4392700195312, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -405.8164978027344, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 172.16873168945312, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -166.0873565673828, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 76.28604888916016, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'San Nicolás' AND u.email = 'camila.torres@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-161-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-161-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-161-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'camila.torres@nidio.app'
  AND p.title = 'Excelente Departamento Semipiso en Venta en el Centro'
  AND p.address = '25 DE MAYO 794, Comuna 1, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA DEPARTAMENTO DE 3 AMBIENTES CON COCHERA EN PALERMO - A ESTRENAR', 'APARTMENT', 'SALE', n.id, 'SANTA ROSA 5200, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4314090504208, -34.5870146057546), 4326), 91.0, 91.0, 3.0, 2.0, 290000, 'VENTA DEPARTAMENTO DE 3 AMBIENTES, CON COCHERA EN PALERMO - A ESTRENAR<br><br><br>Pisos de porcellanato. Hall de entrada. Toilette de recepcion. Cocina americana con artefacto a gas, muebles completos y lavadero integrado. Living comedor con salida a amplio balcón corrido. Hall de distribución. Dos dormitorios con baño en suite, vestidores, placares con frentes incluídos y salida a balcón. Aire acondicionado Frío/Calor en todos los ambientes. Cochera fija.<br>Amenities: S.U.M. con Barbacoa en 10º Piso.<br>', u.id, 'OWNER', true, NULL, 'NEW', false, true, true, false, false, false, false, 291829.3123757486, 507548.892638809, 'El rango de precio esperado para esta propiedad va de 291829 a 507549 USD, con una prediccion central de 398122 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la cochera, los amenities del edificio y la cantidad de banos. Bajan el precio: la superficie.', '[{"factor": "el barrio/zona", "contribution": 680.3590698242188, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 321.5946960449219, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 236.1728515625, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 189.38925170898438, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -161.58993530273438, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'federico.romero@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-162-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-162-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-162-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'federico.romero@nidio.app'
  AND p.title = 'VENTA DEPARTAMENTO DE 3 AMBIENTES CON COCHERA EN PALERMO - A ESTRENAR'
  AND p.address = 'SANTA ROSA 5200, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'DEPARTAMENTO LOFT 4 AMBIENTES EN SAAVEDRA', 'APARTMENT', 'RENT', n.id, 'CARLOS E PELLEGRINI 5813, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.50250603665751, -34.563338721867254), 4326), 140.0, NULL, 4.0, 2.0, 3660000, 'EXCELENTE LOFT EN SAAVEDRA 4 AMBIENTES.<br><br>Nos encontramos con este hermoso loft 4 ambientes. <br>Al ingresar, en la planta inferior nos encontramos con el hall de recepción, living comedor con techos en altura, la cocina, integrada, con una barra desayunadora y una gran cocina industrial, una  despensa-lavadero y una habitación  con baño en suite con ventanal al frente.<br>En la segunda planta, nos encontramos con otra habitación en suite  con ventanales al frente y la habitación principal con gran vestidor. <br>Existe la posibilidad de generar un tercer baño. <br><br> El departamento posee un sistema central de aire frío-calor, regulable desde la unidad.<br>La propiedad se encuentra en un estado excelente. Digno de disfrutar.<br>Posee una cochera de fácil acceso y baulera. Edificio de excelente construcción, con seguridad, laundry, pileta y solarium, gimnasio, sauna y cancha de paddle.<br><br>PLANTA BAJA <br>-Hall de recepción<br>-Cocina <br>-Despensa/lavadero<br>-Living/comedor <br>-Primer dormitorio en suite <br>SEGUNDA PLANTA <br>-Dormitorio en suite <br>-Dormitorio con vestidor <br><br>-Cochera<br>-Baulera<br>-Pileta <br>-Solarium <br>-Cancha de paddle <br>-Gimnasio<br>-Sauna<br>', u.id, 'OWNER', true, 386.89, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 550.3115780712246, 962.1328021748353, 'El rango de precio esperado para esta propiedad va de 550 a 962 USD/mes, con una prediccion central de 754 USD/mes. El factor que mas influye en esta prediccion es la superficie, que sube el precio. Bajan el precio: el barrio/zona, los amenities del edificio, la cantidad de ambientes y la superficie total.', '[{"factor": "la superficie", "contribution": 392.7554931640625, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -209.32943725585938, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": -71.24726104736328, "direction": "baja el precio"}, {"factor": "la cantidad de ambientes", "contribution": -64.31542205810547, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -46.382511138916016, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Saavedra' AND u.email = 'julieta.sosa@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-163-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-163-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-163-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'julieta.sosa@nidio.app'
  AND p.title = 'DEPARTAMENTO LOFT 4 AMBIENTES EN SAAVEDRA'
  AND p.address = 'CARLOS E PELLEGRINI 5813, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta - Depto 3 Ambientes C/dependencia', 'APARTMENT', 'SALE', n.id, 'MALABIA 999, Comuna 15, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4331713048687, -34.5947888597759), 4326), 94.0, 94.0, 3.0, 2.0, 138000, 'Super luminoso departamento en 10mo piso. Consta de 2 dormitorios + escritorio + dependencia c/baño. Amplios placares en dormitorios + pasillo + baño (mucho espacio de guardado) Baño completo + toilette. Entrada de servicio. Cocina cómoda. Pisos de roble. Todo original y en buen estado. Balcón corrido. Calefacción individual. Agua caliente individual (calefón) muy buena oportunidad de inversión. Ambientes: Escritorio (3x2).', u.id, 'OWNER', true, 163.93, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 207254.22084873196, 327771.68557454, 'El rango de precio esperado para esta propiedad va de 207254 a 327772 USD, con una prediccion central de 267380 USD. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona, la superficie total y la cantidad de banos. Bajan el precio: el barrio/zona.', '[{"factor": "la superficie", "contribution": -205.81661987304688, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 197.36459350585938, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -162.8612823486328, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 112.59590911865234, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 92.74253845214844, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Crespo' AND u.email = 'agustin.molina@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-164-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-164-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-164-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'agustin.molina@nidio.app'
  AND p.title = 'Venta - Depto 3 Ambientes C/dependencia'
  AND p.address = 'MALABIA 999, Comuna 15, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Excelente Departamento en Venta en Belgrano', 'APARTMENT', 'SALE', n.id, 'VIRREY DEL PINO 2363, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.45192955039393, -34.56595919620318), 4326), 48.0, 54.0, 2.0, 1.0, 92000, 'Hermoso 2 ambientes con patio a pulmón de manzana. Reciclado hace 5 años. Luminoso.', u.id, 'OWNER', true, NULL, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 145613.24708902583, 240947.08266714896, 'El rango de precio esperado para esta propiedad va de 145613 a 240947 USD, con una prediccion central de 194639 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: el barrio/zona, la superficie cubierta y la superficie. Bajan el precio: la superficie total.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 859.4313354492188, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 374.4677734375, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 135.20498657226562, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 121.7144546508789, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -117.70289611816406, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'florencia.acosta@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-165-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-165-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-165-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'florencia.acosta@nidio.app'
  AND p.title = 'Excelente Departamento en Venta en Belgrano'
  AND p.address = 'VIRREY DEL PINO 2363, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Duplex ', 'APARTMENT', 'SALE', n.id, 'DR ELEODORO DAMIANOVICH 3333, Comuna 4, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.39451624552704, -34.653235263536104), 4326), 110.0, 160.0, 4.0, 2.0, 238900, 'FRENTE: El primer piso tiene patio, el segundo piso balconSuperficie Cubierta: 110 m2Superficie Descubierta: 50m2-.El departamento presenta un amplio estar al frente con rejas de seguridad, cocina integrada, baño completo.La cocina presenta mesada de granito negro en alzada, amoblamientos con alzada y bajo mesada, anafe, horno, ventanas con doble vidrio. Equipo de Aire Acondicionado. Calefacción individual mediante caldera de estilo italiano.Terminaciones en Porcelanato. Griferías de primera calidad. A ESTRENAR - SIN EXPENSAS!!!!', u.id, 'OWNER', true, NULL, 'NEW', false, false, false, false, false, false, false, 154816.42118326822, 287868.6926667524, 'El rango de precio esperado para esta propiedad va de 154816 a 287869 USD, con una prediccion central de 224144 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la superficie total y la cantidad de banos. Bajan el precio: el barrio/zona y la superficie.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -578.058349609375, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -470.4033203125, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 323.7921142578125, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -213.97406005859375, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 107.17843627929688, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Barracas' AND u.email = 'ignacio.medina@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-166-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-166-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-166-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'ignacio.medina@nidio.app'
  AND p.title = 'Duplex '
  AND p.address = 'DR ELEODORO DAMIANOVICH 3333, Comuna 4, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Alquiler departamento en Palermo', 'APARTMENT', 'RENT', n.id, 'AV LACROZE FEDERICO 2200, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4429805524211, -34.5679983051351), 4326), 38.0, 43.0, 2.0, 1.0, 550000, 'Muy lindo departamento para alquilar en una zona muy buena y comoda de Palermo.En un 8vo piso contrafrente con muy buena luz y abierto, este departamento de dos ambientes muy comodo con cocina y baño mas balcon. El edificio con todos los amenities (lavadero, pileta, parrilla, gimnasio).', u.id, 'OWNER', true, 144.26, 'NOT_SPECIFIED', true, false, true, false, true, false, false, 319.44361702216673, 689.7199697482586, 'El rango de precio esperado para esta propiedad va de 319 a 690 USD/mes, con una prediccion central de 481 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona y los amenities del edificio. Bajan el precio: la superficie total y la superficie cubierta.', '[{"factor": "la superficie", "contribution": -325.5046691894531, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 117.95997619628906, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -96.86530303955078, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": 65.46918487548828, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": -55.19194793701172, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'antonella.herrera@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-167-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-167-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-167-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'antonella.herrera@nidio.app'
  AND p.title = 'Alquiler departamento en Palermo'
  AND p.address = 'AV LACROZE FEDERICO 2200, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en Venta', 'APARTMENT', 'SALE', n.id, 'AV INDEPENDENCIA 2537, Comuna 3, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.401445544881646, -34.6186998733893), 4326), 75.0, 75.0, 2.0, NULL, 150000, 'Departamento de 3 ambientes con dependencia, 2 baños, lavadero y balcon. Muy luminoso Entrada 1,13 x 2,15 Hall 2 x 2,38 Living Comedor 3,55 x 4,7 Dormitorio principal con Placard 3 x 3,94 Baño principal 1,62 x 2,18 Dormitorio 3,28 x 3,68 Cocina 2,1 x 2,94 Lavadero 1,37 x 2,5 Habitacion de Servicio 2,1 x 2,94 Baño de Servicio 1 x 1,2', u.id, 'OWNER', true, NULL, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 96656.38160410931, 159482.2214562102, 'El rango de precio esperado para esta propiedad va de 96656 a 159482 USD, con una prediccion central de 128843 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Bajan el precio: el barrio/zona, la superficie, la cochera y los amenities del edificio.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -571.4649658203125, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -466.4476013183594, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -123.27708435058594, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -77.98468017578125, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": -46.00352478027344, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Balvanera' AND u.email = 'franco.suarez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-168-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-168-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-168-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'franco.suarez@nidio.app'
  AND p.title = 'Departamento en Venta'
  AND p.address = 'AV INDEPENDENCIA 2537, Comuna 3, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT '3 ambientes con balcón aterrazado cocina comedor', 'APARTMENT', 'SALE', n.id, 'ISLANDIA 5576, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.49835847314441, -34.565269206265086), 4326), 50.0, 67.0, 3.0, 1.0, 88000, '3 ambientes al frente con balcón aterrazado- living comedor- dos dormitorios muy cómodos con placard- cocina independiente- baño completo con bañera- bajas expensas-  muy luminoso vista abierta.', u.id, 'OWNER', true, 16.39, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 101336.92549865719, 167463.81517282326, 'El rango de precio esperado para esta propiedad va de 101337 a 167464 USD, con una prediccion central de 139656 USD. El factor que mas influye en esta prediccion es las expensas, que baja el precio. Tambien suben el precio: la superficie cubierta y la superficie. Bajan el precio: la cochera y la cantidad de banos.', '[{"factor": "las expensas", "contribution": -128.0941925048828, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 111.69036865234375, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": -100.8389663696289, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 90.95238494873047, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": -78.64234161376953, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Urquiza' AND u.email = 'milagros.castro@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-169-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-169-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-169-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'milagros.castro@nidio.app'
  AND p.title = '3 ambientes con balcón aterrazado cocina comedor'
  AND p.address = 'ISLANDIA 5576, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 7 ambientes en alquiler', 'APARTMENT', 'RENT', n.id, 'CARLOS E ZUBERBUHLER 1714, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.45803378693986, -34.56978664156847), 4326), 320.0, 320.0, 7.0, 3.0, 6405000, 'Excelente Piso alto en una de las mejores zonas de Belgrano, planta de 320 metros cuadrados. La unidad tiene hall privado y acceso de servicio por otro ascensor. Amplia recepcion y comedor separado que dan al balcón corrido al frente, todo vidriado muy luminoso. La cocina cuenta con isla y se conecta con el área de servicios y el área familiar mas privada, que dispone de un comedor de diario y un amplio playroom. Un largo pasillo lleno de placeres ocultos a la vista, nos conecta a los cuatro dormitorios, dos en suite siendo uno la Master Suite con un enorme jacuzzi, vestidor y cantidad de muebles empotrados adicionales. Tres de los cuartos dan a un balcón corrido en el contrafuerte y el cuarto dormitorio que es en suite tiene también vista abierta a un lateral. La unidad cuenta con cuatro cocheras en el primer subsuelo, a las cuales se accede por una rampa con portón automático. Amenities Gran piscina, Salon de Usos Multiples y juegos para niños en el jardín.', u.id, 'OWNER', true, 1215.08, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 2621.91295818992, 5445.793490595098, 'El rango de precio esperado para esta propiedad va de 2622 a 5446 USD/mes, con una prediccion central de 4049 USD/mes. El factor que mas influye en esta prediccion es la superficie, que sube el precio. Tambien suben el precio: las expensas y la cantidad de banos. Bajan el precio: el barrio/zona y el precio de referencia de mercado en la zona.', '[{"factor": "la superficie", "contribution": 2857.824951171875, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": 1065.0634765625, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -311.53009033203125, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -287.0249328613281, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 263.623291015625, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'joaquin.ortiz@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-170-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-170-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-170-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'joaquin.ortiz@nidio.app'
  AND p.title = 'Departamento de 7 ambientes en alquiler'
  AND p.address = 'CARLOS E ZUBERBUHLER 1714, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en Alquiler con Balcón ', 'APARTMENT', 'RENT', n.id, 'GUARDIA VIEJA 3344, Comuna 3, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.41203735024637, -34.60272433840454), 4326), 34.0, 34.0, 1.0, 1.0, 599000, 'Divino monoambiente, sumamente luminoso. Piso 4to al frente con balcón. Vista abierta. Cocina integrada al ambiente. Calefacción por aire acondicionado. Agua caliente central. 1 baño completo. 8 años de antigüedad. Edificio con sum, pileta y laundry. ', u.id, 'OWNER', true, 94.43, 'USED_GOOD_CONDITION', true, false, true, false, true, false, false, 251.2971642219653, 419.97426507317465, 'El rango de precio esperado para esta propiedad va de 251 a 420 USD/mes, con una prediccion central de 326 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: los amenities del edificio. Bajan el precio: el barrio/zona, la superficie total y la cantidad de banos.', '[{"factor": "la superficie", "contribution": -225.6255340576172, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -127.17755126953125, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -85.5467758178711, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": 53.552337646484375, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": -40.50218200683594, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Balvanera' AND u.email = 'rocio.aguirre@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-171-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-171-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-171-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'rocio.aguirre@nidio.app'
  AND p.title = 'Departamento en Alquiler con Balcón '
  AND p.address = 'GUARDIA VIEJA 3344, Comuna 3, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento 47m² 2 ambientes con Plantas, Capital Federal, Colegiales', 'APARTMENT', 'SALE', n.id, 'CONCEPCION ARENAL 3252, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.44488537074025, -34.581218592459294), 4326), 41.0, 47.0, 2.0, 1.0, 115000, 'Mood Amenabar, Un diseño de experiencias.<br>Unidades de 1 y 2 ambientes de 33 a 47 m2.<br><br>Mood Amenábar se encuentra en Colegiales, a sólo tres cuadras están las avenidas Cabildo y Federico Lacroze, ricas en restaurantes, bares y locales comerciales. Los dos barrios vecinos, Belgrano y Palermo, completan la experiencia con múltiples opciones de gastronomía y entretenimiento.<br><br>Departamento 2 ambientes al frente de 47 m2 totales. Cocina con living comedor integrados de 7.07 x 2,80 mts con expansión a balcón de 6 m2. Baño completo. Dormitorio con vestidor de 5,27 x 2,51 mts. OPCIÓN DE PAGO AL CONTADO (precio publicado) O CON FINANCIACIÓN (Anticipo 40% en dolares + 44 cuotas y 8 refuerzos EN PESOS ajustables por CAC).<br><br>Fecha de entrega estimada: Noviembre 2022 (30 meses de plazo de obra una vez iniciada)<br><br>Sacate todas tus dudas acerca del proyecto comunicándote con nuestros asesores.<br><br>[ Provista por  | Código 35605500 ]', u.id, 'OWNER', true, 55.74, 'NEW', false, false, false, false, false, false, false, 97064.29046421411, 153337.82367502252, 'El rango de precio esperado para esta propiedad va de 97064 a 153338 USD, con una prediccion central de 125005 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: la superficie y la superficie cubierta. Bajan el precio: las expensas y la cochera.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 293.7978515625, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 209.65208435058594, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 153.0795135498047, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -109.94701385498047, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -97.89384460449219, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Colegiales' AND u.email = 'emiliano.rojas@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-172-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-172-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-172-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'emiliano.rojas@nidio.app'
  AND p.title = 'Departamento 47m² 2 ambientes con Plantas, Capital Federal, Colegiales'
  AND p.address = 'CONCEPCION ARENAL 3252, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Depto.tipo casa de 5 ambientes en Alquiler en Palermo', 'PH', 'RENT', n.id, 'AV DE LOS OMBUES 379, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.42820670379131, -34.560173329442954), 4326), 70.0, 70.0, 5.0, 1.0, 950000, 'Tipo casa, sin expensas, ideal estudiantes.', u.id, 'OWNER', true, NULL, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 403.89296687989673, 872.0570080403457, 'El rango de precio esperado para esta propiedad va de 404 a 872 USD/mes, con una prediccion central de 608 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona y las expensas. Bajan el precio: la superficie cubierta y la cantidad de banos.', '[{"factor": "la superficie", "contribution": -143.99130249023438, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 122.35303497314453, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": 86.3652572631836, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": -58.08707046508789, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -53.12153625488281, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'constanza.silva@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-173-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-173-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-173-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'constanza.silva@nidio.app'
  AND p.title = 'Depto.tipo casa de 5 ambientes en Alquiler en Palermo'
  AND p.address = 'AV DE LOS OMBUES 379, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en Alquiler 4 Ambientes con Balcón - Patio y Cochera - Edificio con Amenities ', 'APARTMENT', 'RENT', n.id, 'PADRE JUAN B NEUMANN 1447, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.45236226122415, -34.550118969499955), 4326), 83.0, 83.0, 4.0, 2.0, 5337500, 'Departamento de 4 ambientes con balcón al frente y cochera cubierta en el Barrio de Belgrano. Edificio moderno en excelente estado con amenities, parrilla, pileta, quincho y sum. Living comedor con balcón al frente. 3 dormitorios, 2 hacia el frente y 3° dormitorio con baño en suite hacia aire y luz del edificio. 2 baños completos. Cocina amplia, con espacio para mesa. Espacio de lavadero integrado a cocina. No aceptan mascotas. solo con seguro de caucion.', u.id, 'OWNER', true, 295.08, 'USED_GOOD_CONDITION', true, true, true, false, false, false, false, 448.71527126145145, 931.9953569523574, 'El rango de precio esperado para esta propiedad va de 449 a 932 USD/mes, con una prediccion central de 693 USD/mes. El factor que mas influye en esta prediccion es los amenities del edificio, que sube el precio. Tambien suben el precio: la cochera. Bajan el precio: la cantidad de ambientes, la superficie cubierta y que este amoblado.', '[{"factor": "los amenities del edificio", "contribution": 108.84925079345703, "direction": "sube el precio"}, {"factor": "la cantidad de ambientes", "contribution": -69.10610961914062, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -66.456787109375, "direction": "baja el precio"}, {"factor": "que este amoblado", "contribution": -66.18051147460938, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": 64.02893829345703, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'bautista.nunez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-174-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-174-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-174-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'bautista.nunez@nidio.app'
  AND p.title = 'Departamento en Alquiler 4 Ambientes con Balcón - Patio y Cochera - Edificio con Amenities '
  AND p.address = 'PADRE JUAN B NEUMANN 1447, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT '4 Ambientes en Recoleta', 'APARTMENT', 'SALE', n.id, 'BERUTI 2668, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4031375135357, -34.591855175390066), 4326), 74.0, 82.0, 4.0, 1.0, 145000, 'Impecable 4 ambientes en M. T. de Alvear, entre uriburu y azcuenaga, frente a Facultad de Medicina.  Acceso por living comedor con acceso a uno de los dos balcones, con vista a la calle. 3 Dormitorios. Cocina individual. Un baño completo y dos toilette. Lavadero.	<br><br>ARQ. RUGGERI. MATRICULA CUCICBA 1013<br>Se deja expresa constancia que las medidas, superficies, m2 y proporciones consignadas son aproximados, al igual que las medidas parciales y/o de los ambientes esta sujeto a verificación y/o ajuste. El valor indicado de expensas esta sujeto a variación. El precio del inmueble puede ser modificado sin previo aviso.', u.id, 'OWNER', true, 114.1, 'USED_GOOD_CONDITION', false, false, false, false, false, false, false, 138149.54765619995, 240770.5761864251, 'El rango de precio esperado para esta propiedad va de 138150 a 240771 USD, con una prediccion central de 188801 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la superficie total. Bajan el precio: las expensas, la superficie y la cochera.', '[{"factor": "el barrio/zona", "contribution": 232.25399780273438, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -191.56063842773438, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -169.14920043945312, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -99.40912628173828, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 95.4900131225586, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'abril.cabrera@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-175-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-175-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-175-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'abril.cabrera@nidio.app'
  AND p.title = '4 Ambientes en Recoleta'
  AND p.address = 'BERUTI 2668, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento 1 AMBIENTE AMOBLADO - ALQUILER - Villa Urquiza', 'APARTMENT', 'RENT', n.id, 'ECHEVERRIA 4261, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.47390220852786, -34.57357206920888), 4326), 27.0, NULL, 1.0, 1.0, 1143750, 'Alquiler - Departamento  de 1 Ambiente Amoblado a Estrenar con Amplio Balcón  en la zona céntrica de Villa Urquiza.-<br><br>Se alquila Amoblado.<br> - La unidad posee: Microondas, Lava seca ropas, Extractor de aire, Smart TV, Aire Acondicionado frio-calor, Heladera, Anafes a Gas de 2 hornallas, Horno eléctrico.<br><br>Ubicación: Cullen al 5000, entre Avda. Triunvirato y Colodrero, Villa Urquiza, CABA.-<br><br><br>Departamento de 1 Ambiente al Contrafrente con Amplio Balcón.-<br>A Estrenar. Muy Luminoso.- <br>Zona céntrica y comercial del Barrio.-<br>Expensas: $1.500.-<br><br>Descripción del Inmueble:<br><br>- Living comedor con pisos de porcelanato pulido y gran ventanal con salida al Balcón.-<br><br>- Cocina integrada con muebles completos en alacena y bajo mesada.<br><br>- Conexión para lavarropas.-<br><br>- Placard empotrado con interiores completos.-<br><br>- Baño completos.-<br><br>- Amplio Balcón al Contrafrente.-<br><br><br>Requisitos para el alquiler:-<br><br>- Garantía Propietaria de Capital Federal.-<br><br>- Ingresos comprobables.-<br><br>- Mes de adelanto.-<br><br>- Depósito.-<br><br>- ', u.id, 'OWNER', true, 98.36, 'NEW', false, false, false, false, true, false, true, 319.06193303421503, 512.6948216177411, 'El rango de precio esperado para esta propiedad va de 319 a 513 USD/mes, con una prediccion central de 408 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona y el estado de la propiedad (a estrenar). Bajan el precio: el barrio/zona y la superficie total.', '[{"factor": "la superficie", "contribution": -232.5063018798828, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -126.58556365966797, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 89.06204223632812, "direction": "sube el precio"}, {"factor": "el estado de la propiedad (a estrenar)", "contribution": 76.41895127296448, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": -66.21353149414062, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Urquiza' AND u.email = 'santino.peralta@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-176-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-176-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-176-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'santino.peralta@nidio.app'
  AND p.title = 'Departamento 1 AMBIENTE AMOBLADO - ALQUILER - Villa Urquiza'
  AND p.address = 'ECHEVERRIA 4261, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta - 4° A', 'APARTMENT', 'SALE', n.id, 'JUAN FRANCISCO SEGUI 3771, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4113996726164, -34.57807495777932), 4326), 54.0, 61.0, 2.0, 1.0, 170800, 'Departamento. Living/Comedor. 1 dormitorio(s) 1 suite con vest. 1 baño(s) 1 toilette(s). Entre medianeras. Al frente. A estrenar.  Luminoso. Orientación Sureste.', u.id, 'OWNER', true, NULL, 'NEW', false, false, false, false, true, false, false, 120829.78232609114, 210146.88935165462, 'El rango de precio esperado para esta propiedad va de 120830 a 210147 USD, con una prediccion central de 164839 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la superficie cubierta. Bajan el precio: la cochera, la cantidad de banos y los amenities del edificio.', '[{"factor": "el barrio/zona", "contribution": 420.4503479003906, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": -135.79977416992188, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -112.61805725097656, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": -76.26395416259766, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": 55.399078369140625, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'delfina.vega@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-177-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-177-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-177-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'delfina.vega@nidio.app'
  AND p.title = 'Venta - 4° A'
  AND p.address = 'JUAN FRANCISCO SEGUI 3771, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta PH 4 ambientes Villa Urquiza ', 'PH', 'SALE', n.id, 'LITUANIA 5476, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.490319461725385, -34.577228800426525), 4326), 100.0, 100.0, 4.0, 2.0, 320000, 'Ph tipo casa - zona residencial.
<br>Entrada totalmente independiente, distribuida:
<br>Primer piso: Living. Cocina con Muebles en cedro
<br>Habitación tipo escritorio. Baño. Balcón 5 mtros
<br>Segundo piso: Dos habitaciones con piso de viraro.
<br>Placares de cedro por dentro y fuera. Altillo.
<br>Parrilla.Terraza 20 mtros. baño con bañera. 
<br>En toda la casa: Pisos de porcelanato Ilva. Grifería FB. accesorios de línea Roca. Aire acondicionado LG en todos los ambientes.Ventiladores de techo martin y martin. Calefacción en todos los ambientes a gas y eléctrico. Baranda de escalera torneadas hechas en viraro. Ventanas en cedro. Escaleras de mármol. Detalles de categoría.
<br>Rejas en toda la casa. Antiguedad 10 años.
<br>Techo de tejas negras esmaltadas con lucarnas.', u.id, 'OWNER', true, NULL, 'NOT_SPECIFIED', false, false, false, false, false, false, true, 174266.16117758208, 287982.6486023275, 'El rango de precio esperado para esta propiedad va de 174266 a 287983 USD, con una prediccion central de 240163 USD. El factor que mas influye en esta prediccion es el tipo de propiedad (PH), que baja el precio. Tambien suben el precio: la superficie total. Bajan el precio: la superficie, el barrio/zona y los amenities del edificio.', '[{"factor": "el tipo de propiedad (PH)", "contribution": -269.94082975387573, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -238.48519897460938, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -112.14427185058594, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 100.25967407226562, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": -68.09577941894531, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Urquiza' AND u.email = 'maximiliano.paz@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-178-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-178-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-178-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'maximiliano.paz@nidio.app'
  AND p.title = 'Venta PH 4 ambientes Villa Urquiza '
  AND p.address = 'LITUANIA 5476, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 8 ambientes en venta en Recoleta', 'APARTMENT', 'SALE', n.id, 'TAGLE 2560, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.40017977580851, -34.583972230021374), 4326), 390.0, 390.0, 8.0, 3.0, 3200000, 'Impactante piso en edificio de estilo Francés de gran categoría en el corazón de Recoleta. Gran recepción de doble hall de entrada, living con chimenea, comedor y escritorio, todos divididos con puertas corredizas. Escritorio con biblioteca y boiserie, pisos de parquet de roble de Eslavonia. Detalles únicos de construcción. Lleno de luz y sol. Todo el piso externo. Master suite con chimenea de dimensiones impactantes. Baño en mármol, hidromasaje, ducha compartimentada y vestidor. Dos dormitorios en suite, living íntimo, sauna. Doble circulación que conduce a cocina también reciclada con excelentes materiales, office, comedor diario, dos cómodas dependencias. Servicios centrales. Dos cocheras. Metros cubiertos: 378. 60 m². Metros descubiertos: 12. 07 m². Metros totales: 390. 67 m².', u.id, 'OWNER', true, 2402.62, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 1181153.8997244886, 2058545.3215470244, 'El rango de precio esperado para esta propiedad va de 1181154 a 2058545 USD, con una prediccion central de 1614213 USD. El factor que mas influye en esta prediccion es las expensas, que sube el precio. Tambien suben el precio: la superficie total y el barrio/zona. Bajan el precio: la cantidad de ambientes y la superficie.', '[{"factor": "las expensas", "contribution": 1206.10986328125, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 476.4140625, "direction": "sube el precio"}, {"factor": "la cantidad de ambientes", "contribution": -354.1094970703125, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -349.47161865234375, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": 251.681884765625, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'catalina.benitez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-179-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-179-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-179-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'catalina.benitez@nidio.app'
  AND p.title = 'Departamento de 8 ambientes en venta en Recoleta'
  AND p.address = 'TAGLE 2560, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en venta en Villa Urquiza', 'APARTMENT', 'SALE', n.id, 'TOMAS A LE BRETON 4787, Comuna 12, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.485971620067815, -34.56839206672812), 4326), 263.0, 263.0, 5.0, 4.0, 349000, 'Todas las unidades se entregarán listas para mudarse, con el cuidado en los detalles y la calidad de los materiales. Parrillas individuales en cada una de ellas, pisos de porcellanato, griferías de cierre cerámico, Calefacción a través de piso radiante (con caldera individual), carpinterías dvh, persianas en todos los dormitorios e interiores y frentes de placard. La grifería y los artefactos a instalar tanto en bañoscomo en cocinas serán de primeras marcas. Posibilidad de personalizar las unidades a su gusto.', u.id, 'OWNER', true, 98.36, 'NEW', true, true, false, false, false, false, false, 515299.81872287544, 851556.065832493, 'El rango de precio esperado para esta propiedad va de 515300 a 851556 USD, con una prediccion central de 710155 USD. El factor que mas influye en esta prediccion es la cantidad de banos, que sube el precio. Tambien suben el precio: la superficie total. Bajan el precio: la superficie, la superficie cubierta y el barrio/zona.', '[{"factor": "la cantidad de banos", "contribution": 450.6460876464844, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -418.9106140136719, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -298.8686218261719, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -288.50225830078125, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 287.64129638671875, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Urquiza' AND u.email = 'lucia.fernandez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-180-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-180-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-180-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'lucia.fernandez@nidio.app'
  AND p.title = 'Departamento en venta en Villa Urquiza'
  AND p.address = 'TOMAS A LE BRETON 4787, Comuna 12, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'PH 3 ambientes C/Patio en VENTA en BALVANERA', 'PH', 'SALE', n.id, 'VALENTIN GOMEZ 3381, Comuna 3, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.41315974838474, -34.605117025567715), 4326), 51.0, 61.0, 3.0, 1.0, 64900, 'Muy buen PH, en planta baja con patio. A REFACCIONAR. Consta de hall de recepción, living comedor, dos dormitorios con placard, cocina independiente y baño completo. Patio con lavadero. Muy buena ubicación.', u.id, 'OWNER', true, 72.13, 'NEEDS_RENOVATION', false, false, false, false, false, false, false, 61067.57824515651, 100760.99348906762, 'El rango de precio esperado para esta propiedad va de 61068 a 100761 USD, con una prediccion central de 81403 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Bajan el precio: el barrio/zona, el estado de la propiedad (a reciclar), las expensas y el tipo de propiedad (PH).', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -525.4706420898438, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -395.9539489746094, "direction": "baja el precio"}, {"factor": "el estado de la propiedad (a reciclar)", "contribution": -188.76898550987244, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -103.566162109375, "direction": "baja el precio"}, {"factor": "el tipo de propiedad (PH)", "contribution": -97.2715792953968, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Balvanera' AND u.email = 'martin.gomez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-181-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-181-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-181-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'martin.gomez@nidio.app'
  AND p.title = 'PH 3 ambientes C/Patio en VENTA en BALVANERA'
  AND p.address = 'VALENTIN GOMEZ 3381, Comuna 3, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento de 3 Ambientes Al frente Balvanera! Apto crédito!', 'APARTMENT', 'SALE', n.id, 'VALENTIN GOMEZ 3299, Comuna 3, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4120365779316, -34.605107712282), 4326), 63.0, 68.0, 3.0, 1.0, 75000, 'Hermoso departamento de 3 ambientes super luminoso ubicado en 1er piso al frente. Living comedor con salida al balcón . 2 Dormitorios con placares, uno de ellos con salida al patio y el otro con ventana al frente. Cocina con muebles de bajo y alta mesada. Lavadero. Baño completo. Pisos de parquet. Ventiladores de techo.', u.id, 'OWNER', true, 123.93, 'NOT_SPECIFIED', false, false, false, false, true, true, true, 85006.12779649656, 140259.40008703366, 'El rango de precio esperado para esta propiedad va de 85006 a 140259 USD, con una prediccion central de 113314 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: que este amoblado. Bajan el precio: el barrio/zona, la cochera y las expensas.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -567.636962890625, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -407.85479736328125, "direction": "baja el precio"}, {"factor": "que este amoblado", "contribution": 78.31389617919922, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": -77.82971954345703, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -69.55082702636719, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Balvanera' AND u.email = 'sofia.rodriguez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-182-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-182-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-182-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'sofia.rodriguez@nidio.app'
  AND p.title = 'Departamento de 3 Ambientes Al frente Balvanera! Apto crédito!'
  AND p.address = 'VALENTIN GOMEZ 3299, Comuna 3, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento', 'APARTMENT', 'RENT', n.id, 'ECUADOR 1699, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4024228818014, -34.5909800800077), 4326), 69.0, 69.0, 3.0, 1.0, 900000, 'Amplio y luminoso departamento 3 ambientes, dormitorios con placard, baño completo, pisos de parquet. ', u.id, 'OWNER', true, 160.0, 'NOT_SPECIFIED', false, false, false, false, true, false, false, 219.61282769735922, 467.8220075292049, 'El rango de precio esperado para esta propiedad va de 220 a 468 USD/mes, con una prediccion central de 332 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Bajan el precio: la superficie total, la cantidad de banos, que este amoblado y la cantidad de ambientes.', '[{"factor": "la superficie", "contribution": -142.49969482421875, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -42.98696517944336, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -42.407657623291016, "direction": "baja el precio"}, {"factor": "que este amoblado", "contribution": -35.43647384643555, "direction": "baja el precio"}, {"factor": "la cantidad de ambientes", "contribution": -33.00739669799805, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'nicolas.alvarez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-183-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-183-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-183-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'nicolas.alvarez@nidio.app'
  AND p.title = 'Departamento'
  AND p.address = 'ECUADOR 1699, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA LANZAMIENTO - DOS AMBIENTES CON TOILETTE - PALERMO', 'APARTMENT', 'SALE', n.id, 'JOSE ORTEGA Y GASSET 1611, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.43102466524433, -34.568392088006405), 4326), 58.0, 62.0, 2.0, 2.0, 159000, 'LAS UNIDADES SE ENTREGAN CON PISOS, PINTADOS, ALTO Y BAJO MESADA EN COCINA, INSTALACION PARA A/A Y FRENTE E INTERIORES DE PLACARDS. EL EDIFICIO VA A CONTAR CON GYM, SOLARIUM Y PARRILLA. EL LOTE SE ESTRUCTURA CON PB LIBRE Y 10 COCHERAS; Y 7 PISOS DE UNIDADES DE 2 AMBIENTES CON TOILETTE DE 62M2 TOTALES Y MONOAMBIENTES DE 40M2 TOTALES AL FRENTE Y CONTRAFRENTE.TERMINACIONES: LOS BAÑOS Y COCINAS LLEVARÁN PISOS DE CERÁMICA DE PRIMERA CALIDAD O PORCELANATO, LOS BALCONES LLEVARÁN PISOS DE CERÁMICA DE PRIMERA CALIDAD. PISOS DE PORCELLANATO EN HALL DE ACCESO Y PB.REVESTIMIENTOS: LOS BAÑOS SERÁN REVESTIDOS EN CERÁMICA DE PRIMERA CALIDAD SAN LORENZO O PORCELANATO O SIMILAR. INSTALACIÓN DE AIRE ACONDICIONADO: SISTEMA PREPARADO PARA SISTEMA DE AIRE ACONDICIONADO FRIO/CALOR SPLIT. PREVISIÓN PARA UBICACIÓN DE UNIDADES EVAPORADORAS. NO SE COLOCARÁN LOS EQUIPOS. ASCENSORES: ASCENSOR DE ACUERDO A LA LEY 962 “ACCESIBILIDAD PARA TODOS”. SE UTILIZARÁ TECNOLOGÍA DE ÚLTIMA GENERACIÓN CON PUERTAS Y MANIOBRAS AUTOMÁTICAS. CARPINTERÍA METÁLICA: LA CARPINTERÍA METÁLICA EXTERIOR SERÁ DE PERFILES EXTRUIDOS DE ALUMINIO ANODIZADO LÍNEA MODENA O SIMILAR. LOS MARCOS DE LAS PUERTAS SERÁN DE CHAPA DOBLADA BWG N18. PUERTAS DE ACCESO A UNIDADES Y DE ESCALERA DE ACUERDO A NORMATIVA DE INCENDIO.PLACARES: FRENTES DE PLACARES CORREDIZOS ESPEJADOS O SIMILAR, CON LAMINA DE SEGURIDAD EN DORMITORIOS, EJECUTADOS EN ALUMINIO ANODIZADO CON GUÍAS SUPERIOR E INFERIOR Y EQUIPAMIENTO INTERIOR BÁSICO. MUEBLES DE COCINA: MUEBLES BAJO MESADA Y ALACENAS CONSTRUIDAS EN AGLOMERADO O MDF ENCHAPADO EN MELAMINA COLORES A DEFINIR SEGÚN DISEÑO. HERRAJES EN ALUMINIO ANODIZADO NATURAL. COCINA: HORNO Y ANAFE ELÉCTRICOMARMOLERÍA: LAS MESADAS DE COCINA SERÁN DE GRANITO GRIS MARA 0 SIMILAR DE 20MM Y ALZADAS SOBRE LA MESADA CON PILETA DE ACERO INOXIDABLE. EN LOS BAÑOS SE REALIZARÁN MESADAS DE MÁRMOL CON ZÓCALO DE 7CM EN EL PERÍMETRO. LAS BACHAS DE LOS TOILETTES SERÁN BLANCAS DE APOYO. PINTURA: LAS UNIDADES SE ENTREGARÁN PINTADAS CON ENDUIDO COMPLETO, LAS PAREDES CON LATEX, CIELORRASOS CON LATEX PARA CIELORRASOS, LA CARPINTERÍA METÁLICA CON ESMALTE SINTÉTICO. PORTERO ELÉCTRICO: PORTERO ELÉCTRICO CON FRENTE CON CÁMARA PREPARADO PARA MONITORES (OPCIONALES) EN LOS DEPARTAMENTOS. AGUA CALIENTE: LAS UNIDADES CONTARÁN CON SISTEMA DE AGUA CALIENTE CENTRAL. INCENDIO: EL EDIFICIO CONTARÁ CON UN SISTEMA DE PROTECCIÓN CONTRA INCENDIO COMPUESTO POR MATAFUEGOS Y MANGUERAS EN PALIERS Y ESPACIOS COMUNES. INSTALACIÓN SANITARIA: LA INSTALACIÓN PARA AGUA FRÍA Y CALIENTE SE EFECTUARÁ CON MATERIALES DE PRIMERA CALIDAD.', u.id, 'OWNER', true, 59.02, 'NEW', false, false, false, false, false, false, false, 123302.40043985737, 214447.2612894292, 'El rango de precio esperado para esta propiedad va de 123302 a 214447 USD, con una prediccion central de 168213 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la cantidad de banos. Bajan el precio: las expensas, la cochera y los amenities del edificio.', '[{"factor": "el barrio/zona", "contribution": 383.3227844238281, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -247.2711181640625, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -133.91241455078125, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": -112.96417999267578, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": 107.53768920898438, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'valentina.ruiz@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-184-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-184-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-184-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'valentina.ruiz@nidio.app'
  AND p.title = 'VENTA LANZAMIENTO - DOS AMBIENTES CON TOILETTE - PALERMO'
  AND p.address = 'JOSE ORTEGA Y GASSET 1611, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'DEPARTAMENTO DE 3 AMBIENTES CON PATIO Y PARRILLA PROPIA', 'APARTMENT', 'RENT', n.id, 'SOLER 3316, Comuna 2, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.411791868084656, -34.59614661549367), 4326), 65.0, 85.0, 3.0, 1.0, 890000, 'Excelente departamento de 3 ambientes super luminoso al frente, cuenta con living comedor con salida a balcón, dos dormitorios uno de ellos con salida a balcón aterrazado, cocina con muebles sobre y bajo mesada, toilette de recepción, baño completo con hidromasaje, amplio patio con parrilla.', u.id, 'OWNER', true, 163.93, 'NOT_SPECIFIED', false, false, false, false, true, false, true, 306.1044362256038, 652.0675197807647, 'El rango de precio esperado para esta propiedad va de 306 a 652 USD/mes, con una prediccion central de 463 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: que este amoblado. Bajan el precio: la cantidad de banos, el precio de referencia de mercado en la zona y la superficie cubierta.', '[{"factor": "la superficie", "contribution": -161.3114013671875, "direction": "baja el precio"}, {"factor": "que este amoblado", "contribution": 104.4651107788086, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": -51.217586517333984, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -40.12980651855469, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -38.88174819946289, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Recoleta' AND u.email = 'tomas.diaz@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-185-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-185-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-185-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'tomas.diaz@nidio.app'
  AND p.title = 'DEPARTAMENTO DE 3 AMBIENTES CON PATIO Y PARRILLA PROPIA'
  AND p.address = 'SOLER 3316, Comuna 2, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento con Impresionante vista - Nuñez', 'APARTMENT', 'SALE', n.id, 'ARIAS 2262, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.47163871208392, -34.541506296237664), 4326), 100.0, 108.0, 4.0, 2.0, 215000, 'Excelente 4 ambientes con Impresionante vista abierta ! Oportunidad.<br>Ubicado en la mejor zona de Nuñez.<br><br>Living comedor con salida a balcon corrido, con espectacular vista!!<br>Toilette de recepción.<br>Cocina  con lavadero. <br>Dormitorio principal en suite con vestidor<br>Segundo dormitorio  con placad espejado, con salida a balcon. <br>Tercer dormitorio esquinero con gran ventanal y ventanal espejado.<br>Todos los ambientes con excelente ingreso de luz y con hermosa vista. <br><br>Calefacción individual por losa radiante. Aire acondicionado.<br>Piso de madera. <br><br>1 cochera  cubierta en planta baja y Baulera<br><br>Amenities: Pileta con solarium (ultimo piso), GYM, SUM, Laundry<br><br>', u.id, 'OWNER', true, NULL, 'NOT_SPECIFIED', false, true, false, false, true, false, false, 244577.51347621082, 419695.380873604, 'El rango de precio esperado para esta propiedad va de 244578 a 419695 USD, con una prediccion central de 333179 USD. El factor que mas influye en esta prediccion es la cochera, que sube el precio. Tambien suben el precio: el barrio/zona y la superficie total. Bajan el precio: la superficie y los amenities del edificio.', '[{"factor": "la cochera", "contribution": 280.8205261230469, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -223.4280242919922, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": 213.0518798828125, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": -112.13514709472656, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 110.41890716552734, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Núñez' AND u.email = 'camila.torres@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-186-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-186-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-186-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'camila.torres@nidio.app'
  AND p.title = 'Departamento con Impresionante vista - Nuñez'
  AND p.address = 'ARIAS 2262, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Alquiler Departamento 3 Ambientes', 'APARTMENT', 'RENT', n.id, 'CORREA 2049, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.46853365206159, -34.542013425526086), 4326), 90.0, 90.0, 3.0, 2.0, 4575000, 'Departamento con 2 dormitorios Y balcon con gran vista. 2 baños completos. palier privado. edificio con pileta Y cochera incluida', u.id, 'OWNER', true, 393.44, 'NOT_SPECIFIED', true, true, true, false, false, false, false, 784.212817749873, 1487.5011813248964, 'El rango de precio esperado para esta propiedad va de 784 a 1488 USD/mes, con una prediccion central de 1131 USD/mes. El factor que mas influye en esta prediccion es los amenities del edificio, que sube el precio. Tambien suben el precio: el precio de referencia de mercado en la zona y la superficie total. Bajan el precio: que este amoblado y el barrio/zona.', '[{"factor": "los amenities del edificio", "contribution": 130.6522674560547, "direction": "sube el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 88.11776733398438, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 72.1863021850586, "direction": "sube el precio"}, {"factor": "que este amoblado", "contribution": -62.87776565551758, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -61.924293518066406, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Núñez' AND u.email = 'federico.romero@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-187-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-187-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-187-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'federico.romero@nidio.app'
  AND p.title = 'Alquiler Departamento 3 Ambientes'
  AND p.address = 'CORREA 2049, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento / Monoambiente en Alquiler - Balcón - Amenities - Palermo', 'APARTMENT', 'RENT', n.id, 'AV ADOLFO BERRO 3955, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.40963157832233, -34.57388726518425), 4326), 31.0, 31.0, 1.0, 1.0, 500000, 'Monoambiente en exclusivo edificio full amenities. Seguridad 24hs / Pileta / sum / Gimnasio / Parrilla / Sauna / Jacuzzi / Solarium / Laundry. Sumergite en una experiencia única: ¡Descubrí nuestro Open house 24x7! Explora virtualmente el departamento con nuestro tour 360º y disfruta de videos detallados. ¡No te lo pierdas! caracteristicas: - Departamento de 1 ambiente, con amplio balcón. - Full Amenities - Seguridad 24hs. - En pb pileta, sum y gimnasio. - En piso 14° sauna, jacuzzi y parrilla. - En primer ss laundry. - Amplio placard. - Servicios centrales para agua y calefacción. Destacados: - Piso de madera y porcelanatos. - Agua caliente central. - Aire Acondicionado. - Carpintería de aluminio. - Cortina de enrollar de aluminio. - Baño completo con bañera. Importante: - El departamento se entrega recién pintado, deberá devolverse en idénticas condiciones. - Locatario debe justificar ingresos comprobables (jubilaciones y pensiones no, ya que son inembargables) acorde al monto del alquiler y expensas. - Contrato por dos años. - Ajuste trimestral icl/ipc nivel general. - 1 mes de deposito. - Abl/inmobiliario y seguro integral a cargo del locatario. - Propietario no acepta mascotas. - ', u.id, 'OWNER', true, 182.3, 'NOT_SPECIFIED', true, false, true, true, false, false, false, 320.38058100997404, 691.7429958439117, 'El rango de precio esperado para esta propiedad va de 320 a 692 USD/mes, con una prediccion central de 482 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona y los amenities del edificio. Bajan el precio: la superficie total y la superficie cubierta.', '[{"factor": "la superficie", "contribution": -331.7146301269531, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -126.2931900024414, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 114.75817108154297, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 65.67123413085938, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": -56.28468704223633, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'julieta.sosa@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-188-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-188-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-188-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'julieta.sosa@nidio.app'
  AND p.title = 'Departamento / Monoambiente en Alquiler - Balcón - Amenities - Palermo'
  AND p.address = 'AV ADOLFO BERRO 3955, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Excelente Departamento', 'APARTMENT', 'SALE', n.id, 'AV ELCANO 3599, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4601021667629, -34.5782956425609), 4326), 62.0, 62.0, 3.0, 1.0, 159000, ' El departamento se encuentra en excelente estado, recién pintado, para irse a vivir ya !!!
<br> Se entrega con cortina sunscreen y blackout ademas de red de proteccion en todas las aberturas.
<br>DISPONIBILIDAD PARA ALQUILAR COCHERA DENTRO DEL EDIFICIO.', u.id, 'OWNER', true, 124.59, 'USED_GOOD_CONDITION', false, false, false, false, false, false, false, 137273.98441960086, 216859.29931009025, 'El rango de precio esperado para esta propiedad va de 137274 a 216859 USD, con una prediccion central de 176790 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Bajan el precio: la cochera, la cantidad de banos, la superficie total y los amenities del edificio.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 293.86114501953125, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": -101.0754623413086, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -84.18598937988281, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -66.5741195678711, "direction": "baja el precio"}, {"factor": "los amenities del edificio", "contribution": -59.517635345458984, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Colegiales' AND u.email = 'agustin.molina@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-189-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-189-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-189-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'agustin.molina@nidio.app'
  AND p.title = 'Excelente Departamento'
  AND p.address = 'AV ELCANO 3599, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT '5 AMBIENTES', 'APARTMENT', 'RENT', n.id, 'TRES ARROYOS 1374, Comuna 6, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4586613194734, -34.60797837894988), 4326), 157.0, 207.0, 5.0, 4.0, 3500000, 'Departamento tipo duplex  en una de las mejores zonas de Almagro. Sumamente luminoso y ventilado. una vista inmejorable , abierta. Inmueble muy comodo y funcional con espacios confortables. Balcon terraza con parillla. Superficie de 207metros. Tiene cochera fija en planta baja en el edificio de enfrente Avda. Rivadavia 4379.', u.id, 'OWNER', true, 393.44, 'NOT_SPECIFIED', false, true, false, false, true, false, false, 459.91126900109157, 775.5481754572425, 'El rango de precio esperado para esta propiedad va de 460 a 776 USD/mes, con una prediccion central de 602 USD/mes. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie, la cantidad de banos y la superficie total. Bajan el precio: la cantidad de ambientes.', '[{"factor": "el barrio/zona", "contribution": -479.1361083984375, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 443.9671325683594, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 167.96096801757812, "direction": "sube el precio"}, {"factor": "la superficie total", "contribution": 155.5832061767578, "direction": "sube el precio"}, {"factor": "la cantidad de ambientes", "contribution": -89.91714477539062, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Caballito' AND u.email = 'florencia.acosta@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-190-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-190-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-190-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'florencia.acosta@nidio.app'
  AND p.title = '5 AMBIENTES'
  AND p.address = 'TRES ARROYOS 1374, Comuna 6, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'PALERMO - HERMOSO DEPARTAMENTO 2 AMB.', 'APARTMENT', 'SALE', n.id, 'JUAN MORA FERNANDEZ 2968, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.39777712536389, -34.57889625142306), 4326), 40.0, 43.0, 2.0, 1.0, 75000, 'EXCELENTE UBICACION !!!  en la mejor zona de  PALERMO IMPECABLE DEPARTAMENTO 2 AMB1 DORMITORIOCOCINA INDEPENDIENTEBAÑO BALCON CORRIDO', u.id, 'OWNER', true, 85.25, 'USED_GOOD_CONDITION', false, false, false, false, false, true, false, 79340.43997308798, 137988.71717851164, 'El rango de precio esperado para esta propiedad va de 79340 a 137989 USD, con una prediccion central de 108238 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la superficie. Bajan el precio: las expensas, la superficie total y la cochera.', '[{"factor": "el barrio/zona", "contribution": 321.8763732910156, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 198.4612579345703, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -180.41635131835938, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -153.76251220703125, "direction": "baja el precio"}, {"factor": "la cochera", "contribution": -136.39199829101562, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'ignacio.medina@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-191-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-191-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-191-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'ignacio.medina@nidio.app'
  AND p.title = 'PALERMO - HERMOSO DEPARTAMENTO 2 AMB.'
  AND p.address = 'JUAN MORA FERNANDEZ 2968, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento en Venta', 'APARTMENT', 'SALE', n.id, 'GENOVA 3240, Comuna 11, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.48989166228231, -34.60867768495812), 4326), 53.0, 53.0, 1.0, 1.0, 128000, 'EXCELENTE OPORTUNIDAD DE COMPRA.2 AMBIENTES A ESTRENAR.AL CONTRAFRENTE CON LARGO BALCON CORRIDOMUY BUENA CATEGORÍA.SUPERFICIE CUBIERTA 44 M2SUPERFICIE DESCUBIERTA 9 M2TODO SOL Y LUZ.INGRESO A LIVING COMEDOR CON COCINA INTEGRADA.MUEBLES ALTO Y BAJO MESADA.COCINA A GAS Y ESPACIO PARA LAVARROPAS.AGUA CALIENTE INDIVIDUAL POR TERMOTANQUE.SALIDA AL BALCON DESDE EL LIVING.PISOS DE PORCELANATO DE MUY BUENA CALIDAD.DORMITORIO CON AMPLIO PLACARD CON INTERIORES.PISOS DE MADERA.BAÑO COMPLETO CON EXTRACTOR.DETALLES Y TERMINACIONES DE CATEGORÍA.AIRE ACONDICIONADO BGH FRIO/CALOR EN AMBOS AMBIENTES.EDIFICIO EN EXCELENTES CONDICIONES.POSIBILIDAD DE COCHERA.', u.id, 'OWNER', true, 65.57, 'NEW', false, false, false, false, true, false, false, 97562.55006437702, 153172.06847682947, 'El rango de precio esperado para esta propiedad va de 97563 a 153172 USD, con una prediccion central de 124855 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona. Bajan el precio: la cantidad de ambientes, las expensas y la superficie total.', '[{"factor": "el barrio/zona", "contribution": -262.1500244140625, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 197.78546142578125, "direction": "sube el precio"}, {"factor": "la cantidad de ambientes", "contribution": -143.7217559814453, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -111.81485748291016, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -98.63145446777344, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa del Parque' AND u.email = 'antonella.herrera@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-192-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-192-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-192-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'antonella.herrera@nidio.app'
  AND p.title = 'Departamento en Venta'
  AND p.address = 'GENOVA 3240, Comuna 11, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Casa en venta', 'HOUSE', 'SALE', n.id, 'AV RAFAEL OBLIGADO 4585, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.41702828746762, -34.554733175107124), 4326), 420.0, 550.0, 6.0, 4.0, 1200000, 'En el exclusivo barrio residencial Palermo. Excelentes accesos de entrada y salida a la ciudad. Lindísima casa de estilo inglés. Tres plantas. jardín y pileta.  Cochera cubierta y lugar para otro auto.  Aire acondicionado central e individual. Calefacción central y placas individuales en los dormitorios. Agua caliente por termotanque.  420 m2 cubiertos. Muy luminosa.', u.id, 'OWNER', true, NULL, 'NOT_SPECIFIED', true, true, false, false, true, false, false, 1181795.4337041092, 2055375.9963968834, 'El rango de precio esperado para esta propiedad va de 1181795 a 2055376 USD, con una prediccion central de 1612239 USD. El factor que mas influye en esta prediccion es el barrio/zona, que sube el precio. Tambien suben el precio: la superficie total y la cantidad de banos. Bajan el precio: el tipo de propiedad (Casa) y la superficie.', '[{"factor": "el barrio/zona", "contribution": 913.9782104492188, "direction": "sube el precio"}, {"factor": "el tipo de propiedad (Casa)", "contribution": -566.132490158081, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 551.9758911132812, "direction": "sube el precio"}, {"factor": "la cantidad de banos", "contribution": 473.9925842285156, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -433.01947021484375, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'franco.suarez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-193-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-193-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-193-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'franco.suarez@nidio.app'
  AND p.title = 'Casa en venta'
  AND p.address = 'AV RAFAEL OBLIGADO 4585, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Departamento Semipiso  en Venta ubicado en Villa Luro, Capital Federal', 'APARTMENT', 'SALE', n.id, 'ACASSUSO 5208, Comuna 10, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.50381245132183, -34.63956289458678), 4326), 50.0, NULL, 3.0, 3.0, 260000, 'El edificio cuenta con  piscina climatizada, un importante SUM de 200 m2  aprox. , solarium con deck de madera, gimnasio, sauna, parrillas, laundry, grupo electrógeno, seguridad las 24 hs, jardines parquizados y hall de acceso en doble altura . Estacionamiento de cortesía.

Las distintas unidades cuentan con carpintería de aluminio con doble vidriado hermético, agua caliente central, aire acondicionado frío calor con sistema de baja silueta, pisos de madera, deck de madera en balcones, interiores de placard, horno y anafe eléctrico en acero inoxidable. black out incluidos. Entrega inmediata.
Las cocheras son simples y dobles, desarrolladas  en 3 subsuelos, asignadas por unidad funcional.', u.id, 'OWNER', true, NULL, 'NEW', true, true, true, true, false, false, false, 152780.6025720126, 270465.91729740927, 'El rango de precio esperado para esta propiedad va de 152781 a 270466 USD, con una prediccion central de 215731 USD. El factor que mas influye en esta prediccion es la cantidad de banos, que sube el precio. Tambien suben el precio: la seguridad 24hs, la cochera y la superficie. Bajan el precio: el barrio/zona.', '[{"factor": "la cantidad de banos", "contribution": 589.0474243164062, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": -393.3904113769531, "direction": "baja el precio"}, {"factor": "la seguridad 24hs", "contribution": 334.9351501464844, "direction": "sube el precio"}, {"factor": "la cochera", "contribution": 233.2701873779297, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 226.566650390625, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Luro' AND u.email = 'milagros.castro@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-194-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-194-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-194-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'milagros.castro@nidio.app'
  AND p.title = 'Departamento Semipiso  en Venta ubicado en Villa Luro, Capital Federal'
  AND p.address = 'ACASSUSO 5208, Comuna 10, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta departamento 3 dormitorios Belgrano', 'APARTMENT', 'SALE', n.id, 'DR PEDRO IGNACIO RIVERA 2545, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.46254895119875, -34.55762783883206), 4326), 87.0, 91.0, 4.0, 2.0, 198000, 'Hermoso departamento en excelente estado de 3 dormitorios muy luminoso.Living-comedor amplio con balcon a la calle, super luminoso3 dormitorios soleados, baño completo y toilette. Cocina super amplia, con ventanal, despensa y Comedor diario.Todo el departamento tiene pisos de parquet y cuanta con aire acondicionadoPuerta principal blindada.La propiedad se caracteriza por ser muy luminoso en todos sus ambientes y por estar en impecable estado. Sus ambientes son espaciosos y están bien distribuidos lo que hace que sea una vivienda muy cómoda.', u.id, 'OWNER', true, 177.05, 'USED_GOOD_CONDITION', false, false, false, false, true, false, false, 252455.4170570214, 417739.4396419037, 'El rango de precio esperado para esta propiedad va de 252455 a 417739 USD, con una prediccion central de 337454 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: el barrio/zona y la superficie total. Bajan el precio: la superficie y las expensas.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 912.0338745117188, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 350.8376770019531, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -202.8530731201172, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 108.86708068847656, "direction": "sube el precio"}, {"factor": "las expensas", "contribution": -97.68997192382812, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'joaquin.ortiz@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-195-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-195-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-195-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'joaquin.ortiz@nidio.app'
  AND p.title = 'Venta departamento 3 dormitorios Belgrano'
  AND p.address = 'DR PEDRO IGNACIO RIVERA 2545, Comuna 13, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Alquiler 2 Ambientes en Belgrano ', 'APARTMENT', 'RENT', n.id, 'ARAOZ 1904, Comuna 14, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.42139581881895, -34.58963647054714), 4326), 60.0, 60.0, 2.0, 1.0, 800000, 'Departamento de 2 ambientes, excelente ubicación . Amplio living, cocina equipada, baño completo, dormitorio de amplias dimensiones, con un balcón corrido.', u.id, 'OWNER', true, 131.15, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 306.405293250533, 661.568547092926, 'El rango de precio esperado para esta propiedad va de 306 a 662 USD/mes, con una prediccion central de 461 USD/mes. El factor que mas influye en esta prediccion es la superficie, que baja el precio. Tambien suben el precio: el precio de referencia de mercado en la zona. Bajan el precio: la superficie cubierta, la cantidad de banos y la superficie total.', '[{"factor": "la superficie", "contribution": -200.449951171875, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": 98.78143310546875, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": -50.71637725830078, "direction": "baja el precio"}, {"factor": "la cantidad de banos", "contribution": -49.6862678527832, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -45.479278564453125, "direction": "baja el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'rocio.aguirre@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-196-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-196-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-196-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'rocio.aguirre@nidio.app'
  AND p.title = 'Alquiler 2 Ambientes en Belgrano '
  AND p.address = 'ARAOZ 1904, Comuna 14, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'VENTA PH 3 AMB', 'PH', 'SALE', n.id, 'ARREGUI 2115, Comuna 11, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4766736815284, -34.600359450806685), 4326), 233.0, 316.0, 3.0, 2.0, 215000, 'DETALLES DE MEJORAS EN LA VIVIENDA (A REFACCIONAR)<br><br>OPORTUNIDAD !!', u.id, 'OWNER', true, NULL, 'NEEDS_RENOVATION', false, false, false, false, false, true, false, 161834.7803209242, 244381.28446034255, 'El rango de precio esperado para esta propiedad va de 161835 a 244381 USD, con una prediccion central de 204596 USD. El factor que mas influye en esta prediccion es el barrio/zona, que baja el precio. Tambien suben el precio: la superficie total. Bajan el precio: la superficie, el precio de referencia de mercado en la zona y la superficie cubierta.', '[{"factor": "el barrio/zona", "contribution": -572.8728637695312, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": -508.73504638671875, "direction": "baja el precio"}, {"factor": "el precio de referencia de mercado en la zona", "contribution": -436.4028625488281, "direction": "baja el precio"}, {"factor": "la superficie cubierta", "contribution": -291.76129150390625, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": 289.6964111328125, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'La Paternal' AND u.email = 'emiliano.rojas@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-197-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-197-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-197-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'emiliano.rojas@nidio.app'
  AND p.title = 'VENTA PH 3 AMB'
  AND p.address = 'ARREGUI 2115, Comuna 11, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta - Departamento 2 Ambientes  ', 'APARTMENT', 'SALE', n.id, 'MANCO CAPAC 1630, Comuna 7, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4569051358241, -34.64894216563233), 4326), 44.0, 44.0, 2.0, 1.0, 54000, 'VENTA OPORTUNIDAD -  Departamento de 2 ambientes en venta en Flores. El departamento se encuentra en excelente ubicación. Al ingresar al departamento nos encontramos con una amplia Cocina con conexión para lavarropas que conecta con el Living - Comedor con salida y ventilación al Balcón francés, el dormitorio con placar completo y pisos de parquet y baño completo en impecable estado. El edificio no cuenta con ascensor. ', u.id, 'OWNER', true, 64.26, 'NOT_SPECIFIED', false, false, false, false, false, false, false, 54153.224023001334, 91339.93761862478, 'El rango de precio esperado para esta propiedad va de 54153 a 91340 USD, con una prediccion central de 74936 USD. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. Tambien suben el precio: la superficie. Bajan el precio: el barrio/zona, la superficie total y las expensas.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": -490.91595458984375, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -388.8984680175781, "direction": "baja el precio"}, {"factor": "la superficie total", "contribution": -172.50381469726562, "direction": "baja el precio"}, {"factor": "las expensas", "contribution": -136.56573486328125, "direction": "baja el precio"}, {"factor": "la superficie", "contribution": 118.68547821044922, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Flores' AND u.email = 'constanza.silva@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-198-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-198-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-198-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'constanza.silva@nidio.app'
  AND p.title = 'Venta - Departamento 2 Ambientes  '
  AND p.address = 'MANCO CAPAC 1630, Comuna 7, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'ALQUILER DEPARTAMENTO DUPLEX 2 AMBIENTES CON BALCON TERRAZA VILLA CRESPO', 'APARTMENT', 'RENT', n.id, 'CNEL APOLINARIO FIGUEROA 253, Comuna 15, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.44486589978072, -34.60384893223481), 4326), 55.0, 55.0, 2.0, 1.0, 2287500, 'Espectacular departamento de 2 ambientes, completamente amueblado, equipado y decorado, listo para mudarse de inmediato. Cochera opcional: 70 usd. Esta excelente unidad a estrenar, de 55 m2, se encuentra en el barrio de Villa Crespo, una zona en constante crecimiento. Cuenta con un dormitorio con aire acondicionado, un baño completo, una cocina integrada totalmente equipada con todos electrodomésticos esenciales, asi como heladera con freezer, horno, microondas, tostadora eléctrica, jarra eléctrica, entre otros! Posee un luminoso living-comedor con acceso a un amplio balcón. Su estratégica ubicación, a solo 3 cuadras del subte línea B, cercano a espacios verdes y propuestas culturales, lo convierte en una opción ideal. El precio mensual de 500 usd no incluye los gastos. Cochera opcional: 70 usd. Estamos comprometidos en ayudarte a encontrar el hogar de tus sueños. No dudes en contactarnos al +54 9 11 Ver datos. Todas las medidas mencionadas en este anuncio son aproximadas. ', u.id, 'OWNER', true, 131.15, 'NEW', false, false, false, false, true, false, true, 490.53659739325536, 804.6689955209972, 'El rango de precio esperado para esta propiedad va de 491 a 805 USD/mes, con una prediccion central de 615 USD/mes. El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que sube el precio. Tambien suben el precio: el estado de la propiedad (a estrenar) y que este amoblado. Bajan el precio: la superficie y el barrio/zona.', '[{"factor": "el precio de referencia de mercado en la zona", "contribution": 220.42742919921875, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": -185.14505004882812, "direction": "baja el precio"}, {"factor": "el barrio/zona", "contribution": -132.6239471435547, "direction": "baja el precio"}, {"factor": "el estado de la propiedad (a estrenar)", "contribution": 105.05293667316437, "direction": "sube el precio"}, {"factor": "que este amoblado", "contribution": 53.59119415283203, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Villa Crespo' AND u.email = 'bautista.nunez@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-199-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-199-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-199-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'bautista.nunez@nidio.app'
  AND p.title = 'ALQUILER DEPARTAMENTO DUPLEX 2 AMBIENTES CON BALCON TERRAZA VILLA CRESPO'
  AND p.address = 'CNEL APOLINARIO FIGUEROA 253, Comuna 15, Ciudad Autónoma de Buenos Aires';

INSERT INTO property (title, property_type, operation_type, neighborhood_id, address, location, surface_m2, total_surface_m2, rooms, bathrooms, price, description, created_by_user_id, publisher_type, active, expenses_usd, property_condition, has_pool, has_garage, building_amenities, security_24h, bright, apto_credito, furnished, valuation_range_min, valuation_range_max, valuation_explanation_text, valuation_explanation_json, created_at)
SELECT 'Venta 2 amb con cochera y baulera. Piso 16.', 'APARTMENT', 'SALE', n.id, 'AV PTE FIGUEROA ALCORTA 7799, Comuna 13, Ciudad Autónoma de Buenos Aires', ST_SetSRID(ST_MakePoint(-58.4521240408867, -34.5462844842028), 4326), 42.0, 48.0, 2.0, 1.0, 190000, 'Nuñez - 2 ambientes a estrenar con cochera cubierta y baulera. <br>Piso 16. Espectacular vista a la ciudad ! <br>Living comedor con salida al balcon terraza. Cocina integrada con barra desayunadora. Conexión para lavarropa. . <br>Dormitorio. Baño completo. <br>Baulera y cochera. <br>FULL AMENITIES: parrillas, pileta, solarium, sum, sauna, gimnasio, jardines en altura.<br>', u.id, 'OWNER', true, NULL, 'NEW', true, true, true, false, false, false, false, 119530.835786799, 205115.09393753135, 'El rango de precio esperado para esta propiedad va de 119531 a 205115 USD, con una prediccion central de 162832 USD. El factor que mas influye en esta prediccion es la cochera, que sube el precio. Tambien suben el precio: el barrio/zona, los amenities del edificio, la superficie y la superficie cubierta.', '[{"factor": "la cochera", "contribution": 308.6413269042969, "direction": "sube el precio"}, {"factor": "el barrio/zona", "contribution": 299.19683837890625, "direction": "sube el precio"}, {"factor": "los amenities del edificio", "contribution": 214.4670867919922, "direction": "sube el precio"}, {"factor": "la superficie", "contribution": 208.48121643066406, "direction": "sube el precio"}, {"factor": "la superficie cubierta", "contribution": 176.9441680908203, "direction": "sube el precio"}]'::jsonb, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Núñez' AND u.email = 'abril.cabrera@nidio.app';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-paso2-200-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-paso2-200-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-paso2-200-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'abril.cabrera@nidio.app'
  AND p.title = 'Venta 2 amb con cochera y baulera. Piso 16.'
  AND p.address = 'AV PTE FIGUEROA ALCORTA 7799, Comuna 13, Ciudad Autónoma de Buenos Aires';
