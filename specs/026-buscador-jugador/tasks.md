# Tareas: BuscadorJugador

## Frontend
- [x] T01 - Crear `components/BuscadorJugador.tsx` con input,
      lista filtrada, chip de selección y teclado completo
- [x] T02 - `DashboardPage.tsx`: sustituir `<Select>` de jugador
      por `<BuscadorJugador>`
- [x] T03 - `ReservasPage.tsx`: sustituir `<Select>` de
      "reservar en nombre de" por `<BuscadorJugador>`
- [x] T04 - `PerfilPage.tsx`: sustituir `<Select>` de "editar
      datos de un jugador" por `<BuscadorJugador>`
- [x] T05 - Confirmar que en ninguna de las tres páginas queda
      código de `<Select>` o `<select>` para selección de jugador

## Documentación
- [x] T06 - `padel-frontend/AGENTS.md`: añadir `BuscadorJugador.tsx`
      a la lista de componentes; documentar que es el componente
      estándar para selección de jugador en contextos de admin,
      en sustitución del `<select>` nativo

## Verificación
- [ ] T07 - Verificación manual: en Dashboard como admin, escribir
      el nombre de un jugador → aparece en la lista; seleccionar →
      chip visible con "✕"; limpiar → vuelve al input vacío; buscar
      por teléfono → funciona igual; navegar la lista con flechas y
      Enter; Escape cierra sin seleccionar; repetir en ReservasPage y
      PerfilPage