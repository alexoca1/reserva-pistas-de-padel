# Tareas: Titularidad real de reservas creadas por un administrador

- [x] T01 - `CreateReservaDTO.java`: añadir campo `Long usuarioId` (opcional)
- [x] T02 - `ReservasController`: método privado `resolverTitular`
- [x] T03 - `createReserva`: usar `resolverTitular` en vez de `findByEmail` directo
- [x] T04 - `updateReserva`: misma lógica que T03
- [x] T05 - `getDisponibilidadDia`: usar `r.getNombreJugador()` en el mapeo a `FranjaDTO`
- [x] T06 - Test: admin crea reserva con `usuarioId` → titular correcto, no el admin
- [x] T07 - Test: admin crea reserva sin `usuarioId` → comportamiento actual sin cambios
- [x] T08 - Test: usuario no-admin envía `usuarioId` de otro → se ignora, queda a su propio nombre
- [x] T09 - Verificación manual: admin reserva para "Ana" → la cuadrícula muestra "Ana"; si Ana inicia sesión, ve esa reserva como "Tu reserva" y puede editarla/eliminarla