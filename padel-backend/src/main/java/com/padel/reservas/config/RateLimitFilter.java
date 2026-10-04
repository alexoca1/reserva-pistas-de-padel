/*
 * Reserva de Pistas de Pádel — Club Pádel Calatrava
 * Copyright (c) 2026 Alexander Ocampo Hernandez
 * Licencia: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 *           https://creativecommons.org/licenses/by-nc-sa/4.0/
 * Repositorio: https://github.com/alexoca1/reserva-pistas-de-padel
 */
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

/**
 * Filtro de rate limiting por IP usando token-bucket (Bucket4j, in-memory).
 * Se aplica únicamente a los endpoints sensibles definidos en LIMITES.
 * Detrás de un proxy inverso (Cloud Run / Netlify), la IP real del cliente
 * se resuelve en remoteAddr gracias a server.forward-headers-strategy=framework.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final SecurityAuditService auditService;
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    /** Límites por "METHOD:PATH" → capacidad máxima por minuto y por IP. */
    private static final Map<String, Long> LIMITES = Map.of(
        "POST:/auth/login",    5L,
        "POST:/auth/register", 3L,
        "POST:/auth/refresh",  20L,
        "PUT:/auth/perfil",    10L
    );

    @org.springframework.beans.factory.annotation.Autowired
    public RateLimitFilter(org.springframework.beans.factory.ObjectProvider<SecurityAuditService> auditServiceProvider) {
        this.auditService = auditServiceProvider.getIfAvailable();
    }

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
            // Endpoint no limitado → pasar directamente
            chain.doFilter(request, response);
            return;
        }

        String ip        = request.getRemoteAddr();
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
            if (auditService != null) {
                auditService.rateLimitSuperado(ip, clave);
            }
            response.setStatus(429);
            response.setHeader("Retry-After", "60");
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                "{\"error\":\"Demasiadas peticiones. Intenta de nuevo en un minuto.\"}"
            );
        }
    }
}
