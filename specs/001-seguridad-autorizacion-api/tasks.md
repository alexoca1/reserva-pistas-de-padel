# Tareas: Corrección de autorización en Reservas y Admin

- [x] T01 - Filtrar `GET /reservas` por usuario autenticado (o todas si es admin) en `ReservasController`
- [x] T02 - Retirar `/auth/register-admin` de `permitAll()` en `SecurityConfig`
- [x] T03 - Añadir `@PreAuthorize("hasRole('ADMIN')")` a `AuthController.registerAdmin`
- [x] T04 - Cambiar `GlobalExceptionHandler` de `@RestController` a `@RestControllerAdvice`
- [x] T05 - Añadir manejo explícito de `AccessDeniedException` (403) en `GlobalExceptionHandler`
- [x] T06 - Crear `ReservasControllerSecurityTest` (usuario normal solo ve las suyas; admin ve todas)
- [x] T07 - Crear `AuthControllerSecurityTest` (`register-admin`: 401 sin auth, 403 sin rol, 201 con `ROLE_ADMIN`)
- [x] T08 - Actualizar `padel-backend/AGENTS.md` con el registro de cambios