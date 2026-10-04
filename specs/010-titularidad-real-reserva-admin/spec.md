# Spec: Titularidad real de reservas creadas por un administrador

**Estado:** Completado

## Resumen
Cuando un admin crea una reserva seleccionando un jugador, la cuadrícula
muestra el nombre del propio admin, no el del jugador. La causa raíz: el
backend nunca ha usado el jugador seleccionado por el admin para determinar
el propietario real de la reserva — `CreateReservaDTO` no tiene ningún
campo para indicar "en nombre de otro usuario", así que la reserva siempre
queda asociada a quien hace la llamada (el admin). Esto es anterior a la
spec 003; el nuevo endpoint de disponibilidad solo hizo visible un problema
que ya existía.

## Escenarios

- Como administrador, al reservar en nombre de un jugador concreto, quiero
  que la reserva quede asociada a ese jugador en base de datos, no a mi
  propia cuenta.
- Como jugador para quien un administrador hizo una reserva, quiero poder
  verla, editarla y cancelarla como propia.
- Como administrador, quiero ver el nombre correcto del jugador en las
  celdas ocupadas por reservas que gestioné.

## Requisitos funcionales

- RF-01: `CreateReservaDTO` acepta un campo `usuarioId` opcional.
- RF-02: Al crear o editar, si quien llama tiene `ROLE_ADMIN` y `usuarioId`
  viene informado, la reserva se asocia a ese usuario. Si no, se asocia al
  usuario autenticado (comportamiento actual, sin cambios).
- RF-03: Si `usuarioId` no corresponde a un usuario existente, `400` con
  mensaje claro.
- RF-04: `disponibilidad-dia` muestra en `nombreJugador` el valor de
  `Reserva.nombreJugador` (texto ya almacenado), no el nombre derivado de
  la relación `Usuario`.
- RF-05: Un usuario no-admin que envíe `usuarioId` en el payload lo ve
  ignorado — no puede hacer que una reserva quede a nombre de otro.

## Fuera de alcance

- Migrar reservas históricas ya mal asociadas a su titular correcto.
- Permitir que un usuario no-admin reserve "en nombre de" otro.
- Cambios en el frontend — `ReservasPage.tsx` ya envía `usuarioId` desde la
  spec 003; el backend lo ignoraba.

## Preguntas abiertas

Ninguna.