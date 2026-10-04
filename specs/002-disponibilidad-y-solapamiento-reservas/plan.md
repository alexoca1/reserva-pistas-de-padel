# Plan técnico: Disponibilidad y prevención de solapamiento en reservas

**Spec relacionada:** ./spec.md

## Diseño

- **`ReservaRepository`**:
  - `findByPistaIdAndFechaReserva(Long pistaId, LocalDate fechaReserva)` para consultar reservas existentes de una pista en un día determinado.
  - `findSolapadas(...)` mediante `@Query` JPQL:
    ```jpql
    SELECT r FROM Reserva r
    WHERE r.pista.id = :pistaId
      AND r.fechaReserva = :fecha
      AND r.id <> :excludeId
      AND r.horaInicio < :horaFin
      AND r.horaFin > :horaInicio
    ```
- **`ReservaSolapadaException`**: excepción runtime lanzada ante conflictos de horario.
- **`GlobalExceptionHandler`**: captura `ReservaSolapadaException` y responde HTTP `409 Conflict` con un JSON `{"error": "..."}`.
- **`FranjaOcupadaDTO`**: DTO liviano (`horaInicio`, `horaFin`) devuelto por `GET /reservas/disponibilidad` sin exponer PII.
- **`ReservasController`**:
  - `GET /reservas/disponibilidad?pistaId={id}&fecha={YYYY-MM-DD}`: retorna `List<FranjaOcupadaDTO>`.
  - `POST /reservas` y `PUT /reservas/{id}`: ejecutan la validación previa de solapamiento (`validarSinSolapamiento`).

## Decisiones y alternativas descartadas

- **Solapamiento exacto vs parcial**: Se eligió solapamiento parcial (`r.horaInicio < :horaFin AND r.horaFin > :horaInicio`) para impedir reservas solapadas parcialmente (ej. 14:00-15:00 vs 14:30-15:30).
- **Exposición de datos en disponiblidad**: Se creó `FranjaOcupadaDTO` para evitar devolver la entidad `Reserva` completa en la disponibilidad pública/autenticada, previniendo fugas de PII (nombres, teléfonos).

## Impacto en seguridad y consistencia

- Garantiza la integridad de las reservas en la base de datos a nivel de lógica de negocio.
- Evita reservas duplicadas y condiciones de carrera concurrentes.
