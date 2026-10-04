# Plan técnico: Spec 033 — SEO: Meta Tags, Open Graph, Twitter Cards, Sitemap y Robots.txt

**Spec relacionada:** `../spec.md`

---

## Diseño técnico

### 1. Inyección de etiquetas en `index.html`
- Colocar las etiquetas `<meta name="description">`, Open Graph (`og:*`) y Twitter (`twitter:*`) en el `<head>` antes de los estilos.
- Garantizar que las etiquetas estáticas estén presentes en el HTML inicial para scrapers simples que no ejecutan JavaScript (como el crawler de WhatsApp o Twitter).

### 2. Sincronización en cliente (`Layout.tsx`)
- Siguiendo el patrón existente de `TITULOS_POR_RUTA`, declarar `DESCRIPCIONES_POR_RUTA`.
- En el hook de cambio de ruta (`location.pathname`), localizar el elemento `<meta name="description">`:
  ```ts
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", descripcion);
  }
  ```
- Mantener compatibilidad con la filosofía Ponytail: manipulación directa del nodo DOM existente sin librerías externas como `react-helmet` o `next-seo`.

### 3. Activos estáticos en `public/`
- `sitemap.xml`: define las URL canónicas públicas y sus prioridades de indexación.
- `robots.txt`: restringe rutas protegidas (`/dashboard`, `/reservas`, `/perfil`, `/admin/`) e indica la localización del sitemap.
- `og-image.png`: imagen de 1200×630px para vistas previas en redes sociales.

---

## Decisiones y alternativas descartadas

1. **¿Usar una dependencia externa como `react-helmet` o `react-helmet-async`?**
   - *Decisión:* Descartado.
   - *Motivo:* Constitución del proyecto (Artículo 1 — Filosofía Ponytail y Artículo 2 — Librerías nativas). Manipular `document.title` y `meta[name="description"]` en un hook de React toma 4 líneas de código sin añadir peso ni posibles incompatibilidades de React 19.

2. **¿Rutas protegidas en el `sitemap.xml`?**
   - *Decisión:* Descartado.
   - *Motivo:* Rutas como `/dashboard`, `/reservas` o `/perfil` requieren autenticación y devuelven pantallas protegidas o datos privados; incluirlas penalizaría el SEO técnico.

---

## Impacto en seguridad
- Ninguno. `robots.txt` orienta a motores de búsqueda legítimos, pero la seguridad de rutas sensibles sigue siendo garantizada por `ProtectedRoute` y el backend Spring Security.
