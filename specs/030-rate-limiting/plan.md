# Plan — Spec 030: Rate Limiting por IP

## Decisiones de diseño

### Librería: Bucket4j Core (sin Redis)

Bucket4j-core usa buckets en memoria (`ConcurrentHashMap<String, Bucket>`).
Es suficiente para un servidor de instancia única. No se añade Redis/Caffeine —
cumple la filosofía Ponytail (sin complejidad innecesaria).

### Granularidad: método + path como clave de bucket

La clave de rate limit es `"IP:METHOD:PATH"` para que los límites de cada endpoint
sean independientes por IP. Ejemplo: `"1.2.3.4:POST:/auth/login"`.

### Configuración de límites como Map estático

Los límites se definen en un `Map<String, Long>` estático en el filtro (endpoint → capacidad).
Si en el futuro se necesita configuración dinámica, se mueve a `application.properties`.

### Registro en SecurityConfig

Se usa `.addFilterBefore(rateLimitFilter, BearerTokenAuthenticationFilter.class)` para
que el rate limit actúe antes de cualquier validación de JWT — protegiendo incluso
los endpoints públicos.

### IP del cliente

`request.getRemoteAddr()` es suficiente para desarrollo/pruebas. En producción
detrás de un proxy se usaría `X-Forwarded-For` — se documenta como `ponytail:` comment.

## Ficheros afectados

| Archivo | Acción |
|---|---|
| `pom.xml` | Añadir `bucket4j-core:8.10.1` |
| `config/RateLimitFilter.java` | Crear (nuevo) |
| `config/SecurityConfig.java` | Añadir `.addFilterBefore(...)` |
| `test/.../config/RateLimitFilterTest.java` | Crear (nuevo) |
| `padel-backend/AGENTS.md` | Actualizar sección de filtros/config |
