# Spec: Reservas de duración variable (60, 90 o 120 minutos)

**Estado:** Borrador

## Resumen
Las reservas pasan de ser siempre de 1 hora a poder durar 60, 90 o 120
minutos, reflejando cómo se alquilan las pistas de pádel en España. La
cuadrícula pasa a una rejilla de 30 minutos como unidad atómica. Se
introduce un campo `estado` en `Reserva` para que las canceladas no bloqueen
franjas, un código de reserva único para identificarlas, y un límite de 120
minutos de reserva por usuario por día.

## Escenarios
- Como usuario, quiero elegir si mi reserva dura 60, 90 o 120 minutos (por
  defecto 90), para ajustarme a cómo juego realmente.
- Como usuario, quiero ver en la cuadrícula cuánto ocupa mi reserva (o la de
  otro), no solo una franja de 30 min.
- Como usuario, quiero saber cuánto tiempo me queda disponible hoy antes de
  hacer la reserva, para no llegar al límite sin esperarlo.
- Como usuario, si dos personas intentan reservar la misma pista y hora casi
  a la vez, quiero que como mucho una lo consiga.

## Requisitos funcionales
- RF-01: El formulario permite elegir duración: 60, 90 (por defecto) o 120
  minutos. No hay otras duraciones.
- RF-02: La cuadrícula usa una rejilla de 30 minutos como unidad mínima.
- RF-03: La entidad `Reserva` almacena `horaInicio` y `horaFin` como
  `LocalTime` (en vez de `String` como hasta ahora).
- RF-04: `Reserva` incorpora un campo `estado`
  (CONFIRMADA / CANCELADA / COMPLETADA). Las reservas canceladas no bloquean
  franjas ni cuentan para el límite diario.
- RF-05: `Reserva` incorpora un `codigoReserva` único generado
  automáticamente al crear (formato `RES-YYYY-MMDD-NNN`).
- RF-06: Un usuario no puede acumular más de 120 minutos de reservas
  CONFIRMADAS en el mismo día. El backend rechaza con 400 y mensaje claro
  si superaría ese límite.
- RF-07: La creación y edición de reservas es segura frente a condiciones
  de carrera: si dos peticiones concurrentes intentan ocupar una franja de
  30 min en común, como máximo una tiene éxito; la otra recibe 409.
- RF-08: `disponibilidad-dia` sigue devolviendo rangos por reserva
  (`FranjaDTO`, horaInicio/horaFin) — el contrato de lectura no cambia.
  Solo se incluyen reservas con estado CONFIRMADA.
- RF-09: El último inicio válido depende de la duración: 120 min no puede
  empezar más tarde de 21:00, 90 min no más tarde de 21:30, 60 min no más
  tarde de 22:00 (cierre a las 23:00).

## Fuera de alcance
- Migrar reservas existentes — proyecto en fase de pruebas, se descartan.
- `ConfiguracionClub` (límites configurables por admin) — spec 019.
- Política de cancelación y antelación máxima — spec 020.
- Selección de horario por arrastre (drag) sobre la cuadrícula.
- Precalcular en cliente la duración máxima disponible por hueco libre.
- Fusionar visualmente (rowSpan) celdas de la misma reserva — mejora futura.

## Preguntas abiertas
Ninguna.