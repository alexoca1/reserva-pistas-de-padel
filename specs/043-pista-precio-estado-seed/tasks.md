# Tareas: Spec 043 — Pista (Precio y Estado) y Seed de Demo

### Backend: Parte A — Modelo de Pista y Ciclo Operativo
- [x] **T01** — Crear enum `EstadoPista` (`ACTIVA`, `MANTENIMIENTO`) y actualizar `Pista.java` con `precioHora` (`BigDecimal`) y `estado` (`EstadoPista`). Crear script SQL de respaldo en `padel-backend/migracion_pista_precio_estado.sql`.
- [x] **T02** — Actualizar `Reserva.java` con métodos de cálculo `getCosteEstimado()` y regla unificada `esJugada(LocalDateTime ahora)`. Exponer `costeEstimado` en los endpoints/DTOs de reserva.
- [x] **T03** — Actualizar `ReservaService.java` y `ReservasController.java`: rechazar con `409 Conflict` la creación o modificación de reservas sobre pistas en `MANTENIMIENTO`. Añadir campo `estado` en `DisponibilidadDiaDTO`.
- [x] **T04** — Actualizar `PistasController.java`: permitir persistir `precioHora` y `estado` en `createPista` y `updatePista`, y añadir endpoint para consultar reservas futuras en una pista.

### Frontend: Parte A — Gestión Visual de Pista y Coste
- [x] **T05** — Actualizar tipos en `padel-frontend/src/types/index.ts` (`Pista`, `DisponibilidadDia`, `Reserva`).
- [x] **T06** — Actualizar `PistasPage.tsx`: campos de precio y estado en formulario de administración y badges de estado en el catálogo.
- [x] **T07** — Actualizar `CuadriculaDisponibilidad.tsx`: renderizado deshabilitado y atenuado para pistas en `MANTENIMIENTO`.
- [x] **T08** — Mostrar coste estimado en el formulario modal de reserva y en `TarjetaReserva.tsx` del Dashboard.

### Backend: Parte B — Seeder de Demostración
- [x] **T09** — Implementar `DemoDataPlanGenerator.java` como POJO puro: generación de 30-60 usuarios con correos `@seed.invalid`, generación determinista con semilla fija de 800-1.500 reservas (curva pico 18:00-22:00, 60-90 días pasados y 7 días futuros) y asignación atómica de `FranjaReservada` sin solapamientos.
- [x] **T10** — Implementar `DemoDataSeeder.java` (`CommandLineRunner`, condicionado a `app.seed.demo=true`, idempotente verificando usuarios existentes).

### Verificación y Tests
- [x] **T11** — Pruebas unitarias para `DemoDataPlanGeneratorTest.java`: verificar determinismo de la semilla, distribución horaria y ausencia total de solapamientos en memoria.
- [x] **T12** — Pruebas unitarias y MockMvc en `ReservaServiceTest.java` / `ReservasControllerSecurityTest.java`: validar rechazo 409 por `MANTENIMIENTO`, cálculo exacto de coste estimado y comportamiento de la regla `esJugada()`.
- [x] **T13** — Verificación en frontend: `npm run build` y `npm run lint` limpios (0 errores).

### Documentación
- [x] **T14** — Actualizar `padel-backend/AGENTS.md` (modelo de Pista, seeder de demo, propiedad `app.seed.demo`).
- [x] **T15** — Actualizar `padel-frontend/AGENTS.md` (nuevos campos de Pista, comportamiento de pistas en mantenimiento en la cuadrícula).
- [x] **T16** — Actualizar `README.md` (sección del seed de demo, y en mejoras por implementar la adopción de Flyway y la gestión de tareas periódicas en Cloud Run).
