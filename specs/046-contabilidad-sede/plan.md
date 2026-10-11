# Plan técnico: Contabilidad de la Sede
**Spec relacionada:** spec.md

## Diseño
- Backend:
  - Record `ContabilidadDTO`: ingresosBrutos, reembolsosEmitidos, ingresosNetos, reservasConfirmadas, reservasCanceladas, tasaCancelacion.
  - Métodos en `PagoRepository`:
    - `sumImporteByTipoAndPeriodo(@Param("tipo") TipoPago tipo, @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta)`
    - `findAllConReservaYPistaEnPeriodo(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta)`
  - Método en `ReservaRepository`:
    - `countByEstadoAndFechaReservaBetween(EstadoReserva estado, LocalDate desde, LocalDate hasta)`
  - Endpoints en `AdminController`:
    - `GET /admin/contabilidad`
    - `GET /admin/contabilidad/csv`
  - Tests en `AdminControllerTest`: seguridad y endpoints 401, 403, 200 y CSV.
- Frontend:
  - Tipo `ContabilidadResumen` en `types/index.ts`.
  - Objeto `adminService` en `services/api.ts` con `getContabilidad` y `descargarCSV` (usando `getMemoryAccessToken()`).
  - Página `ContabilidadPage.tsx` con filtros de fecha y KPIs.
  - Card "Contabilidad" en `DashboardPage.tsx`.
  - Ruta `/admin/contabilidad` en `App.tsx` y título/descripción en `Layout.tsx`.

## Decisiones y alternativas descartadas
- En vez de crear un nuevo controlador, se amplía `AdminController`, que ya agrupa operaciones administrativas del club.
- Para la descarga del CSV, no se usa `fetchAPI` porque este parsea JSON; se hace fetch directo con `getMemoryAccessToken()` y descarga de `blob` en navegador.

## Impacto en seguridad
- Ambos endpoints requieren autenticación y rol `ROLE_ADMIN`. Controlado por `@PreAuthorize("hasRole('ADMIN')")`. Verificado con pruebas unitarias en `AdminControllerTest`.
