# Plan técnico: Edición de datos personales

**Spec relacionada:** ./spec.md

## Diseño backend

- **`UpdatePerfilDTO`** (nuevo, record): `nombre` (`@NotBlank`), `apellidos`
  (`@NotBlank`), `telefono` (sin validación, igual que `RegisterRequest`),
  `usuarioId` (nullable, sin `@NotNull`).
- **`AuthController`**: nuevo método privado `isAdmin(Authentication)`,
  idéntico en forma al ya existente en `ReservasController` (se duplica
  deliberadamente — ver alternativas descartadas).
- **`AuthController.updatePerfil`**: `PUT /auth/perfil`. Resuelve el
  usuario objetivo con la misma lógica que `resolverTitular` de la spec
  010 (admin + `usuarioId` informado → ese usuario; cualquier otro caso →
  usuario autenticado). Actualiza `nombre`, `apellidos`, `telefono` y
  devuelve un `Map` con `id`, `email`, `nombre`, `apellidos`, `telefono`,
  `roles` — mismo shape que ya devuelven `login`/`refresh`.
- Jackson ignora por defecto campos JSON no declarados en el record — un
  payload malicioso con `"roles": "ROLE_ADMIN"` no tiene efecto, porque
  `UpdatePerfilDTO` no tiene ese campo.

## Diseño frontend

- **`types/index.ts`**: `PerfilPayload` (`nombre`, `apellidos`, `telefono`,
  `usuarioId?`).
- **`services/api.ts`**: `perfilService.actualizar(datos: PerfilPayload)` →
  `PUT /auth/perfil`, tipado de respuesta `Usuario`.
- **`context/AuthContext.tsx`**: nueva función `actualizarUsuario(datos:
  Partial<Usuario>)` en `AuthContextValue`, hace merge sobre el `user` en
  estado (`setUser(prev => prev ? {...prev, ...datos} : prev)`).
- **`pages/PerfilPage.tsx`** (nuevo): dos formularios independientes.
  - "Mis datos": inicializado desde `user` (vía `useEffect`, porque
    `AuthContext` puede seguir resolviendo el refresco silencioso al
    montar). Al guardar: `perfilService.actualizar({...})` sin
    `usuarioId`, luego `actualizarUsuario(respuesta)`, luego
    `mostrarToast("Perfil actualizado")`.
  - "Editar datos de un jugador" (solo si `isAdmin`): carga
    `usuariosService.getAll()` igual que `DashboardPage`/`ReservasPage`,
    excluye al propio admin de la lista. Al seleccionar un jugador,
    rellena el formulario desde el objeto ya cargado (sin fetch nuevo). Al
    guardar: `perfilService.actualizar({..., usuarioId})`, actualiza esa
    entrada en el array local de `usuarios`, `mostrarToast(`Datos de
    ${nombre} actualizados`)`. No toca `AuthContext`.
- **`App.tsx`**: ruta `/perfil` dentro de `<ProtectedRoute>`.
- **`components/Layout.tsx`**: añade `"/perfil": "Perfil"` a
  `TITULOS_POR_RUTA` (spec 005).
- **`components/Navbar.tsx`**: enlace "Perfil" en el bloque de navegación
  autenticada, escritorio y móvil, junto a Dashboard/Pistas/Reservas.

## Decisiones y alternativas descartadas

- **Endpoint admin separado (`PUT /auth/usuarios/{id}`) en vez de
  `usuarioId` opcional en el mismo DTO**: descartado — duplicaría la lógica
  de resolución que ya existe en `resolverTitular` (spec 010); reutilizar
  el mismo patrón mantiene un solo camino de código para "actuar en nombre
  de otro usuario" en todo el proyecto.
- **Selector único que alterna entre "mis datos" y "datos de un jugador"
  (como el Dashboard, spec 011)**: descartado — en el Dashboard, "próxima
  reserva propia" no aplica a un admin en la práctica, así que sustituirla
  por el selector tiene sentido. Aquí, los datos propios del admin son tan
  relevantes de editar como los de cualquier jugador — ocultarlos detrás de
  un selector sería peor UX sin ninguna ganancia.
- **`isAdmin` compartido en una clase de utilidades**: descartado por
  ahora — son 3 líneas duplicadas en dos controladores; extraerlo sería la
  abstracción que la constitución pide no anticipar. Si aparece un tercer
  controlador que lo necesite, se reconsidera.
- **Endpoint `GET /auth/usuarios/{id}`**: descartado — el admin ya tiene el
  listado completo vía `/auth/usuarios`; pedir el detalle otra vez por id
  sería una llamada de red innecesaria para datos que ya están en memoria.

## Impacto en seguridad

- La resolución de destino replica exactamente el patrón ya auditado en la
  spec 010 (test de "no-admin no puede actuar sobre otro usuario").
- El DTO no incluye `email`, `password`, `roles` ni `enabled` — no hay
  superficie para escalar privilegios ni cambiar la identidad de login
  desde este endpoint, aunque el payload JSON incluya esos campos.