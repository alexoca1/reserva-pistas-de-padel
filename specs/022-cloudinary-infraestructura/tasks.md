# Tareas: Integración Cloudinary

## Backend
- [x] T01 - `pom.xml`: añadir dependencia `cloudinary-http45`
- [x] T02 - `application.properties`: añadir variables de Cloudinary y
      límites de multipart
- [x] T03 - Crear `CloudinaryConfig.java` con bean `Cloudinary`
- [x] T04 - Crear record `SubidaResult(String url, String publicId)`
      en `dto/`
- [x] T05 - Crear `CloudinaryService.java` con métodos `subir` y
      `eliminar`
- [x] T06 - Crear `UploadController.java` con `POST /upload`
- [x] T07 - Test: subir archivo > 10 MB → 400 con mensaje claro
- [x] T08 - Test: `POST /upload` sin autenticación → 401

## Frontend
- [x] T09 - `types/index.ts`: añadir `SubidaResult`
- [x] T10 - `services/api.ts`: añadir `uploadService.subir`

## Documentación
- [x] T11 - `padel-backend/AGENTS.md`: añadir `CloudinaryConfig`,
      `CloudinaryService`, `UploadController`, `SubidaResult` a las
      secciones correspondientes; añadir `POST /upload` a la tabla de
      endpoints; anotar las variables de entorno de Cloudinary
- [ ] T12 - Verificación manual: subir una imagen desde Postman a
      `POST /upload` con token válido; confirmar que la URL devuelta
      carga en el navegador en formato WebP; confirmar que un archivo
      de 11 MB devuelve 400