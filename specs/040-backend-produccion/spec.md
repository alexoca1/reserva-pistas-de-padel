# Spec 040 — Preparación del Backend para Producción (Docker, Cloud Run & Aiven MySQL)

**Estado:** Planificada  
**Fecha:** 2026-10-04  
**Afecta:** `padel-backend` (`Dockerfile`, `.dockerignore`, `src/main/resources/application-prod.properties`, `RateLimitFilter.java`, `AuthController.java`), raíz (`README.md`), documentación (`padel-backend/AGENTS.md`)

---

## Resumen

Esta especificación prepara el backend (`padel-backend`) para su empaquetado en contenedor Docker y despliegue en producción serverless (**Google Cloud Run**) conectado a una base de datos MySQL gestionada en la nube (**Aiven**), preservando al 100% el comportamiento y flujo de desarrollo en el entorno local.

Los objetivos clave son:
1. **Contenedorización optimizada:** Construcción multi-etapa con Java 25, imagen base ligera (Alpine), ejecución con usuario sin privilegios (`appuser`), arranque rápido y adaptación a la variable de entorno `$PORT` inyectada por Cloud Run.
2. **Perfil `prod`:** Externalización estricta de todos los secretos y cadenas de conexión vía variables de entorno, configuración de SSL obligatorio para Aiven y limitación del pool de conexiones HikariCP a 5 conexiones para respetar los límites del tier gratuito de Aiven.
3. **Resolución de IP real de cliente:** Activación de `server.forward-headers-strategy=framework` para que el filtro de Rate Limiting aplique límites basados en la IP real del cliente detrás del proxy inverso de Cloud Run/Netlify.
4. **Seguridad de Cookies en Producción:** Activación de la flag `Secure=true` en la emisión de cookies del Refresh Token cuando el perfil activo sea producción.

---

## Escenarios

- **Como operador/desarrollador**, ejecuto `docker build -t padel-backend .` y obtengo una imagen Docker ligera y reproducible lista para desplegar en Google Cloud Run.
- **Como Cloud Run al recibir tráfico**, el contenedor arranca en menos de 5 segundos consumiendo un perfil mínimo de memoria gracias a los flags optimizados de la JVM (`UseSerialGC`, `MaxRAMPercentage`, `TieredStopAtLevel`).
- **Como usuario detrás del proxy de Netlify/Cloud Run**, interactúo con la API y mi cookie de Refresh Token se emite con `HttpOnly; Secure; SameSite=Lax`. Si realizo peticiones abusivas, el Rate Limit me bloquea a mí individualmente sin afectar a otros usuarios que compartan el proxy.
- **Como administrador de base de datos en Aiven**, compruebo que las conexiones del backend se realizan cifradas vía SSL y que el pool HikariCP no satura el límite de conexiones concurrentes del servicio.

---

## Requisitos funcionales

### RF-01 — Dockerfile multi-etapa y `.dockerignore` (`padel-backend/`)
- **Etapa 1 (Build):**
  - Imagen base `eclipse-temurin:25-jdk-alpine` o similar con Maven wrapper.
  - Copia de dependencias y código fuente, ejecución de `./mvnw clean package -DskipTests`.
- **Etapa 2 (Runtime):**
  - Imagen base `eclipse-temurin:21-jre-alpine`.
  - Creación de grupo y usuario de sistema no root (`appuser`).
  - Exposición dinámica del puerto mediante la variable `${PORT:-8081}`.
  - Flags de JVM optimizados para contenedor serverless:
    `-XX:MaxRAMPercentage=75.0 -XX:+UseSerialGC -XX:TieredStopAtLevel=1`
- **`.dockerignore`:**
  - Excluir `target/`, `.git/`, `.idea/`, `.vscode/`, `*.log`, `*.md`.

### RF-02 — Perfil de producción `application-prod.properties`
- Crear `padel-backend/src/main/resources/application-prod.properties`:
  - `spring.datasource.url=${DB_URL}` (la URL en Cloud Run incluirá parámetros de SSL exigidos por Aiven: `sslMode=REQUIRED&useSSL=true`).
  - `spring.datasource.username=${DB_USERNAME}`
  - `spring.datasource.password=${DB_PASSWORD}`
  - `spring.datasource.hikari.maximum-pool-size=5` (respetando el límite de 76 conexiones de Aiven).
  - `spring.datasource.hikari.minimum-idle=1`
  - `jwt.secret=${JWT_SECRET}`
  - `cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}`
  - `cloudinary.api-key=${CLOUDINARY_API_KEY}`
  - `cloudinary.api-secret=${CLOUDINARY_API_SECRET}`
  - `ADMIN_SEED_PASSWORD=${ADMIN_SEED_PASSWORD}`
  - `app.cookie.secure=true`
  - `server.forward-headers-strategy=framework`
  - `spring.jpa.hibernate.ddl-auto=update` (anotado como deuda técnica de demo).
  - `spring.jpa.show-sql=false`
  - `server.port=${PORT:8081}`

### RF-03 — IP real del cliente tras Proxy Inverso
- Al habilitar `server.forward-headers-strategy=framework`, Spring Boot registra automáticamente `ForwardedHeaderFilter`, traduciendo los encabezados `X-Forwarded-For` a `request.getRemoteAddr()`.
- En `RateLimitFilter.java`, eliminar el comentario `ponytail:` sobre reverse proxy, ya que la resolución queda delegada limpiamente a la configuración del framework.

### RF-04 — Configuración dinámica de Cookie `Secure` en `AuthController.java`
- Inyectar `@Value("${app.cookie.secure:false}") private boolean cookieSecure;` en `AuthController.java`.
- En todos los puntos de emisión de `ResponseCookie` (login, refresh, logout), utilizar `.secure(cookieSecure)`.
- En local continúa en `false` (permitiendo pruebas HTTP), y en `application-prod.properties` se fija en `true` (garantizando transporte HTTPS).

### RF-05 — Documentación de despliegue
- En `README.md` de la raíz, añadir la sección `## Despliegue en producción` detallando la arquitectura (Cloud Run + Aiven + Netlify) y la lista de variables de entorno requeridas (sin valores sensibles).
- Actualizar `padel-backend/AGENTS.md` con las instrucciones del Dockerfile y perfiles de Spring.

---

## Fuera de alcance
- Añadir `spring-boot-starter-actuator` (evitar dependencias adicionales según la Constitución).
- Migración a herramientas de versionado de BD como Flyway o Liquibase en esta etapa.
- Modificación de la lógica de negocio de reservas o pistas.
