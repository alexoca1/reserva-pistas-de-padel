# Spec: Contraste de tarjetas sobre fondo Aurora

**Estado:** En progreso

## Resumen
Las tarjetas (`Card` y las "ventaja" de `HomePage`) usan `bg-white/5` — un
overlay relativo al fondo que hay detrás. Como el fondo trae los blobs
animados de `animate-aurora` (`Layout.tsx`), el color de la tarjeta se
"contagia" del tono del blob en cada punto y el borde deja de leerse. El
`Dialog` no sufre esto porque tiene una capa `bg-background/80` de pantalla
completa antes del panel, que neutraliza el aurora primero.

## Decisiones y alternativas descartadas

- **Subir solo el alpha de `bg-white/X`**: descartado — sigue siendo
  relativo al fondo animado; en las zonas de mayor intensidad del aurora
  el problema podía persistir.
- **`bg-card/70` (semitransparente)**: descartado — conserva parte del
  contagio de color, menos predecible que anclar del todo al token.
- **`bg-card/95` (elegida)**: mismo valor exacto que ya usa
  `ToastContext.tsx`, la única superficie del proyecto que hoy no tiene
  problema de contraste sobre el aurora. Reutilizar un valor ya probado en
  vez de inventar uno nuevo (Artículo 1 — reutilizar antes de reescribir).
- **Unificar las tarjetas "ventaja" de HomePage bajo `<Card>`**: descartado
  para este cambio — son dos formas visuales distintas (compacta horizontal
  vs. vertical `p-6`) que no encajan en la estructura
  `CardHeader`/`CardContent` sin decidir antes si hace falta una variante
  nueva del componente. Se aplica el mismo valor de color directamente en
  los dos bloques, sin tocar su estructura. Queda anotado como limpieza
  futura, no como parte de esta spec.

## Requisitos funcionales

- RF-01: `Card` (`components/ui/card.tsx`) usa `bg-card/95`,
  `border-white/12` y una sombra exterior reforzada
  (`0_10px_36px_-10px_rgba(0,0,0,0.65)`), en vez de `bg-white/5`.
- RF-02: Las dos tarjetas "ventaja" en `HomePage.tsx` (bloque compacto de
  escritorio y bloque de la grilla móvil) reciben los mismos valores de
  color y sombra que RF-01, sin cambiar su estructura ni su layout.
- RF-03: El estado hover de las tarjetas "ventaja" pasa de
  `hover:bg-white/10` a `hover:bg-card` (sin slash — más opaco al pasar el
  cursor, coherente con el nuevo valor base).

## Fuera de alcance

- Unificar las tarjetas "ventaja" bajo el componente `<Card>` — mejora
  futura, requiere decidir si hace falta una variante nueva.
- Cambios en `Dialog`, `Table` u otras superficies de cristal — ya se leen
  bien, no tienen el problema.
- Cambios en `index.css` o en los valores HSL del tema.

## Tareas

- [ ] T01 - `components/ui/card.tsx`: actualizar `bg-white/5` →
      `bg-card/95`, `border-white/10` → `border-white/12`, sombra reforzada
- [ ] T02 - `pages/HomePage.tsx`: mismo cambio en el bloque `TiltCard`
      compacto de escritorio (grilla `lg:grid-cols-3` oculta en móvil)
- [ ] T03 - `pages/HomePage.tsx`: mismo cambio en el bloque `TiltCard` de la
      grilla `md:grid-cols-3` de móvil, incluyendo su sombra ya explícita
- [ ] T04 - Verificación manual: Home, Dashboard y Perfil con el aurora en
      movimiento — confirmar que el borde de cada tarjeta se distingue del
      fondo en todo momento, no solo en algunos frames de la animación