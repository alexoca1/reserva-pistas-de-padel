# Plan técnico: Notificaciones de confirmación (toast)

**Spec relacionada:** ./spec.md

## Diseño

- **`src/context/ToastContext.tsx` (nuevo)**: mismo patrón que
  `AuthContext.tsx` ya existente — `createContext`, componente `ToastProvider`,
  hook `useToast()` que lanza si se usa fuera del provider. `ToastProvider`
  mantiene el array de toasts en estado, expone `mostrarToast(mensaje)`, y
  renderiza él mismo la pila de notificaciones (posición fija, esquina
  inferior derecha) usando `AnimatePresence`/`motion` de framer-motion, ya
  instalado — sin dependencia nueva.
- **`main.tsx`**: se inserta `ToastProvider` entre `AuthProvider` y `App`,
  sin reordenar los cuatro niveles ya documentados en
  `padel-frontend/AGENTS.md`.
- **`PistasPage.tsx` / `ReservasPage.tsx`**: cada página importa `useToast`
  y llama a `mostrarToast(...)` en el punto donde hoy ya se sabe que la
  operación tuvo éxito (después del `await ...Service.create/update/delete`,
  antes o después de resetear el formulario).

## Decisiones y alternativas descartadas

- **Librería de toasts (`react-hot-toast`, `sonner`, etc.)**: descartada por
  la constitución (Artículo 4 — ninguna dependencia nueva si se puede evitar).
  framer-motion ya cubre la animación necesaria.
- **Botón de cierre manual**: descartado — el caso de uso es confirmación
  pasiva de algo que ya ocurrió, no un mensaje que exija decisión del
  usuario. Añadir un botón sería abstracción no pedida (Artículo 1).
- **Convertir también los errores existentes a toast**: descartado — fuera
  del alcance pedido ("cierra el hueco de éxito", no reemplaza lo que ya
  funciona).
- **Insertar `ToastProvider` entre `AuthProvider` y `App`**: es una adición,
  no una reordenación de los niveles existentes — se documenta el nuevo
  orden completo en `AGENTS.md` para que quede como referencia actualizada.

## Impacto en seguridad

Ninguno — los mensajes son texto estático, no exponen datos de otros usuarios.