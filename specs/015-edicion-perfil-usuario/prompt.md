# Prompt de implementación — spec 015

Implementa specs/015-edicion-perfil-usuario siguiendo spec.md, plan.md y
tasks.md (T01-T15). Sigue .specify/memory/constitution.md — cambios
mínimos, sin dependencias nuevas, reutiliza patrones ya existentes en el
código en vez de inventar nuevos.

No escribas ningún archivo nuevo desde cero sin antes leer el patrón
equivalente ya existente en el proyecto — cada tarea abajo indica qué
archivo mirar como referencia directa.

## Backend

### T01 - Crear UpdatePerfilDTO

Ubícalo en `padel-backend/src/main/java/com/padel/reservas/dto/`. Usa
`RegisterRequest.java` como referencia de estilo (record, anotaciones
Jakarta Validation). Campos: `nombre` (obligatorio), `apellidos`
(obligatorio), `telefono` (sin validación, igual que en `RegisterRequest`),
`usuarioId` (nullable, sin anotación de obligatoriedad — mismo patrón que
`usuarioId` en `CreateReservaDTO`, spec 010).

### T02 - Método privado `isAdmin` en `AuthController`

Copia exactamente la forma del método `isAdmin` privado que ya existe en
`ReservasController` (comprobación de `ROLE_ADMIN` sobre
`Authentication.getAuthorities()`).

### T03 - Endpoint `PUT /auth/perfil` en `AuthController`

Sigue el patrón de `resolverTitular` de `ReservasController` (spec 010)
para decidir el usuario objetivo: si `isAdmin(authentication)` y
`dto.usuarioId() != null`, busca ese usuario por id; en cualquier otro
caso, usa `usuarioRepository.findByEmail(authentication.getName())`. Si no
se encuentra, `400` con mensaje claro. Actualiza `nombre`, `apellidos`,
`telefono` sobre la entidad, guarda, y devuelve un `Map` con el mismo shape
que ya usan `login`/`refresh` (`id`, `email`, `nombre`, `apellidos`,
`telefono`, `roles`).

### T04-T07 - Tests

Ubícalos en `padel-backend/src/test/java/com/padel/reservas/controller/`.
Usa `ReservasTitularidadTest.java` (spec 010) como plantilla exacta de
estructura (`@WebMvcTest`, mocks de repositorios, `jwt()` con roles,
`ArgumentCaptor` para verificar qué se guardó). Casos: usuario edita lo
propio sin `usuarioId`; admin edita `usuarioId` de otro; usuario no-admin
envía `usuarioId` y se ignora (verifica que el guardado afecta solo a su
propia cuenta); `usuarioId` inexistente devuelve 400.

## Frontend

### T08 - `PerfilPayload` en `types/index.ts`

Sigue el estilo de `ReservaPayload` ya existente en el mismo archivo.
Campos: `nombre`, `apellidos`, `telefono`, `usuarioId` opcional.

### T09 - `perfilService` en `services/api.ts`

Sigue el patrón de `pistasService`/`reservasService` ya existentes en el
mismo archivo (uso de `fetchAPI`). Un único método `actualizar(datos:
PerfilPayload)` que hace `PUT` a `/auth/perfil`.

### T10 - `actualizarUsuario` en `context/AuthContext.tsx`

Añádela a `AuthContextValue` junto a `login`/`logout`. Implementación:
mergea los campos recibidos sobre el `user` actual en estado, sin
recargar ni volver a llamar a `/auth/refresh`.

### T11 - `pages/PerfilPage.tsx` (nuevo)

Dos secciones independientes en la misma página, cada una con su propio
formulario y su propio botón de guardar:

- **"Mis datos"**: visible siempre. Inicializa sus campos desde `user`
  del `AuthContext` (con un `useEffect`, porque el contexto puede seguir
  resolviendo su refresco silencioso al montar el componente — mismo
  cuidado que ya tiene `ProtectedRoute` con su estado `cargando`). Al
  guardar: llama a `perfilService.actualizar` sin `usuarioId`, luego
  `actualizarUsuario` con la respuesta, luego `mostrarToast` (patrón de
  `useToast` ya usado en `PistasPage.tsx`/`ReservasPage.tsx`, spec 008).

- **"Editar datos de un jugador"**: visible solo si `isAdmin` (mismo
  patrón condicional por rol que `DashboardPage.tsx`, spec 011). Carga la
  lista de usuarios igual que ya hace `DashboardPage`/`ReservasPage`
  (`usuariosService.getAll()`), excluyendo al propio admin de las
  opciones del selector. Al elegir un jugador, rellena el formulario con
  sus datos ya cargados en memoria (sin fetch adicional). Al guardar:
  llama a `perfilService.actualizar` con `usuarioId`, actualiza esa
  entrada dentro del array local de usuarios (no toques `AuthContext` en
  esta rama), y muestra un toast distinto que incluya el nombre del
  jugador editado.

Usa los componentes `Card`, `Input`, `Label`, `Button` ya existentes en
`components/ui/` — no crees componentes nuevos (regla del sistema de
diseño en `padel-frontend/AGENTS.md`). Envuelve el contenido con
`motion.div`/`fadeUp`/`staggerContainer` como hacen el resto de páginas
(`DashboardPage.tsx` es la referencia más cercana en estructura).

### T12 - Ruta `/perfil` en `App.tsx`

Añádela dentro del mismo `<Route path="/" element={<Layout />}>`, envuelta
en `<ProtectedRoute>` — igual que `/dashboard` y `/reservas`.

### T13 - `TITULOS_POR_RUTA` en `components/Layout.tsx`

Añade la entrada `"/perfil": "Perfil"` al mapa existente (spec 005 exige
registrar cada ruta nueva aquí).

### T14 - Enlace "Perfil" en `components/Navbar.tsx`

Añádelo junto a Dashboard/Pistas/Reservas, en ambos bloques de navegación
autenticada (el de escritorio con `NavLink` y el del menú móvil), siguiendo
exactamente el mismo patrón que esos enlaces ya usan.

No toques `SecurityConfig` — `PUT /auth/perfil` cae en la regla ya
existente `anyRequest().authenticated()`.

No añadas dependencias, no toques ningún otro archivo fuera de los
listados en tasks.md.

Verificación: como usuario normal, entra a `/perfil`, cambia el teléfono,
guarda, y confirma que el Navbar y el formulario de "Nueva reserva" ya
muestran el dato nuevo sin recargar la página. Como admin, edita tus
propios datos en "Mis datos" y confirma que funciona igual. Luego, en
"Editar datos de un jugador", selecciona a otro usuario (confirma que tú
mismo no apareces en la lista), cambia su teléfono, guarda, y confirma que
tu propia sesión de admin no cambió. Repite el flujo de "Nueva reserva"
como ese jugador (inicia sesión con su cuenta) y confirma que el teléfono
prellenado ya es el corregido.