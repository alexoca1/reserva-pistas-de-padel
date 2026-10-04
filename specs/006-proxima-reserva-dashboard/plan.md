# Plan técnico: "Tu próxima reserva" en el Dashboard

**Spec relacionada:** ./spec.md

## Diseño

- **`src/lib/fechas.ts` (nuevo)**: extrae `obtenerFechaHoyLocal`,
  `obtenerFechaISOHoyLocal` y `parseFechaLocal` de `ReservasPage.tsx` tal cual
  están (sin reescribir lógica), y añade `formatearFechaRelativa` nueva para
  las etiquetas "Hoy"/"Mañana"/`DD/MM`.
- **`ReservasPage.tsx`**: importa esas 3 funciones desde `lib/fechas.ts` y
  elimina sus definiciones locales — mismo comportamiento, sin duplicación.
- **`types/index.ts`**: añade `getReservaUsuarioId`, extraída de
  `ReservasPage.tsx`, junto a `getErrorMessage` (mismo patrón ya existente
  de utilidades compartidas en ese archivo).
- **`ReservasPage.tsx`**: importa `getReservaUsuarioId` desde `types` y
  elimina su definición local.
- **`DashboardPage.tsx`**: añade estado (`proximaReserva`, `loadingReserva`,
  `errorReserva`), un `useEffect` que carga, filtra y ordena, y una tercera
  `Card` con el mismo patrón visual (`TiltCard` + `Card` + `CardHeader`) que
  las dos existentes. El grid pasa de `md:grid-cols-2` a `md:grid-cols-3`.

## Decisiones y alternativas descartadas

- **No filtrar por usuario y confiar en que el backend ya lo hace**: descartado
  porque rompe para admins — `getAll()` les devuelve las reservas de todos.
- **Filtrar solo por fecha ≥ hoy, sin comparar hora**: descartado — mostraría
  como "próxima" una reserva de hoy que ya terminó.
- **Instalar `date-fns`/`dayjs` para las etiquetas relativas**: descartado —
  la comparación es trivial (hoy / hoy+1 / resto), no justifica dependencia
  nueva.
- **Duplicar la lógica de fechas en `DashboardPage.tsx`**: descartado por la
  constitución — se extrae a `lib/fechas.ts` y ambas páginas la comparten.

## Impacto en seguridad

Corrige una fuga de PII no intencionada: sin el filtro por `usuario.id`, un
admin vería fecha, hora y pista de la reserva de otro jugador presentada como
si fuera la suya propia.