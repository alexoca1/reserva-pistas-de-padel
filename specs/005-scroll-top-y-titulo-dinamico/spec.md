# Spec: Scroll-to-top y título de pestaña dinámico

**Estado:** Completado

## Resumen
Al cambiar de ruta, el scroll mantiene la posición de la página anterior y el
título de la pestaña del navegador es siempre "Pádel Reservas", sin distinguir
en qué página está el usuario. Esta spec corrige ambos comportamientos.

## Escenarios

- Como usuario, al navegar de una página a otra, quiero que la vista empiece
  desde arriba, para no llegar a mitad de una página que no he visto todavía.
- Como usuario con varias pestañas de la app abiertas, quiero distinguirlas
  por el título de cada una, para saber cuál es cuál sin entrar a mirarlas.
- Como usuario que llega a una URL inexistente, quiero que la pestaña y el
  scroll se comporten igual de bien que en el resto de la app.

## Requisitos funcionales

- RF-01: Al cambiar de ruta dentro de `Layout` (Home, Login, Register,
  Dashboard, Pistas, Reservas), el scroll de la ventana vuelve a la posición
  superior (0,0).
- RF-02: Al cambiar de ruta dentro de `Layout`, `document.title` se actualiza
  con el formato `"{Página} · Pádel Reservas"`; la home usa solo
  `"Pádel Reservas"` sin sufijo.
- RF-03: `NotFoundPage`, al vivir fuera de `Layout` en el árbol de rutas,
  gestiona su propio título (`"Página no encontrada · Pádel Reservas"`) y su
  propio scroll-to-top de forma independiente.
- RF-04: El mapa de títulos por ruta vive en un único lugar (`Layout.tsx`) y
  debe ampliarse cada vez que se añada una ruta nueva bajo `Layout`.

## Fuera de alcance

- Restaurar la posición de scroll al pulsar "atrás" del navegador (eso es
  scroll restoration de historial, lo opuesto a scroll-to-top; no se pide aquí).
- Títulos dinámicos con datos de entidad (ej. "Pista 3 · Pádel Reservas").
- Anidar `NotFoundPage` dentro de `Layout` para unificar el efecto — cambiaría
  el layout visual del 404 (hoy vive fuera del `<main>` con su propio fondo).

## Preguntas abiertas

Ninguna.