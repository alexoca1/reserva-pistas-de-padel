# Plan técnico: Gestión de reservas desde el Dashboard

**Spec relacionada:** ./spec.md

## Diseño

### DashboardPage.tsx

- Grid de navegación pasa de `md:grid-cols-3` a `md:grid-cols-2`
  (Gestión de pistas / Gestión de reservas).
- Nueva sección de ancho completo debajo: para admin, el selector de
  jugador (ya existente desde spec 011) se mueve aquí como control
  compacto en la cabecera de la sección, no dentro de una tarjeta
  pequeña. Debajo, un grid responsive de `TarjetaReserva` (1 columna en
  móvil, más en escritorio) o el estado vacío ya existente.
- Estado `proximaReserva: Reserva | null` pasa a
  `proximasReservas: Reserva[]`. El efecto que ya carga y filtra
  "futuras" (specs 006/011) cambia `futuras[0] ?? null` por
  `futuras.slice(0, 5)`. Se guarda también `futuras.length` para decidir
  si mostrar "Ver todas".
- Diálogo de confirmación de borrado propio de esta página (mismo
  componente `Dialog` que ya usan Pistas y Reservas, con su propio
  `openDeleteDialog`/`reservaAEliminar` en estado local — cada página
  gestiona el suyo, como ya ocurre entre Pistas y Reservas hoy).
- Éxito de borrado: `useToast().mostrarToast("Reserva eliminada")`
  (spec 008). Error: mensaje inline junto al diálogo, mismo patrón que
  los errores inline ya usados en Pistas/Reservas — incluye el mensaje
  de ventana de cancelación de la spec 020 tal cual lo devuelve el
  backend.
- "Editar" llama a:
navigate("/reservas", {
state: {
reservaId: reserva.id,
pistaId: reserva.pista?.id ?? reserva.pistaId,
fecha: reserva.fechaReserva || reserva.fecha,
},
})

### Nuevo componente components/TarjetaReserva.tsx

Presentacional, props `reserva`, `onEditar`, `onEliminar`. Reutiliza
`Card`/`Button` ya existentes. Vive en `components/` (no en
`components/ui/`) — mismo criterio que `CuadriculaDisponibilidad.tsx`:
es específico del dominio Reservas, no un primitivo genérico reutilizable
en cualquier página.

### ReservasPage.tsx

- `fechaVista` gana un inicializador que lee `location.state?.fecha` si
  existe (además de "hoy" por defecto) — mismo patrón que
  `pistaSeleccionada` ya lee `location.state?.pistaId` desde spec 004.
- Nuevo efecto: si `location.state?.reservaId` existe y aún no se ha
  abierto el diálogo (controlado con un `useRef` para no reabrirlo en
  cada re-render), busca esa reserva en los datos de disponibilidad ya
  cargados para `fechaVista` y llama al mismo handler que ya abre el
  diálogo de edición al hacer clic en una celda "tu reserva" de la
  cuadrícula — no se duplica lógica de apertura, se reutiliza la
  existente.

## Decisiones y alternativas descartadas

- **Editar en línea en el Dashboard, sin navegar** (Opción B): descartada
  por decisión explícita — evita duplicar el formulario de edición y su
  dependencia de la cuadrícula de disponibilidad para elegir horario.
- **Mantener la sección como tercera tarjeta del grid de 3 columnas**:
  descartada — mezclar una tarjeta de navegación simple (una línea + un
  botón) con una lista de hasta 5 tarjetas con dos botones cada una en la
  misma celda de grid da una densidad de información desigual. Se pasa a
  2 columnas + sección de ancho completo debajo.
- **Panel lateral para las reservas del admin**: descartado — el proyecto
  no tiene precedente de paneles laterales en ningún sitio; todo se apila
  verticalmente, Pistas y Reservas incluidas. Una sección de ancho
  completo apilada es coherente con el resto de la app y no tiene el
  problema de móvil que sí tiene un panel lateral.
- **Compartir el diálogo de confirmación de `ReservasPage` desde
  `DashboardPage`**: descartado — no hay mecanismo de estado compartido
  entre páginas sin pasar por context nuevo. Cada página gestiona su
  propio diálogo, como ya ocurre entre Pistas y Reservas.

## Impacto en seguridad
Ninguno nuevo. El borrado y la edición siguen pasando por los mismos
endpoints con las mismas reglas de autorización (specs 001, 010) y de
ventana de cancelación (spec 020) ya validadas ahí. El Dashboard es una
superficie de UI nueva, no una vía nueva de acceso a datos.