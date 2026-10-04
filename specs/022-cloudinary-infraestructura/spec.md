# Spec: Integración Cloudinary — infraestructura compartida de subida

**Estado:** Implementada

## Resumen
Todas las imágenes del proyecto (galería de pistas, galería de la sede,
avatares de usuario) se suben a Cloudinary y se almacenan como URLs en
base de datos. Esta spec establece la capa compartida: configuración del
SDK, endpoint de subida, optimización automática a WebP, y el servicio
de borrado que las specs posteriores reutilizan para cumplir con el
borrado en cascada exigido por el RGPD.

## Escenarios
- Como desarrollador (o agente IA), quiero un único punto de subida a
  Cloudinary que todas las specs posteriores reutilicen sin duplicar
  lógica de SDK.
- Como sistema, cuando se borra una foto de la base de datos, quiero que
  también se borre de Cloudinary para no dejar datos personales huérfanos
  (requisito RGPD).

## Requisitos funcionales
- RF-01: El backend expone `POST /upload` (autenticado, cualquier rol)
  que recibe un `MultipartFile`, lo sube a Cloudinary con optimización
  automática (WebP, calidad auto, ancho máximo configurable), y devuelve
  la URL pública y el `publicId`.
- RF-02: La optimización a WebP se aplica en el servidor de Cloudinary
  vía parámetros de transformación, sin código de compresión propio.
- RF-03: `CloudinaryService` expone también un método `eliminar(publicId)`
  que las specs 023-025 llaman al borrar una foto de la BD.
- RF-04: Las credenciales de Cloudinary (`cloud_name`, `api_key`,
  `api_secret`) viven en variables de entorno, nunca en el código.
- RF-05: El frontend expone `uploadService.subir(file)` en `api.ts` que
  llama a `POST /upload` y devuelve `{ url, publicId }`.
- RF-06: El tamaño máximo de archivo aceptado es 10 MB, rechazado con
  400 y mensaje claro si se supera.

## Fuera de alcance
- Subida directa desde el navegador a Cloudinary (sin pasar por el
  backend) — se descarta por RGPD: el backend debe ser el intermediario
  que controla qué se sube y puede forzar el borrado.
- Transformaciones específicas por tipo de imagen (miniatura vs. galería)
  — se usan los parámetros por defecto de Cloudinary (`q_auto`, `f_auto`,
  `w_1920,c_limit`) en este endpoint; las specs posteriores pueden pasar
  parámetros adicionales si lo necesitan.
- Panel de gestión de Cloudinary dentro de la app.

## Preguntas abiertas
Ninguna.