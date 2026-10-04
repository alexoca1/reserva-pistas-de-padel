package com.padel.reservas.services;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifica que SecurityAuditService registra eventos con el nivel correcto.
 * Usa ListAppender de Logback (disponible sin dependencias adicionales en
 * el classpath de test de Spring Boot).
 */
class SecurityAuditServiceTest {

    private final SecurityAuditService auditService = new SecurityAuditService();
    private ListAppender<ILoggingEvent> listAppender;
    private Logger logger;

    @BeforeEach
    void setUp() {
        logger = (Logger) LoggerFactory.getLogger(SecurityAuditService.class);
        listAppender = new ListAppender<>();
        listAppender.start();
        logger.addAppender(listAppender);
    }

    @AfterEach
    void tearDown() {
        logger.detachAppender(listAppender);
    }

    @Test
    void loginExitoso_debeRegistrarNivelInfo() {
        auditService.loginExitoso("usuario@test.com");

        assertThat(listAppender.list)
                .anyMatch(e -> e.getLevel() == Level.INFO
                        && e.getFormattedMessage().contains("usuario@test.com")
                        && e.getFormattedMessage().contains("Login exitoso"));
    }

    @Test
    void loginFallido_debeRegistrarNivelWarn() {
        auditService.loginFallido("impostor@test.com");

        assertThat(listAppender.list)
                .anyMatch(e -> e.getLevel() == Level.WARN
                        && e.getFormattedMessage().contains("impostor@test.com")
                        && e.getFormattedMessage().contains("Login fallido"));
    }

    @Test
    void cambioEmail_debeRegistrarAmbosEmailsEnNivelInfo() {
        auditService.cambioEmail("viejo@test.com", "nuevo@test.com");

        assertThat(listAppender.list)
                .anyMatch(e -> e.getLevel() == Level.INFO
                        && e.getFormattedMessage().contains("viejo@test.com")
                        && e.getFormattedMessage().contains("nuevo@test.com"));
    }
}
