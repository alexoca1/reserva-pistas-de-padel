# Tareas: Gestión de reservas desde el Dashboard

## Frontend
- [x] T01 - Crear `components/TarjetaReserva.tsx` (presentacional:
      reserva, onEditar, onEliminar)
- [x] T02 - `DashboardPage.tsx`: grid de navegación de 3 a 2 columnas
- [x] T03 - `DashboardPage.tsx`: `proximaReserva` → `proximasReservas`
      (`futuras.slice(0, 5)` en vez de `futuras[0]`); guardar
      `futuras.length`
- [x] T04 - `DashboardPage.tsx`: nueva sección de ancho completo —
      selector de jugador (admin) arriba, grid de `TarjetaReserva` o
      estado vacío debajo
- [x] T05 - `DashboardPage.tsx`: enlace "Ver todas" cuando hay más de 5
      reservas futuras
- [x] T06 - `DashboardPage.tsx`: diálogo de confirmación de borrado +
      toast de éxito + error inline (incluida la ventana de cancelación
      de spec 020)
- [x] T07 - `DashboardPage.tsx`: botón "Editar" navega a `/reservas` con
      `location.state: { reservaId, pistaId, fecha }`
- [x] T08 - `ReservasPage.tsx`: `fechaVista` lee `location.state?.fecha`
      si existe
- [x] T09 - `ReservasPage.tsx`: efecto que abre el diálogo de edición si
      `location.state?.reservaId` existe, reutilizando el handler ya
      existente de clic en celda "tu reserva"; `useRef` para no reabrir
      en cada re-render

## Documentación
- [x] T10 - `padel-frontend/AGENTS.md`: añadir `TarjetaReserva.tsx` a la
      lista de componentes; documentar el patrón de `reservaId` en
      `location.state` junto a la nota ya existente sobre `pistaId`
      (spec 004)
- [x] T11 - Verificación manual: usuario con 3 reservas futuras ve 3
      tarjetas; usuario con 7 ve 5 + enlace "Ver todas"; eliminar una
      reserva con más de 24h de antelación funciona y muestra toast;
      intentar eliminar una con menos de 24h muestra el error inline;
      editar una reserva desde su tarjeta abre Reservas ya en la fecha
      correcta con el diálogo de edición abierto; repetir todo el flujo
      como admin con un jugador seleccionado