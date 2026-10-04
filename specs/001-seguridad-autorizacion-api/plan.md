# Plan técnico: Corrección de autorización en Reservas y Admin

**Spec relacionada:** ./spec.md

## Diseño

- **`ReservasController.findAllReservas`**: usa el `isAdmin()` privado ya existente en la clase para decidir entre `reservaRepository.findAll()` y `reservaRepository.findByUsuarioEmail(authentication.getName())` (este último método ya existía en `ReservaRepository`, sin usar).
- **`SecurityConfig`**: se retira `/auth/register-admin` de la lista `permitAll()`.
- **`AuthController.registerAdmin`**: se añade `@PreAuthorize("hasRole('ADMIN')")`.
- **`GlobalExceptionHandler`**: cambia de `@RestController` a `@RestControllerAdvice` (sin eso, los `@ExceptionHandler` nunca se activaban); se añade un handler explícito para `AccessDeniedException` → `403`.

## Decisiones y alternativas descartadas

- **Ocultar datos solo en frontend**: `ReservasPage.tsx` ya ocultaba `nombreJugador`/`telefono` con `puedeVerDatosSensibles()`. Se descartó como solución única porque los datos ya viajaban completos por la red — cualquiera con las devtools los veía igual. La fuente de verdad del filtrado debe estar en el backend; el frontend queda como UX adicional, no como barrera de seguridad.
- **Eliminar `/auth/register-admin` en vez de protegerlo**: se descartó porque ya existe un admin semilla vía `DataInitializer`, y este endpoint es la única vía para crear admins adicionales sin acceso directo a la base de datos.

## Impacto en seguridad

- Cierra fuga de PII (nombre, teléfono) entre usuarios autenticados.
- Cierra vector de escalado de privilegios no autenticado (cualquiera podía crear una cuenta `ROLE_ADMIN`).
- Mejora la trazabilidad de errores: `403` explícito en vez de `500` genérico para accesos denegados.