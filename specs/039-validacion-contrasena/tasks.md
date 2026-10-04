# Tareas: Spec 039 — Validación Robusta de Contraseña en Registro

- [x] **T01** — Añadir `@Size(min = 8, max = 100)` y `@Pattern` con regexp `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$` al campo `password` en `RegisterRequest.java`.
- [x] **T02** — Crear tests unitarios/controlador (@WebMvcTest) verificando HTTP 400 y mensaje en `password` para contraseña débil y HTTP 201 para contraseña válida.
- [x] **T03** — Ajustar `RegisterPage.tsx` para capturar y mostrar el mensaje de validación del backend retornado en el mapa de errores `{ "password": "..." }`.
- [x] **T04** — Actualizar `padel-backend/AGENTS.md` con los nuevos requisitos de validación en la descripción del DTO `RegisterRequest`.
