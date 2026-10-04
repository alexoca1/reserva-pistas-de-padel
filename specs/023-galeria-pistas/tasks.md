# Tareas: Galería de fotos por pista

## Backend
- [x] T01 - Crear entidad `FotoPista` (url, publicId, esPortada, orden)
- [x] T02 - Crear `FotoPistaRepository` con
      `findByPistaIdOrderByOrden` y `countByPistaId`
- [x] T03 - `Pista.java`: añadir `@OneToMany` hacia `FotoPista`;
      mantener `imagenUrl` existente
- [x] T04 - Crear `FotoPistaController` con los 4 endpoints
      (`GET`, `POST`, `DELETE`, `PUT portada`)
- [x] T05 - `PistasController.deletePista`: borrar fotos de Cloudinary
      antes del borrado de la entidad
- [x] T06 - Test: subir 6ª foto a una pista → rechazada con 400
- [x] T07 - Test: borrar foto que era portada → la siguiente pasa a ser
      portada y `Pista.imagenUrl` se actualiza
- [x] T08 - Test: `POST /pistas/{id}/fotos` sin `ROLE_ADMIN` → 403
- [x] T09 - Test: `GET /pistas/{id}/fotos` sin autenticación → 200
      (endpoint público)

## Frontend
- [x] T10 - Crear `components/LightboxGaleria.tsx` (overlay,
      prev/next, Escape, foco, ARIA)
- [x] T11 - `services/api.ts`: añadir `fotoPistaService`
      (getAll, subir, eliminar, setPortada)
- [x] T12 - `types/index.ts`: añadir tipo `FotoPista`
- [x] T13 - `PistasPage.tsx`: clic en miniatura → carga galería y
      abre lightbox (todos los usuarios)
- [x] T14 - `PistasPage.tsx`: sección de gestión de galería en el
      diálogo de edición (solo admin) — subir, eliminar, portada
- [x] T15 - `PistasPage.tsx`: botón "Subir foto" deshabilitado con
      mensaje cuando ya hay 5 fotos

## Documentación
- [x] T16 - `padel-backend/AGENTS.md`: añadir `FotoPista`,
      `FotoPistaRepository`, `FotoPistaController` y los 4 endpoints
      nuevos
- [x] T17 - `padel-frontend/AGENTS.md`: añadir `LightboxGaleria.tsx`
      a la lista de componentes
- [ ] T18 - Verificación manual: subir 5 fotos a una pista desde el
      panel admin; confirmar que la 6ª es rechazada; cambiar portada y
      confirmar que la miniatura del catálogo cambia; abrir lightbox
      como usuario sin login y navegar con flechas y Escape; borrar una
      pista con fotos y confirmar que las URLs ya no son accesibles en
      Cloudinary