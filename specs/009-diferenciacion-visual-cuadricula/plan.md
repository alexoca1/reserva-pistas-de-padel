# Plan técnico: Diferenciación visual de estados en la cuadrícula

**Spec relacionada:** ./spec.md

## Diseño

- **`icons.tsx`**: añadir `IconLock`, mismo patrón que los iconos existentes.
- **`CuadriculaDisponibilidad.tsx`**: cada celda pasa a envolver su
  contenido en una caja interior (`rounded-md`) con el tratamiento visual
  de su estado, en vez de aplicar el estilo directamente al `<button>`/`<div>`
  exterior — así el borde de rejilla compartido (`border-t border-l`) se
  mantiene limpio y el estado se ve solo en la caja interna.
- **Leyenda**: cada bloque de color pasa a incluir el icono correspondiente.

## Decisiones y alternativas descartadas

- **Patrón de rayas diagonales para "Ocupada"**: descartado — más complejo
  con Tailwind puro que un icono de candado, para una ganancia de
  legibilidad menor.
- **Distinguir solo por color, sin iconos**: descartado — no resuelve
  visión de color, y los iconos ya son el patrón establecido en el proyecto.

## Impacto en seguridad

Ninguno — cambio puramente visual.