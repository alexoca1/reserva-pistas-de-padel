# Spec: Limpieza automática de refresh tokens expirados

**Estado:** Implementada

## Resumen
La tabla `refresh_tokens` acumula filas indefinidamente porque nunca
se borran los tokens expirados. Un job nocturno los elimina
automáticamente, dejando solo los tokens de los últimos 7 días
(la ventana de vida de un refresh token), que son los únicos
necesarios para la detección de reutilización.

## Requisitos funcionales
- RF-01: Un job programado borra todos los `RefreshToken` cuya
  `expiryDate` sea anterior al momento de ejecución.
- RF-02: El job se ejecuta una vez al día (03:00 hora del servidor)
  para no competir con tráfico real.
- RF-03: Los tokens revocados pero aún dentro de su ventana de 7
  días NO se borran — son necesarios para detectar intentos de
  reutilización de tokens robados.
- RF-04: `@EnableScheduling` se activa en la clase principal o en
  una `@Configuration` existente.

## Fuera de alcance
- Endpoint manual de limpieza.
- Configuración del horario via `ConfiguracionClub`.
- Limpieza de otros tipos de datos.

## Tareas
- [x] T01 - `RefreshTokenRepository`: añadir
      `deleteAllByExpiryDateBefore(Instant ahora)`
- [x] T02 - `RefreshTokenService`: añadir método
      `limpiarExpirados()` con `@Scheduled(cron = "0 0 3 * * *")`
      y `@Transactional`
- [x] T03 - `PadelReservasApplication.java` (o
      `SecurityConfig.java`): añadir `@EnableScheduling`
- [x] T04 - Test: verificar que `deleteAllByExpiryDateBefore` se
      llama con `Instant.now()` al ejecutar el job
- [ ] T05 - Verificación manual: revisar los logs tras arrancar
      la app — Spring debe registrar el scheduler sin errores;
      ejecutar el método manualmente desde un test de integración
      y confirmar que las filas expiradas desaparecen