# Plan técnico: Spec 042 — Cabeceras de Seguridad HTTP en Netlify

**Spec relacionada:** `specs/042-cabeceras-seguridad-netlify/spec.md`

---

## Decisiones de Diseño

### 1. Ubicación de las Cabeceras (`netlify.toml`)
Netlify permite definir cabeceras HTTP personalizadas por patrón de URL mediante bloques `[[headers]]`.
Se define un único bloque con `for = "/*"` colocado después de los bloques de `[build]` y `[[redirects]]`:
- `X-Frame-Options: DENY`: Evita ataques de clickjacking garantizando que ningún sitio pueda incrustar la aplicación en iframes.
- `X-Content-Type-Options: nosniff`: Fuerza al navegador a respetar estrictamente los tipos MIME declarados.
- `Referrer-Policy: strict-origin-when-cross-origin`: Oculta rutas internas al navegar hacia orígenes externos y preserva la privacidad del usuario.
- `Permissions-Policy: geolocation=(), camera=(), microphone=()`: Deshabilita el acceso no solicitado a APIs sensibles del dispositivo cliente.
- `Content-Security-Policy`: Define con precisión quirúrgica los orígenes válidos determinados durante el inventario de recursos.

### 2. Construcción Minuciosa de la Política CSP
- `default-src 'self'`: Restricción estricta por defecto.
- `script-src 'self'`: Solo código empaquetado del bundle local.
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`: Admite estilos locales, el CSS de Google Fonts y los estilos en línea dinámicos de `framer-motion` y `Avatar.tsx`.
- `font-src 'self' https://fonts.gstatic.com data:`: Permite la descarga de los archivos de fuentes WOFF2 de Google.
- `img-src 'self' data: blob: https://res.cloudinary.com`: Permite imágenes del sitio, esquemas base64 data:, URLs en memoria `blob:` (usadas por `URL.createObjectURL` para avatares y sede) y el CDN de Cloudinary.
- `connect-src 'self' https://padel-backend-1058303442470.europe-west1.run.app`: Permite el transporte de peticiones AJAX tanto al proxy inverso de Netlify como al host directo de Cloud Run.
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`.

### 3. Ficheros afectados

| Archivo | Acción | Descripción |
|---|---|---|
| `padel-frontend/netlify.toml` | Modificar | Añadir sección `[[headers]]` con las 5 cabeceras de seguridad |
| `padel-frontend/AGENTS.md` | Modificar | Documentar las cabeceras de seguridad y la CSP de Netlify |
| `README.md` | Modificar | Reflejar las cabeceras HTTP de seguridad en la sección de despliegue en producción |
| `specs/042-cabeceras-seguridad-netlify/*` | Crear | Documentación formal de la especificación |

---

## Impacto en Seguridad y Filosofía Ponytail

- **Cambio mínimo:** Cero líneas de código TypeScript añadidas o modificadas. Todo se gestiona a nivel de infraestructura estática en el servidor web de Netlify.
- **Cero dependencias nuevas:** Sin bibliotecas de terceros para gestión de cabeceras en tiempo de ejecución.
- **Defensa en profundidad:** Complementa armónicamente la Spec 029 del backend sin sobreescrituras ni contradicciones.
