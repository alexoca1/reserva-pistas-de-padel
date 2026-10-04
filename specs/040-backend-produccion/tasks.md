# Tareas: Spec 040 — Preparación del Backend para Producción

- [x] **T01** — Crear `Dockerfile` (multi-stage con Java 21 Alpine, usuario no-root y flags JVM optimizados) y `.dockerignore` en `padel-backend/`.
- [x] **T02** — Crear `application-prod.properties` en `padel-backend/src/main/resources/` con configuración externalizada por variables de entorno, Hikari pool = 5, SSL para Aiven y `server.forward-headers-strategy=framework`.
- [x] **T03** — Limpiar comentario `ponytail:` en `RateLimitFilter.java` relativo al proxy inverso y verificar que los tests unitarios de `RateLimitFilterTest.java` siguen pasando.
- [x] **T04** — Parametrizar la flag `.secure(cookieSecure)` en `AuthController.java` con `@Value("${app.cookie.secure:false}")` y fijar `app.cookie.secure=true` en `application-prod.properties`.
- [x] **T05** — Verificar la compilación de la imagen Docker en local (`docker build -t padel-backend ./padel-backend`) y ejecutar `./mvnw test` asegurando 0 fallos.
- [x] **T06** — Añadir la sección `## Despliegue en producción` en `README.md` con la lista de variables requeridas y actualizar `padel-backend/AGENTS.md` con las instrucciones de contenedor y perfiles.
