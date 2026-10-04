# Tasks — Spec 029

## T01 — SecurityConfig.java: añadir cabeceras HTTP
- Añadir bloque `.headers()` en `securityFilterChain`.
- Cabeceras: CSP `default-src 'self'`, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
  `Permissions-Policy`.
- Sin dependencias nuevas; usar `StaticHeadersWriter` para las no nativas.

## T02 — Crear SecurityAuditService.java
- Paquete: `com.padel.reservas.services`.
- Logger: `private static final Logger log = LoggerFactory.getLogger(...)`.
- Métodos:
  - `loginExitoso(String email)`
  - `loginFallido(String email)`
  - `logout(String email)`
  - `cambioPassword(String email)`
  - `cambioEmail(String emailAntiguo, String emailNuevo)`
  - `avatarActualizado(String email)`

## T03 — AuthController.java: inyectar SecurityAuditService y auditar
- Añadir `SecurityAuditService` al constructor (ya usa `@RequiredArgsConstructor`).
- Llamar al método correcto en cada endpoint:
  - `/auth/login` éxito → `loginExitoso`; `BadCredentialsException` → `loginFallido`
  - `/auth/logout` → `logout`
  - `/auth/perfil` PUT cuando cambia password → `cambioPassword`
  - `/auth/perfil` PUT cuando cambia email → `cambioEmail`
  - `/auth/perfil/avatar` PUT → `avatarActualizado`

## T04 — Crear SecurityAuditServiceTest.java
- Paquete test: `com.padel.reservas.services`.
- Usar `ListAppender<ILoggingEvent>` para capturar logs de Logback.
- Verificar: `loginExitoso` → nivel INFO; `loginFallido` → nivel WARN.

## T05 — padel-backend/AGENTS.md: actualizar tabla de servicios
- Añadir fila `SecurityAuditService` en la sección de servicios.
