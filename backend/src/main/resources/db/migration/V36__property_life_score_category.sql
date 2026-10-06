-- Puntaje de Life Score por categoría para cada propiedad (7 filas por
-- propiedad, sin total). Lo usa el recomendador ("Recomendador con Nidi");
-- property.life_score (puntaje único de la ficha) no se toca.
--
-- El puntaje de una categoría depende solo de la ubicación de la propiedad y
-- de los datasets locales del ml-service, así que es determinista: se
-- calcula al publicar (o al cambiar la dirección) y se puede recalcular
-- cuando cambien los datasets. datasets_version identifica con qué versión
-- de datasets se calculó cada fila (ver app.life-score.datasets-version).
CREATE TABLE property_life_score_category (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES property (id) ON DELETE CASCADE,
    category VARCHAR(20) NOT NULL,
    score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
    poi_count INT NOT NULL CHECK (poi_count >= 0),
    datasets_version VARCHAR(40) NOT NULL,
    computed_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_property_life_score_category UNIQUE (property_id, category)
);

CREATE INDEX idx_property_life_score_category_property
    ON property_life_score_category (property_id);
