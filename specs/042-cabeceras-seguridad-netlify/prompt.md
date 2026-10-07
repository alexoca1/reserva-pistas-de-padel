# Prompt para Spec 042 — Cabeceras de Seguridad HTTP en Netlify

Crea la spec `specs/042-cabeceras-seguridad-netlify/` con `spec.md`, `plan.md`, `tasks.md` y `prompt.md` siguiendo `.specify/memory/constitution.md` y el formato de la spec 029. Después impleméntala.

Objetivo: el frontend se sirve desde Netlify sin cabeceras de seguridad. Añadirlas en `padel-frontend/netlify.toml` (sección `[[headers]]`):
- `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` y `X-Frame-Options: DENY`.
- Inventario de recursos externos: buscar todas las URLs `https://` en `padel-frontend/src` e `index.html` (Cloudinary, la API de Cloud Run, fuentes de Google Fonts, etc.) y construir la CSP solo con lo que la app usa de verdad.
- Punto de partida de CSP:
  `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://res.cloudinary.com; connect-src 'self' https://padel-backend-1058303442470.europe-west1.run.app; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`.
- Justificar en la spec la necesidad de `'unsafe-inline'` en `style-src` (animaciones de `framer-motion`, estilos de `Avatar.tsx`, Canvas WebGL de Three.js).
- Comprobar que las cabeceras de la spec 029 del backend no se duplican ni contradicen.

Verificación: `npm run build` y `npm run preview`; recorrer TODAS las rutas (incluida la galería con lightbox, el perfil con subida de avatar y la escena del hero) con la consola abierta y confirmar cero violaciones de CSP. Documentar el resultado en la spec.
Documentación: actualizar `padel-frontend/AGENTS.md` y `README.md`.
Rama: `spec/042-cabeceras-seguridad-netlify`. Commits: `feat(security)`, `docs`.
