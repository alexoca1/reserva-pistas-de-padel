# Tareas: Preselección de pista al navegar de Pistas a Reservas

- [x] T01 - En `PistasPage.tsx`, pasar `state: { pistaId: pista.id }` en el `navigate` de la vista tarjeta (móvil)
- [x] T02 - En `PistasPage.tsx`, pasar `state: { pistaId: pista.id }` en el `navigate` de la vista tabla (escritorio)
- [x] T03 - En `ReservasPage.tsx`, importar `useLocation` e inicializar `pistaSeleccionada` desde `location.state?.pistaId ?? null`
- [x] T04 - Verificación manual: navegar Pistas → Reservas y confirmar filtro aplicado; navegar directo a `/reservas` y confirmar sin filtro