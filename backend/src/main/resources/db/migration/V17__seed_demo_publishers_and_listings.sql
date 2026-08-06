-- Datos de demo para poder ver en pantalla las características nuevas
-- (V16) y el cartel de publicador sin tener que cargar un aviso a mano:
-- dos publicadores (una inmobiliaria y un dueño directo) con dos avisos
-- cada uno, con todas las características completas y fotos ilustrativas
-- (Picsum Photos, banco abierto — mismo criterio que el resto del catálogo
-- sintético: no son propiedades reales).
-- Password de ambas cuentas demo (por si se quiere probar el login): Demo1234!
INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES (
    'Inmobiliaria Nidio Demo',
    'inmobiliaria.demo@nidio.app',
    '$2b$10$E2Vtd9VL8O9Z4XrHFrJXIeMvw3klqsjtgoY8zuaUYG8LaT1wc2g7W',
    true, 'USER', true, now(), now()
);

INSERT INTO "user" (name, email, password_hash, phone, email_verified, role, active, created_at, updated_at)
VALUES (
    'Marcos Ferreyra',
    'marcos.ferreyra.demo@nidio.app',
    '$2b$10$baPf3b93qXwQAV7KOF/rj.szA/n/urYVfk2.QeXUwLpFGyaXQakbS',
    '1155667788',
    true, 'USER', true, now(), now()
);

-- Inmobiliaria Nidio Demo — 2 avisos (Palermo y Belgrano)
INSERT INTO property (
    title, property_type, operation_type, neighborhood_id, address, location,
    surface_m2, total_surface_m2, rooms, bathrooms, age_years, orientation, price,
    description, created_by_user_id, publisher_type, active, created_at
)
SELECT
    'Departamento 2 ambientes con balcón en Palermo',
    'APARTMENT', 'SALE', n.id, 'Av. Santa Fe 3253',
    ST_SetSRID(ST_MakePoint(-58.4173, -34.5895), 4326),
    52, 58, 2, 1, 8, 'Frente', 185000,
    'Luminoso departamento de 2 ambientes al frente, con balcón francés, cocina integrada y placares en ambos ambientes. Edificio con portero y ascensor. A metros de Plaza Italia y del subte D.',
    u.id, 'AGENCY', true, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Palermo' AND u.email = 'inmobiliaria.demo@nidio.app';

INSERT INTO property (
    title, property_type, operation_type, neighborhood_id, address, location,
    surface_m2, total_surface_m2, rooms, bathrooms, age_years, orientation, price,
    description, created_by_user_id, publisher_type, active, created_at
)
SELECT
    'Departamento 3 ambientes a estrenar en Belgrano',
    'APARTMENT', 'RENT', n.id, 'Av. Cabildo 2100',
    ST_SetSRID(ST_MakePoint(-58.4570, -34.5627), 4326),
    68, 72, 3, 2, 0, 'Contrafrente', 420000,
    'A estrenar, sin uso. 3 ambientes con dependencia de servicio, cochera fija incluida y amenities: SUM, laundry y gimnasio. Orientación contrafrente, muy silencioso.',
    u.id, 'AGENCY', true, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Belgrano' AND u.email = 'inmobiliaria.demo@nidio.app';

-- Marcos Ferreyra (dueño directo) — 2 avisos (Almagro y Caballito)
INSERT INTO property (
    title, property_type, operation_type, neighborhood_id, address, location,
    surface_m2, total_surface_m2, rooms, bathrooms, age_years, orientation, price,
    description, created_by_user_id, publisher_type, active, created_at
)
SELECT
    'PH 3 ambientes con patio en Almagro',
    'PH', 'SALE', n.id, 'Bulnes 1450',
    ST_SetSRID(ST_MakePoint(-58.4205, -34.6083), 4326),
    75, 90, 3, 1, 35, 'Interno', 165000,
    'PH de dos plantas con patio propio, ideal para reformar o mudarse directo. Vendo por mudanza al interior. Sin intermediarios, trato directo con el dueño.',
    u.id, 'OWNER', true, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Almagro' AND u.email = 'marcos.ferreyra.demo@nidio.app';

INSERT INTO property (
    title, property_type, operation_type, neighborhood_id, address, location,
    surface_m2, total_surface_m2, rooms, bathrooms, age_years, orientation, price,
    description, created_by_user_id, publisher_type, active, created_at
)
SELECT
    'Monoambiente luminoso en Caballito',
    'APARTMENT', 'RENT', n.id, 'Av. Rivadavia 4980',
    ST_SetSRID(ST_MakePoint(-58.4436, -34.6187), 4326),
    28, 30, 1, 1, 15, 'Frente', 210000,
    'Monoambiente al frente, muy luminoso, con balcón. A dos cuadras del subte A. Apto profesional. Alquilo directamente, sin comisión de inmobiliaria.',
    u.id, 'OWNER', true, now()
FROM neighborhood n, "user" u
WHERE n.name = 'Caballito' AND u.email = 'marcos.ferreyra.demo@nidio.app';

-- Fotos ilustrativas: Picsum Photos (banco abierto, sin API key, CDN
-- estable) con seed fija por propiedad — así cada aviso siempre muestra
-- las mismas fotos entre sí (no son reales, son solo ilustrativas).
INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-palermo-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-palermo-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-palermo-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'inmobiliaria.demo@nidio.app'
  AND p.title = 'Departamento 2 ambientes con balcón en Palermo';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-belgrano-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-belgrano-2/1200/800', 1),
        ('https://picsum.photos/seed/nidio-belgrano-3/1200/800', 2)
) AS img(url, ord)
WHERE u.email = 'inmobiliaria.demo@nidio.app'
  AND p.title = 'Departamento 3 ambientes a estrenar en Belgrano';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-almagro-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-almagro-2/1200/800', 1)
) AS img(url, ord)
WHERE u.email = 'marcos.ferreyra.demo@nidio.app'
  AND p.title = 'PH 3 ambientes con patio en Almagro';

INSERT INTO property_image (property_id, url, sort_order)
SELECT p.id, img.url, img.ord
FROM property p
JOIN "user" u ON p.created_by_user_id = u.id
CROSS JOIN LATERAL (
    VALUES
        ('https://picsum.photos/seed/nidio-caballito-1/1200/800', 0),
        ('https://picsum.photos/seed/nidio-caballito-2/1200/800', 1)
) AS img(url, ord)
WHERE u.email = 'marcos.ferreyra.demo@nidio.app'
  AND p.title = 'Monoambiente luminoso en Caballito';
