# Prompt — Spec 030: Rate Limiting por IP

Implementa specs/030-rate-limiting siguiendo spec.md, plan.md y
tasks.md (T01-T05). Sigue .specify/memory/constitution.md — sin
dependencias nuevas más allá de bucket4j-core:8.10.1.

Solo backend. No tocar frontend.

## T01 — pom.xml

```xml
<dependency>
    <groupId>com.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.10.1</version>
</dependency>
```

## T02 — SecurityAuditService.java: añadir rateLimitSuperado

```java
public void rateLimitSuperado(String ip, String endpoint) {
    log.warn("[AUDIT] Rate limit superado | ip={} endpoint={} | ts={}", ip, endpoint, LocalDateTime.now());
}
```

## T03 — RateLimitFilter.java

```java
package com.padel.reservas.config;

import com.padel.reservas.services.SecurityAuditService;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final SecurityAuditService auditService;
    // ponytail: IP extraída de remoteAddr; detrás de un proxy usar X-Forwarded-For
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    private static final Map<String, Long> LIMITES = Map.of(
        "POST:/auth/login",    5L,
        "POST:/auth/register", 3L,
        "POST:/auth/refresh",  20L,
        "PUT:/auth/perfil",    10L
    );

    public RateLimitFilter(SecurityAuditService auditService) {
        this.auditService = auditService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String metodo = request.getMethod();
        String path   = request.getRequestURI();
        String clave  = metodo + ":" + path;

        Long limite = LIMITES.get(clave);
        if (limite == null) {
            chain.doFilter(request, response);
            return;
        }

        String ip = request.getRemoteAddr();
        String bucketKey = ip + ":" + clave;

        Bucket bucket = buckets.computeIfAbsent(bucketKey, k ->
            Bucket.builder()
                .addLimit(Bandwidth.builder()
                    .capacity(limite)
                    .refillIntervally(limite, Duration.ofMinutes(1))
                    .build())
                .build()
        );

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            auditService.rateLimitSuperado(ip, clave);
            response.setStatus(429);
            response.setHeader("Retry-After", "60");
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"Demasiadas peticiones. Intenta de nuevo en un minuto.\"}");
        }
    }
}
```

## T04 — SecurityConfig.java

Añadir `RateLimitFilter` como dependencia y registrarla:

```java
private final RateLimitFilter rateLimitFilter;
```

En `securityFilterChain`, antes de `.oauth2ResourceServer(...)`:
```java
.addFilterBefore(rateLimitFilter,
    org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter.class)
```

## T05 — RateLimitFilterTest.java

Test unitario puro con Mockito (sin Spring context). Verifica:
1. Primera petición a POST /auth/login → chain.doFilter llamado
2. Petición 6 a POST /auth/login → response.setStatus(429)
3. Petición 429 incluye header Retry-After: 60
