# Tareas: Reservas de duración variable (60, 90 o 120 minutos)

## Backend
- [x] T01 - Crear enum `EstadoReserva` (CONFIRMADA, CANCELADA, COMPLETADA)
- [x] T02 - `Reserva.java`: migrar `horaInicio`/`horaFin` de `String` a
      `LocalTime`; añadir `estado` (default CONFIRMADA), `codigoReserva`;
      añadir `@OneToMany` hacia `FranjaReservada`
- [x] T03 - Configurar `ObjectMapper` (o `application.properties`) para que
      `LocalTime` serialice como `"HH:mm"` y no como array
- [x] T04 - Crear entidad `FranjaReservada` con `horaSlot: LocalTime` y
      constraint única `(pista_id, fecha, hora_slot)`
- [x] T05 - Crear `FranjaReservadaRepository`
- [x] T06 - `ReservaRepository`: añadir
      `findByUsuarioAndFechaAndEstado(Usuario, LocalDate, EstadoReserva)`
- [x] T07 - Crear `ReservaService`: validación de duración y cierre,
      consulta de límite diario, generación de franjas atómicas,
      `saveAndFlush` con captura de constraint → `ReservaSolapadaException`,
      generación de `codigoReserva`
- [x] T08 - `ReservasController`: delegar `createReserva`/`updateReserva`
      en `ReservaService`; eliminar `validarSinSolapamiento` y
      `findSolapadas` si ya no tienen otros usos
- [x] T09 - `getDisponibilidadDia`: filtrar solo reservas con estado
      CONFIRMADA en el mapeo de franjas
- [x] T10 - Test: reserva de 90 min genera tres franjas correctas (10:00,
      10:30, 11:00)
- [x] T11 - Test: dos peticiones que compiten por la misma franja de 30 min
      — solo una tiene éxito (mock de `saveAndFlush` lanzando
      `DataIntegrityViolationException`)
- [x] T12 - Test: reserva de 120 min empezando a las 21:30 → rechazada
      (no cabe antes del cierre a las 23:00)
- [x] T13 - Test: usuario con 60 min ya reservados intenta añadir 90 min →
      rechazado por límite diario de 120 min
- [x] T14 - Test: editar una reserva cambiando duración libera franjas
      antiguas y reclama las nuevas; si las nuevas chocan, la edición falla
      y las franjas originales permanecen
- [x] T15 - Test: `disponibilidad-dia` excluye reservas con estado
      CANCELADA

## Frontend
- [x] T16 - Crear `src/lib/franjas.ts` (conversión hora↔minutos,
      `franjasDeReserva`, `sumarMinutos`)
- [x] T17 - `CuadriculaDisponibilidad.tsx`: `HORAS` en pasos de 30 min;
      `resolverSlot` sobre ventanas de 30 min; handler de clic repetido en
      cada celda de la misma reserva
- [x] T18 - `ReservasPage.tsx`: selector de duración (60 / 90 por defecto /
      120 min); calcular `horaFin` antes de enviar; mostrar minutos
      restantes del día
- [x] T19 - `types/index.ts`: actualizar tipos si `horaInicio`/`horaFin`
      necesitan ajuste; añadir `codigoReserva` y `estado` al tipo `Reserva`

## Documentación
- [x] T20 - Cubierto por `specs/018-housekeeping-documentacion` (actualizar
      AGENTS.md backend con FranjaReservada, ReservaService y EstadoReserva)
- [x] T21 - Verificación manual: crear reservas de 60, 90 y 120 min;
      confirmar franjas apiladas; confirmar error al superar el límite
      diario; confirmar error al pedir duración que no cabe antes del
      cierre; abrir dos pestañas y confirmar que solo una reserva la misma
      franja; editar reserva cambiando duración; confirmar que reservas
      canceladas no bloquean franjas ni cuentan en el límite diario;
      confirmar formato `"HH:mm"` en JSON (no array)