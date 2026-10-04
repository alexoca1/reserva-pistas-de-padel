# Spec: Política de cancelación y antelación máxima

**Estado:** Borrador

## Resumen
Hoy una reserva se puede cancelar (eliminar) en cualquier momento y
para cualquier fecha futura, sin restricciones de tiempo. Tampoco hay
límite de con cuántos días de antelación se puede reservar. Esta spec
introduce ambas reglas, usando los parámetros ya configurables de
`ConfiguracionClub` (spec 019).

## Escenarios
- Como usuario, quiero poder cancelar mi reserva con al menos 24 horas
  de antelación sin penalización, para reorganizar mis planes con
  libertad razonable.
- Como usuario, si intento cancelar con menos de 24 horas de antelación,
  quiero un mensaje claro que me explique por qué no puedo.
- Como administrador, quiero poder cancelar cualquier reserva en cualquier
  momento, independientemente de la antelación — para gestionar
  imprevistos del club.
- Como usuario, al intentar reservar con más de 7 días de antelación,
  quiero un mensaje que me indique cuándo podré reservar esa fecha.

## Requisitos funcionales
- RF-01: `DELETE /reservas/{id}` por un usuario normal valida que la
  reserva empiece con al menos `horasCancelacionGratuita` horas de
  margen respecto a la hora actual. Si no, devuelve 409 con mensaje
  claro.
- RF-02: Un admin puede eliminar cualquier reserva sin restricción de
  antelación (comportamiento actual sin cambios para admin).
- RF-03: `POST /reservas` y `PUT /reservas/{id}` validan que la fecha
  de la reserva no supere `diasAntelacionMaxima` días desde hoy. Si
  supera el límite, devuelve 400 con mensaje claro indicando desde qué
  fecha podrá reservarse.
- RF-04: Ambos límites (`horasCancelacionGratuita` y
  `diasAntelacionMaxima`) se leen de `ConfiguracionClub` (spec 019),
  no se hardcodean.
- RF-05: `ConfiguracionClub` incorpora el campo
  `horasCancelacionGratuita` (default 24) si no lo tiene ya.

## Fuera de alcance
- Cancelación parcial (cambiar solo la hora, no eliminar la reserva).
- Lista de espera tras cancelación — spec futura.
- Email de confirmación de cancelación — spec futura.
- Penalización económica por cancelación tardía.
- Permitir al admin configurar una ventana de cancelación de 0h
  (cancelación siempre libre) — el campo ya lo soporta con valor 0,
  no hace falta lógica extra.

## Preguntas abiertas
Ninguna.