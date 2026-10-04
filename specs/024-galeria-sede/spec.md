# Spec: Galería de fotos de la sede + página /instalaciones

**Estado:** Implementada

## Resumen
Club Pádel Calatrava tiene una galería de hasta 10 fotos generales de
la sede (exterior, instalaciones, ambiente) accesibles en la página
pública `/instalaciones`. El admin gestiona esas fotos desde
`/admin/galeria`, accesible solo con `ROLE_ADMIN`.

## Escenarios
- Como visitante, quiero ver las fotos de las instalaciones del club
  antes de registrarme, para hacerme una idea del lugar.
- Como administrador, quiero subir, reordenar (por orden de subida) y
  borrar fotos de la sede desde un panel dedicado, sin tocar código.
- Como sistema, cuando se borra una foto de la sede, quiero que también
  se borre de Cloudinary (RGPD/limpieza).

## Requisitos funcionales
- RF-01: Nueva entidad `FotoSede` con URL, publicId de Cloudinary y
  orden. No hay concepto de "portada" — todas las fotos son iguales
  en peso.
- RF-02: Máximo 10 fotos de sede. El botón de subir queda deshabilitado
  con mensaje claro cuando se alcanza el límite.
- RF-03: `GET /sede/fotos` — público, sin autenticación.
- RF-04: `POST /sede/fotos` y `DELETE /sede/fotos/{id}` — solo
  `ROLE_ADMIN`.
- RF-05: Al borrar una foto, se llama a `CloudinaryService.eliminar`
  antes de borrar la fila de BD.
- RF-06: Nueva página pública `/instalaciones` con:
  - Cabecera con el nombre del club y descripción breve.
  - Galería de fotos de la sede en grid responsive (3 columnas
    escritorio, 2 tablet, 1 móvil).
  - Sección inferior con las pistas del club (lista compacta con
    miniatura y datos básicos), para que el visitante pueda ver las
    pistas sin ir a `/pistas`.
  - Botón CTA "Reservar ahora" que lleva a `/login` o `/reservas`
    según si el usuario está autenticado.
- RF-07: Nueva página protegida `/admin/galeria` (solo `ROLE_ADMIN`)
  con:
  - Grid de fotos actuales con botón "Eliminar" en cada una.
  - Botón "Subir foto" (deshabilitado al llegar a 10).
  - Input file con preview antes de confirmar la subida.
- RF-08: El Navbar muestra "Instalaciones" como enlace público, junto
  a "Pistas", visible sin login.
- RF-09: El Navbar muestra "Galería" como enlace solo visible para
  `ROLE_ADMIN`, en el bloque de navegación autenticada.

## Fuera de alcance
- Reordenación manual por drag de las fotos de sede.
- Lightbox en `/instalaciones` — las fotos se ven en grid, sin modal
  de zoom (simplifica el alcance; el lightbox ya existe en `/pistas`
  como referencia si se quiere añadir después).
- Descripción o título por foto.
- Múltiples sedes.

## Preguntas abiertas
Ninguna.