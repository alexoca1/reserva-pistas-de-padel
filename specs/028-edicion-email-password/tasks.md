# Tareas: Edición de email y contraseña en perfil

## Backend
- [x] T01 - Actualizar `UpdatePerfilDTO` con campos `email`, `password` y `currentPassword`.
- [x] T02 - Actualizar `AuthController.actualizarPerfil` para guardar cambios de email y contraseña (validando `currentPassword` si es usuario regular).

## Frontend
- [x] T03 - Actualizar `PerfilPage.tsx` para permitir la edición de email en "Mis datos" y "Editar datos de un jugador".
- [x] T04 - Actualizar `PerfilPage.tsx` para agregar campos de "Nueva contraseña", "Confirmar nueva contraseña" y "Contraseña actual" en los modales/secciones de edición correspondientes.

## Documentación
- [x] T05 - Crear spec `028-edicion-email-password` para documentar explícitamente que estas características, que inicialmente se dejaron fuera de alcance en la spec 015, ya han sido implementadas.
- [x] T06 - Asegurarse de que el `UpdatePerfilDTO` está documentado adecuadamente en el `AGENTS.md` si se requiriese. (Nota: el backend lo documentó sin password/email para limitar al LLM, pero existe en código).
