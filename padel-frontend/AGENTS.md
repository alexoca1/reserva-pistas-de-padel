# Frontend de Reservas de Pistas de Pádel

## Descripción

Aplicación web para gestionar usuarios, pistas de pádel y reservas.

El frontend utiliza una API REST desarrollada con Spring Boot.

- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:8081`
- **Autenticación:** JWT (Access Token en memoria + Refresh Token en Cookie HttpOnly)
- **Licencia:** [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) · Copyright (c) 2026 Alexander Ocampo Hernandez
- **Repositorio:** https://github.com/alexoca1/reserva-pistas-de-padel


## Tecnologías

- React 19
- TypeScript
- Vite
- React Router 7
- Tailwind CSS 4
- Componentes UI locales en `src/components/ui`
- ESLint
- npm

## Comandos

Ejecutar desde la carpeta `padel-frontend`:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## Arranque de la Aplicación

La aplicación se monta en `src/main.tsx` siguiendo este orden:

1. `StrictMode`
2. `BrowserRouter`
3. `AuthProvider`
4. `ToastProvider`
5. `App`

> ⚠️ **Nota:** No modificar este orden sin revisar el funcionamiento de rutas, autenticación y notificaciones.

## Despliegue en Producción (Netlify) y Proxy de Mismo Origen

- **Plataforma:** Netlify (SPA con `netlify.toml`).
- **Proxy `/api/*`:** Para evitar incompatibilidades de cookies `HttpOnly; SameSite=Lax` entre dominios cruzados, Netlify reescribe las peticiones `/api/*` hacia la URL pública de Google Cloud Run con código `200` (`status = 200`, `force = true`).
- **Configuración de URLs (`VITE_API_URL`):**
  - **Producción (`.env.production`):** `VITE_API_URL=/api` (mismo origen relativo).
  - **Desarrollo (`.env`):** `VITE_API_URL=http://localhost:8081` (conexión local directa).
- **Resiliencia y Cold Start:**
  - Si una petición de red tarda más de 4 segundos (típico arranque en frío de Cloud Run tras suspensión), se emite automáticamente un aviso no intrusivo vía toast: *"El servidor se está despertando, puede tardar unos segundos"*.
  - En caso de fallos de conexión o respuestas HTTP 5xx del backend, se muestra al usuario el mensaje amigable: *"Demo temporalmente no disponible. Por favor, inténtalo de nuevo en unos minutos."*.
- **Cabeceras HTTP de Seguridad y CSP (Spec 042):**
  - Netlify inyecta cabeceras de protección en todas las respuestas estáticas y rutas SPA (`[[headers]] for = "/*"` en `netlify.toml`):
    - `X-Frame-Options: DENY` (inmunidad contra clickjacking).
    - `X-Content-Type-Options: nosniff` (prevención de ataques de confusión MIME).
    - `Referrer-Policy: strict-origin-when-cross-origin` (preserva la privacidad de origen).
    - `Permissions-Policy: geolocation=(), camera=(), microphone=()` (bloqueo de APIs de dispositivo no solicitadas).
    - `Content-Security-Policy`: Política estricta basada en inventario real de recursos:
      - `default-src 'self'`
      - `script-src 'self'`
      - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` (justificado por estilos inline de `framer-motion`, `Avatar.tsx`, Canvas WebGL de Three.js y CSS de Google Fonts).
      - `font-src 'self' https://fonts.gstatic.com data:` (fuentes tipográficas Outfit).
      - `img-src 'self' data: blob: https://res.cloudinary.com` (iconos locales, ruido base64, imágenes de Cloudinary y previsualizaciones `blob:` con `URL.createObjectURL` en avatar y galería).
      - `connect-src 'self' https://padel-backend-1058303442470.europe-west1.run.app` (proxy inverso local y host público de Cloud Run).
      - `object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`.
  - Coexistencia armónica con la Spec 029 (Backend): El backend emite `default-src 'self'` para respuestas REST en `/api/*`, mientras que Netlify aplica la política completa para la interfaz web, sin duplicidades ni contradicciones.

## Flujo de Autenticación Seguro (OAuth 2.0 / OWASP)

1. `POST /auth/login` recibe `email` y `password` (con `credentials: "include"`).
2. El backend devuelve `accessToken` (15 min) y los datos del `user` en el body, y emite una cookie `refreshToken` (7 días) con flags `HttpOnly`, `SameSite=Lax`, `Path=/`.
3. El `accessToken` se guarda **única y exclusivamente en la memoria de React** y `api.ts`. Nunca se persiste en `localStorage` ni `sessionStorage` para inmunizar la sesión contra ataques XSS.
4. Al recargar la página, `AuthContext` efectúa un refresco silencioso llamando a `POST /auth/refresh` con `credentials: "include"`, recuperando el nuevo token en memoria y los datos del perfil.
5. En caso de token expirado (`401`), `src/services/api.ts` ejecuta de forma transparente la rotación de token contra `/auth/refresh` y reintenta la petición original.
6. `POST /auth/logout` invalida el refresh token en el backend y limpia la cookie `HttpOnly`.

## Reglas de desarrollo

- Usar TypeScript con modo estricto.
- Preferir componentes funcionales y hooks de React.
- Mantener los tipos de dominio en `src/types/index.ts`.
- Mantener las llamadas HTTP en `src/services/api.ts` con `credentials: "include"`.
- No duplicar lógica de autenticación fuera de `AuthContext`.
- No almacenar tokens en `localStorage` o `sessionStorage`.
- Enviar el token mediante cabecera en memoria:

```http
Authorization: Bearer <accessToken>
```
- Las utilidades de fecha (parseo, comparación con hoy, formato relativo) viven
  en `src/lib/fechas.ts` — reutilizar desde ahí en vez de redefinir lógica de
  fechas en cada página.
- Las utilidades de franjas horarias de 30 minutos (conversión hora↔minutos,
  cálculo de `horaFin` a partir de duración) viven en `src/lib/franjas.ts` —
  usarlas tanto en `CuadriculaDisponibilidad` como en el formulario de reserva
  para mantener un único sitio de cálculo.
- El componente `Dialog` (`src/components/ui/dialog.tsx`) ya gestiona cierre
  con Escape, `role="dialog"`/`aria-modal`, y restauración de foco — no
  reimplementar esta lógica en páginas individuales.
- Para confirmar el éxito de una acción (crear/editar/eliminar), usar
  `useToast().mostrarToast(mensaje)` en vez de inventar un mecanismo de
  feedback nuevo. Los errores siguen mostrándose inline en el formulario o
  la página, no como toast.
- El Dashboard diferencia contenido por rol: para `ROLE_USER` la tercera
  tarjeta muestra "Tu próxima reserva" (propia, spec 006); para
  `ROLE_ADMIN` se sustituye por un selector de jugador + su próxima
  reserva (spec 011), ya que el admin no reserva pistas a su propio nombre
  en la práctica. Es el primer caso del proyecto de un widget condicionado
  por rol dentro de la misma página — replicar este patrón si aparecen
  casos similares, en vez de crear páginas separadas por rol.
- Para el rol de demostración (`DEMO_ADMIN`, spec 038), `AuthContext` expone `isDemoAdmin: boolean`. Las acciones destructivas o reconfiguraciones de sistema (eliminar reservas, crear/editar/eliminar pistas) ocultan los botones y muestran en su lugar un texto discreto en cursiva: `No disponible en demo`.
- En `PerfilPage.tsx` se integra la sección *"Privacidad y control de datos"* (RGPD, spec 036): exportación de archivo JSON vía `Blob` descargable en navegador y eliminación irreversible de cuenta protegida por confirmación con palabra clave `"ELIMINAR"`.

## Sistema de diseño

Los tokens de color y radio viven en `src/index.css`, dentro de `:root` y del bloque `@theme inline` que los conecta con Tailwind 4. Paleta actual: base azul marino oscuro, acento verde lima (`--primary`).

- No usar clases de paleta Tailwind en crudo (`bg-slate-900`, `bg-emerald-500`, `text-red-400`...) directamente en páginas o componentes. Usar los tokens semánticos: `bg-background`, `text-foreground`, `bg-card`, `bg-primary`, `text-muted-foreground`, `border-border`, `bg-destructive`, etc.
- Para cambiar el tema completo, basta con editar los valores HSL de `:root` en `src/index.css`.
- `Button` admite `variant`: `primary` (por defecto), `secondary`, `outline`, `ghost`, `destructive`. No sobrescribir el color con `className` suelto.
- `Badge` admite `variant`: `default`, `success`, `danger`.
- Los iconos viven en `src/components/icons.tsx` (componentes SVG con `currentColor`, sin librería externa). Antes de crear uno nuevo, revisa si ya existe.
- Tipografía de títulos (`h1`, `h2`, `h3`): Outfit, cargada en `index.html`. No hace falta añadir clases, se aplica sola.
- `HomePage` usa un layout distinto en escritorio (`lg:` en adelante): todo el contenido cabe en una pantalla sin scroll, `calc(100vh - 8rem)` restando el Navbar y el padding de `<main>`. El Navbar tiene altura fija `h-16` para que ese cálculo sea exacto. En móvil se mantiene el scroll normal, sin cambios.
- `PistasPage` y `ReservasPage` usan doble vista: tarjetas apiladas por debajo de `md` (sin scroll lateral) y la tabla completa a partir de `md`. Si añades una columna nueva a la tabla, añade también su dato correspondiente en la tarjeta.
- Toda la app usa glassmorfismo + Aurora UI. El fondo de manchas de color va una sola vez en `Layout.tsx` para que se vea en todas las páginas (`404` es la excepción, vive fuera del Layout y lleva la suya propia). Las superficies (`Card`, `Dialog`, `Table`, footer) usan `bg-white/5` (o `white/[0.07]` en el Dialog) + `border-white/10` + `backdrop-blur-xl`. `Input` y `Select` no llevan blur propio, solo `bg-black/20`, para no apilar blurs dentro de una superficie que ya está desenfocada.
- `color-scheme: dark` en `:root` (`index.css`) para que los controles nativos (popup de `select`, selector de fecha, scrollbars) se dibujen en oscuro. Las `<option>` llevan color explícito con los tokens (`--card`, `--foreground`) porque el popup nativo no respeta transparencia ni `backdrop-blur`.
- Efecto de inclinación 3D: `src/components/TiltCard.tsx`, envuelve cualquier tarjeta para que rote según la posición del cursor, con brillo que la sigue. Usa Motion, que ya está instalado. Se desactiva solo si el usuario tiene `prefers-reduced-motion` activado. El foco de luz que sigue al cursor en el hero de `HomePage` usa la misma idea (`useMotionValue` + `useMotionTemplate`) sin componente propio, es específico de esa página.
- Escena 3D del hero: `src/components/HeroScene.tsx`, tres esferas con `MeshDistortMaterial` (React Three Fiber + drei) flotando detrás de la foto. Se carga con `lazy()` en `HomePage.tsx` para no meter el peso de Three.js en el resto de páginas. Se oculta si el usuario tiene `prefers-reduced-motion` activado, y por debajo de `sm` (poco margen alrededor de la foto).
- `src/components/TarjetaReserva.tsx`: componente presentacional para tarjetas de reserva individuales (pista, fecha relativa, horario, botones de edición y eliminación). Usado en la sección de próximas reservas del Dashboard.
- `src/components/LightboxGaleria.tsx`: visor de galería de fotos a pantalla completa (lightbox) con navegación prev/next, soporte de teclado (flechas y Escape), trampa y restauración de foco accesible.
- `src/components/Avatar.tsx`: avatar de usuario (foto redondeada si dispone de `avatarUrl` o círculo con iniciales y color determinista derivado del `id`). Prop `size` configurable. Usado en `Navbar` y `PerfilPage`.
- `src/components/BuscadorJugador.tsx`: combobox accesible de búsqueda de usuario por nombre o teléfono. Componente estándar para cualquier selector de jugador en contextos de admin — reemplaza `<Select>` nativo en DashboardPage, ReservasPage y PerfilPage. Props: `usuarios`, `value` (id | null), `onChange`, `id`.
- `src/components/DemoBanner.tsx`: barra superior permanente informativa que indica el carácter de demostración/educativo del proyecto con enlace a GitHub. Montada en el nivel superior de `App.tsx`.
- `src/components/CookieBanner.tsx`: aviso inferior de cookies técnicas de funcionamiento con almacenamiento de consentimiento en `localStorage` (`cookie_consent`). Enlaza a `/privacidad`.
- Los tres estados de celda en `CuadriculaDisponibilidad` (Disponible, Ocupada,
  Tu reserva) se diferencian por icono + color + relleno simultáneamente, no
  solo por color. "Ocupada" usa paleta ámbar (`amber-500`), no gris neutro —
  ver `specs/013-diseno-real-cuadricula-disponibilidad`. Las celdas ocupadas
  son clicables para admin (abren edición de esa reserva); no interactivas
  para usuario normal.

### Reglas Ponytail Frontend

- Priorizar componentes nativos de HTML5 (ej. `<input type="date">` o `<input type="color">`) sobre librerías de componentes externas para formularios e inputs.
- Librerías nuevas permitidas cuando resuelven algo que HTML/CSS/React puro no cubre bien (animación orquestada, gestos...). Cada dependencia nueva en `package.json` necesita una razón concreta, no se añaden "por si acaso". Primera hasta ahora: `framer-motion`, para las animaciones de la home.
- Usar la instancia centralizada de cliente HTTP en `src/services/api.js`[cite: 3] sin duplicar instancias de `axios`/`fetch`.
- No crear nuevos componentes en `src/components/ui`[cite: 3] si el caso de uso se resuelve con los existentes (`button`, `input`, `card`)[cite: 3].
- Borrado sobre adición: eliminar código no utilizado antes de escribir nuevas abstracciones.

## Rutas y Navegación

Las rutas públicas son:

- `/`
- `/login`
- `/register`
- `/pistas`
- `/instalaciones`
- `/privacidad`
- `/terminos`

Las rutas protegidas son:

- `/dashboard`
- `/reservas`
- `/perfil`

`/pistas` es una ruta de acceso público para que cualquier visitante pueda consultar la disponibilidad e información de las instalaciones antes de registrarse o iniciar sesión.
`ProtectedRoute` comprueba `isAuthenticated`. Si el usuario no está autenticado al intentar acceder a rutas protegidas, redirige a `/login`.

- Para pasar contexto ligero de una página a otra (ej. `pistaId` para preseleccionar pista [spec 004], o `{ reservaId, pistaId, fecha }` para abrir la edición de una reserva específica desde el Dashboard [spec 021]), usar `navigate(ruta, { state: {...} })` y leer `location.state` en el destino — no usar query params ni un context global para esto. Este estado no sobrevive a un refresh (F5), lo cual es aceptable para filtros de conveniencia.
 
 - Cada ruta nueva añadida bajo `Layout` debe registrarse en el mapa
  `TITULOS_POR_RUTA` y en `DESCRIPCIONES_POR_RUTA` (en `Layout.tsx`) para que el título de la pestaña y la meta descripción SEO se
  actualicen correctamente. Si la ruta nueva vive fuera de `Layout` (como
  `NotFoundPage`), debe gestionar su propio `document.title` de forma
  independiente.

### Componente Navbar

- Muestra enlaces públicos cuando no hay sesión.
- Muestra `Dashboard`, `Pistas` y `Reservas` cuando hay sesión.
- Muestra el nombre del usuario autenticado.
- Permite cerrar sesión.
- Utiliza un menú hamburguesa en pantallas pequeñas.
- Cierra el menú móvil al navegar o cerrar sesión.

## Carga de Datos

Las páginas que consultan datos deben:

- Activar el estado de carga antes de la petición.
- Limpiar el error anterior.
- Validar que la respuesta tenga el formato esperado.
- Mostrar un mensaje de carga.
- Mostrar un estado vacío si no existen resultados.
- Mostrar un mensaje de error si falla la petición.
- Restaurar el estado de carga en un bloque `finally`.

`PistasPage` carga las pistas mediante `pistasService.getAll()`. Incluye soporte para visualizar y gestionar el campo `imagenUrl` de cada pista, modal de vista ampliada en tamaño real, y gestión de `precioHora` (numérico en €/h) y `estado` (`ACTIVA` / `MANTENIMIENTO`). En el catálogo muestra badges de estado y desactiva la reserva de pistas en mantenimiento.

`ReservasPage` y `CuadriculaDisponibilidad` gestionan la disponibilidad por día (`DisponibilidadDia` con `precioHora` y `estado`):
- Pistas en `MANTENIMIENTO`: cabecera con badge distintivo, slots deshabilitados (`cursor-not-allowed`) e interactividad bloqueada.
- Formulario modal: selector de pista deshabilita las opciones en mantenimiento e informa en tiempo real del coste estimado (`precioHora * duracion / 60` en euros).
- `TarjetaReserva` (Dashboard): muestra el coste estimado formateado si está disponible.

## Registro de Cambios Relevantes

> A partir de la adopción de SDD (spec-kit), los cambios funcionales se documentan
> en `specs/00X-nombre/tasks.md`, no aquí. Las entradas anteriores se conservan
> como historial.

- Migración a arquitectura de tokens seguros: Access Token (15 min) en memoria + Refresh Token (7 días) en cookie `HttpOnly` con rotación continua y detección de reutilización.
- Incorporación de `RefreshTokenService`, entidad `RefreshToken` y repositorio JPA `RefreshTokenRepository`.
- Endpoints `/auth/refresh` y `/auth/logout` añadidos a `AuthController`.
- Migración de rutas de dominio a `pistas` y `reservas`.
- Adopción de `CreateReservaDTO` con `pistaId: Long`.
- Vinculación obligatoria de `Reserva` con `Usuario` autenticado (`usuario_id NOT NULL`).
- Restricción administrativa explícita en `DELETE /reservas`.
- **Autorización de Pistas**: `GET /pistas` y `GET /pistas/{id}` son de acceso público sin necesidad de estar autenticado. Se configuró un `BearerTokenResolver` personalizado en `SecurityConfig` para omitir la resolución/validación de token JWT en las consultas `GET` de pistas, mientras que `POST`, `PUT` y `DELETE` se mantienen restringidos a `ROLE_ADMIN`.
- **Campo `imagenUrl` en entidad `Pista`**: Adición del atributo `imagenUrl` para almacenar la URL de la imagen representativa de cada pista.
- **Persistencia de clave JWT**: Carga de la clave secreta desde `JWT_SECRET` (Base64) en `JwtSecretKeyProvider` con fallback por defecto en `application.properties`.
- **Configuración por variables de entorno**: Externalización de `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `PORT` y `ADMIN_SEED_PASSWORD` con fallbacks locales.

> **spec-kit:** los cambios de `specs/001-seguridad-autorizacion-api` en adelante se
> registran en su `tasks.md` correspondiente.