# Plan técnico: Cuadrícula de disponibilidad hora × pista

**Spec relacionada:** ./spec.md

## Diseño backend

### Endpoint nuevo: `GET /reservas/disponibilidad-dia`

- Parámetro: `fecha` (ISO date, `@DateTimeFormat(iso = DATE)`).
- Devuelve: `List<DisponibilidadDiaDTO>` — una entrada por pista, con su lista
  de franjas ocupadas (horaInicio + horaFin). Sin datos de jugador (PII).
- Requiere autenticación (cae en `anyRequest().authenticated()` — sin tocar
  `SecurityConfig`).
- Para el admin: devuelve también `nombreJugador` por franja (campo nullable;
  el frontend lo usa solo si `isAdmin`).
- Reutiliza `findByPistaIdAndFechaReserva` ya existente en `ReservaRepository`,
  llamado N veces (una por pista); N es pequeño (3–10 pistas), no justifica
  una query JOIN compleja.

### DTO nuevo: `DisponibilidadDiaDTO`

```java
record DisponibilidadDiaDTO(Long pistaId, Integer numeroPista, List<FranjaDTO> franjas) {}
record FranjaDTO(String horaInicio, String horaFin, String nombreJugador, Long reservaId, Long usuarioId) {}
```

`nombreJugador` y `reservaId` y `usuarioId` los necesita el frontend para
distinguir "Tu reserva" de "Ocupada" y para abrir el formulario de edición.
El frontend filtra lo que muestra según el rol — el backend devuelve todo a
usuarios autenticados (el nombre de jugador viaja pero el frontend no lo
muestra si no es admin o propietario, igual que ya hacía la tabla).

## Diseño frontend

### Componente nuevo: `CuadriculaDisponibilidad.tsx`

Props: `fecha`, `pistas`, `disponibilidad`, `userId`, `isAdmin`,
`onSlotLibreClick(pistaId, hora)`, `onReservaClick(reserva)`.

Renderiza: grid CSS con `grid-template-columns: 64px repeat(N, 1fr)`.
Primera columna = etiquetas de hora. Resto = columnas de pista.

### `ReservasPage.tsx`

- Añade estado `fechaVista` (string ISO, default hoy).
- Añade `useEffect` que llama al nuevo endpoint cuando cambia `fechaVista`.
- `abrirNuevaReserva` acepta `pistaId` y `horaInicio` opcionales para
  preseleccionar la celda clicada.
- Elimina la tabla de filas (desktop y móvil) — la cuadrícula la reemplaza.

### Móvil

Por debajo de `md`: un `Select` de pista filtra la columna visible.
La cuadrícula muestra una sola columna (la pista seleccionada).

## Decisiones y alternativas descartadas

- **N peticiones vs. endpoint batch**: se descartó llamar N veces a
  `/reservas/disponibilidad` (ya existente) porque con un date picker el
  usuario cambia de día frecuentemente — cada cambio dispararía 3+ fetches
  en paralelo. Un endpoint batch es más limpio y más fácil de cachear en el
  futuro.
- **Timeline con posicionamiento absoluto (Opción 4)**: descartada porque
  las reservas son de hora en hora fija — el grid con celdas uniformes es
  equivalente sin la complejidad de cálculo de píxeles.

## Impacto en seguridad

- El nuevo endpoint sigue el principio de la spec 001: `nombreJugador`
  viaja al admin; el frontend decide si lo muestra.
- No se expone teléfono ni email en ningún caso.