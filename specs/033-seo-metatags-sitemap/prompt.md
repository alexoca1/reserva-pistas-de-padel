# Prompt de implementación — Spec 033: SEO, Meta Tags y Sitemap

Implementa la spec 033 siguiendo `spec.md`, `plan.md` y `tasks.md`.

## PARTE A — `padel-frontend/index.html`
Añadir dentro de `<head>`:
- Meta descripción base:
  `<meta name="description" content="Reserva tus pistas de pádel en segundos. Consulta disponibilidad, gestiona tus reservas y disfruta jugando en Club Pádel Calatrava." />`
- Open Graph tags (`og:type`, `og:url`, `og:title`, `og:description`, `og:image`).
- Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).

## PARTE B — `src/components/Layout.tsx`
- Añadir diccionario `DESCRIPCIONES_POR_RUTA`.
- Actualizar el contenido de `<meta name="description">` en el DOM al navegar según `location.pathname` (con fallback a la descripción base).

## PARTE C — `public/og-image.png`
- Crear imagen de 1200×630px para vistas previas en redes sociales en `padel-frontend/public/og-image.png`.

## PARTE D — `public/sitemap.xml` y `public/robots.txt`
- `public/sitemap.xml`: XML estándar con prioridades de rutas públicas (`/`, `/pistas`, `/instalaciones`, `/privacidad`, `/terminos`).
- `public/robots.txt`: reglas de rastreo permitiendo `/`, denegando `/dashboard`, `/reservas`, `/perfil`, `/admin/` y enlazando al sitemap.

## Verificación
- Comprobar que `/sitemap.xml`, `/robots.txt` y `/og-image.png` son accesibles sin error 404.
- Ejecutar `npm run build` y `npm run lint`.
