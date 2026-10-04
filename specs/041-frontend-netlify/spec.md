# Spec 041 — Frontend en Netlify y Proxy de Mismo Origen

**Estado:** Implementada  
**Fecha:** 2026-10-05  
**Afecta:** `padel-frontend` (`netlify.toml`, `.env`, `.env.production`, `src/services/api.ts`, `src/context/AuthContext.tsx`, `public/sitemap.xml`, `public/robots.txt`, `index.html`, `AGENTS.md`), raíz (`README.md`)

---

## Resumen

Esta especificación define la configuración, empaquetado y estrategia de despliegue del frontend de Pádel Reservas en **Netlify**.

Para evitar incompatibilidades de cookies HttpOnly entre dominios cruzados (*cross-site cookie restrictions / SameSite=Lax*), el frontend accede a la API de Cloud Run a través de una regla de reescritura de proxy (*same-origin rewrite*) `/api/*` configurada en `netlify.toml`. Además, se implementa una experiencia de usuario resiliente ante el arranque en frío (*cold start*) de Cloud Run (aviso no intrusivo tras 4 segundos y mensaje amigable de "demo temporalmente no disponible" si el backend responde con 5xx o falla la conexión).

---

## Escenarios

- **Como evaluador o visitante en producción**, accedo a `https://<mi-app>.netlify.app/` y puedo navegar entre rutas internas (`/pistas`, `/reservas`, `/perfil`) sin que una recarga devuelva error 404 (gracias al fallback SPA `/* -> /index.html 200`).
- **Como usuario en producción**, inicio sesión y mi refresh token en cookie HttpOnly se envía y recibe de forma transparente en `/api/auth/refresh` al tratarse del mismo origen (`same-origin`), sin bloqueos de terceros ni configuraciones CORS complejas.
- **Como usuario que accede cuando el contenedor de Cloud Run está suspendido (cold start)**, si una petición tarda más de 4 segundos, observo un mensaje informativo no intrusivo indicando *"El servidor se está despertando, puede tardar unos segundos"*.
- **Como usuario cuando el backend no está disponible o responde con error 5xx**, recibo un mensaje comprensible de *"Demo temporalmente no disponible. Inténtalo de nuevo en unos minutos"* en lugar de trazas técnicas o errores crudos.
- **Como desarrollador en local**, sigo ejecutando `npm run dev` conectando directamente con `http://localhost:8081` sin interferencias del proxy de producción.

---

## Requisitos funcionales

### RF-01 — Configuración de Netlify (`netlify.toml`)
- Crear `padel-frontend/netlify.toml` con:
  - Comando de construcción: `npm run build`
  - Directorio de publicación: `dist`
  - Regla 1 (Proxy API): `from = "/api/*"` hacia `to = "https://<URL_BACKEND_CLOUD_RUN>/:splat"`, `status = 200`, `force = true`. (La URL se deja con un marcador para que el usuario la complete tras el despliegue de Cloud Run).
  - Regla 2 (SPA Fallback): `from = "/*"` hacia `to = "/index.html"`, `status = 200`.
  - **Orden crítico:** La regla del proxy `/api/*` debe declararse **antes** que la regla de fallback `/*`.

### RF-02 — Configuración de URL Base de la API
- En `padel-frontend/`:
  - En `.env.production` (o `.env.local` / configuración de Vite): `VITE_API_URL=/api` (ruta relativa para mismo origen en producción).
  - En `.env` (desarrollo local por defecto): `VITE_API_URL=http://localhost:8081`.
- En `src/services/api.ts`:
  - `API_BASE_URL` se inicializa con `import.meta.env.VITE_API_URL || "/api"`.
  - Mantener estrictamente `credentials: "include"` en todas las peticiones `fetch` para el envío de cookies HttpOnly a través del proxy.
  - Asegurar que ningún endpoint o servicio tenga URLs absolutas hardcodeadas.

### RF-03 — Resiliencia y Manejo de Arranque en Frío (Cold Start)
- Implementar un temporizador en las peticiones clave o en `fetchAPI` / `AuthContext`:
  - Si una petición de red tarda más de 4.000 ms en completarse, emitir un aviso informativo no intrusivo (toast o indicador visual existente): *"El servidor se está despertando, puede tardar unos segundos"*.
  - En caso de fallo de red (`TypeError: Failed to fetch` / `NetworkError`) o códigos de respuesta `502`, `503`, `504` o `500`, transformar el mensaje de error para el usuario en: *"Demo temporalmente no disponible. Por favor, inténtalo de nuevo en unos minutos."*.
  - Reutilizar el sistema de `ToastContext` y componentes existentes sin añadir ninguna dependencia externa.

### RF-04 — SEO y Metadatos de Dominio
- Actualizar `public/sitemap.xml`, `public/robots.txt` e `index.html` (`og:url`, `twitter:url`) reemplazando URLs de prueba por la URL canónica de Netlify o un marcador claramente documentado `https://<tu-app>.netlify.app/`.
- Dejar anotado como paso manual pendiente en `tasks.md` la sustitución de este marcador por el subdominio real una vez creado en Netlify.

### RF-05 — Documentación de Despliegue
- En `README.md` (raíz): Añadir subsección en `## Despliegue en producción` con el paso a paso para desplegar en Netlify:
  1. Conexión del repositorio Git a Netlify.
  2. Base directory: `padel-frontend`.
  3. Build command: `npm run build`.
  4. Publish directory: `padel-frontend/dist`.
  5. Sustitución de la URL del proxy en `netlify.toml` con la URL generada por Cloud Run.
- En `padel-frontend/AGENTS.md`: Documentar las directivas de Netlify, el proxy `/api` y el comportamiento del arranque en frío.

---

## Fuera de alcance

- Configuración de dominio personalizado (DNS propio con SSL propio) en esta fase (se utiliza el subdominio gratuito `*.netlify.app`).
- Modificaciones en el código fuente de `padel-backend` (el backend ya está configurado con `server.forward-headers-strategy=framework` y no requiere cambios).
- Creación automática del proyecto en Netlify mediante CLI o APIs con credenciales del usuario (el despliegue se gestiona vía interfaz web o git push).

---

## Verificación

1. `npm run build` en `padel-frontend/` genera el bundle en `dist/` sin errores de TypeScript ni linter.
2. `npm run preview` permite comprobar localmente la carga del frontend.
3. Las llamadas a la API usan `/api` en modo producción (`npm run build`).
4. Si el backend está apagado o tarda en responder, se muestra el aviso de cold start y el mensaje amigable de "demo temporalmente no disponible".
