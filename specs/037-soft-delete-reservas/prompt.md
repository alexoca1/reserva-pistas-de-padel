# Prompt de implementación — Spec 037: Soft-delete en Reservas

Implementa la spec 037 siguiendo `spec.md`, `plan.md` y `tasks.md`.

---

## 1. Backend (`padel-backend`)

### Paso 1: Campo `fechaCancelacion` en `Reserva.java`
En `padel-backend/src/main/java/com/padel/reservas/entities/Reserva.java`:
```java
@Column(name = "fecha_cancelacion", nullable = true)
private LocalDateTime fechaCancelacion;
```

### Paso 2: Modificar `deleteReserva` en `ReservasController.java`
En `padel-backend/src/main/java/com/padel/reservas/controller/ReservasController.java`:
Sustituir el borrado físico en `deleteReserva`:
```java
    @DeleteMapping("/reservas/{id}")
    public ResponseEntity<Object> deleteReserva(@PathVariable Long id, Authentication authentication) {
        Optional<Reserva> reservaOpt = isAdmin(authentication)
                ? reservaRepository.findById(id)
                : reservaRepository.findByIdAndUsuarioEmail(id, authentication.getName());

        if (reservaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Reserva reserva = reservaOpt.get();
        // ponytail: Las filas de FranjaReservada de reservas canceladas permanecen en BD
        // sin impacto funcional porque los endpoints filtran por Reserva.estado == CONFIRMADA.
        reserva.setEstado(EstadoReserva.CANCELADA);
        reserva.setFechaCancelacion(java.time.LocalDateTime.now());
        reservaRepository.save(reserva);

        return ResponseEntity.noContent().build();
    }
```

### Paso 3: Tests unitarios / controlador
Crear o ampliar pruebas en `padel-backend/src/test/java/com/padel/reservas/controller/` (ej. `ReservasSoftDeleteTest.java` o `ReservasControllerSecurityTest.java`):
- `DELETE /reservas/{id}` autenticado como propietario:
  - Devuelve `204 No Content`.
  - Capturar el argumento con `ArgumentCaptor<Reserva>` al invocar `reservaRepository.save(reserva)` para verificar que:
    - `reserva.getEstado() == EstadoReserva.CANCELADA`
    - `reserva.getFechaCancelacion() != null`
  - Verificar que `reservaRepository.delete()` o `deleteById()` **NO** son invocados.
- Comprobar que tras la cancelación, `GET /reservas/disponibilidad-dia` no incluye la franja de la reserva cancelada como ocupada.

Ejecutar `./mvnw test` y comprobar que todos los tests pasen.

---

## 2. Frontend (`padel-frontend`)

### Paso 1: Actualizar tipos (`src/types/index.ts`)
En `padel-frontend/src/types/index.ts`, añadir `fechaCancelacion?: string;` a `Reserva`:
```typescript
export interface Reserva {
  id: number;
  fechaReserva?: string;
  fecha?: string;
  horaInicio: string;
  horaFin: string;
  nombreJugador: string;
  telefono: string;
  estado?: string;
  codigoReserva?: string;
  fechaCancelacion?: string;
  pista?: Pista;
  pistaId?: number;
  numeroPista?: number;
  usuario?: Pick<Usuario, "id"> & Partial<Usuario>;
  usuarioId?: number;
}
```

### Paso 2: Filtrar en `DashboardPage.tsx`
En `padel-frontend/src/pages/DashboardPage.tsx`, dentro de `cargarProximasReservas`, excluir las reservas con `estado === "CANCELADA"` al construir `futuras`:
```typescript
      const futuras = propias.filter((r) => {
        if (r.estado === "CANCELADA") return false;
        const fecha = parseFechaLocal(r.fechaReserva || r.fecha);
        if (!fecha) return false;
        if (fecha.getTime() > hoy.getTime()) return true;
        if (fecha.getTime() === hoy.getTime()) {
          const [h, m] = r.horaFin.split(":").map(Number);
          const finReserva = new Date(fecha);
          finReserva.setHours(h, m, 0, 0);
          return finReserva.getTime() > ahora.getTime();
        }
        return false;
      });
```

---

## 3. Documentación

- Actualizar `padel-backend/AGENTS.md` añadiendo el campo `fechaCancelacion` a la descripción de `Reserva` y una aclaración en la tabla de endpoints indicando que `DELETE /reservas/{id}` realiza borrado lógico marcando `estado = CANCELADA`.

---

## 4. Verificación manual

1. **Cancelación por usuario:**
   - Iniciar sesión y crear una reserva para un día futuro.
   - Cancelar la reserva desde el Dashboard o la página de reservas.
   - Verificar que desaparece del panel de próximas reservas.
   - En la cuadrícula de disponibilidad para ese mismo día y pista, comprobar que la franja horaria vuelve a estar libre y disponible para reservar.
2. **Auditoría en base de datos:**
   - Comprobar que en la base de datos la fila sigue existiendo con `estado = 'CANCELADA'` y `fecha_cancelacion` rellenada con el timestamp actual.
3. **Cancelación por administrador:**
   - Iniciar sesión como `ROLE_ADMIN` y cancelar una reserva de otro usuario; verificar que se actualiza el estado a `CANCELADA` sin errores.
