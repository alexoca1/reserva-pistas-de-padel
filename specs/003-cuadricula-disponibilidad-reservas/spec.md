# Spec: Cuadrícula de disponibilidad hora × pista

**Estado:** Completado

## Resumen
La tabla de reservas actual muestra solo lo que ya está reservado, fila por fila,
sin dar visibilidad de qué pistas están libres a qué horas. Se reemplaza por una
cuadrícula donde las columnas son pistas y las filas son franjas horarias, de modo
que el usuario ve de un vistazo toda la disponibilidad del día y puede reservar
directamente pulsando una celda libre.

## Escenarios

- Como usuario, quiero ver en una sola pantalla qué pistas están libres y ocupadas
  hora a hora, para elegir la que más me conviene sin tener que abrir el formulario
  a ciegas.
- Como usuario, quiero pulsar una celda libre para que el formulario de reserva
  se abra ya con la pista y la hora preseleccionadas.
- Como usuario, quiero que mis propias reservas se distingan visualmente de las
  reservas de otros jugadores (que solo aparecen como "Ocupada" sin exponer datos
  de terceros).
- Como administrador, quiero ver el nombre del jugador en las celdas ocupadas
  (dentro de mi propia vista), para gestionar la agenda.

## Requisitos funcionales

- RF-01: La vista principal de reservas muestra la cuadrícula en vez de la tabla
  de filas actual. La tabla de filas desaparece.
- RF-02: Las columnas son las pistas existentes; las filas son las franjas horarias
  de 06:00 a 23:00 en intervalos de 1 hora (mismo rango que ya existe en HORAS_RESERVA).
- RF-03: Un selector de fecha (date picker) encima de la cuadrícula controla qué
  día se muestra. Por defecto: hoy.
- RF-04: El backend expone un nuevo endpoint `GET /reservas/disponibilidad-dia?fecha=`
  que devuelve la ocupación de todas las pistas para esa fecha en una sola llamada,
  para no disparar N peticiones (una por pista).
- RF-05: Las celdas libres son clicables y abren el formulario con pista y hora
  de inicio preseleccionadas (hora de fin = horaInicio + 1h por defecto).
- RF-06: Las celdas ocupadas por otros usuarios muestran solo "Ocupada" sin exponer
  nombre ni teléfono (misma regla de PII de la spec 001).
- RF-07: Las celdas de la propia reserva del usuario se distinguen con un color
  diferente ("Tu reserva") y son clicables para editar.
- RF-08: Las celdas ocupadas por ROLE_ADMIN muestran el nombre del jugador.
- RF-09: En móvil (< md), la cuadrícula muestra las pistas de una en una con tabs
  o un selector de pista encima, para evitar scroll horizontal.
- RF-10: Si al intentar guardar otra sesión ya ocupó la franja (race condition),
  el frontend refresca la cuadrícula y muestra el error 409 ya existente.

## Fuera de alcance

- Duraciones variables (las reservas siguen siendo de hora en hora).
- Reservas recurrentes.
- Notificaciones de liberación de franja.
- Cambios en el modelo de entidades.

## Preguntas abiertas

Ninguna — requisitos claros para empezar.