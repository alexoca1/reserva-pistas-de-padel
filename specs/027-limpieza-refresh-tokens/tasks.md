# Tareas: Limpieza automática de refresh tokens expirados

## Backend
- [x] T01 - `RefreshTokenRepository`: añadir `deleteAllByExpiryDateBefore(Instant ahora)`
- [x] T02 - `RefreshTokenService`: añadir método `limpiarExpirados()` con `@Scheduled(cron = "0 0 3 * * *")` y `@Transactional`
- [x] T03 - `PadelReservasApplication.java`: añadir `@EnableScheduling`
- [x] T04 - Test: `RefreshTokenServiceTest` verifica que `deleteAllByExpiryDateBefore` se invoca con el instante actual
- [x] T05 - `padel-backend/AGENTS.md`: documentar la tarea programada de limpieza de tokens
