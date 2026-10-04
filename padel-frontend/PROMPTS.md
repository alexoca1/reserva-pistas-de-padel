# PROMPTS CLAVE DEL PROYECTO

Documento de referencia con los prompts mas importantes usados durante el desarrollo de la app React 19 y TypeScript de reservas de padel.

## Configuracion inicial

- Crea el frontend de una app de reservas de padel con React 19, TypeScript, Vite, Tailwind CSS y componentes reutilizables.
- Organiza el proyecto con estructura por paginas, componentes, context y servicios.
- Usa archivos `.tsx` para componentes React y `.ts` para servicios, tipos y configuracion.
- Configura `tsconfig` con modo estricto, contratos de dominio en `src/types/index.ts` y compilacion con `tsc -b`.

## Migracion a TypeScript

- Migra todo el frontend de JavaScript/JSX a TypeScript, sustituyendo `.js`/`.jsx` por `.ts`/`.tsx`.
- Tipifica props, estado, respuestas de API, payloads de reservas y el contexto de autenticacion.
- Mantiene imports de tipos separados cuando corresponda y corrige errores detectados por `tsc -b` y ESLint.

## Backend

- Conecta el frontend al backend en `http://localhost:8081` usando token JWT en `Authorization: Bearer`.
- Ajusta el payload de reservas para que sea compatible con backend enviando `fechaReserva`, `fecha`, `pistaId`, `usuarioId` y `usuario.id`.
- Revisa por que un usuario con `ROLE_USER` solo ve sus reservas y detecta si el filtrado esta ocurriendo en backend.
- Actualiza `AGENTS.md` para reflejar los endpoints reales del proyecto: `aulas` pasa a `/pistas` y `centros` pasa a `/reservas`, listando metodo HTTP, ruta, autenticacion y `ROLE_ADMIN`.

## Autenticacion

- Implementa autenticacion en contexto global con login, logout y perfil.
- Migra de `localStorage` a Access Token en memoria de React (15 min) + Refresh Token rotativo en Cookie `HttpOnly` (7 días) para máxima protección contra XSS.
- Soporta refresco silencioso en arranque (`/auth/refresh`) e interceptor transparente para reintentar peticiones con error 401.
- Agrega helpers de rol en frontend: `roles`, `hasRole` e `isAdmin`.
- Protege rutas privadas y redirige al login si el usuario no esta autenticado (controlando estado de carga).

## Paginas principales

- Crea `DashboardPage` personalizada con saludo al usuario, badge de rol y accesos rapidos a Pistas y Reservas.
- Crea `PistasPage` para listar pistas y mostrar vista de solo lectura para `ROLE_USER`.
- Crea `ReservasPage` con tabla, formularios modales y acciones por fila.
- Crea una pagina `404 NotFoundPage` con mensaje claro, numero 404 grande, diseno centrado y boton de `shadcn/ui` que use `useNavigate` para volver al inicio.

## CRUD

- Implementa CRUD completo de reservas con crear, editar y eliminar desde modales.
- Implementa CRUD de pistas solo para `ROLE_ADMIN`.
- Corrige error de DELETE con respuesta vacia (`204 No Content`) para evitar fallo al parsear JSON.
- En reservas, permite editar/eliminar solo a admin o propietario.

- Restringe creacion de reservas con reglas de negocio:
  - No permitir fechas anteriores a hoy.
  - Si es el mismo dia, inicio minimo 2 horas por encima de la hora actual.
  - Horario permitido de 06:00 a 23:00.
  - Hora fin siempre mayor que hora inicio.
  - Excluir del listado reservas de fechas pasadas.

## Diseno visual

- Mejora el Navbar para que sea totalmente responsive.
- En movil usa menu hamburguesa y despliegue vertical de enlaces.
- En escritorio mantiene layout horizontal.
- Usa solo Tailwind CSS y estado de React para abrir/cerrar menu, sin librerias extra.
- Redisena la apariencia visual completa del frontend con Tailwind 4 y un sistema de tokens semanticos en index.css (@theme inline), sin anadir librerias nuevas.
- Define paleta "oscuro deportivo": base azul marino, acento verde lima, usando variables HSL en :root.
- Anade variantes a Button (primary, secondary, outline, ghost, destructive) y Badge (default, success, danger) para evitar overrides de color sueltos en las paginas.
- Sustituye el favicon (logo de Vite recoloreado) y el emoji de balon de futbol en Login/Register por un icono propio de pala de padel.
- Elimina codigo muerto de la plantilla inicial de Vite: App.css, public/icons.svg, react.svg, vite.svg.
- Anade un set de iconos propios (SVG, sin libreria), tipografia de titulos personalizada y efectos de fondo sutiles (brillo y grano) en el home, siguiendo tendencias de diseno 2026.
- Ajusta el layout del Home en escritorio para que quepa en una sola pantalla sin scroll (100vh), con el hero a dos columnas y el CTA final oculto en esa version; el movil no cambia.
- Resuelve el scroll lateral en movil en PistasPage y ReservasPage: tarjetas apiladas por debajo de md, tabla normal a partir de md.
- Anade animaciones de entrada y de scroll con framer-motion en la home (hero, tarjetas, banner movil), respetando prefers-reduced-motion. Fondo Aurora con movimiento lento via CSS. Se permite anadir librerias nuevas cuando esten justificadas.
- Anade inclinacion 3D con el cursor (TiltCard, con brillo) a las tarjetas y a la imagen del hero, mas un foco de luz interactivo en el hero. Con Motion, sin libreria nueva. Investigado: para 3D real con WebGL la opcion es React Three Fiber o Spline, pendiente si se quiere ampliar mas adelante.
- Anade una escena 3D real en el hero con React Three Fiber + drei: esferas flotantes con material de distorsion detras de la foto, luces, sin OrbitControls. Carga diferida (lazy) para no afectar al peso del resto de paginas. Confirmado por busqueda: @react-three/fiber v9 es la version compatible con React 19.