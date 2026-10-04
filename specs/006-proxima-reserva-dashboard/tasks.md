# Tareas: "Tu próxima reserva" en el Dashboard

- [x] T01 - Crear `src/lib/fechas.ts` con `obtenerFechaHoyLocal`, `obtenerFechaISOHoyLocal`, `parseFechaLocal` (extraídas) y `formatearFechaRelativa` (nueva)
- [x] T02 - `ReservasPage.tsx`: importar las 3 funciones desde `lib/fechas.ts`, eliminar definiciones locales
- [x] T03 - `types/index.ts`: añadir `getReservaUsuarioId`
- [x] T04 - `ReservasPage.tsx`: importar `getReservaUsuarioId` desde `types`, eliminar definición local
- [x] T05 - `DashboardPage.tsx`: añadir estados `proximaReserva`, `loadingReserva`, `errorReserva`
- [x] T06 - `DashboardPage.tsx`: `useEffect` que carga, filtra (propias + aún no finalizadas) y ordena
- [x] T07 - `DashboardPage.tsx`: tercera `Card` con estados carga/vacío/error/datos; grid a `md:grid-cols-3`
- [x] T08 - `DashboardPage.tsx`: botón de la tarjeta con datos navega a `/reservas` con `state.pistaId`
- [x] T09 - Verificación manual: usuario con reserva futura, usuario sin reservas, admin (confirmar que ve solo la suya), reserva de hoy ya finalizada (no debe aparecer)