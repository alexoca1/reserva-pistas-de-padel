# Spec: Diseño real de la cuadrícula de disponibilidad (retroactiva)

**Estado:** Completado (documentación retroactiva)

## Resumen
La spec 009 especificó una cuadrícula en CSS Grid con "Ocupada" en gris neutro.
La implementación real diverge en tres puntos, decididos en sesiones
posteriores fuera del ciclo SDD formal. Esta spec formaliza el estado actual
como el estándar vigente, documentando el porqué de cada divergencia para no
tener que redebatirlas.

## Divergencias respecto a la spec 009 (aceptadas como estándar)

- **Markup**: tabla HTML (`<table>/<thead>/<tbody>`) en vez de CSS Grid. No
  hay necesidad funcional de migrar a Grid — se mantiene tal cual (regla
  Ponytail: sin bug ni necesidad real, no se reescribe).
- **Color de "Ocupada"**: ámbar (`bg-amber-500/15`, `text-amber-300`,
  `border-amber-500/40`) en vez de gris neutro. Motivo explícito del usuario:
  el gris no se distinguía intuitivamente frente al resto de estados; el
  ámbar iguala el color ya usado en las celdas ocupadas, dando coherencia
  entre leyenda y celdas.
- **Celdas ocupadas clicables para admin**: al hacer clic, abren el
  formulario de edición de esa reserva (de cualquier jugador). Coherente con
  que el backend ya permite a un admin editar cualquier reserva (spec 010) —
  la cuadrícula expone esa capacidad ya existente en vez de obligar al admin
  a buscarla en otro sitio.

## Bug detectado durante esta revisión (no es diseño, es un defecto)

- `shadow-[0_0_12px_rgba(var(--primary-rgb,34,197,94),0.15)]` en la celda
  "Tu reserva" referencia `--primary-rgb`, una variable que no existe en
  `index.css` (solo está `--primary` en formato HSL). El brillo nunca reflejaba el tema real.

## Requisitos funcionales (ya implementados)

- RF-01: La cuadrícula se renderiza como tabla semántica, no como grid CSS.
- RF-02: El estado "Ocupada" usa la paleta ámbar en leyenda y celdas de
  forma idéntica.
- RF-03: Un admin puede hacer clic en cualquier celda ocupada para editar
  esa reserva.
- RF-04: Un usuario no-admin no puede interactuar con celdas ocupadas por
  otros (sin cambios).
- RF-05: El brillo de "Tu reserva" usa el token de color real del tema
  (`--primary-rgb`), definido adecuadamente en `index.css`.

## Fuera de alcance

- Migrar a CSS Grid.
- Cambios en el backend.

## Tareas

- [x] T01 - Formalizar como estándar: tabla HTML, ámbar en Ocupada, edición
      admin desde celda (ya implementado; esta spec solo documenta)
- [x] T02 - Corregir el `shadow` roto en la celda "Tu reserva"
      (`CuadriculaDisponibilidad.tsx`)
