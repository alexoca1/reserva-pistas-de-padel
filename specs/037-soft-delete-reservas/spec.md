# Spec 037 — Soft-delete en Reservas (Borrado Lógico)

**Estado:** Implementada  
**Fecha:** 2026-10-04  
**Afecta:** `padel-backend` (`Reserva.java`, `ReservasController.java`, tests de reservas), `padel-frontend` (`types/index.ts`, `DashboardPage.tsx`), documentación (`padel-backend/AGENTS.md`)

---

## Resumen

Actualmente, cuando un usuario o administrador elimina una reserva mediante `DELETE /reservas/{id}`, el registro se elimina físicamente de la base de datos (`reservaRepository.delete()`).

Esta especificación transforma la eliminación de reservas en un **borrado lógico (soft-delete)**:
1. El registro permanece en la base de datos con `estado = CANCELADA` y un timestamp en `fechaCancelacion: LocalDateTime`.
2. Las franjas horarias ocupadas se liberan de inmediato para otros usuarios, ya que los endpoints de disponibilidad (`/reservas/disponibilidad` y `/reservas/disponibilidad-dia`) filtran exclusivamente por reservas con `estado = CONFIRMADA`.
3. Se complementa con la anonimización de cuentas de la spec 036, preservando el histórico operativo del club y la integridad de las reservas pasadas.

---

## Escenarios

- **Como usuario**, cancelo una reserva desde mi panel o lista de reservas. La reserva queda marcada como `CANCELADA` en base de datos con su fecha de cancelación, y el horario de la pista queda libre de inmediato para que otro jugador pueda reservar.
- **Como usuario**, accedo a mi Dashboard y compruebo que las reservas canceladas no aparecen en el listado de "Próximas reservas" ni suman al contador de reservas activas.
- **Como administrador**, elimino/cancelo una reserva de cualquier usuario. La reserva se marca como `CANCELADA` con la fecha actual, manteniendo el histórico de auditoría.
- **Como desarrollador/auditor**, consulto la base de datos y puedo auditar todas las reservas históricas, su estado y el momento exacto en que fueron canceladas.

---

## Requisitos funcionales

### Backend (`padel-backend`)

#### RF-01 — Campo `fechaCancelacion` en `Reserva.java`
- Añadir el campo `private LocalDateTime fechaCancelacion;` en la entidad `Reserva.java` (columna `fecha_cancelacion`, nullable).
- El campo `estado` (`EstadoReserva`) ya existe en la entidad con valor por defecto `CONFIRMADA`.

#### RF-02 — Borrado lógico en `DELETE /reservas/{id}`
- Modificar el controlador `ReservasController.deleteReserva`:
  - Validar existencia y titularidad (propietario o admin con `ROLE_ADMIN`). Si no existe o no tiene permiso, devolver `404 Not Found`.
  - En lugar de invocar `reservaRepository.deleteById(id)` o `delete(reserva)`:
    1. `reserva.setEstado(EstadoReserva.CANCELADA);`
    2. `reserva.setFechaCancelacion(LocalDateTime.now());`
    3. `reservaRepository.save(reserva);`
  - Devolver `204 No Content`.
- La liberación de franjas horarias ocurre implícitamente porque `getDisponibilidad` y `getDisponibilidadDia` solo consideran reservas en estado `CONFIRMADA`.

#### RF-03 — Listado de reservas (`GET /reservas`)
- `GET /reservas` devuelve la lista de reservas propias para usuarios autenticados (o todas para `ROLE_ADMIN`).
- Incluye reservas con estado `CONFIRMADA` y `CANCELADA` (el historial pertenece al usuario).

#### RF-04 — Tests de backend
- Test unitario/integración para `DELETE /reservas/{id}`:
  - Verificar que devuelve `204 No Content`.
  - Usar `ArgumentCaptor<Reserva>` para verificar que se invoca `reservaRepository.save()` y NO `reservaRepository.delete()`.
  - Comprobar que la reserva guardada tiene `estado == EstadoReserva.CANCELADA` y `fechaCancelacion != null`.
- Test de disponibilidad tras cancelación:
  - Comprobar que tras cancelar una reserva, `GET /reservas/disponibilidad-dia` para esa pista y fecha devuelve la franja libre (no ocupada).

---

### Frontend (`padel-frontend`)

#### RF-05 — Tipos en `types/index.ts`
- Actualizar la interfaz `Reserva` en `padel-frontend/src/types/index.ts`:
  ```typescript
  export interface Reserva {
    // ... campos existentes ...
    fechaCancelacion?: string;
  }
  ```

#### RF-06 — Filtro de próximas reservas en `DashboardPage.tsx`
- En la función `cargarProximasReservas` de `DashboardPage.tsx`, asegurar que el filtrado de reservas `futuras` excluye explícitamente aquellas con `r.estado === "CANCELADA"`.

---

## Fuera de alcance
- Interfaz gráfica para consultar un historial específico de reservas canceladas (se mantiene la experiencia de usuario actual donde eliminar una reserva la quita de la vista activa).
- Eliminación física periódica de filas huérfanas en `FranjaReservada` (las franjas quedan asociadas a la reserva cancelada sin afectar la disponibilidad).
