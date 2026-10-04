package com.padel.reservas.config;

import com.padel.reservas.services.SecurityAuditService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Test unitario puro de RateLimitFilter: no levanta Spring context.
 * Usa Mockito para simular request/response/chain.
 */
@ExtendWith(MockitoExtension.class)
class RateLimitFilterTest {

    @Mock private SecurityAuditService auditService;
    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;
    @Mock private FilterChain chain;

    private RateLimitFilter filter;
    private StringWriter responseBody;

    @BeforeEach
    void setUp() throws Exception {
        filter = new RateLimitFilter(auditService);
        responseBody = new StringWriter();
        lenient().when(response.getWriter()).thenReturn(new PrintWriter(responseBody));
    }

    private void configureRequest(String method, String path, String ip) {
        when(request.getMethod()).thenReturn(method);
        when(request.getRequestURI()).thenReturn(path);
        when(request.getRemoteAddr()).thenReturn(ip);
    }

    @Test
    void primerasPeticiones_dentroDelLimite_pasanFiltro() throws Exception {
        configureRequest("POST", "/auth/login", "10.0.0.1");

        filter.doFilterInternal(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }

    @Test
    void sextaPeticion_superaLimite_devuelve429() throws Exception {
        configureRequest("POST", "/auth/login", "10.0.0.2");

        // 5 peticiones dentro del límite
        for (int i = 0; i < 5; i++) {
            filter.doFilterInternal(request, response, chain);
        }
        // 6ª petición — supera el límite
        filter.doFilterInternal(request, response, chain);

        verify(response).setStatus(429);
        verify(chain, times(5)).doFilter(request, response); // solo 5 pasaron
    }

    @Test
    void respuesta429_incluyeHeaderRetryAfter() throws Exception {
        configureRequest("POST", "/auth/login", "10.0.0.3");

        // Agotar el bucket (5 intentos)
        for (int i = 0; i < 5; i++) {
            filter.doFilterInternal(request, response, chain);
        }
        // 6ª petición → 429
        filter.doFilterInternal(request, response, chain);

        verify(response).setHeader("Retry-After", "60");
        assertThat(responseBody.toString()).contains("Demasiadas peticiones");
    }

    @Test
    void endpointNoLimitado_siemprePasa() throws Exception {
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/pistas");
        // No llamar a getRemoteAddr porque no debe extraerse la IP para endpoints libres

        filter.doFilterInternal(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }

    @Test
    void diferentesIPs_bucketsSeparados() throws Exception {
        // IP A agota su límite
        when(request.getMethod()).thenReturn("POST");
        when(request.getRequestURI()).thenReturn("/auth/login");
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");
        for (int i = 0; i < 6; i++) {
            filter.doFilterInternal(request, response, chain);
        }

        // IP B — bucket fresco, debe pasar
        HttpServletRequest requestB = mock(HttpServletRequest.class);
        when(requestB.getMethod()).thenReturn("POST");
        when(requestB.getRequestURI()).thenReturn("/auth/login");
        when(requestB.getRemoteAddr()).thenReturn("192.168.1.2");

        filter.doFilterInternal(requestB, response, chain);

        // chain se llamó: 5 veces para IP A + 1 para IP B = 6
        verify(chain, times(6)).doFilter(any(), eq(response));
    }

    @Test
    void auditService_llamadoCuandoSeSupelaLimite() throws Exception {
        configureRequest("POST", "/auth/register", "10.0.0.4");

        // Agotar el límite de register (3)
        for (int i = 0; i < 3; i++) {
            filter.doFilterInternal(request, response, chain);
        }
        // 4ª petición → 429
        filter.doFilterInternal(request, response, chain);

        verify(auditService).rateLimitSuperado("10.0.0.4", "POST:/auth/register");
    }
}
