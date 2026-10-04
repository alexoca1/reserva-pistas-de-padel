# Tareas: Galería de fotos de la sede

## Backend
- [x] T01 - Crear entidad `FotoSede` (url, publicId, orden)
- [x] T02 - Crear `FotoSedeRepository` con `findAllByOrderByOrden`
      y `count`
- [x] T03 - Crear `SedeController` con `GET`, `POST` y `DELETE`
- [x] T04 - `SecurityConfig`: añadir `/sede/fotos` a `permitAll()`
- [x] T05 - Test: subir 11ª foto → rechazada con 400
- [x] T06 - Test: `POST /sede/fotos` sin `ROLE_ADMIN` → 403
- [x] T07 - Test: `GET /sede/fotos` sin autenticación → 200

## Frontend
- [x] T08 - `types/index.ts`: añadir tipo `FotoSede`
- [x] T09 - `services/api.ts`: añadir `fotoSedeService`
- [x] T10 - Crear `pages/InstalacionesPage.tsx` (galería + pistas
      compactas + CTA)
- [x] T11 - Crear `pages/AdminGaleriaPage.tsx` (grid + subir +
      eliminar con confirmación)
- [x] T12 - `App.tsx`: rutas `/instalaciones` y `/admin/galeria`
- [x] T13 - `Layout.tsx`: añadir ambas rutas a `TITULOS_POR_RUTA`
- [x] T14 - `Navbar.tsx`: enlace "Instalaciones" público + enlace
      "Galería" solo para admin
- [ ] T15 - Verificación manual: subir 10 fotos como admin; confirmar
      que la 11ª es rechazada; ver `/instalaciones` sin login y
      confirmar que las fotos y las pistas compactas se muestran;
      borrar una foto y confirmar que la URL de Cloudinary ya no
      responde; confirmar que "Galería" en el Navbar solo aparece
      para admin