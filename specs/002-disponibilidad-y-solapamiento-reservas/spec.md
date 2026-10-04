# Spec: Disponibilidad y prevención de solapamiento en reservas

**Estado:** Aprobado

## Resumen
Actualmente el backend no valida que una pista esté libre en el horario solicitado, y el frontend no muestra qué horarios ya están ocupados. Dos usuarios pueden reservar la misma pista a la misma hora sin ningún aviso.

## Escenarios

- Como usuario, quiero ver qué horarios ya están ocupados para una pista en la fecha que elijo, para no intentar reservar un horario que ya está cogido.
- Como usuario, si igualmente intento reservar un horario ya ocupado (p. ej. por una condición de carrera entre dos pestañas), quiero un mensaje claro de que ese horario ya no está disponible, en vez de una reserva duplicada silenciosa.
- Como administrador, quiero que las mismas reglas apliquen cuando gestiono reservas por otros usuarios.

## Requisitos funcionales

- RF-01: `POST /reservas` rechaza la creación si la pista ya tiene una reserva que se solapa con el rango `horaInicio`-`horaFin` solicitado para la misma `fechaReserva`.
- RF-02: `PUT /reservas/{id}` aplica la misma validación, excluyendo la propia reserva que se está editando.
- RF-03: El rechazo por solapamiento devuelve `409 Conflict` con un mensaje claro (no un `400` genérico ni un `500`).
- RF-04: El frontend consulta la disponibilidad de una pista para la fecha elegida y deshabilita/marca visualmente las franjas horarias ya ocupadas en el formulario de reserva.
- RF-05: Si el backend rechaza por `409` (carrera entre dos usuarios), el frontend muestra el mensaje de error y refresca la disponibilidad automáticamente.

## Fuera de alcance

- Lista de espera o notificación cuando se libera un horario.
- Reservas recurrentes.
- Cambios en el modelo de `Pista`.

## Preguntas abiertas

- [RESUELTO] La validación de solapamiento considera franjas parciales (`horaInicio < :horaFin AND horaFin > :horaInicio`), de modo que una reserva de 14:00-15:00 bloquea la franja de 14:30-15:30.
