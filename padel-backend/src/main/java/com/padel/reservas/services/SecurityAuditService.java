package com.padel.reservas.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SecurityAuditService {

    private static final Logger log = LoggerFactory.getLogger(SecurityAuditService.class);

    public void loginExitoso(String email) {
        log.info("[AUDIT] Login exitoso | email={} | ts={}", email, LocalDateTime.now());
    }

    public void loginFallido(String email) {
        log.warn("[AUDIT] Login fallido  | email={} | ts={}", email, LocalDateTime.now());
    }

    public void logout(String email) {
        log.info("[AUDIT] Logout         | email={} | ts={}", email, LocalDateTime.now());
    }

    public void cambioPassword(String email) {
        log.info("[AUDIT] Cambio password | email={} | ts={}", email, LocalDateTime.now());
    }

    public void cambioEmail(String emailAntiguo, String emailNuevo) {
        log.info("[AUDIT] Cambio email   | de={} a={} | ts={}", emailAntiguo, emailNuevo, LocalDateTime.now());
    }

    public void avatarActualizado(String email) {
        log.info("[AUDIT] Avatar actualizado | email={} | ts={}", email, LocalDateTime.now());
    }

    public void rateLimitSuperado(String ip, String endpoint) {
        log.warn("[AUDIT] Rate limit superado | ip={} endpoint={} | ts={}", ip, endpoint, LocalDateTime.now());
    }
}
