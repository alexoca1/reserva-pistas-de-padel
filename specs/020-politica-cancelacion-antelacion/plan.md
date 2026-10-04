# Plan técnico: Política de cancelación y antelación máxima

**Spec relacionada:** ./spec.md

## Diseño

### Backend

**`ConfiguracionClub`**: añadir campo `horasCancelacionGratuita`
(`Integer`, default 24) si no existe tras la spec 019.

**`ReservaService`**: dos métodos nuevos de validación, llamados desde
`ReservasController`:

- `validarAntelacionReserva(LocalDate fecha, ConfiguracionClub config)`:
  lanza `IllegalArgumentException` si `fecha` supera
  `hoy + diasAntelacionMaxima`. El mensaje incluye desde qué fecha
  podrá reservarse (`hoy + 1 día`... hasta el límite).
- `validarCancelacion(Reserva reserva, boolean esAdmin,
  ConfiguracionClub config)`: si `esAdmin`, no valida nada. Si no,
  calcula el umbral `reserva.fechaReserva @ reserva.horaInicio -
  horasCancelacionGratuita horas` y compara con `LocalDateTime.now()`.
  Si el umbral ya pasó, lanza excepción.

**`ReservasController`**:
- `createReserva`/`updateReserva`: añaden llamada a
  `reservaService.validarAntelacionReserva(...)` antes de delegar en
  `crear`/`actualizar`.
- `deleteReserva`: añade llamada a
  `reservaService.validarCancelacion(...)` pasando `isAdmin(authentication)`.

### Cálculo del umbral de cancelación
LocalDateTime umbral = LocalDateTime.of(reserva.getFechaReserva(),
reserva.getHoraInicio()).minusHours(config.getHorasCancelacionGratuita());
if (LocalDateTime.now().isAfter(umbral)) → rechazar


No se necesita librería de zonas horarias nueva — `LocalDateTime` sin
zona es suficiente para comparar con `LocalDateTime.now()` en un servidor
que corra en la misma zona que los usuarios (España, Europe/Madrid,
ya configurado en `application.properties` desde spec 017).

## Decisiones y alternativas descartadas

- **Nuevo campo `estado = CANCELADA` en vez de eliminar la fila**: la
  spec 017 ya introdujo `estado`. Sin embargo, el comportamiento actual
  del sistema es `DELETE` físico. Cambiar a cancelación lógica
  (`estado = CANCELADA`) es una decisión de mayor calado — implica que
  `GET /reservas` devuelva o no las canceladas, que el historial persista,
  etc. Se deja para una spec futura si hay necesidad real. Esta spec
  solo añade la validación temporal antes del `DELETE` existente.
- **Validar antelación en `ReservaService.crear/actualizar`** en vez de
  en el controller: descartado — `crear`/`actualizar` ya tienen mucha
  responsabilidad. Una validación que depende de "ahora mismo" es mejor
  en el punto de entrada (controller), o como método de validación
  separado en el service llamado explícitamente, para que sea testeable
  por separado. Se elige lo segundo.

## Impacto en seguridad
RF-02 ya lo aplica el sistema actual (admin puede eliminar cualquier
reserva — spec 001). Esta spec no relaja ni endurece esa regla, solo
añade una capa para usuarios normales.