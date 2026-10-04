# Tareas: Avatar de usuario

## Backend
- [x] T01 - `Usuario.java`: añadir campos `avatarUrl` y
      `avatarPublicId` (ambos nullable)
- [x] T02 - `AuthController`: nuevo endpoint `PUT /auth/perfil/avatar`
      con borrado del avatar anterior si existe
- [x] T03 - Test: subir avatar → URL devuelta contiene dominio de
      Cloudinary
- [x] T04 - Test: subir segundo avatar → el primero se elimina de
      Cloudinary (mock de `CloudinaryService.eliminar` verifica la
      llamada)
- [x] T05 - Test: `PUT /auth/perfil/avatar` sin autenticación → 401

## Frontend
- [x] T06 - `types/index.ts`: añadir `avatarUrl?: string` al tipo
      `Usuario`
- [x] T07 - Crear `components/Avatar.tsx` (foto si hay URL, SVG de
      iniciales si no; color derivado de id; prop `size`)
- [x] T08 - `Navbar.tsx`: reemplazar texto de nombre por
      `<Avatar size={32}>` + nombre
- [x] T09 - `PerfilPage.tsx`: `<Avatar size={80}>` clicable + input
      file oculto + preview + botón confirmar/cancelar
- [x] T10 - `services/api.ts`: añadir `perfilService.subirAvatar`
- [x] T11 - `PerfilPage.tsx`: llamada a `actualizarUsuario` tras
      subida exitosa + toast

## Documentación
- [x] T12 - `padel-backend/AGENTS.md`: añadir `avatarUrl`/
      `avatarPublicId` a la descripción de `Usuario`; añadir
      `PUT /auth/perfil/avatar` a la tabla de endpoints de `/auth`
- [x] T13 - `padel-frontend/AGENTS.md`: añadir `Avatar.tsx` a la
      lista de componentes
- [ ] T14 - Verificación manual: subir foto de perfil desde
      `/perfil`; confirmar que el Navbar muestra la foto nueva sin
      recargar; subir una segunda foto y confirmar que la primera
      ya no es accesible en Cloudinary; crear usuario sin foto y
      confirmar que el avatar de iniciales aparece en Navbar y perfil
      con color consistente al recargar