# Spec: Estadísticas del Jugador
**Estado:** En progreso

## Resumen
Permite a cada usuario autenticado consultar en su perfil un resumen de su actividad personal en el club: número de partidos jugados, horas acumuladas en pista, gasto neto simulado y pista favorita.

## Escenarios
- Como usuario autenticado, quiero visualizar mis métricas de juego (partidos jugados, horas en pista, gasto neto y pista favorita) en mi página de perfil para conocer mi actividad deportiva y económica simulada.
- Como usuario sin sesión activa, no debo poder acceder al endpoint de estadísticas (retorna 401 Unauthorized).

## Requisitos funcionales
- RF-01: Endpoint `GET /auth/estadisticas` en `AuthController`, protegido para cualquier usuario autenticado (`authentication.getName()`).
- RF-02: Retorno de `EstadisticasUsuarioDTO` (record) con `partidosJugados`, `horasEnPista`, `gastoNeto`, `pistaMasFrecuente`.
- RF-03: `partidosJugados`: conteo de reservas del usuario donde `r.esJugada(ahora)` sea verdadero.
- RF-04: `horasEnPista`: suma de duración en horas de las reservas jugadas, redondeada a 1 decimal (`Math.round(horas * 10.0) / 10.0`).
- RF-05: `gastoNeto`: suma de importes de pagos tipo `COBRO` menos tipo `REEMBOLSO` del usuario (obtenidos vía `pagoRepository.findByUsuarioId(id)`).
- RF-06: `pistaMasFrecuente`: número de pista con mayor frecuencia entre reservas `CONFIRMADAS` (historial completo incluyendo futuras), o `null` si no hay reservas confirmadas.
- RF-07: Frontend: Card "Mis estadísticas" en `PerfilPage.tsx` ubicada tras "Mis datos personales".
- RF-08: Métodos tipados en `types/index.ts` y servicio en `perfilService.getEstadisticas()` en `api.ts`.
- RF-09: Tests unitarios/seguridad en `AuthPerfilTest.java`.

## Fuera de alcance
- Rankings globales o comparativas públicas entre jugadores.
- Pagos reales (los importes continúan siendo simulados).
