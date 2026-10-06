# Registro de la prueba de carga (50 usuarios)

Completar los campos con "___" antes y después de correr la prueba. Es el respaldo para el capítulo 7 del informe.

## 1. Antes de correr: configuración (anotar tal cual está en Render)
| Dato | Valor |
|---|---|
| Fecha y hora de la prueba | 06/10/2026, entre las 03:08 y las 03:16 aprox. (hora que muestra el panel de Render; la prueba corta fue ≈ 03:00) |
| Quién la corrió y desde dónde (casa, universidad, tipo de conexión) | Pilar Suriano, desde Buenos Aires (Argentina). Conexión: wifi |
| Backend (Spring Boot): tipo de instancia, RAM y CPU | Render, plan de USD 7/mes (`0.5c-512mb`): 0,5 CPU y 512 MB de RAM. Región: Oregon (US West) |
| ml-service (Python): tipo de instancia, RAM y CPU | Render, plan de USD 7/mes (`0.5c-512mb`): 0,5 CPU y 512 MB de RAM. Región: Oregon (US West) |
| Base de datos: proveedor y plan | PostgreSQL de Render (`nidio-db`), región Oregon (US West), 1 GB de almacenamiento (11,18 % usado al 06/10/2026). PostgreSQL 18, plan de USD 6/mes (`0.1c-256mb`): 0,1 CPU y 256 MB de RAM. Límite de conexiones simultáneas: 100 (según el panel de Render) |
| Dirección del backend probado | https://nidiowebapp.onrender.com |
| Commit desplegado (primeros 7 caracteres) | 7bc5051 ("Pruebas testing") |
| Cuenta de prueba usada | pilisuriano@gmail.com (sin la contraseña) |
| Versión de k6 (`k6 version`) | k6.exe v2.2.0 (commit/00a9a1b7f5, go1.26.5, windows/amd64) |

## 2. Prueba corta (SMOKE) contra Render
- ¿Salió sin errores? Sí. 3 usuarios, 30 s, contra https://nidiowebapp.onrender.com: 18 de 18 chequeos correctos, 0 % de errores en 22 pedidos. Tiempos p(95): consultas 998 ms, cálculos 1,64 s, Life Score 1,76 s; el pedido más rápido tardó 249 ms (incluye el viaje Buenos Aires - Oregon). Las seis funciones respondieron bien (catálogo, ficha, mapa de precios, valuación, Life Score, recomendador).

## 3. Prueba real (50 usuarios, ~8 min)
| Resultado | Valor | Meta |
|---|---|---|
| Errores (`http_req_failed`) | 0,00 % (0 de 6.360 pedidos) | menos de 1 % |
| p(95) consultas (`tipo:consulta`) | 624,39 ms | menos de 2000 ms |
| p(95) cálculos (`tipo:calculo`) | 549,42 ms | menos de 5000 ms |
| p(95) Life Score (`endpoint:life_score`) | 583,27 ms | menos de 5000 ms |
| Total de pedidos (`http_reqs`) | 6.360 (≈13,6 por segundo; 1.891 iteraciones completas) | — |
| Chequeos que pasaron (`checks_succeeded`) | 100 % (6.356 de 6.356) | más de 99 % |

Durante la prueba, en el panel de Render (Metrics) de cada servicio:
| Servicio | CPU máxima | Memoria máxima | ¿Se reinició o dio error? |
|---|---|---|---|
| Backend | 51,24 % del límite de 0,5 CPU (≈ 0,26 CPU) | 58,90 % de 512 MB (≈ 302 MB); antes de la prueba ≈ 47 % | No. Sin reinicios |
| ml-service | 26,88 % del límite de 0,5 CPU | 50,20 % de 512 MB (≈ 257 MB); antes de la prueba ≈ 35 % | No. Sin reinicios |
| Base de datos (`nidio-db`) | 65,62 % del límite de 0,1 CPU | Working set ≈ 49,7 % de 256 MB (≈ 127 MB), estable (a las 03:13: RSS 22,5 %, caché de páginas 46,6 %) | No. Sin reinicios (conexiones activas máximas: 12 de 100) |

## 4. Observaciones
- Distancia: quien ejecuta la prueba está en Buenos Aires y los servicios están en Oregon (US West). Cada pedido incluye el tiempo de viaje de ida y vuelta, por lo que los tiempos medidos por k6 son mayores que los tiempos de procesamiento de los servicios. Declararlo en el informe.
- Recursos ajustados: los dos servicios tienen 512 MB de RAM y 0,5 CPU, y la base de datos 256 MB de RAM y 0,1 CPU. La base es el recurso más chico de los tres: mirar sus métricas (CPU, memoria y conexiones) durante la prueba. Si es el cuello de botella, se documenta como hallazgo.
- Reinicios: ningún servicio se reinició ni reportó falta de memoria durante la prueba.
- Pedidos que vio el backend (gráfico Total Requests de Render): 6.382 en la ventana medida. Coincide con los 6.360 de k6 más los 22 de la prueba corta (6.360 + 22 = 6.382), lo que confirma que ningún pedido se perdió en el camino.
- Recursos: el eslabón más exigido fue la base de datos (CPU 65,62 % de 0,1 CPU, pero con ruido de base de 5-20 % aun sin carga); el backend llegó a 51,24 % de CPU y el ml-service a 26,88 %. La memoria subió de forma moderada y se estabilizó (sin crecimiento sostenido) en los tres.
- Conexiones a la base: se mantuvieron en 11-12 (límite 100), por debajo de los 50 usuarios porque el backend comparte un pool de conexiones y cada una se usa solo mientras dura la consulta. Verificar en `application.properties` el tamaño del pool (por defecto HikariCP usa 10).
- Los valores de CPU y memoria son los picos que marca el panel de Render (anotados en el documento `Resultados de pruebas Render.docx`); los de memoria en MB se calcularon a partir del porcentaje y el límite del plan. La zona horaria del panel es GMT-3 (Buenos Aires).
- ¿Algún umbral falló (con ✗)? No. Los seis umbrales pasaron (✓).
- Resultados generales de la corrida (7 min 47 s, hasta 50 usuarios virtuales): tiempo de respuesta promedio 338,89 ms, mediana 256,12 ms, p(90) 481,43 ms, p(95) 600,77 ms, máximo 2,79 s. Datos recibidos: 88 MB.
- Alcance de la prueba: los usuarios virtuales simulan pausas de 1 a 4 s entre acciones, por lo que la carga es moderada (≈13,6 pedidos por segundo), no un estrés al límite. Es una sola corrida de 5 min a 50 usuarios: no es una prueba de estrés ni de resistencia prolongada.
- Valores atípicos: el máximo de 2,79 s no afectó el p(95). Pendiente de revisar si coincide con algún pedido en frío o con la base de datos.
- Pendiente: métricas de Render (CPU, memoria, conexiones) y revisar las consultas más frecuentes de la base de datos (posibles consultas repetidas en el listado).

## 5. Archivos que guardar
- `tests/carga/resultado-50vu.json` (lo genera k6).
- Texto completo de la consola de k6: pegarlo en `docs/pruebas/consola-k6-50vu.txt`.
- Capturas del panel de Render, en `docs/pruebas/capturas/`: `backend-cpu.png`, `backend-memoria.png`, `backend-pedidos.png`, `mlservice-cpu.png`, `mlservice-memoria.png`, `db-cpu.png`, `db-memoria.png`, `db-conexiones.png`.
