# Prompt de implementación — spec 020

Implementa specs/020-politica-cancelacion-antelacion siguiendo spec.md,
plan.md y tasks.md (T01-T14). Sigue .specify/memory/constitution.md —
cambios mínimos, sin dependencias nuevas.

Lee antes de empezar: `ReservaService.java` (para añadir los dos métodos
de validación), `ReservasController.java` (para los tres puntos de llamada),
`ConfiguracionClub.java` (para añadir el campo nuevo si no existe),
`ReservasPage.tsx` (para el manejo de errores y el selector de fecha).

Prerequisito: spec 019 implementada — `ConfiguracionClub` y
`ConfiguracionClubService` deben existir.

---

## T01 — ConfiguracionClub.java

Comprueba si el campo `horasCancelacionGratuita` ya existe tras la
implementación de spec 019. Si no existe, añádelo:

```java
@Column(nullable = false)
private Integer horasCancelacionGratuita = 24;
```

Si existe, no toques nada.

---

## T02 — ReservaService.java: validarAntelacionReserva

Añade este método público al servicio existente:

```java
public void validarAntelacionReserva(LocalDate fechaReserva,
                                      ConfiguracionClub config) {
    LocalDate hoy = LocalDate.now();
    LocalDate limiteMaximo = hoy.plusDays(config.getDiasAntelacionMaxima());
    if (fechaReserva.isAfter(limiteMaximo)) {
        LocalDate fechaDisponibleDesde = fechaReserva
            .minusDays(config.getDiasAntelacionMaxima());
        throw new IllegalArgumentException(
            "Solo puedes reservar con un máximo de " +
            config.getDiasAntelacionMaxima() + " días de antelación. " +
            "Esta fecha estará disponible a partir del " +
            fechaDisponibleDesde.format(
                java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"))
            + ".");
    }
}
```

---

## T03 — ReservaService.java: validarCancelacion

Añade este método público junto al anterior:

```java
public void validarCancelacion(Reserva reserva, boolean esAdmin,
                                ConfiguracionClub config) {
    if (esAdmin) return; // RF-02: admin cancela siempre sin restricción

    LocalDateTime umbral = LocalDateTime.of(
        reserva.getFechaReserva(),
        reserva.getHoraInicio()
    ).minusHours(config.getHorasCancelacionGratuita());

    if (LocalDateTime.now().isAfter(umbral)) {
        throw new IllegalArgumentException(
            "No puedes cancelar esta reserva con menos de " +
            config.getHorasCancelacionGratuita() +
            " horas de antelación.");
    }
}
```

---

## T04-T06 — ReservasController.java (descrito, no diff literal)

Inyecta `ConfiguracionClubService` por constructor si no está ya
(`@RequiredArgsConstructor` hace el resto).

**En `createReserva`**, añade antes de llamar a `reservaService.crear(...)`:

```java
ConfiguracionClub config = configuracionClubService.getConfiguracion();
reservaService.validarAntelacionReserva(dto.fechaReserva(), config);
```

**En `updateReserva`**, añade el mismo bloque antes de llamar a
`reservaService.actualizar(...)`.

**En `deleteReserva`** (o el método equivalente que elimina por id),
localiza el bloque que verifica que el usuario es propietario o admin
(ya existente desde spec 001) y añade justo después de obtener la
reserva y antes del delete:

```java
ConfiguracionClub config = configuracionClubService.getConfiguracion();
reservaService.validarCancelacion(reserva, isAdmin(authentication), config);
```

En los tres casos, `IllegalArgumentException` ya está mapeada a 400
desde la spec 017 — no añadas nuevo manejo de excepciones si ese handler
ya existe en `GlobalExceptionHandler` o en el controller.

---

## T07-T10 — Tests

Añade en `ReservaServiceTest.java` (misma clase de specs 017 y 019).
Necesitarás un `Reserva` con `fechaReserva` y `horaInicio` reales para
las pruebas de cancelación:

```java
@Test
void validarAntelacion_fechaDemasiadoLejos_lanzaError() {
    ConfiguracionClub config = new ConfiguracionClub();
    // diasAntelacionMaxima default = 7
    LocalDate dentroDeNueveDias = LocalDate.now().plusDays(9);
    assertThrows(IllegalArgumentException.class,
        () -> service.validarAntelacionReserva(dentroDeNueveDias, config));
}

@Test
void validarAntelacion_fechaDentroDelLimite_noLanzaError() {
    ConfiguracionClub config = new ConfiguracionClub();
    LocalDate dentroDeSeisdias = LocalDate.now().plusDays(6);
    assertDoesNotThrow(
        () -> service.validarAntelacionReserva(dentroDeSeisdias, config));
}

@Test
void validarCancelacion_menosDe24h_usuarioNormal_lanzaError() {
    ConfiguracionClub config = new ConfiguracionClub();
    // horasCancelacionGratuita default = 24
    Reserva reserva = new Reserva();
    // La reserva empieza en 23 horas — dentro de la ventana bloqueada
    LocalDateTime en23Horas = LocalDateTime.now().plusHours(23);
    reserva.setFechaReserva(en23Horas.toLocalDate());
    reserva.setHoraInicio(en23Horas.toLocalTime()
        .withSecond(0).withNano(0));
    assertThrows(IllegalArgumentException.class,
        () -> service.validarCancelacion(reserva, false, config));
}

@Test
void validarCancelacion_menosDe24h_admin_noLanzaError() {
    ConfiguracionClub config = new ConfiguracionClub();
    Reserva reserva = new Reserva();
    LocalDateTime en23Horas = LocalDateTime.now().plusHours(23);
    reserva.setFechaReserva(en23Horas.toLocalDate());
    reserva.setHoraInicio(en23Horas.toLocalTime()
        .withSecond(0).withNano(0));
    // admin = true → sin restricción
    assertDoesNotThrow(
        () -> service.validarCancelacion(reserva, true, config));
}
```

---

## T11 — ReservasPage.tsx: mensaje de cancelación tardía

Localiza el bloque que maneja el error al eliminar una reserva
(`confirmarEliminar` o equivalente). El manejo del 409 de solapamiento
ya muestra un mensaje inline — usa exactamente el mismo patrón para
mostrar el mensaje del 400/409 de cancelación tardía. No introduces
ningún mecanismo nuevo, solo te aseguras de que el mensaje que devuelve
el backend se muestra al usuario.

---

## T12 — ReservasPage.tsx: límite de fecha en el selector

Localiza el `<input type="date">` del formulario de reserva. Añade el
atributo `max` calculado a partir de la configuración ya cargada en
el estado local `duraciones` (spec 019, T11):

```tsx
// Si duraciones incluye diasAntelacionMaxima (añadir al endpoint y al tipo):
const fechaMaxima = sumarDias(obtenerFechaISOHoyLocal(), duraciones.diasAntelacionMaxima);
// y en el input:
<input type="date" ... max={fechaMaxima} />
```

Si el endpoint `/configuracion/duraciones` no devuelve aún
`diasAntelacionMaxima`, amplíalo para incluirlo (un campo más en el
`Map` del `AdminController.getDuraciones()` y en el tipo
`ConfiguracionDuraciones` de `types/index.ts`).

`sumarDias` es una función de 3 líneas que puedes añadir a
`lib/fechas.ts` (donde ya viven `obtenerFechaISOHoyLocal` y
`parseFechaLocal`):

```ts
export function sumarDias(fechaISO: string, dias: number): string {
  const fecha = new Date(fechaISO);
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().split("T")[0];
}
```

---

## T13 — padel-backend/AGENTS.md

En las notas de los endpoints afectados, añade:

```diff
 | POST | `/reservas`        | Sí | No | Crea una reserva...
+|      |                    |    |    | Valida antelación máxima (ConfiguracionClub.diasAntelacionMaxima) |
 | PUT  | `/reservas/{id}`   | Sí | No | Usuario: actualiza su reserva...
+|      |                    |    |    | Valida antelación máxima |
 | DELETE | `/reservas/{id}` | Sí | No | Usuario: elimina su reserva...
+|        |                  |    |    | Usuario normal: valida ventana de cancelación (horasCancelacionGratuita). Admin: sin restricción |
```

Si el formato de la tabla no admite filas adicionales limpiamente,
añade una nota en prosa debajo de la tabla en vez de romper el formato.

---

## T14 — Verificación manual

1. Intentar crear una reserva para dentro de 10 días (límite 7) →
   rechazado con mensaje que indica desde cuándo estará disponible.
2. El selector de fecha del formulario no permite seleccionar fechas
   más allá de hoy + 7 días.
3. Crear una reserva para dentro de 2 horas. Intentar cancelarla como
   usuario normal → rechazado (menos de 24h). Cancelarla como admin
   → aceptado.
4. Crear una reserva para mañana. Cancelarla como usuario normal →
   aceptado (más de 24h de margen).
5. Desde `/admin/configuracion`, cambiar `horasCancelacionGratuita` a 48.
   Repetir el paso 4 con una reserva para pasado mañana → ahora también
   rechazada. Restaurar a 24.

No toques `SecurityConfig`, `GlobalExceptionHandler` (salvo que
`IllegalArgumentException` no tenga handler — en ese caso añade uno que
devuelva 400), ni las reglas de propietario/admin de las specs 001 y 010.