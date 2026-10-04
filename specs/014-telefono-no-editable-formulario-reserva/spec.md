# Spec: Teléfono no editable en el formulario de reserva

**Estado:** Completado

## Resumen
El campo teléfono del formulario de reserva era de texto libre — cualquiera
que reservase (admin o el propio usuario) podía escribir un número distinto al
del perfil. Se convierte en solo lectura, siempre poblado con el teléfono
del perfil del titular, para evitar reservas con números erróneos o
inconsistentes. La edición del teléfono del propio perfil queda para una
spec futura.

## Requisitos funcionales

- RF-01: El campo "Teléfono" del formulario de reserva es de solo lectura
  (`readOnly`), tanto para admin como para usuario normal, en creación y
  en edición.
- RF-02: El valor mostrado proviene siempre del teléfono del perfil del
  titular (usuario autenticado, o jugador seleccionado por el admin) — el
  origen del dato no cambia, solo se retira la posibilidad de editarlo a mano.
- RF-03: Si el titular no tiene teléfono registrado en su perfil, el campo
  se muestra vacío. No se bloquea el envío del formulario por esto.

## Fuera de alcance

- Edición del perfil propio (nombre, teléfono) — spec futura, tanto
  autoedición como edición por admin.
- Cambios en el backend — `telefono` sigue siendo texto libre en `Reserva`.
- Validar formato del teléfono.

## Tareas

- [x] T01 - `ReservasPage.tsx`: `readOnly` en el `<Input id="telefono">`,
      quitar `onChange` y `required`
- [ ] T02 - Verificación manual: crear reserva como usuario normal (teléfono
      no editable, del perfil propio); crear como admin seleccionando
      jugador (teléfono no editable, del jugador elegido); editar una
      reserva existente (mismo comportamiento)
