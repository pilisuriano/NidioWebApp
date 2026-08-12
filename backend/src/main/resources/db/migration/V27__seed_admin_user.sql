-- Usuario admin de prueba para poder acceder al panel de administración
-- (rutas /api/admin/** protegidas con hasRole("ADMIN"), ver SecurityConfig)
-- sin tener que promover manualmente una cuenta ya registrada.
-- Password: Admin1234
INSERT INTO "user" (name, email, password_hash, email_verified, role, active, created_at, updated_at)
VALUES (
    'Admin Nidio',
    'admin@nidio.com',
    '$2b$10$QYeCbGUya22VlNqyIyjgQeXpgfTZ4WJCPbIEvMtTIMOrVTCHnoibC',
    true, 'ADMIN', true, now(), now()
)
ON CONFLICT (email) DO NOTHING;
