# Tareas: Accesibilidad de teclado en diálogos

- [x] T01 - `Dialog.tsx`: añadir `useEffect`, `useRef`, `panelRef` y `elementoPrevioRef`
- [x] T02 - `Dialog.tsx`: listener de Escape (solo activo mientras `open === true`)
- [x] T03 - `Dialog.tsx`: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="dialog-title"`, `tabIndex={-1}` en el panel
- [x] T04 - `Dialog.tsx`: `id="dialog-title"` en `DialogTitle`
- [x] T05 - Verificación manual: abrir cada uno de los 5 diálogos de la app (3 en Pistas, 2 en Reservas) navegando solo con teclado (Tab + Enter), confirmar que el foco entra al panel, que Escape cierra, y que el foco vuelve al botón original