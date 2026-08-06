-- Baja lógica de propiedades (HU nueva: ABM de propiedades en el panel
-- admin). Una propiedad inactiva desaparece del catálogo público (mapa,
-- listados) pero sigue viéndose en el panel admin para poder reactivarla.
ALTER TABLE property ADD COLUMN active boolean NOT NULL DEFAULT true;
