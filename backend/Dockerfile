# Nidio backend -- build multi-stage: JDK+Maven para compilar, JRE liviano para correr.
# Motivo de usar Docker (no hay runtime nativo de Java en Render): ver roadmap del
# proyecto, seccion "Despliegue en Render + Vercel".

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render inyecta la variable PORT y espera que la app escuche ahi (ver
# application.properties: server.port=${PORT:8080}). -Xmx conservador porque el
# plan Free/Starter de Render da 512MB de RAM total al contenedor -- sin este limite
# el heap por defecto de la JVM puede terminar compitiendo con el resto y crashear
# (mismo tipo de problema de memoria que ya se vio en local, ver bitacora del
# proyecto -- aca la causa seria distinta, limite del contenedor en vez de pagefile
# de Windows, pero la mitigacion es la misma idea: acotar el heap).
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -Xmx400m ${JAVA_OPTS} -jar app.jar"]
