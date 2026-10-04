# Plan — Spec 029: Seguridad cabeceras HTTP y logging de auditoría

## Decisiones de diseño

### Parte A — Cabeceras HTTP

Spring Security 6 expone `http.headers(headers -> headers.xxx())` para cada
cabecera estándar. Para cabeceras no nativas del DSL (como `Permissions-Policy`
y un CSP personalizado) se usa `headers.addHeaderWriter(new
StaticHeadersWriter(...))`.

No se añaden filtros propios ni dependencias.

### Parte B — SecurityAuditService

- Logger SLF4J con `LoggerFactory.getLogger(SecurityAuditService.class)`.
- Métodos simples, un método por evento, sin estado.
- Inyectado en `AuthController` mediante `@RequiredArgsConstructor` (ya
  establecido como patrón en el Artículo 3 de la constitución).
- El timestamp se formatea con `LocalDateTime.now()` de Java 17 (sin
  dependencias externas).

### Prueba

Test JUnit con `@ExtendWith(MockitoExtension.class)` que captura logs
usando un `ListAppender` de Logback (disponible en el classpath de test
de Spring Boot sin dependencias adicionales).

## Ficheros afectados

| Archivo | Acción |
|---|---|
| `config/SecurityConfig.java` | Añadir bloque headers() |
| `services/SecurityAuditService.java` | Crear (nuevo) |
| `controller/AuthController.java` | Inyectar + llamadas de auditoría |
| `test/.../services/SecurityAuditServiceTest.java` | Crear (nuevo) |
| `padel-backend/AGENTS.md` | Actualizar tabla de servicios |
