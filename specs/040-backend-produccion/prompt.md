# Prompt de implementación — Spec 040: Preparación del Backend para Producción

Implementa la spec 040 siguiendo `spec.md`, `plan.md` y `tasks.md`.

---

## 1. Dockerfile y `.dockerignore` (`padel-backend/`)

### Paso 1: Crear `padel-backend/Dockerfile`
```dockerfile
# Etapa 1: Construcción con Maven
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copiar archivos del wrapper y dependencias primero para aprovechar la caché de capas
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline -B

# Copiar código fuente y compilar artefacto
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Etapa 2: Runtime ligero
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

# Usuario de sistema no root para ejecución segura
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar el jar empaquetado desde la etapa builder
COPY --from=builder /app/target/*.jar app.jar
RUN chown -R appuser:appgroup /app

USER appuser

# Variables de entorno por defecto para Cloud Run
ENV PORT=8081
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseSerialGC -XX:TieredStopAtLevel=1"

EXPOSE ${PORT}

# Ejecutar pasando dinámicamente el puerto de Cloud Run y flags de memoria JVM
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]
```

### Paso 2: Crear `padel-backend/.dockerignore`
```
target/
.mvn/wrapper/maven-wrapper.jar
.git/
.gitignore
.idea/
.vscode/
*.log
*.md
Dockerfile
.dockerignore
```

---

## 2. Perfil de Producción (`application-prod.properties`)

Crear `padel-backend/src/main/resources/application-prod.properties`:
```properties
spring.application.name=API Padel

# Conexión a Base de Datos (Aiven MySQL con SSL)
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Pool HikariCP ajustado para tier gratuito de Aiven (max 76 conexiones globales)
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=600000

# Esquema JPA (update como deuda técnica controlada de demo)
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.show-sql=false

# Puerto dinámico inyectado por Cloud Run
server.port=${PORT:8081}

# Reenvío de cabeceras para resolución de IP real de cliente tras proxy de Cloud Run
server.forward-headers-strategy=framework

# Secreto JWT
jwt.secret=${JWT_SECRET}

# Credenciales de Cloudinary
cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api-key=${CLOUDINARY_API_KEY}
cloudinary.api-secret=${CLOUDINARY_API_SECRET}

# Contraseña de semilla de Administrador
ADMIN_SEED_PASSWORD=${ADMIN_SEED_PASSWORD}

# Flag de cookie segura para HTTPS en producción
app.cookie.secure=true

# Límites de carga de archivos
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

---

## 3. Código Java (`RateLimitFilter.java` y `AuthController.java`)

### Paso 1: Limpieza en `RateLimitFilter.java`
En `padel-backend/src/main/java/com/padel/reservas/config/RateLimitFilter.java`:
Eliminar el comentario `ponytail:` de las líneas 29-31 que mencionaba la extracción de IP tras proxy, ya que queda resuelto a nivel de infraestructura mediante `server.forward-headers-strategy=framework`.

### Paso 2: Parametrizar cookies en `AuthController.java`
En `padel-backend/src/main/java/com/padel/reservas/controller/AuthController.java`:
1. Inyectar la propiedad:
   ```java
   @org.springframework.beans.factory.annotation.Value("${app.cookie.secure:false}")
   private boolean cookieSecure;
   ```
2. Actualizar las llamadas a `ResponseCookie.from("refreshToken", ...)` en `/auth/login`, `/auth/refresh` y `/auth/logout`:
   ```java
   .secure(cookieSecure)
   ```
   (Sustituyendo el `secure(false)` hardcodeado).

---

## 4. Pruebas y Verificación Local

1. **Tests unitarios:**
   Ejecutar `./mvnw test` en `padel-backend/` y verificar que pasen todos los tests (especialmente `RateLimitFilterTest`).
2. **Build de imagen Docker:**
   Ejecutar desde `padel-backend/`:
   ```bash
   docker build -t padel-backend .
   ```
3. **Prueba de arranque de contenedor:**
   ```bash
   docker run --rm -p 8081:8081 -e SPRING_PROFILES_ACTIVE=prod -e DB_URL="jdbc:mysql://host.docker.internal:3306/padel_reservas?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" -e DB_USERNAME="root" -e DB_PASSWORD="" -e JWT_SECRET="REMOVED_DEVELOPMENT_JWT_SECRET" -e CLOUDINARY_CLOUD_NAME="demo" -e CLOUDINARY_API_KEY="123" -e CLOUDINARY_API_SECRET="abc" -e ADMIN_SEED_PASSWORD="admin" padel-backend
   ```
   Comprobar que arranca y responde a `POST /auth/login`.

---

## 5. Documentación

### Paso 1: `README.md` (raíz)
Añadir sección `## Despliegue en producción`:
- Explicación de la arquitectura Cloud Run (Backend) + Aiven (MySQL) + Netlify (Frontend).
- Tabla de variables de entorno requeridas en Cloud Run:
  - `SPRING_PROFILES_ACTIVE` (fijar en `prod`)
  - `PORT` (inyectado automáticamente por Cloud Run)
  - `DB_URL` (cadena JDBC de Aiven con SSL)
  - `DB_USERNAME`
  - `DB_PASSWORD`
  - `JWT_SECRET`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `ADMIN_SEED_PASSWORD`

### Paso 2: `padel-backend/AGENTS.md`
Actualizar con la descripción del `Dockerfile`, el perfil `application-prod.properties` y las directivas de reenvío de proxy.
