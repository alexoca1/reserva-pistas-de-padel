# Tasks — Spec 030

## T01 — pom.xml: añadir bucket4j-core
- Añadir dentro de `<dependencies>`:
  ```xml
  <dependency>
      <groupId>com.bucket4j</groupId>
      <artifactId>bucket4j-core</artifactId>
      <version>8.10.1</version>
  </dependency>
  ```

## T02 — Crear RateLimitFilter.java
- Paquete: `com.padel.reservas.config`
- Extiende `OncePerRequestFilter`
- Mapa estático de límites: `POST:/auth/login→5`, `POST:/auth/register→3`,
  `POST:/auth/refresh→20`, `PUT:/auth/perfil→10`
- `ConcurrentHashMap<String, Bucket>` para buckets por IP+endpoint
- Clave: `"IP:METHOD:PATH"`
- Si la clave no está en el mapa de límites → `chain.doFilter` directo
- Si `bucket.tryConsume(1)` falla → HTTP 429 + `Retry-After: 60` + JSON error
- Llamar a `SecurityAuditService.rateLimitSuperado(ip, endpoint)` al rechazar
- Añadir `rateLimitSuperado(String ip, String endpoint)` a `SecurityAuditService`

## T03 — SecurityConfig.java: registrar el filtro
- Añadir `RateLimitFilter` como dependencia inyectada
- En `securityFilterChain`, añadir:
  `.addFilterBefore(rateLimitFilter, org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter.class)`

## T04 — Crear RateLimitFilterTest.java
- Paquete test: `com.padel.reservas.config`
- Test unitario puro (sin Spring context): instanciar `RateLimitFilter` directamente
- Mock de `HttpServletRequest`, `HttpServletResponse`, `FilterChain`
- Test 1: primera petición a `POST /auth/login` → `chain.doFilter` llamado
- Test 2: 6 peticiones seguidas a `POST /auth/login` → la 6ª devuelve 429
- Test 3: respuesta 429 incluye header `Retry-After: 60`

## T05 — padel-backend/AGENTS.md: documentar el filtro
- Añadir sección "Filtros de seguridad" con `RateLimitFilter`
- Añadir entrada en changelog
