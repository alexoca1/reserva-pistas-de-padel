# Tareas: Selector de usuario en el Dashboard del administrador

- [x] T01 - `DashboardPage.tsx`: importar `usuariosService`, tipo `Usuario`, `Select`, `Label`
- [x] T02 - `DashboardPage.tsx`: añadir `isAdmin` desde `useAuth()`, estado `usuarios` y `usuarioSeleccionadoId`
- [x] T03 - `DashboardPage.tsx`: `useEffect` que carga `usuarios` cuando `isAdmin`
- [x] T04 - `DashboardPage.tsx`: adaptar el `useEffect` de "próxima reserva" para usar el id correcto según rol y no ejecutar sin selección
- [x] T05 - `DashboardPage.tsx`: JSX condicional (título, selector, mensajes de espera/vacío específicos para admin)
- [x] T06 - Verificación manual: como usuario normal, confirmar que no cambia nada; como admin, alternar entre varios jugadores y confirmar que la reserva mostrada corresponde a cada uno; confirmar el mensaje de espera antes de seleccionar