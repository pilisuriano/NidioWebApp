-- Rol de administrador (HU nueva: panel admin) y baja lógica de cuentas.
-- Todos los usuarios existentes quedan como USER activos por defecto; el
-- primer admin se promueve manualmente con un UPDATE (ver backend/README).
ALTER TABLE "user" ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER';
ALTER TABLE "user" ADD COLUMN active boolean NOT NULL DEFAULT true;
