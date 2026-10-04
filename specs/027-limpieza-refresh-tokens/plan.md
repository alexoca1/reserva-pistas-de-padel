# Plan de implementación: Limpieza automática de refresh tokens expirados

## Arquitectura y diseño

### 1. Programación de tareas (Scheduling)
- Se habilita el soporte de tareas programadas en Spring Boot mediante `@EnableScheduling` en `PadelReservasApplication`.
- Se implementa un método `@Scheduled(cron = "0 0 3 * * *")` dentro de `RefreshTokenService`.
- Se anota con `@Transactional` para garantizar la ejecución atómica de la sentencia de borrado por lotes.

### 2. Repositorio de base de datos
- Se añade el método derivado `deleteAllByExpiryDateBefore(Instant ahora)` con `@Modifying` y `@Transactional` en `RefreshTokenRepository`.
- La consulta elimina de manera eficiente todos los registros de `refresh_tokens` cuya fecha de expiración sea estrictamente anterior al instante de ejecución.

### 3. Garantías de Seguridad (OWASP / Detección de Reúso)
- Los tokens revocados no expirados se preservan durante su ventana de validez original (7 días) para que el mecanismo de detección de reuso de tokens robados siga funcionando.
- Solo se purgan los tokens que han superado su `expiryDate`.

## Archivos afectados

- `padel-backend/src/main/java/com/padel/reservas/PadelReservasApplication.java`: `@EnableScheduling`
- `padel-backend/src/main/java/com/padel/reservas/repositories/RefreshTokenRepository.java`: `deleteAllByExpiryDateBefore`
- `padel-backend/src/main/java/com/padel/reservas/services/RefreshTokenService.java`: `limpiarExpirados()`
- `padel-backend/src/test/java/com/padel/reservas/services/RefreshTokenServiceTest.java`: Pruebas unitarias de limpieza
