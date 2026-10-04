# Spec 033 — SEO: Meta Tags, Open Graph, Twitter Cards, Sitemap y Robots.txt

**Estado:** Implementada  
**Fecha:** 2026-10-03  
**Afecta:** Solo frontend (`padel-frontend`: `index.html`, `src/components/Layout.tsx`, `public/og-image.png`, `public/sitemap.xml`, `public/robots.txt`)

---

## Resumen

Esta especificación implementa las optimizaciones fundamentales de SEO (Search Engine Optimization) y previsualización en redes sociales (Open Graph / Twitter Cards) para el proyecto "Club Pádel Calatrava" (Pádel Reservas):
1. Configuración de meta etiquetas base en `index.html` (description, Open Graph y Twitter Cards).
2. Actualización dinámica en cliente de `<meta name="description">` según la ruta navegada en `Layout.tsx`.
3. Creación de la imagen Open Graph (`public/og-image.png`, 1200×630px).
4. Generación de `sitemap.xml` para indexación de rutas públicas y `robots.txt` para regular el rastreo de motores de búsqueda.

---

## Escenarios

- **Como motor de búsqueda o crawler (Googlebot, Bingbot)**, accedo a `robots.txt` para conocer las directivas de indexación y a `sitemap.xml` para descubrir las páginas públicas del club y sus prioridades.
- **Como usuario que comparte un enlace en WhatsApp, Telegram, Twitter/X o LinkedIn**, la plataforma genera una tarjeta enriquecida con título, descripción y una imagen representativa de 1200×630px.
- **Como usuario que navega por la web**, el atributo `<meta name="description">` del documento se sincroniza automáticamente con la página activa para mejorar el snippet en resultados de búsqueda.

---

## Requisitos funcionales

### RF-01 — Meta etiquetas base en `index.html`
- Añadir meta descripción base:
  `Reserva tus pistas de pádel en segundos. Consulta disponibilidad, gestiona tus reservas y disfruta jugando en Club Pádel Calatrava.`
- Añadir etiquetas Open Graph:
  - `og:type`: `"website"`
  - `og:url`: `"https://padelreservas.es/"`
  - `og:title`: `"Pádel Reservas · Club Pádel Calatrava"`
  - `og:description`: `"Reserva tus pistas de pádel en segundos. Consulta disponibilidad y gestiona tus reservas."`
  - `og:image`: `"/og-image.png"`
- Añadir etiquetas Twitter Card:
  - `twitter:card`: `"summary_large_image"`
  - `twitter:title`: `"Pádel Reservas · Club Pádel Calatrava"`
  - `twitter:description`: `"Reserva tus pistas de pádel en segundos. Consulta disponibilidad y gestiona tus reservas."`
  - `twitter:image`: `"/og-image.png"`

### RF-02 — Meta descripción dinámica por ruta en `Layout.tsx`
- Definir un diccionario `DESCRIPCIONES_POR_RUTA`:
  - `"/"`: `"Reserva tus pistas de pádel en segundos. Consulta disponibilidad y gestiona tus reservas en Club Pádel Calatrava."`
  - `"/pistas"`: `"Consulta todas las pistas de pádel disponibles, horarios y disponibilidad en tiempo real."`
  - `"/instalaciones"`: `"Conoce las instalaciones del Club Pádel Calatrava: pistas, servicios y galería de fotos."`
  - `"/dashboard"`: `"Tu panel de control: próximas reservas, acceso rápido y gestión de tu actividad."`
  - `"/reservas"`: `"Crea, edita y cancela tus reservas de pádel de forma sencilla."`
  - `"/perfil"`: `"Gestiona tus datos personales, cambia tu contraseña y actualiza tu foto de perfil."`
  - `"/privacidad"`: `"Política de privacidad y protección de datos del Club Pádel Calatrava."`
  - `"/terminos"`: `"Términos y condiciones de uso del servicio de reservas de pádel."`
- Actualizar en `useLayoutEffect` o `useEffect` el elemento `<meta name="description">` del DOM con fallback a la descripción base si la ruta no está registrada.

### RF-03 — Imagen Open Graph (`public/og-image.png`)
- Archivo `padel-frontend/public/og-image.png` accesible en la ruta `/og-image.png`.
- Dimensiones recomendadas: 1200×630px.
- Identidad visual acorde al Club Pádel Calatrava.

### RF-04 — Archivo `public/sitemap.xml`
- XML estándar con espacio de nombres `http://www.sitemaps.org/schemas/sitemap/0.9`.
- Rutas indexables con prioridades:
  - `https://padelreservas.es/` (prioridad 1.0)
  - `https://padelreservas.es/pistas` (prioridad 0.9)
  - `https://padelreservas.es/instalaciones` (prioridad 0.8)
  - `https://padelreservas.es/privacidad` (prioridad 0.3)
  - `https://padelreservas.es/terminos` (prioridad 0.3)

### RF-05 — Archivo `public/robots.txt`
- `User-agent: *`
- Permitir rastreo en `/`.
- Prohibir rutas privadas/sensibles:
  - `Disallow: /dashboard`
  - `Disallow: /reservas`
  - `Disallow: /perfil`
  - `Disallow: /admin/`
- Enlace al sitemap: `Sitemap: https://padelreservas.es/sitemap.xml`.

---

## Fuera de alcance
- Renderizado del lado del servidor (SSR) o prerender estático de HTML (SSG) de todas las páginas (se mantiene arquitectura SPA Vite).
- Modificaciones en el backend o API.
