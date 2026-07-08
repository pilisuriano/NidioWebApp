# Deuda técnica conocida del MVP

Registro de atajos tomados durante la implementación inicial (Auth + Épicas 2-5 con datos sintéticos) que hay que revisar antes de reemplazar los datos sintéticos por los datasets reales.

## Tabla de precios por m² duplicada entre backend y ml-service

`backend` sembró precios por barrio en `NEIGHBORHOOD_PRICE_M2` vía `V2__seed_synthetic_caba.sql` (usada para los heatmaps de la Épica 3). `ml-service` tiene su propia tabla de precios por barrio hardcodeada en `src/models/valuation.py` para resolver `/predict` (Épica 2). Son dos fuentes independientes que hoy están alineadas a mano, pero nada garantiza que sigan coincidiendo si se edita una sin la otra.

**Por qué pasó:** `ml-service` todavía no lee de la base de datos en runtime (ver `system-diagram.md`, la llamada a `/predict` no depende de `db`), así que necesitaba sus propios valores para devolver algo coherente.

**Cómo resolverlo:** cuando se cargue el dataset real y se entrene el modelo de valuación (reemplazando la lógica sintética de `valuation.py`), esta duplicación desaparece sola — el modelo entrenado no necesita la tabla hardcodeada. Mientras tanto, si se edita `NEIGHBORHOOD_PRICE_M2` (por ejemplo al ajustar el seed), hay que replicar el cambio a mano en `ml-service/src/models/valuation.py`.

## Proceso viejo del backend en el puerto 8080

Durante la implementación había un proceso del backend corriendo en background con el código anterior (servicios en `TODO`, sin los endpoints nuevos). Se reemplazó por el proceso con el código actual, pero si en algún momento el backend responde con comportamiento viejo (por ejemplo, un endpoint documentado que da 404), lo primero a chequear es que no haya dos procesos de `spring-boot:run` compitiendo por el puerto 8080 (`lsof -i :8080` en Mac/Linux).

## Lint y tests de frontend pendientes

Ver la nota en [`frontend/README.md`](../../frontend/README.md): tras migrar de TypeScript a JavaScript, `package.json` quedó sin script de `lint` ni de `test`, pero `frontend-ci.yml` todavía los invoca. Hay que reinstalar un linter JS (`oxlint`, como estaba definido en la propuesta original) y agregar tests antes de que el CI corra en verde.
