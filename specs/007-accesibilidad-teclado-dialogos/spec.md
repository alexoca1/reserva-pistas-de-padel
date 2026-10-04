# Spec: Accesibilidad de teclado en diálogos

**Estado:** Completado

## Resumen
Los diálogos de la app (formularios de Pistas y Reservas, confirmaciones de
borrado, vista de imagen) no se pueden cerrar con Escape, no se anuncian como
diálogo modal a lectores de pantalla, y no devuelven el foco al elemento que
los abrió. Esta spec corrige los tres puntos en el componente compartido
`Dialog`, sin tocar las páginas que lo usan.

## Escenarios

- Como usuario que navega con teclado, quiero cerrar cualquier diálogo con
  Escape, para no depender del ratón.
- Como usuario de lector de pantalla, quiero que al abrirse un diálogo se
  anuncie como modal y se lea su título, para saber dónde estoy.
- Como usuario con teclado, al cerrar un diálogo quiero que el foco vuelva al
  botón que lo abrió, para no perder mi posición en la página.

## Requisitos funcionales

- RF-01: Con el diálogo abierto, pulsar Escape lo cierra (mismo efecto que
  pulsar el fondo oscurecido).
- RF-02: El panel del diálogo expone `role="dialog"`, `aria-modal="true"` y
  `aria-labelledby` apuntando al `id` de su título.
- RF-03: Al abrir el diálogo, el foco se mueve dentro del panel — no queda en
  el botón que lo disparó, ahora oculto detrás del fondo oscurecido.
- RF-04: Al cerrar el diálogo (Escape, clic en el fondo, o cualquier botón
  interno como "Cancelar"), el foco vuelve al elemento que lo abrió.
- RF-05: El comportamiento se implementa una sola vez en el componente
  compartido `Dialog` y se aplica automáticamente a todos sus usos, sin
  cambios en las páginas que lo consumen.

## Fuera de alcance

- Focus trap completo (impedir que Tab saque el foco del diálogo). Se deja
  para una spec futura si se detecta necesidad real.
- Cambios de diseño visual.
- `aria-live` para mensajes de error dentro de los formularios.

## Preguntas abiertas

Ninguna.