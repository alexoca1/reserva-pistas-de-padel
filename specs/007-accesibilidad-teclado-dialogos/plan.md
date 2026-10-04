# Plan técnico: Accesibilidad de teclado en diálogos

**Spec relacionada:** ./spec.md

## Diseño

- **`Dialog.tsx`**: añadir `panelRef` (apunta al `motion.div` del panel) y
  `elementoPrevioRef` (guarda `document.activeElement` al abrir). Un único
  `useEffect` con dependencia `[open, onOpenChange]`:
  - Si `open` pasa a `true`: guarda el elemento con foco actual, mueve el
    foco al panel (`tabIndex={-1}` + `.focus()`), y registra un listener de
    `keydown` para Escape que llama a `onOpenChange(false)`.
  - Si `open` pasa a `false`: devuelve el foco al elemento guardado.
- **`DialogTitle`**: añade `id="dialog-title"` a su `<h2>`.
- **Panel del diálogo**: añade `role="dialog"`, `aria-modal="true"`,
  `aria-labelledby="dialog-title"`.

## Decisiones y alternativas descartadas

- **Focus trap completo (librería `focus-trap-react` o similar)**: descartado
  — no justifica una dependencia nueva para el alcance actual (regla
  Ponytail); se documenta como posible ampliación futura.
- **`id` dinámico con `React.useId()` en vez de `"dialog-title"` fijo**:
  descartado por ahora. En el patrón de uso actual del proyecto nunca hay más
  de un `Dialog` abierto a la vez — los propios call sites cierran uno antes
  de abrir el siguiente (ver `ReservasPage.abrirEliminarDesdeForm`, que hace
  `setOpenFormDialog(false)` antes de `setOpenDeleteDialog(true)`). Si en el
  futuro se permiten diálogos apilados, esto habrá que revisarlo.
- **Foco al primer campo del formulario en vez de al panel**: descartado —
  `Dialog` es genérico y no conoce su contenido; mover el foco al contenedor
  (`tabIndex={-1}`) es la práctica WAI-ARIA aceptada en ese caso.

## Impacto en seguridad

Ninguno.