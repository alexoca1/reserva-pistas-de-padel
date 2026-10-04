# Plan técnico: Spec 040 — Preparación del Backend para Producción

**Spec relacionada:** `../spec.md`

---

## Diseño técnico

### 1. Dockerfile Multi-Etapa y Optimización JVM (RF-01)
- **Multi-Stage Build:**
  - `builder`: Utiliza `eclipse-temurin:21-jdk-alpine`. Ejecuta el build empaquetando el `.jar` ejecutable sin ejecutar tests (`-DskipTests`).
  - `runner`: Utiliza `eclipse-temurin:21-jre-alpine`. No incluye compiladores ni herramientas innecesarias, reduciendo la superficie de ataque y el peso final de la imagen (< 200 MB).
- **Ejecución no-root:** Se crea un usuario de sistema `appuser` (UID 1001) para ejecutar el proceso Java, mitigando riesgos de escalada de privilegios en el contenedor.
- **Flags de JVM para Cloud Run:**
  - `-XX:MaxRAMPercentage=75.0`: Permite que la JVM se adapte automáticamente a la memoria asignada al contenedor (ej. 512 MB o 1 GB en Cloud Run) sin hardcodear `-Xmx`.
  - `-XX:+UseSerialGC`: Recolector de basura de baja sobrecarga de CPU y memoria, ideal para instancias pequeñas con 1 vCPU.
  - `-XX:TieredStopAtLevel=1`: Limita la compilación JIT C2 en el arranque, reduciendo significativamente el tiempo de inicio en frío (*cold starts*) de Cloud Run.
- **Puerto dinámico:** Cloud Run inyecta la variable de entorno `$PORT`. La orden `ENTRYPOINT` pasa `-Dserver.port=${PORT:-8081}` al comando `java`.

### 2. Base de Datos en Aiven y Perfil `application-prod.properties` (RF-02)
- Se define `application-prod.properties` donde no existe ningún valor hardcodeado ni credencial por defecto.
- **Pool de Conexiones HikariCP:** Aiven limita el número máximo de conexiones concurrentes en su plan gratuito (máximo 76). Se configura `maximum-pool-size=5` y `minimum-idle=1`, garantizando que múltiples réplicas o herramientas administrativas no agoten el pool de la base de datos.
- **SSL Obligatorio:** La URL JDBC proporcionada por Aiven exige TLS/SSL (`sslMode=REQUIRED` o `useSSL=true&requireSSL=true`).

---

## Decisiones de diseño y justificación

### 1. Gestión de Esquema: `ddl-auto=update` como deuda técnica consciente
- **Decisión:** Mantener `spring.jpa.hibernate.ddl-auto=update` en el perfil de producción.
- **Justificación:** Para un proyecto de portafolio y demostración técnica, `update` simplifica el despliegue inicial y la sincronización automática de entidades (`Usuario.tipoAdmin`, `Reserva.fechaCancelacion`) sin requerir scripts SQL manuales.
- **Deuda técnica:** En un entorno de producción empresarial con datos críticos, se sustituiría por una herramienta de versionado de esquemas (Flyway o Liquibase) con `ddl-auto=validate` o `none` para evitar modificaciones no deterministas en caliente.

### 2. `server.forward-headers-strategy=framework` e IP Real de Cliente
- **Problema sin proxy headers:** Google Cloud Run y los balanceadores de carga de Google Cloud actúan como proxies inversos. Sin la lectura de cabeceras reenviadas (`X-Forwarded-For`), `HttpServletRequest.getRemoteAddr()` devolvería la IP interna del proxy de Cloud Run para todas las peticiones entrantes.
- **Impacto en Rate Limiting:** Si todas las peticiones provienen aparentemente de la misma IP interna, el filtro `RateLimitFilter` compartiría un único bucket para todos los usuarios del mundo, bloqueando a usuarios legítimos tras 5 intentos fallidos globales de login.
- **Solución:** Configurar `server.forward-headers-strategy=framework` habilita el `ForwardedHeaderFilter` de Spring, que extrae la IP pública real del cliente desde `X-Forwarded-For` y la establece de forma transparente en `getRemoteAddr()`.

### 3. Cookies de Refresh Token y Arquitectura Same-Origin vía Netlify Proxy
- **Decisión:** Mantener `SameSite=Lax` y `HttpOnly` en la cookie `refreshToken`, activando `Secure=true` en producción mediante la propiedad `app.cookie.secure=true`.
- **Justificación:** El frontend se desplegará en Netlify utilizando reglas de proxy/rewrite (`/api/*` redirigido transparentemente al dominio de Cloud Run). Al comunicarse a través del mismo origen ante el navegador del cliente:
  - No se sufren las restricciones de cookies de terceros (*Third-Party Cookies*).
  - No se requiere `SameSite=None` (que exigiría configuraciones complejas de particionado CHIPS en navegadores modernos).
  - La configuración de CORS existente no bloquea el tráfico del proxy.

---

## Impacto en seguridad y tests

- **Seguridad:** Ningún secreto queda expuesto en el repositorio git; se exige HTTPS en producción para las cookies de sesión y SSL en la capa de datos.
- **Tests:** `./mvnw test` continúa ejecutándose con el perfil default/test sin depender de Docker ni de la base de datos externa de Aiven.
