# Tareas: Notificaciones de confirmación (toast)

- [x] T01 - Crear `src/context/ToastContext.tsx` con `ToastProvider` y `useToast`
- [x] T02 - `main.tsx`: envolver `<App />` con `<ToastProvider>` dentro de `<AuthProvider>`
- [x] T03 - `PistasPage.tsx`: toast tras crear/editar en `guardarPista`
- [x] T04 - `PistasPage.tsx`: toast tras eliminar en `confirmarEliminar`
- [x] T05 - `ReservasPage.tsx`: toast tras crear/editar en `guardarReserva`
- [x] T06 - `ReservasPage.tsx`: toast tras eliminar en `confirmarEliminar`
- [x] T07 - Verificación manual: crear/editar/eliminar pista y reserva y confirmar el toast correcto en cada caso; disparar dos acciones seguidas y confirmar que se apilan