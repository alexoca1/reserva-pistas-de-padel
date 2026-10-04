# Prompt para Spec 041 — Frontend en Netlify

Crea `specs/041-frontend-netlify/` con `spec.md`, `plan.md`, `tasks.md` y `prompt.md`. Lee antes: `padel-frontend/vite.config.ts`, `package.json`, `src/services/api.ts` (cómo se construye la URL base), `archivo.env`, `public/sitemap.xml`, `public/robots.txt`, `index.html` (URLs de Open Graph) y `AuthContext.tsx` (cómo se maneja el refresco de sesión).

El objetivo es desplegar el frontend en Netlify con el backend de Cloud Run accesible a través de un proxy del mismo origen, para evitar problemas de cookies entre dominios distintos.

Tareas:

T01 — `netlify.toml` en `padel-frontend/`. Define el comando de build y el directorio de publicación de Vite. Añade una regla de reescritura de `/api/*` hacia la URL del backend en Cloud Run (estado 200, para que actúe como proxy) y una regla de fallback de SPA que redirija todo lo demás a `index.html`. La regla del proxy debe ir antes que la del fallback. La URL del backend se deja como marcador que el usuario rellenará tras desplegar; el agente no debe inventarla.
T02 — URL base de la API. Cambia la configuración para que en producción `VITE_API_URL` valga `/api` (ruta relativa, mismo origen) y en local siga apuntando a `http://localhost:8081`. Verifica que ninguna llamada use una URL absoluta hardcodeada y que `credentials: "include"` se mantiene.
T03 — Aviso de arranque lento. En la capa común de peticiones o en el contexto de autenticación, si una petición tarda más de unos 4 segundos, muestra un mensaje no intrusivo ("El servidor se está despertando, puede tardar unos segundos"). Si el backend responde con error 5xx o falla la conexión, muestra un mensaje claro de "demo temporalmente no disponible" en lugar de un error técnico. Reutiliza los componentes y el toast existentes; sin dependencias nuevas.
T04 — Dominio en SEO. Actualiza `sitemap.xml`, `robots.txt` y las URL de `og:url`/`index.html` con la URL real de Netlify. Si todavía no existe, deja un marcador y anótalo como paso manual pendiente en `tasks.md`.
T05 — Documentación. Añade al `README.md` raíz la URL de la demo (marcador hasta tenerla) y el paso a paso resumido de despliegue. Actualiza `padel-frontend/AGENTS.md`.

Reglas: sin dependencias nuevas, sin cambios en el backend, sin secretos en archivos versionados. `npm run build` y `npm run lint` deben pasar.

Verificación: el build de producción funciona localmente con `npm run preview`, recargar una ruta interna (por ejemplo `/pistas`) no devuelve 404, y simulando el backend caído aparece el mensaje de "no disponible".
