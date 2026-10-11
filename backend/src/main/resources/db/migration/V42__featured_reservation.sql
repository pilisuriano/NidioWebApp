-- Reserva de destacados: cuando los lugares están ocupados, el usuario puede reservar el destacado
-- para la primera fecha en que se libere uno. El pago guarda desde qué fecha arranca (null = ahora)
-- y el destacado reservado es un featured_listing con starts_at en el futuro.
ALTER TABLE payment ADD COLUMN featured_starts_at TIMESTAMP;
