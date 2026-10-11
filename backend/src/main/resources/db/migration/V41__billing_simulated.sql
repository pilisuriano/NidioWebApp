-- Planes, pase de análisis, adicionales, destacados y pagos de la pasarela SIMULADA
-- (modelo de negocio). Nada de esto guarda datos de tarjeta: el "pago" es un registro
-- que el usuario aprueba o rechaza con un botón (ver BillingService). Los montos están
-- en USD; la conversión a pesos solo se muestra en pantalla.

CREATE TABLE payment (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    item_code VARCHAR(40) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount_usd NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    property_id BIGINT REFERENCES property (id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP
);
CREATE INDEX idx_payment_user_created_at ON payment (user_id, created_at DESC);

-- Pase de análisis, planes de dueño y planes profesionales (30 días, sin renovación automática).
CREATE TABLE subscription (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    kind VARCHAR(30) NOT NULL,
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    replaced BOOLEAN NOT NULL DEFAULT FALSE,
    payment_id BIGINT REFERENCES payment (id) ON DELETE SET NULL
);
CREATE INDEX idx_subscription_user_expires_at ON subscription (user_id, expires_at);

-- Packs de usos (+10), de publicaciones (+50) y de destacados (x5).
CREATE TABLE addon (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL,
    quantity INTEGER NOT NULL,
    purchased_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    payment_id BIGINT REFERENCES payment (id) ON DELETE SET NULL
);
CREATE INDEX idx_addon_user_expires_at ON addon (user_id, expires_at);

-- Destacados de 7 días. Se cuentan los que todavía no terminaron (ends_at > ahora)
-- contra el cupo global de 15 y el tope por cuenta.
CREATE TABLE featured_listing (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES property (id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    source VARCHAR(20) NOT NULL,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    addon_id BIGINT REFERENCES addon (id) ON DELETE SET NULL,
    payment_id BIGINT REFERENCES payment (id) ON DELETE SET NULL
);
CREATE INDEX idx_featured_listing_ends_at ON featured_listing (ends_at);
CREATE INDEX idx_featured_listing_property ON featured_listing (property_id, ends_at);
CREATE INDEX idx_featured_listing_user ON featured_listing (user_id, source);
