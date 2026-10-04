# Tareas: Política de cancelación y antelación máxima

## Backend
- [x] T01 - `ConfiguracionClub`: añadir campo `horasCancelacionGratuita`
      (Integer, default 24) si no está ya tras spec 019
- [x] T02 - `ReservaService`: método `validarAntelacionReserva(fecha, config)`
- [x] T03 - `ReservaService`: método `validarCancelacion(reserva, esAdmin, config)`
- [x] T04 - `ReservasController.createReserva`: llamar a
      `validarAntelacionReserva` antes de `reservaService.crear`
- [x] T05 - `ReservasController.updateReserva`: misma llamada
- [x] T06 - `ReservasController.deleteReserva`: llamar a
      `validarCancelacion` antes del delete
- [x] T07 - Test: reserva para dentro de 8 días (límite 7) → rechazada
      con 400 y mensaje con fecha disponible más próxima
- [x] T08 - Test: cancelar reserva que empieza en 23 horas (límite 24h)
      como usuario normal → rechazada con 409
- [x] T09 - Test: cancelar esa misma reserva como admin → aceptada
- [x] T10 - Test: cancelar reserva que empieza en 25 horas como usuario
      normal → aceptada

## Frontend
- [x] T11 - `ReservasPage.tsx`: mostrar el mensaje de error de cancelación
      tardía (409) de forma clara — ya existe el manejo de 409 de
      solapamiento, usar el mismo patrón
- [x] T12 - `ReservasPage.tsx`: en el selector de fecha del formulario,
      deshabilitar fechas más allá de `hoy + diasAntelacionMaxima`
      (dato ya disponible desde `configuracionService.getDuraciones()`
      o un nuevo campo en ese endpoint)

## Documentación
- [x] T13 - `padel-backend/AGENTS.md`: anotar las nuevas validaciones
      en los endpoints `POST /reservas`, `PUT /reservas/{id}` y
      `DELETE /reservas/{id}`
- [x] T14 - Verificación manual: intentar reservar para dentro de 10 días
      → rechazado; intentar cancelar con menos de 24h → rechazado como
      usuario, aceptado como admin; cancelar con más de 24h → aceptado