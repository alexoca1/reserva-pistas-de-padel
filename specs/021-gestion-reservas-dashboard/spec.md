# Spec: Gestión de reservas desde el Dashboard

**Estado:** Borrador

## Resumen
El Dashboard hoy muestra solo la próxima reserva como una línea de texto
con un botón que lleva a Reservas. Pasa a mostrar hasta 5 reservas futuras
como tarjetas, cada una con botones de editar y eliminar directamente
desde el propio Dashboard. Aplica igual para el admin viendo las reservas
de un jugador seleccionado.

## Escenarios
- Como usuario, quiero ver mis próximas reservas (hasta 5) en tarjetas en
  el Dashboard, con toda la info relevante de un vistazo.
- Como usuario, quiero cancelar una reserva directamente desde su tarjeta,
  sin ir a Reservas, respetando la misma ventana de cancelación ya
  existente.
- Como usuario, quiero editar una reserva desde su tarjeta — al pulsar
  "Editar" quiero llegar a Reservas con esa reserva concreta ya abierta
  para editar, sin tener que buscarla de nuevo en la cuadrícula.
- Como usuario con más de 5 reservas futuras, quiero un enlace para ver
  el resto en Reservas.
- Como administrador, quiero el mismo comportamiento para las reservas del
  jugador que tengo seleccionado.

## Requisitos funcionales
- RF-01: El Dashboard muestra hasta 5 reservas futuras (mismo criterio de
  "futura" ya usado en specs 006/011), ordenadas por fecha/hora ascendente.
- RF-02: Cada reserva se muestra como una tarjeta con pista, fecha
  (etiqueta relativa Hoy/Mañana/DD-MM), rango horario, y dos botones:
  Editar y Eliminar.
- RF-03: "Eliminar" pide confirmación antes de borrar. Al confirmar, llama
  al endpoint ya existente; éxito muestra un toast ("Reserva eliminada");
  error se muestra inline, no como toast.
- RF-04: "Editar" navega a `/reservas` pasando la reserva como estado de
  navegación; Reservas abre directamente el diálogo de edición de esa
  reserva, con la cuadrícula ya situada en la fecha correcta.
- RF-05: Si hay más de 5 reservas futuras, se muestra un enlace "Ver
  todas" hacia `/reservas`.
- RF-06: Si no hay ninguna reserva futura, se mantiene el estado vacío ya
  existente (mensaje + botón "Reservar ahora").
- RF-07: Para administrador, todo lo anterior aplica sobre las reservas
  del jugador seleccionado en el selector ya existente (spec 011); sin
  selección, se mantiene el mensaje de "selecciona un jugador".
- RF-08: La sección de reservas ocupa el ancho completo del Dashboard,
  debajo de las tarjetas de navegación — deja de ser una tercera tarjeta.
- RF-09: No se modifica ningún endpoint del backend.

## Fuera de alcance
- Cambiar el límite de 5 — queda fijo.
- Editar la reserva en línea en el Dashboard sin navegar a Reservas.
- Cambios en el backend.
- Paginación de "Ver todas" — Reservas ya lista todo sin límite.

## Preguntas abiertas
Ninguna.