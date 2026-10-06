# Stage 1: Build
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Copy Maven wrapper and configuration
COPY mvnw mvnw.cmd ./
COPY .mvn .mvn
COPY pom.xml .

# 🔑 LA LÍNEA CRUCIAL: Añadir permisos antes de ejecutar mvnw
RUN chmod +x mvnw

# Descargar dependencias fuera de línea
RUN ./mvnw -q dependency:go-offline

# Copy source code and package omitting tests
COPY src src
RUN ./mvnw clean package -DskipTests -Dmaven.test.skip=true

# Stage 2: Runtime
FROM eclipse-temurin:25-jre-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy artifact from build stage
COPY --from=build --chown=appuser:appgroup /app/target/*.jar app.jar

USER appuser

ENV PORT=8081
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseSerialGC -XX:TieredStopAtLevel=1"

EXPOSE 8081

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]

