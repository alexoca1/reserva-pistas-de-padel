# Tareas: Cuadrícula de disponibilidad hora × pista

## Backend
- [x] T01 - Crear `FranjaDTO` en `dto/`
- [x] T02 - Crear `DisponibilidadDiaDTO` en `dto/`
- [x] T03 - Añadir endpoint `GET /reservas/disponibilidad-dia` en `ReservasController`
- [x] T04 - Añadir test `ReservasDisponibilidadDiaTest` (sin fecha → 400, con fecha → 200)

## Frontend
- [x] T05 - Añadir `DisponibilidadDia` y `Franja` a `src/types/index.ts`
- [x] T06 - Añadir `reservasService.getDisponibilidadDia(fecha)` en `api.ts`
- [x] T07 - Crear `src/components/CuadriculaDisponibilidad.tsx`
- [x] T08 - Adaptar `ReservasPage.tsx`: añadir `fechaVista`, llamar al nuevo
            endpoint, pasar props a la cuadrícula, eliminar la tabla de filas
- [x] T09 - Adaptar `abrirNuevaReserva` para aceptar `pistaId` y `horaInicio`
            opcionales y preseleccionar el formulario
- [x] T10 - Vista móvil: selector de pista que filtra la columna visible
- [x] T11 - Manejo de race condition 409: refrescar cuadrícula tras error