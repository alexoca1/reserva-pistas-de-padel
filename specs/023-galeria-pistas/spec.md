# Spec: Galería de fotos por pista y lightbox en /pistas

**Estado:** Implementada

## Resumen
Cada pista puede tener hasta 5 fotos en Cloudinary. Una de ellas es la
portada (miniatura en el catálogo, campo `imagenUrl` ya existente). Las
demás se muestran en un lightbox al hacer clic en la miniatura desde
`/pistas`. El admin gestiona la galería de cada pista desde la misma
página de Pistas.

## Escenarios
- Como usuario, al hacer clic en la foto de una pista en el catálogo,
  quiero ver su galería completa sin salir de la página.
- Como administrador, quiero subir hasta 5 fotos por pista, elegir cuál
  es la portada, y borrar fotos, todo desde la página de Pistas.
- Como sistema, cuando se borra una pista o una de sus fotos, quiero que
  las imágenes también se borren de Cloudinary (RGPD/limpieza).

## Requisitos funcionales
- RF-01: Nueva entidad `FotoPista` con URL, publicId de Cloudinary,
  flag de portada y orden.
- RF-02: Máximo 5 fotos por pista. Si ya hay 5, el botón de subir queda
  deshabilitado con mensaje claro.
- RF-03: La foto marcada como portada sincroniza automáticamente el
  campo `imagenUrl` de `Pista` (compatibilidad con el código existente
  que ya usa ese campo).
- RF-04: Al borrar una foto, se llama a `CloudinaryService.eliminar`
  antes de borrar la fila de BD.
- RF-05: Al borrar una pista, se borran todas sus fotos de Cloudinary
  antes de borrar la pista de BD.
- RF-06: En `/pistas`, hacer clic en la miniatura de cualquier pista
  abre un lightbox con todas sus fotos (navegación prev/next).
- RF-07: El lightbox es accesible con teclado (flechas para navegar,
  Escape para cerrar) — patrón ya establecido en spec 007.
- RF-08: La galería de cada pista es pública — no requiere autenticación
  para verla.
- RF-09: El campo "URL de imagen" (manual) se retira del modal de
  creación y edición de pistas, centralizando la gestión de imágenes
  exclusivamente en la galería y su mecanismo de "portada".

## Fuera de alcance
- Reordenación de fotos por arrastre (drag).
- Zoom dentro del lightbox.
- Cambios en el modelo de datos de `Pista` más allá de la relación con
  `FotoPista`.

## Preguntas abiertas
Ninguna.