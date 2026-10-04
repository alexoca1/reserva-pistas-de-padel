# Plan técnico: Spec 041 — Frontend en Netlify y Proxy de Mismo Origen

**Spec relacionada:** [spec.md](file:///d:/guithub%20proyectos/reserva-pistas-de-padel/specs/041-frontend-netlify/spec.md)

---

## Diseño Técnico

### 1. `netlify.toml` (Configuración de build y redirects)
Ubicación: `padel-frontend/netlify.toml`
```toml
[build]
  base = "padel-frontend"
  publish = "dist"
  command = "npm run build"

# 1. Proxy inverso para API REST hacia Cloud Run (mismo origen, status 200)
[[redirects]]
  from = "/api/*"
  to = "https://URL-DEL-BACKEND-EN-CLOUD-RUN.a.run.app/:splat"
  status = 200
  force = true
  headers = {X-Forwarded-Host = "padelreservas.netlify.app"}

# 2. SPA Fallback para React Router (todas las demás rutas a index.html)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Configuración de Entornos y URL Base de la API
- **Producción (`.env.production`):**
  `VITE_API_URL=/api`
- **Desarrollo (`.env`):**
  `VITE_API_URL=http://localhost:8081`
- **En `src/services/api.ts`:**
  - `API_BASE_URL`: Utiliza `import.meta.env.VITE_API_URL || "/api"`.
  - Las llamadas concatenan `${API_BASE_URL}/auth/...` de modo que en producción apuntan a `/api/auth/...`.
  - Se mantiene `credentials: "include"` para que el navegador adjunte automáticamente la cookie `refreshToken` en las peticiones al mismo origen `/api/*`.

### 3. Aviso de Cold Start y Fallo de Conexión en `src/services/api.ts` y `AuthContext.tsx`
- En `fetchAPI`:
  - Se inicia un temporizador de 4.000 ms (`window.dispatchEvent(new CustomEvent("app:slow-request"))` o toast directo).
  - Al recibir la respuesta o error, se cancela el temporizador.
  - Si la petición falla por error de red (`Failed to fetch`) o código HTTP `500..504`, se formatea la excepción con el mensaje de usuario amigable:
    `"Demo temporalmente no disponible. Por favor, inténtalo de nuevo en unos minutos."`
  - En `AuthContext.tsx` (en el `inicializarSesion` inicial): si el refresh inicial falla por error de red (no 401), se captura silenciosamente sin bloquear la carga inicial de la aplicación.

### 4. Metadatos SEO y Dominio Canónico
- En `public/sitemap.xml`, `public/robots.txt` e `index.html`:
  - Estandarizar la URL canónica temporal `https://padelreservas.netlify.app/` (o marcador documentado).
  - Documentar en `tasks.md` la tarea manual de actualizar con el subdominio final elegido en Netlify.

---

## Decisiones y alternativas descartadas

| Decisión | Alternativa descartada | Razón técnica |
|---|---|---|
| **Proxy inverso en Netlify (`/api/*` -> 200)** | Llamadas CORS directas a `https://backend.run.app` | Las cookies HttpOnly con `SameSite=Lax` o navegadores con protección estricta contra cookies de terceros (Safari ITP, Chrome Privacy Sandbox) fallan al refrescar tokens entre dominios distintos. Con el proxy de mismo origen (`same-origin`), la cookie viaja sin restricciones de terceros. |
| **Aviso de cold start a los 4s con CustomEvent / Toast existente** | Instalar librería de timeout/polling pesada | Mantiene la mentalidad *Ponytail* (cambios mínimos, cero dependencias nuevas). |
| **`.env.production` en el frontend** | Hardcodear `/api` en el código fuente | Permite seguir ejecutando `npm run dev` en local contra `http://localhost:8081` de forma transparente. |

---

## Impacto en Seguridad

- **Cookies HttpOnly seguras:** Al usar el proxy de Netlify, las cookies `refreshToken` se envían sobre HTTPS con atributo `Secure` y `SameSite=Lax` al mismo dominio, eliminando el riesgo de ataques CSRF entre dominios cruzados sin romper la sesión.
- **Sin exposición de secretos:** El frontend no contiene claves ni credenciales sensibles; solo la URL pública del proxy.
