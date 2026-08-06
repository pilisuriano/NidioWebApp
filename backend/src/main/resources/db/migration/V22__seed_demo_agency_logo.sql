-- Logo placeholder para la inmobiliaria demo sembrada en V17, así se ve el
-- cartel de publicador completo (logo + verificado) sin depender de que
-- alguien lo suba a mano. DiceBear genera un ícono geométrico abstracto y
-- determinístico a partir del seed — no es una imagen real ni de un banco
-- con derechos, mismo criterio que el resto del catálogo sintético.
UPDATE "user"
SET logo_url = 'https://api.dicebear.com/7.x/shapes/svg?seed=Inmobiliaria%20Nidio%20Demo&backgroundColor=00647c'
WHERE email = 'inmobiliaria.demo@nidio.app';
