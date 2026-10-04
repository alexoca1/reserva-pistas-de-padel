# Tareas: Spec 036 — RGPD: Derechos de Supresión y Portabilidad

- [x] **T01** — Añadir el campo `fechaBaja: LocalDateTime` en `Usuario.java`.
- [x] **T02** — Añadir método para contar administradores en `UsuarioRepository.java` (ej. `countByRolesContaining("ROLE_ADMIN")`).
- [x] **T03** — Implementar endpoints `GET /auth/mis-datos` y `DELETE /auth/cuenta` en `AuthController.java` con guarda de único admin, limpieza Cloudinary, borrado de refresh tokens y anonimización.
- [x] **T04** — Implementar tests automatizados (@WebMvcTest) para verificar 401 sin auth, 200 en descarga, 204 en borrado normal con comprobación de anonimización (ArgumentCaptor), y 409 al borrar único admin.
- [x] **T05** — Añadir `fechaBaja?: string` en `types/index.ts` y métodos `perfilService.getMisDatos()` y `perfilService.eliminarCuenta()` en `services/api.ts`.
- [x] **T06** — Implementar la sección "Privacidad y datos" en `PerfilPage.tsx` con descarga de JSON y modal destructivo con confirmación por texto "ELIMINAR".
- [x] **T07** — Actualizar `padel-backend/AGENTS.md` (tabla de endpoints y entidad Usuario) y `padel-frontend/AGENTS.md` (sección de privacidad en PerfilPage).
