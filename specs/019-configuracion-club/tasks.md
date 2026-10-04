# Tareas: ConfiguracionClub

## Backend
- [x] T01 - Crear entidad `ConfiguracionClub` con id=1L fijo y campos
      de configuración; getter `getDuracionesPermitidas()` que parsea
      el string almacenado
- [x] T02 - Crear `ConfiguracionClubRepository`
- [x] T03 - Crear `ConfiguracionClubService` (`getConfiguracion`,
      `actualizar`)
- [x] T04 - Crear `AdminController` con `GET`/`PUT /admin/configuracion`
      (`@PreAuthorize("hasRole('ADMIN')")`)
- [x] T05 - Añadir `GET /configuracion/duraciones` (público) en
      `AdminController` o en un `ConfiguracionController` nuevo
- [x] T06 - `DataInitializer`: crear registro de `ConfiguracionClub`
      con valores por defecto si no existe
- [x] T07 - `ReservaService`: sustituir constantes hardcodeadas por
      lectura desde `ConfiguracionClubService`
- [x] T08 - Test: crear reserva con duración no permitida según la
      configuración actual → rechazada
- [x] T09 - Test: admin actualiza `horaCierre` a 22:00; reserva que
      antes era válida (21:30-23:00) ahora es rechazada

## Frontend
- [x] T10 - `services/api.ts`: añadir `configuracionService.getDuraciones()`
- [x] T11 - `ReservasPage.tsx`: cargar duraciones al montar y usarlas
      en el selector; fallback a [60, 90, 120] si la carga falla
- [x] T12 - `types/index.ts`: añadir tipo `ConfiguracionDuraciones`

## Documentación
- [x] T13 - Cubierto por spec de housekeeping de documentación (housekeeping post-specs 015, 017, 019)
- [x] T14 - Verificación manual: cambiar `horaCierre` a 21:00 desde
      el panel de admin; confirmar que una reserva de 20:30-22:00 es
      rechazada inmediatamente sin reiniciar el servidor; restaurar
      el cierre a 23:00 y confirmar que vuelve a aceptarla