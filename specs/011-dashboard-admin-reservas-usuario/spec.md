# Spec: Selector de usuario en el Dashboard del administrador

**Estado:** Completado

## Resumen
La tarjeta "Tu próxima reserva" del Dashboard (spec 006) asume que el usuario
autenticado tiene reservas propias. Para un administrador eso no aplica en la
práctica — no reserva pistas a su propio nombre. Se sustituye, solo para
`ROLE_ADMIN`, por un selector de jugador que muestra la próxima reserva de
quien se elija.

## Escenarios

- Como administrador, en vez de ver mi propia próxima reserva (que no existe
  en la práctica), quiero elegir un jugador de una lista y ver su próxima
  reserva.
- Como administrador, antes de elegir a nadie, quiero un mensaje claro de que
  debo seleccionar un jugador, no una tarjeta vacía sin explicación.
- Como administrador, si el jugador elegido no tiene reservas próximas,
  quiero un mensaje específico para ese caso, distinto del genérico.
- Como usuario no-admin, el comportamiento actual (spec 006) no cambia.

## Requisitos funcionales

- RF-01: Si el usuario autenticado no es admin, el Dashboard se comporta
  exactamente igual que en la spec 006, sin cambios.
- RF-02: Si el usuario autenticado es admin, la tarjeta pasa a titularse
  "Próxima reserva de un jugador" e incluye un selector con la lista de
  usuarios (mismo origen de datos que el selector ya existente en
  `ReservasPage`: `usuariosService.getAll()`).
- RF-03: Antes de seleccionar un jugador, la tarjeta muestra un mensaje de
  espera y no realiza ninguna petición de reservas.
- RF-04: Al seleccionar un jugador, se muestra su próxima reserva con el
  mismo criterio ya definido en la spec 006 (fecha futura, o fecha de hoy
  con `horaFin` aún no pasada).
- RF-05: Si el jugador seleccionado no tiene reservas próximas, se muestra
  un mensaje específico ("Este jugador no tiene reservas próximas"),
  distinto del mensaje para el propio usuario.
- RF-06: No se realiza ninguna llamada nueva al backend — se reutilizan
  `reservasService.getAll()` y `usuariosService.getAll()`, ambos ya
  existentes.

## Fuera de alcance

- Mostrar más de una reserva próxima por jugador.
- Preseleccionar al jugador elegido en el formulario de "Reservar ahora" al
  navegar desde el estado vacío — queda como posible mejora futura.
- Restringir en el backend que un admin pueda crear una reserva sin
  seleccionar usuario (spec 010 RF-02 se mantiene sin cambios). Si se
  decide bloquear esa vía más adelante, será una spec propia.
- Cambios en las otras dos tarjetas del Dashboard (Gestión de pistas,
  Gestión de reservas).

## Preguntas abiertas

Ninguna.