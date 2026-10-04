# Tareas: Spec 041 — Frontend en Netlify y Proxy de Mismo Origen

- [x] **T01** — Crear `padel-frontend/netlify.toml` con comando de build (`npm run build`), directorio `dist`, regla de reescritura de `/api/*` hacia la URL del backend de Cloud Run (`status = 200`, `force = true`, con marcador editable) y regla de fallback SPA `/*` a `/index.html` en ese orden exacto.
- [x] **T02** — Configurar URL base de la API con `VITE_API_URL=/api` en `.env.production` y `http://localhost:8081` en `.env`. Verificar que `API_BASE_URL` en `src/services/api.ts` use la variable de entorno y que todas las peticiones mantengan `credentials: "include"` sin URLs absolutas hardcodeadas.
- [x] **T03** — Implementar el detector de cold start (aviso tras 4 segundos: *"El servidor se está despertando, puede tardar unos segundos"*) y transformación de errores 5xx / conexión caída a *"Demo temporalmente no disponible. Por favor, inténtalo de nuevo en unos minutos."* en `src/services/api.ts` reutilizando los toasts existentes.
- [x] **T04** — Actualizar `public/sitemap.xml`, `public/robots.txt` e `index.html` con la URL canónica de Netlify (con marcador) y dejar documentada la actualización manual final.
- [x] **T05** — Actualizar `README.md` (con instrucciones paso a paso para el despliegue en Netlify y marcador de URL en vivo) y `padel-frontend/AGENTS.md`.
- [x] **T06** — Verificación técnica: ejecutar `npm run build` y `npm run lint` en `padel-frontend/` asegurando 0 errores, y validar `npm run preview` localmente.

---

### Tareas manuales pendientes de usuario tras despliegue

- [ ] Reemplazar `https://URL-DEL-BACKEND-EN-CLOUD-RUN.a.run.app` en `padel-frontend/netlify.toml` por la URL pública real obtenida al desplegar el backend en Google Cloud Run.
- [ ] Reemplazar `https://padelreservas.netlify.app/` en `sitemap.xml`, `robots.txt`, `index.html` y `README.md` por el nombre de subdominio definitivo en Netlify.
