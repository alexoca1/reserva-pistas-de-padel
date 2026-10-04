# Plan técnico: Avatar de usuario

**Spec relacionada:** ./spec.md

## Diseño

### Backend

**`Usuario`**: añadir `avatarUrl String` (nullable) y
`avatarPublicId String` (nullable). Sin `@NotNull` — son opcionales
por diseño.

**`AuthController`**: nuevo endpoint `PUT /auth/perfil/avatar`:
- Recibe `@RequestParam MultipartFile file`.
- Resuelve el usuario autenticado (`findByEmail(authentication.getName())`).
- Si `usuario.getAvatarPublicId() != null`, llama a
  `cloudinaryService.eliminar(avatarPublicId)` primero.
- Llama a `cloudinaryService.subir(file, "avatares", 400)` — ancho
  máximo 400px, suficiente para un avatar.
- Guarda `avatarUrl` y `avatarPublicId` en el usuario.
- Devuelve el mismo shape que `PUT /auth/perfil` — objeto con id,
  email, nombre, apellidos, telefono, roles, avatarUrl.

**No hay endpoint de borrado de avatar** (fuera de scope explícito) —
el único borrado ocurre implícitamente al subir uno nuevo o al borrar
la cuenta de usuario (que ya tendría que llamar a
`CloudinaryService.eliminar` si existe `avatarPublicId` — se anota
como deuda técnica en el plan, spec futura si se implementa borrado de
cuentas).

### Frontend

**`components/Avatar.tsx`** (nuevo componente presentacional):
```tsx
// Props: url?: string, nombre?: string, apellidos?: string,
//        id?: number, size?: number (default 32)
// Si url → <img> con la URL de Cloudinary
// Si no → SVG inline con iniciales y color derivado de id
```

Color derivado del id: `COLORES[id % COLORES.length]` donde `COLORES`
es un array de 8-10 colores del sistema de diseño ya definido en
`index.css` — sin cálculo complejo, sin dependencia nueva.

**`Navbar.tsx`**: reemplaza el texto del nombre de usuario por
`<Avatar>` + nombre, usando `user.avatarUrl`, `user.nombre`,
`user.apellidos`, `user.id`.

**`PerfilPage.tsx`**:
- Muestra `<Avatar size={80}>` clicable que activa un
  `<input type="file" accept="image/*">` oculto.
- Al seleccionar archivo: genera preview con `URL.createObjectURL`,
  muestra un botón "Guardar foto" y un botón "Cancelar".
- Al confirmar: llama a `perfilService.subirAvatar(file)`, luego
  `actualizarUsuario({ avatarUrl: resultado.avatarUrl })` — mismo
  patrón que `actualizarUsuario` de spec 015.
- Toast "Foto de perfil actualizada" — patrón spec 008.

**`services/api.ts`**: añadir en `perfilService`:
```ts
subirAvatar: (file: File): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  return fetchAPI("/auth/perfil/avatar", {
    method: "PUT",
    body: formData,
  });
},
```

**`context/AuthContext.tsx`**: añadir `avatarUrl` al tipo `Usuario`
si no está ya.

## Decisiones y alternativas descartadas

- **Guardar el avatar como BLOB en MySQL**: descartado — requería
  `webp-imageio` en Java (dependencia nueva, compresión manual) y
  ralentizaría consultas de usuario con megabytes de BLOB. Cloudinary
  es la solución coherente con el resto de imágenes del proyecto.
- **Gravatar como fallback**: descartado — requiere enviar el hash
  del email del usuario a un servicio externo sin que el usuario lo
  haya consentido explícitamente. El SVG de iniciales es local, sin
  RGPD implicado.
- **Avatar recortable (crop)**: descartado — añade una dependencia
  nueva (`react-image-crop` o similar) para un resultado visual que
  el resize de Cloudinary (400px) ya cubre suficientemente para un avatar.
- **Borrado explícito de avatar**: descartado por scope — el caso de
  uso real (un usuario que sube una foto y luego quiere volver al
  avatar de iniciales) es menos frecuente que el de actualizar la foto;
  se deja para una mejora futura si se detecta necesidad real.

## Impacto en seguridad
`PUT /auth/perfil/avatar` requiere autenticación — un usuario solo puede
cambiar su propio avatar (se resuelve por `authentication.getName()`,
no por un id que venga en el payload). El borrado del avatar anterior en
Cloudinary antes de guardar el nuevo evita acumulación de datos de imagen
de la misma persona sin propósito — cumplimiento de minimización de datos
del RGPD.