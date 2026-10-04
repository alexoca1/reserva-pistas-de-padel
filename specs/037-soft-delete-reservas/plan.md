# Plan técnico: Spec 037 — Soft-delete en Reservas

**Spec relacionada:** `../spec.md`

---

## Diseño técnico

### 1. Modelo de Datos y Estado de Reserva (RF-01)
La entidad `Reserva` ya cuenta con el enum `EstadoReserva` (`CONFIRMADA`, `CANCELADA`, `COMPLETADA`) introducido en la spec 017.
Se añade el atributo:
```java
@Column(name = "fecha_cancelacion", nullable = true)
private LocalDateTime fechaCancelacion;
```

### 2. Flujo de Cancelación Lógica en Backend (RF-02)
En `ReservasController.deleteReserva`:
1. Comprueba permisos y existencia mediante `findById` o `findByIdAndUsuarioEmail`.
2. Asigna `reserva.setEstado(EstadoReserva.CANCELADA)`.
3. Asigna `reserva.setFechaCancelacion(LocalDateTime.now())`.
4. Persiste con `reservaRepository.save(reserva)`.
5. Devuelve `204 No Content`.

### 3. Impacto en Disponibilidad de Pistas
Los endpoints de consulta de disponibilidad:
- `GET /reservas/disponibilidad`
- `GET /reservas/disponibilidad-dia`
Ya contienen una cláusula `.filter(r -> r.getEstado() == EstadoReserva.CONFIRMADA)` en `ReservasController.java`.
Al marcar la reserva como `CANCELADA`, los slots de la pista se consideran libres de inmediato sin necesidad de recalcular franjas intermedias.

### 4. Filtrado en Frontend (RF-05, RF-06)
- En `DashboardPage.tsx`, el cálculo de `proximasReservas` y `totalFuturas` añade la guarda `if (r.estado === "CANCELADA") return false;`.
- En `CuadriculaDisponibilidad.tsx`, no se requiere ningún cambio dado que el backend filtra de origen las reservas no confirmadas.
- La experiencia visual para el usuario final se mantiene inalterada (toasts de confirmación, desaparición inmediata de la reserva).

---

## Decisiones de diseño y justificación

### 1. Soft-delete vs. Delete físico (DELETE SQL)
- **Integridad referencial y análisis histórico:** Permite al club conservar estadísticas reales de demanda, horas pico, cancelaciones y tasa de ocupación efectiva a lo largo del tiempo.
- **Trazabilidad y auditoría:** Conserva el registro de qué usuario realizó la reserva original y en qué momento se produjo la anulación (`fechaCancelacion`).
- **Compatibilidad con Spec 036 (RGPD):** Si un usuario solicita la supresión de su cuenta bajo el RGPD, sus reservas quedan desvinculadas de cualquier dato de carácter personal identificable (anonimizadas a nivel de usuario titular), preservando al mismo tiempo el estado `CANCELADA` o `CONFIRMADA` sin romper las relaciones en la base de datos.

### 2. Alcance de UI: No incluir vista de historial de canceladas
- **Principio Ponytail (cambios mínimos y YAGNI):** La funcionalidad esencial para el portafolio y la operativa del club es la liberación del slot y la persistencia del estado en base de datos.
- Añadir pestañas o filtros adicionales de "Historial de cancelaciones" en el frontend introduce complejidad visual innecesaria sin aportar valor crítico inmediato a la experiencia de reserva. Queda como extensión futura si fuera requerido.

### 3. Franjas `FranjaReservada` y limpieza huérfana
- **Filtrado implícito:** Las entidades `FranjaReservada` asociadas a la reserva no requieren un borrado físico explícito en la cancelación porque los endpoints de disponibilidad leen directamente `Reserva.estado == CONFIRMADA`.
- **Estrategia Ponytail:**
  ```java
  // ponytail: Las filas de FranjaReservada de reservas canceladas permanecen en BD
  // sin impacto funcional porque los endpoints filtran por Reserva.estado == CONFIRMADA.
  // Limpieza periódica diferible a un job nocturno si el volumen de datos lo requiere.
  ```
  Esto evita consultas SQL de borrado innecesarias durante la transacción de cancelación.

---

## Impacto en tests
- Se añade test de integración en el controlador de reservas verificando que `DELETE /reservas/{id}` ejecuta `save()` con `EstadoReserva.CANCELADA` y no `delete()`.
- Se verifica que la disponibilidad tras la cancelación refleja la franja como libre.
