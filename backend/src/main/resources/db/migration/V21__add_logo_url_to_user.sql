-- Logo de la cuenta profesional (inmobiliaria/corredor/desarrollador), para
-- mostrar en el cartel "Publicado por" del detalle de propiedad junto al
-- check de verificado. Nullable: no todas las cuentas profesionales lo
-- cargan, y las cuentas PERSONAL nunca lo usan.
ALTER TABLE "user" ADD COLUMN logo_url TEXT;
