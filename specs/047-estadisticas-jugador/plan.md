# Plan: Estadísticas del Jugador

## Arquitectura y Diseño
- **Backend**:
  - DTO: `EstadisticasUsuarioDTO` (record) en `com.padel.reservas.dto`.
  - Endpoint `GET /auth/estadisticas` en `AuthController`.
  - Consultas usando `reservaRepository.findByUsuarioEmail(email)` y `pagoRepository.findByUsuarioId(usuario.getId())`.
  - Cálculo de horas en pista y partidos usando `r.esJugada(ahora)` y `Duration.between(r.getHoraInicio(), r.getHoraFin())`.
  - Pista favorita usando `groupingBy` sobre reservas con `EstadoReserva.CONFIRMADA`.
  - Gasto neto calculando cobros menos reembolsos de pagos del usuario.
- **Frontend**:
  - Interfaz `EstadisticasUsuario` en `types/index.ts`.
  - Método `getEstadisticas` en `perfilService` (`src/services/api.ts`).
  - Card de estadísticas en `PerfilPage.tsx` con diseño glassmorphism consistente con el resto de la app.
- **Pruebas**:
  - `AuthPerfilTest.java`: test sin token (401) y test autenticado (200 con campos esperados).
