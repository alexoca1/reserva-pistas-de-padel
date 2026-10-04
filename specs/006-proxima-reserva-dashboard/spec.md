# Spec: "Tu próxima reserva" en el Dashboard

**Estado:** Completado

## Resumen
El Dashboard hoy es un saludo más dos tarjetas estáticas que solo enlazan a Pistas
y Reservas — no dice nada sobre lo que el usuario ya tiene reservado. Se añade una
tercera tarjeta que muestra la próxima reserva propia del usuario autenticado.

## Escenarios

- Como usuario, quiero ver en el Dashboard cuál es mi próxima reserva (pista,
  fecha, horario), para no tener que entrar a Reservas solo para comprobarlo.
- Como usuario sin reservas futuras, quiero un mensaje claro más un acceso directo
  para reservar, en vez de una tarjeta vacía sin explicación.
- Como administrador, quiero ver mi propia próxima reserva, no la de otro jugador
  del sistema.

## Requisitos funcionales

- RF-01: El Dashboard carga las reservas del usuario autenticado al montar,
  reutilizando `reservasService.getAll()`.
- RF-02: El filtrado por reservas propias (`usuario.id === user.id`) se aplica
  siempre, sin ramificar por rol — para un usuario normal el backend ya devuelve
  solo las suyas (spec 001), así que el filtro es un no-op; para un admin, es el
  filtro el que evita mostrar la reserva de otro jugador.
- RF-03: Se consideran "próximas" las reservas con fecha posterior a hoy, o con
  fecha de hoy cuya `horaFin` todavía no haya pasado.
- RF-04: De las reservas próximas, se ordena por fecha y hora de inicio ascendente
  y se muestra solo la primera.
- RF-05: La tarjeta muestra: número de pista, fecha con etiqueta relativa
  ("Hoy" / "Mañana" / `DD/MM`), y el rango horario.
- RF-06: Si no hay ninguna reserva próxima, la tarjeta muestra un estado vacío
  con botón "Reservar ahora" que enlaza a `/reservas`.
- RF-07: El botón de la tarjeta con datos enlaza a `/reservas` pasando la pista
  de esa reserva como estado de navegación (mismo mecanismo de la spec 004).
- RF-08: La tarjeta gestiona sus propios estados de carga y error, sin bloquear
  el resto del Dashboard si la petición falla.

## Fuera de alcance

- Mostrar más de una reserva próxima.
- Editar o cancelar la reserva directamente desde el Dashboard.
- Cambios en el backend.
- Notificaciones o recordatorios.

## Preguntas abiertas

Ninguna.