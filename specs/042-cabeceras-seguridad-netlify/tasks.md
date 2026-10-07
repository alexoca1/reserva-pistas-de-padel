# Tareas: Spec 042 — Cabeceras de Seguridad HTTP en Netlify

- [x] **T01** — Añadir el bloque `[[headers]]` en `padel-frontend/netlify.toml` con las 5 cabeceras de seguridad requeridas (`Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`), basándose en el inventario de recursos externos.
- [x] **T02** — Ejecutar compilación de producción (`npm run build`) en `padel-frontend/` y verificar que no hay errores de empaquetado.
- [x] **T03** — Iniciar `npm run preview`, navegar por todas las rutas de la aplicación (incluyendo la escena 3D WebGL en el Hero, galerías con Lightbox y perfil con avatar `blob:`) y verificar que se registran 0 violaciones de CSP en la consola del navegador.
- [x] **T04** — Actualizar la documentación en `padel-frontend/AGENTS.md` y `README.md` detallando las cabeceras de seguridad y la política de CSP.
- [x] **T05** — Documentar los resultados de verificación en `specs/042-cabeceras-seguridad-netlify/spec.md` y marcar las tareas como completadas.
