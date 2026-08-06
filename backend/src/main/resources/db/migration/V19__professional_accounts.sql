-- Cuentas profesionales (inmobiliarias, corredores/martilleros, desarrolladores),
-- pensadas para que quien administra avisos como Inmobiliaria pueda tener un
-- registro con sus datos fiscales, no solo nombre/email/teléfono como una
-- cuenta particular. account_type distingue el tipo de cuenta; el resto de
-- las columnas solo se completan cuando account_type = 'PROFESSIONAL'.
ALTER TABLE "user" ADD COLUMN account_type VARCHAR(20) NOT NULL DEFAULT 'PERSONAL';
ALTER TABLE "user" ADD COLUMN professional_type VARCHAR(20);
ALTER TABLE "user" ADD COLUMN business_name VARCHAR(255);
ALTER TABLE "user" ADD COLUMN tax_condition VARCHAR(30);
ALTER TABLE "user" ADD COLUMN cuit VARCHAR(20);
-- "Teléfono móvil", distinto del "phone" ya existente (que en el formulario
-- profesional se usa como "Teléfono" de línea/oficina).
ALTER TABLE "user" ADD COLUMN mobile_phone VARCHAR(30);
