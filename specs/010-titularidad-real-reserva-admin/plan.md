# Plan técnico: Titularidad real de reservas creadas por un administrador

**Spec relacionada:** ./spec.md

## Diseño

- **`CreateReservaDTO`**: añadir `Long usuarioId` (sin `@NotNull`).
- **`ReservasController`**: nuevo método privado `resolverTitular(dto, authentication)`
  — si `isAdmin(authentication)` y `dto.usuarioId() != null`, resuelve por
  `usuarioRepository.findById`; en cualquier otro caso, por
  `usuarioRepository.findByEmail(authentication.getName())` (comportamiento
  actual). Se usa en `createReserva` y `updateReserva`.
- **`getDisponibilidadDia`**: cambia el mapeo de `FranjaDTO.nombreJugador`
  a `r.getNombreJugador()` directamente.

## Decisiones y alternativas descartadas

- **Migrar reservas históricas mal asociadas**: descartado — no hay forma
  fiable de reasignar titularidad retroactiva (`nombreJugador` de texto
  libre no es un identificador único). Fuera de alcance explícito (RF de
  la spec cubre solo reservas nuevas).
- **Eliminar el campo `nombreJugador` de texto libre y depender solo de
  `Usuario`**: descartado — cambio de modelo más invasivo del necesario;
  el texto libre ya es la fuente fiable del nombre a mostrar.

## Impacto en seguridad

Corrige un problema de integridad de permisos: una reserva "hecha para"
un usuario por un admin era, a efectos de `findByUsuarioEmail`, propiedad
del admin — el usuario real no podía gestionarla como propia. Se corrige
para reservas nuevas. RF-05 cierra el vector inverso: un usuario normal no
puede usar `usuarioId` para asignar una reserva a otra cuenta.