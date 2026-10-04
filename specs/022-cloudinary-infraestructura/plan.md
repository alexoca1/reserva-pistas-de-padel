# Plan técnico: Integración Cloudinary

**Spec relacionada:** ./spec.md

## Diseño

### Backend

**Dependencia nueva** (`pom.xml`) — justificada por Artículo 4 (resuelve
algo que Java puro no puede hacer sin código de compresión propio):

```xml
<dependency>
  <groupId>com.cloudinary</groupId>
  <artifactId>cloudinary-http45</artifactId>
  <version>1.39.0</version>
</dependency>
```

**`CloudinaryConfig.java`** (`@Configuration`): crea el bean `Cloudinary`
leyendo `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET` de variables de entorno vía
`@Value("${cloudinary.cloud-name}")` etc., con sus contrapartes en
`application.properties` que leen de `${CLOUDINARY_CLOUD_NAME}`.

**`CloudinaryService.java`** (`@Service`):
- `SubidaResult subir(MultipartFile file, String carpeta, int anchoMax)`:
  usa `cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(...))`.
  Parámetros de transformación: `format → webp`, `quality → auto`,
  `width → anchoMax`, `crop → limit`. Devuelve record `SubidaResult(String url, String publicId)`.
- `void eliminar(String publicId)`: llama a
  `cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap())`.
  Usado por specs 023-025 al borrar imágenes de la BD — garantiza que
  Cloudinary no retiene datos huérfanos.

**`UploadController.java`**:
- `POST /upload` — autenticado (`anyRequest().authenticated()` ya lo
  cubre, sin `@PreAuthorize` extra).
- Recibe `@RequestParam MultipartFile file`.
- Valida tamaño ≤ 10 MB; si supera, `400` con mensaje claro.
- Llama a `cloudinaryService.subir(file, "general", 1920)`.
- Devuelve `SubidaResult` como JSON.

**`application.properties`**:
```properties
cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api-key=${CLOUDINARY_API_KEY}
cloudinary.api-secret=${CLOUDINARY_API_SECRET}
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### Frontend

**`services/api.ts`**: añadir `uploadService`:
```ts
export const uploadService = {
  subir: (file: File): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    return fetchAPI("/upload", { method: "POST", body: formData });
  },
};
```
No añadir `Content-Type` manualmente — el navegador lo pone con el
`boundary` correcto automáticamente cuando el body es `FormData`.

**`types/index.ts`**: añadir tipo `SubidaResult { url: string; publicId: string }`.

## Decisiones y alternativas descartadas

- **Subida directa navegador → Cloudinary** (unsigned upload preset):
  descartada por RGPD — si el frontend sube directamente, el backend no
  sabe qué hay en Cloudinary y no puede forzar el borrado en cascada de
  datos personales.
- **`cloudinary-http44` vs `cloudinary-http45`**: se usa `http45` porque
  es la versión más reciente compatible con el cliente HTTP de Spring Boot
  3 / Java 21.
- **Transformación en el cliente antes de subir** (Canvas API, WebP):
  descartada — el soporte de WebP via Canvas no es uniforme en todos los
  navegadores; delegar a Cloudinary es más fiable y es justo una de sus
  ventajas principales.

## Impacto en seguridad
Las credenciales de Cloudinary nunca salen del backend — el frontend
solo recibe URLs públicas de resultado. El endpoint `POST /upload`
requiere autenticación, por lo que usuarios anónimos no pueden consumir
la cuota de Cloudinary.