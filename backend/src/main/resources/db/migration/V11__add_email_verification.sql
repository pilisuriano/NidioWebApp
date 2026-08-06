-- Verificación de email al registrarse (nuevo requisito: el registro manda
-- un mail de verificación y el login queda bloqueado hasta que el usuario
-- confirme). Backfill en true para no dejar afuera a los usuarios ya
-- registrados en desarrollo; el default pasa a false después, para que
-- cualquier alta futura (si no pasa por la app) arranque sin verificar.
ALTER TABLE "user" ADD COLUMN email_verified boolean NOT NULL DEFAULT true;
ALTER TABLE "user" ALTER COLUMN email_verified SET DEFAULT false;

-- Mismo patrón que password_reset_token (HU-03).
CREATE TABLE email_verification_token (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES "user" (id),
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
