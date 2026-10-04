# Plan de implementación: Edición de email y contraseña en perfil

## Diseño y Arquitectura

### 1. Actualización de DTO
El DTO `UpdatePerfilDTO` se expande (ya se hizo en su momento) para admitir:
- `@Email String email`
- `String password`
- `String currentPassword`

### 2. Backend (Controlador y Servicio)
En el método `actualizarPerfil` (dentro de `AuthController`):
- Se verifica si `UpdatePerfilDTO` incluye un `email` válido, y si es diferente al actual, se actualiza.
- Se verifica si incluye `password`. Si es el propio usuario, se exige y valida `currentPassword`. Si es `ROLE_ADMIN` editando a otro usuario, se permite saltar la validación de `currentPassword`.

### 3. Frontend (PerfilPage)
El formulario de la pestaña "Mis datos" se expande:
- Campo `email` editable (antes de solo lectura).
- Campo `currentPassword` (contraseña actual).
- Campo `password` (nueva contraseña).
- Campo `confirmPassword` (confirmar nueva contraseña - lógica en frontend para validar que coincidan).

El formulario de "Editar datos de un jugador" (admin) se expande:
- Campo `email`.
- Campo `password` (nueva contraseña).

## Archivos afectados (Ya implementados)
- `padel-backend/src/main/java/com/padel/reservas/dto/UpdatePerfilDTO.java`
- `padel-backend/src/main/java/com/padel/reservas/controller/AuthController.java`
- `padel-frontend/src/pages/PerfilPage.tsx`
