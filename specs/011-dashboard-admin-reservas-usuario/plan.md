# Plan técnico: Selector de usuario en el Dashboard del administrador

**Spec relacionada:** ./spec.md

## Diseño

- **`DashboardPage.tsx`**: añade `isAdmin` desde `useAuth()` (ya expuesto,
  usado en otras páginas). Añade estado `usuarios: Usuario[]` y
  `usuarioSeleccionadoId: number | null`.
- Nuevo `useEffect` (dependencia `[isAdmin]`): si `isAdmin` y `usuarios.length
  === 0`, carga `usuariosService.getAll()` — mismo patrón ya usado en
  `ReservasPage.abrirNuevaReserva`.
- El `useEffect` de "próxima reserva" (spec 006) cambia su dependencia de
  filtrado: el id objetivo es `isAdmin ? usuarioSeleccionadoId : user?.id`.
  Si `isAdmin && usuarioSeleccionadoId === null`, no se llama a
  `reservasService.getAll()` — se limpia el estado y se sale temprano.
  Dependencias del efecto: `[user?.id, isAdmin, usuarioSeleccionadoId]`.
- JSX de la tarjeta: título y mensajes condicionados por `isAdmin`; el
  `<Select>` de jugador solo se renderiza cuando `isAdmin` es `true`.

## Decisiones y alternativas descartadas

- **Endpoint de backend para filtrar por usuario en servidor**: descartado
  — `getAll()` ya devuelve todo para admin (spec 001); filtrar en cliente
  es suficiente y no añade superficie de API nueva.
- **Lista completa de reservas del jugador en vez de solo la próxima**:
  descartado por ahora — mantiene el mismo patrón visual que la spec 006;
  posible ampliación futura si se pide explícitamente.
- **Bloquear a nivel de backend que el admin se autorreserve**: descartado
  de esta spec — es una decisión de política de negocio distinta a "qué
  muestra el Dashboard", y tocaría spec 010 que ya está cerrada.

## Impacto en seguridad

Ninguno — reutiliza datos que el rol admin ya podía consultar íntegramente
vía `getAll()` (spec 001); no se expone nada nuevo, solo se cambia qué
subconjunto se muestra en cliente.