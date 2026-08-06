-- Nidio — esquema inicial (ver docs/architecture/erd.md)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Épica 1: Autenticación
CREATE TABLE "user" (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uk_user_email UNIQUE (email)
);

CREATE TABLE password_reset_token (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES "user" (id),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uk_password_reset_token_token UNIQUE (token)
);

-- Épica 3: Visualización Geoespacial (barrios y capas precalculadas)
CREATE TABLE neighborhood (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    boundary geometry(Polygon, 4326) NOT NULL,
    CONSTRAINT uk_neighborhood_name UNIQUE (name)
);

CREATE TABLE neighborhood_price_m2 (
    id BIGSERIAL PRIMARY KEY,
    neighborhood_id BIGINT NOT NULL REFERENCES neighborhood (id),
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('SALE', 'RENT')),
    avg_price_m2 NUMERIC(14, 2) NOT NULL,
    period DATE NOT NULL
);

CREATE TABLE noise_zone (
    id BIGSERIAL PRIMARY KEY,
    area geometry(Polygon, 4326) NOT NULL,
    noise_level NUMERIC(6, 2) NOT NULL
);

CREATE TABLE security_zone (
    id BIGSERIAL PRIMARY KEY,
    area geometry(Polygon, 4326) NOT NULL,
    crime_count INT NOT NULL,
    security_index NUMERIC(6, 2) NOT NULL
);

-- Épica 5: Exploración de Propiedades
CREATE TABLE property (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('APARTMENT', 'HOUSE', 'PH')),
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('SALE', 'RENT')),
    neighborhood_id BIGINT NOT NULL REFERENCES neighborhood (id),
    address VARCHAR(255) NOT NULL,
    location geometry(Point, 4326) NOT NULL,
    surface_m2 NUMERIC(10, 2) NOT NULL,
    rooms INT NOT NULL,
    price NUMERIC(14, 2) NOT NULL,
    image_url VARCHAR(500),
    valuation_range_min NUMERIC(14, 2),
    valuation_range_max NUMERIC(14, 2),
    life_score NUMERIC(5, 2),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Épica 2: Valuación de Propiedades
CREATE TABLE valuation_request (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES "user" (id),
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('SALE', 'RENT')),
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('APARTMENT', 'HOUSE', 'PH')),
    neighborhood_id BIGINT NOT NULL REFERENCES neighborhood (id),
    surface_m2 NUMERIC(10, 2) NOT NULL,
    rooms INT NOT NULL,
    declared_price NUMERIC(14, 2),
    estimated_min NUMERIC(14, 2) NOT NULL,
    estimated_max NUMERIC(14, 2) NOT NULL,
    result VARCHAR(20) CHECK (result IN ('UNDERVALUED', 'FAIR', 'OVERVALUED')),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Épica 4: Life Score
CREATE TABLE life_score_query (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES "user" (id),
    address VARCHAR(255) NOT NULL,
    location geometry(Point, 4326) NOT NULL,
    total_score NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE life_score_category_weight (
    id BIGSERIAL PRIMARY KEY,
    life_score_query_id BIGINT NOT NULL REFERENCES life_score_query (id),
    category VARCHAR(20) NOT NULL CHECK (category IN (
        'TRANSPORT', 'COMMERCE', 'GREEN_SPACE', 'HEALTH', 'GASTRONOMY', 'NIGHTLIFE', 'EDUCATION'
    )),
    weight INT NOT NULL CHECK (weight BETWEEN 1 AND 5),
    poi_count INT NOT NULL
);

-- Índices (ver docs/architecture/erd.md, sección "Índices")
CREATE INDEX idx_neighborhood_boundary ON neighborhood USING GIST (boundary);

CREATE INDEX idx_property_location ON property USING GIST (location);
CREATE INDEX idx_property_neighborhood_id ON property (neighborhood_id);
CREATE INDEX idx_property_property_type ON property (property_type);
CREATE INDEX idx_property_operation_type ON property (operation_type);

CREATE INDEX idx_noise_zone_area ON noise_zone USING GIST (area);
CREATE INDEX idx_security_zone_area ON security_zone USING GIST (area);

CREATE INDEX idx_neighborhood_price_m2_lookup ON neighborhood_price_m2 (neighborhood_id, operation_type, period);

CREATE INDEX idx_valuation_request_user_id ON valuation_request (user_id);

CREATE INDEX idx_life_score_query_location ON life_score_query USING GIST (location);
