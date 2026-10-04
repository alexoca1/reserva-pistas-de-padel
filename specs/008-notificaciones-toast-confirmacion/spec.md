# Spec: Notificaciones de confirmación (toast)

**Estado:** Completado

## Resumen
Crear, editar o eliminar una pista o una reserva se confirma hoy solo porque el
diálogo se cierra y la lista se refresca — no hay ninguna señal explícita de que
la acción funcionó. Los errores sí tienen feedback visible (mensaje inline); el
éxito no tiene ninguno. Se añade una notificación temporal que confirma la acción.

## Escenarios

- Como usuario, al crear, editar o eliminar una pista o una reserva con éxito,
  quiero ver una confirmación breve, para saber que la acción se completó sin
  tener que inferirlo por la ausencia de error.
- Como usuario, quiero que la notificación desaparezca sola pasados unos
  segundos, sin tener que cerrarla yo.
- Como usuario de lector de pantalla, quiero que la confirmación se anuncie
  igual que se leería cualquier otro cambio de estado importante en la página.
- Como usuario que encadena varias acciones seguidas, quiero ver todas las
  confirmaciones, no que una sustituya a la anterior antes de que me haya
  dado tiempo a leerla.

## Requisitos funcionales

- RF-01: Al crear una pista o reserva con éxito, se muestra "Pista creada" /
  "Reserva creada".
- RF-02: Al editar con éxito, se muestra "Pista actualizada" / "Reserva
  actualizada".
- RF-03: Al eliminar con éxito, se muestra "Pista eliminada" / "Reserva
  eliminada".
- RF-04: La notificación desaparece automáticamente a los ~4 segundos.
- RF-05: La notificación se anuncia a lectores de pantalla (`role="status"`,
  `aria-live="polite"`), en línea con el trabajo de accesibilidad de la
  spec 007.
- RF-06: El mecanismo de disparo está disponible desde cualquier página sin
  prop drilling, vía un hook (`useToast`) sobre contexto de React.
- RF-07: Si ocurren varias acciones en sucesión rápida, las notificaciones se
  apilan — no se sustituyen entre sí.

## Fuera de alcance

- Los mensajes de error existentes no cambian — siguen siendo inline en cada
  formulario/página, no se convierten a toast.
- Botón de cierre manual en el toast — solo auto-dismiss.
- Histórico o persistencia de notificaciones pasadas.

## Preguntas abiertas

Ninguna.