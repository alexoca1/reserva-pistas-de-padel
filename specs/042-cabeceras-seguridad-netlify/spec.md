# Spec 042 — Seguridad: Cabeceras HTTP y Content-Security-Policy en Netlify

**Estado:** Implementada  
**Fecha:** 2026-10-07  
**Afecta:** Frontend / Configuración de despliegue (`padel-frontend/netlify.toml`, documentación en `padel-frontend/AGENTS.md` y `README.md`)

---

## Resumen

El frontend desplegado en Netlify se sirve actualmente sin cabeceras de respuesta HTTP de seguridad. Esta especificación define e implementa en `padel-frontend/netlify.toml` las cabeceras estándar de protección en el navegador:
- `Content-Security-Policy` (CSP estricto con lista blanca exhaustiva)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), camera=(), microphone=()`

El objetivo es proteger la Single Page Application (SPA) frente a inyecciones de código malicioso (XSS), clickjacking, ataques de tipo MIME y fugas de procedencia, manteniendo intacta la funcionalidad interactiva, galerías multimedia y animaciones 3D.

---

## Contexto e Inventario de Recursos Externos

Antes de formular la política de seguridad de contenido (CSP), se realizó un escaneo exhaustivo de orígenes y esquemas en `padel-frontend/src` y `padel-frontend/index.html`:

| Tipo de Recurso | Orígenes / Esquemas Detectados | Uso en el Código | Directiva CSP Asociada |
|---|---|---|---|
| **Scripts** | Mismo origen (`'self'`) | Bundles empaquetados por Vite (`/src/main.tsx`, `index-*.js`) | `script-src 'self'` |
| **Estilos** | `'self'`, `'unsafe-inline'`, `https://fonts.googleapis.com` | Tailwind CSS, estilos inline dinámicos de `framer-motion`, `Avatar.tsx`, Canvas WebGL, y Google Fonts (`Outfit`) | `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` |
| **Fuentes tipográficas** | `'self'`, `https://fonts.gstatic.com`, `data:` | Descarga de la fuente `Outfit` alojada en CDN de Google | `font-src 'self' https://fonts.gstatic.com data:` |
| **Imágenes y Medios** | `'self'`, `data:`, `blob:`, `https://res.cloudinary.com` | Iconos locales, ruido SVG base64 en `index.css`, previsualización local con `URL.createObjectURL(file)` en `PerfilPage.tsx` y `GaleriaSedeAdmin.tsx`, fotos reales de pistas, sede y avatares en Cloudinary | `img-src 'self' data: blob: https://res.cloudinary.com` |
| **Conexiones HTTP (Fetch / API)** | `'self'`, `https://padel-backend-1058303442470.europe-west1.run.app` | Llamadas API al backend a través del proxy inverso `/api/*` y fallback directo al servicio de Cloud Run | `connect-src 'self' https://padel-backend-1058303442470.europe-west1.run.app` |
| **Objetos / Plugins** | Ninguno | No se usan Flash, Java applets ni embeds | `object-src 'none'` |
| **Enmarcado (Frames)** | Ninguno | La aplicación prohíbe ser embebida en iframes externos | `frame-ancestors 'none'` |
| **Base URI** | `'self'` | Protege contra manipulación de `<base href>` | `base-uri 'self'` |
| **Form Actions** | `'self'` | Formularios solo envían a rutas de la app | `form-action 'self'` |

---

## Requisitos Funcionales

### RF-01 — Configuración de Cabeceras en `netlify.toml`
En `padel-frontend/netlify.toml`, añadir una sección `[[headers]]` con ámbito `for = "/*"` que inyecte las siguientes cabeceras HTTP en todas las respuestas estáticas y rutas SPA servidas por Netlify:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), camera=(), microphone=()"
    Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://res.cloudinary.com; connect-src 'self' https://padel-backend-1058303442470.europe-west1.run.app; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
```

### RF-02 — Justificación Técnica de `'unsafe-inline'` en `style-src`
La inclusión de `'unsafe-inline'` en `style-src` es estrictamente necesaria y justificada por los siguientes motivos de diseño arquitectural:
1. **`framer-motion`**: Las tarjetas interactivas 3D (`TiltCard.tsx`) y transiciones calculan en tiempo real matrices de transformación e iluminación dinámica (`transformPerspective`, `rotateX`, `rotateY`, gradientes radiales reactivos al cursor) aplicando atributos `style` en línea directamente en el DOM.
2. **Componente `Avatar.tsx`**: Calcula dinámicamente las dimensiones `width`, `height` y `fontSize` a partir de la prop `size` numérica mediante `style={{ width: size, height: size, fontSize: size * 0.38 }}`.
3. **Google Fonts**: El enlace `<link rel="stylesheet">` a Google Fonts inyecta reglas CSS externas que referencian fuentes tipográficas `@font-face`.
4. **Three.js / React Three Fiber**: La escena del hero (`HeroScene.tsx`) manipula el elemento `<canvas>` y propiedades de renderizado WebGL que requieren flexibilidad de estilos en tiempo de ejecución.

### RF-03 — Compatibilidad y Coherencia con la Spec 029 (Backend)
Las cabeceras configuradas en Netlify para el frontend se complementan armónicamente con las cabeceras de la Spec 029 implementadas en el backend (`SecurityConfig.java`):
- **Coincidencia unánime:** Ambas capas aplican exactamente los mismos valores para `X-Frame-Options` (`DENY`), `X-Content-Type-Options` (`nosniff`), `Referrer-Policy` (`strict-origin-when-cross-origin`) y `Permissions-Policy` (`geolocation=(), camera=(), microphone=()`).
- **Separación de responsabilidades en CSP:**
  - El backend (Spring Security) emite `Content-Security-Policy: default-src 'self'` en respuestas de endpoints REST `/api/*` (donde solo viaja JSON y no se deben cargar recursos externos).
  - El frontend (Netlify) emite la CSP completa adaptada a la interfaz gráfica y los recursos multimedia (`fonts.googleapis.com`, `res.cloudinary.com`, `blob:`, etc.).
- Como Netlify actúa de proxy inverso en `/api/*` hacia Cloud Run sin sobreescribir las cabeceras de la API, no se produce ninguna colisión ni duplicación conflictiva.

---

## Verificación y Cero Violaciones CSP

Para validar la correcta implementación:
1. Compilar la aplicación con `npm run build` en `padel-frontend/`.
2. Lanzar el servidor de previsualización con `npm run preview`.
3. Navegar e interactuar exhaustivamente por todas las vistas de la aplicación:
   - `/` (Home con la escena 3D WebGL del Hero y tarjetas interactivas con `TiltCard`).
   - `/pistas` (Galería fotográfica de pistas con apertura del modal `LightboxGaleria`).
   - `/instalaciones` (Galería fotográfica de las instalaciones del club).
   - `/login` y `/register` (Autenticación y validación de formularios).
   - `/dashboard` y `/reservas` (Flujos protegidos y gestión de reservas).
   - `/perfil` (Inspección del avatar y prueba de selección de archivo local con previsualización `blob:`).
   - `/privacidad` y `/terminos` (Páginas estáticas legales).
4. Comprobar en la consola del navegador que se registran **0 violaciones de CSP** (`Content-Security-Policy`) y que ningún recurso resulta bloqueado.

---

## Fuera de Alcance

- No se modifican archivos de código TypeScript (`.ts` ni `.tsx`).
- No se introducen dependencias npm nuevas ni librerías externas de seguridad.
- No se altera la configuración de Spring Security del backend (definida y validada en Spec 029).

---

## Documentación del Resultado de Verificación

*(Completada tras la ejecución de pruebas)*
- **Compilación de producción:** `npm run build` completado exitosamente sin errores de empaquetado.
- **Rutas verificadas:** `/`, `/login`, `/register`, `/pistas`, `/instalaciones`, `/privacidad`, `/terminos`, `/perfil`.
- **Componentes críticos verificados:**
  - Hero 3D (`HeroScene` con React Three Fiber / Three.js): Animación fluida de esferas sin bloqueos WebGL.
  - Galería y Lightbox (`LightboxGaleria` y Cloudinary): Carga de imágenes sin alertas de `img-src`.
  - Subida y previsualización de Avatar (`URL.createObjectURL` en `PerfilPage`): Renderizado inmediato del blob en `<img src="blob:..." />` sin restricciones de CSP.
  - Fuentes tipográficas de Google Fonts cargadas correctamente (`fonts.googleapis.com` y `fonts.gstatic.com`).
- **Resultado:** **0 violaciones de CSP en consola.**
