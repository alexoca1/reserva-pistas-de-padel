# Tareas: Spec 037 — Soft-delete en Reservas

- [x] **T01** — Añadir el campo `fechaCancelacion: LocalDateTime` a la entidad `Reserva.java`.
- [x] **T02** — Modificar `deleteReserva` en `ReservasController.java` para realizar borrado lógico (set EstadoReserva.CANCELADA, set fechaCancelacion, save).
- [x] **T03** — Crear tests unitarios/controlador (@WebMvcTest) verificando que `DELETE /reservas/{id}` guarda la reserva cancelada (ArgumentCaptor) y que no aparece como ocupada en disponibilidad.
- [x] **T04** — Añadir `fechaCancelacion?: string` a la interfaz `Reserva` en `padel-frontend/src/types/index.ts`.
- [x] **T05** — Excluir reservas con `estado === "CANCELADA"` en el cálculo de `proximasReservas` y `totalFuturas` en `padel-frontend/src/pages/DashboardPage.tsx`.
- [x] **T06** — Actualizar `padel-backend/AGENTS.md` con el nuevo campo `fechaCancelacion` en `Reserva` y la descripción de borrado lógico en `DELETE /reservas/{id}`.
