# Spec: Pagos Simulados
**Estado:** Implementado

## Resumen
Se añade un sistema de pagos simulados a las reservas. Cada reserva generará un registro de cobro y, en caso de cancelación o ajuste de duración, se calcularán y registrarán reembolsos o cobros adicionales. La cancelación incluye un esquema de tramos basado en la antelación para calcular el porcentaje de reembolso.

## Escenarios
- Como usuario, quiero que mi reserva quede pagada (simuladamente) al crearla.
- Como usuario, quiero recibir un reembolso proporcional si cancelo antes de ciertas horas límite.
- Como administrador, quiero poder cancelar reservas de usuarios y decidir si aplican los tramos de reembolso o se devuelve el 100%.

## Requisitos funcionales
- RF-01: Generar un cobro automático al crear una reserva.
- RF-02: Calcular y generar un reembolso al cancelar una reserva, dependiendo de los tramos de antelación.
- RF-03: Generar cobros/reembolsos por ajuste de tarifa al editar una reserva.
- RF-04: Exponer el historial de pagos de una reserva en un nuevo endpoint `GET /reservas/{id}/pagos`.

## Fuera de alcance
- Pagos reales. (Todo es simulado).
- Pasarelas de pago.
- Pantallas complejas de pago en el Frontend (en esta primera iteración).

## Preguntas abiertas
- ¿Se manejarán facturas en el futuro? (Por ahora solo concepto y recibo simple).
