-- Cuota gratuita mensual (modelo de negocio): una fila por cada uso exitoso
-- de una función con límite (tasación o recomendador). El servicio cuenta las
-- filas del mes calendario actual para decidir si el usuario puede seguir
-- usándola gratis (ver UsageQuotaService). ON DELETE CASCADE para no dejar
-- usos huérfanos si se borra el usuario.
CREATE TABLE feature_usage (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    feature VARCHAR(30) NOT NULL,
    used_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_feature_usage_user_feature_used_at ON feature_usage (user_id, feature, used_at);
