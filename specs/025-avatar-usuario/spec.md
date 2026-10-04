# Spec: Foto de perfil (avatar) de usuario

**Estado:** Implementada

## Resumen
Cada usuario puede subir una foto de perfil almacenada en Cloudinary.
Si no sube ninguna, se muestra un avatar SVG generado automáticamente
con las iniciales del usuario. El avatar se muestra en el Navbar y en
la página de perfil.

## Escenarios
- Como usuario, quiero subir mi foto de perfil desde la página de
  perfil, para personalizar mi cuenta.
- Como usuario sin foto, quiero ver un avatar con mis iniciales, para
  que no haya un espacio vacío donde debería estar mi foto.
- Como sistema, cuando un usuario borra su cuenta o sube una foto nueva,
  quiero que la foto anterior se borre de Cloudinary (RGPD/limpieza).

## Requisitos funcionales
- RF-01: `Usuario` gana dos campos: `avatarUrl` (String, nullable) y
  `avatarPublicId` (String, nullable).
- RF-02: `PUT /auth/perfil/avatar` — autenticado, cualquier rol:
  recibe `MultipartFile`, llama a `CloudinaryService.subir`, guarda
  URL y publicId en el usuario. Si el usuario ya tenía avatar, borra
  el anterior de Cloudinary antes de guardar el nuevo.
- RF-03: Si `avatarUrl` es null, el frontend genera un SVG inline con
  las iniciales del usuario (primera letra de nombre + primera letra
  de apellidos) sobre un fondo de color derivado del id del usuario
  (para que cada usuario tenga un color consistente).
- RF-04: El avatar (foto o SVG de iniciales) se muestra en el Navbar
  junto al nombre del usuario.
- RF-05: En `PerfilPage`, el avatar es clicable y abre un selector de
  archivo para cambiarlo.
- RF-06: Al subir nueva foto, se muestra preview inmediato antes de
  confirmar — el usuario ve el resultado antes de guardarlo.
- RF-07: El avatar se actualiza en `AuthContext` tras la subida exitosa
  (mismo mecanismo de `actualizarUsuario` de spec 015).
- RF-08: `GET /auth/perfil` y `GET /auth/usuarios` devuelven
  `avatarUrl` en su respuesta — sin campo nuevo en el endpoint, ya que
  el shape que devuelven es el objeto `Usuario` completo.

## Fuera de alcance
- Recorte (crop) del avatar antes de subir.
- Avatar generado por IA.
- Borrado explícito del avatar sin subir uno nuevo (restaurar al
  avatar de iniciales).

## Preguntas abiertas
Ninguna.