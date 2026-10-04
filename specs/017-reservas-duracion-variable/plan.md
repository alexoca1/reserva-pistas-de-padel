# Plan técnico: Reservas de duración variable (60, 90 o 120 minutos)

**Spec relacionada:** ./spec.md

## Diseño

### Backend

**Nuevo enum `EstadoReserva`**: `CONFIRMADA`, `CANCELADA`, `COMPLETADA`.
Almacenado como `EnumType.STRING`.

**Migración de tipos en `Reserva`**: `horaInicio`/`horaFin` pasan de
`String` a `LocalTime`. `JavaTimeModule` ya está configurado en el proyecto
(se usa para `LocalDate` en `fechaReserva`), Jackson serializa `LocalTime`
como `"HH:mm"` con el formato correcto si se configura
`SerializationFeature.WRITE_DATES_AS_TIMESTAMPS = false` en el mismo
`ObjectMapper` ya existente. Sin eso, Jackson serializa `LocalTime` como
array `[18, 0]`.

**Nuevos campos en `Reserva`**: `estado` (`@Enumerated(STRING)`,
`NOT NULL`, default CONFIRMADA) y `codigoReserva` (`String`, único,
nullable en DB — se genera tras el primer save para poder usar el `id`).

**Generación de `codigoReserva`**: `String.format("RES-%s-%03d",
LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MMdd")), reserva.getId())`.
Se llama en `ReservaService` tras el primer `saveAndFlush`, luego se
vuelve a guardar. Sin generador externo, sin dependencia nueva.

**Nueva entidad `FranjaReservada`**: `id`, `pista` (`@ManyToOne`), `fecha`
(`LocalDate`), `horaSlot` (`LocalTime`), `reserva` (`@ManyToOne`).
Constraint única `(pista_id, fecha, hora_slot)`.

**`Reserva.franjas`**: `@OneToMany(mappedBy = "reserva",
cascade = CascadeType.ALL, orphanRemoval = true)`. Crear puebla la
colección; editar la limpia y repuebla; borrar cascada automáticamente.

**`ReservaService`** (nuevo `@Service`, sin interfaz):
1. Validar duración (60/90/120) y regla de cierre (RF-09).
2. Consultar minutos ya reservados hoy por el usuario con estado CONFIRMADA
   (fetch en Java de la lista, suma con `Duration.between` — N máximo de 2
   reservas/día, no justifica query nativa).
3. Validar que no supera 120 min en el día.
4. Llamar a `saveAndFlush(reserva)` dentro de `@Transactional`, capturar
   `DataIntegrityViolationException` → `ReservaSolapadaException` (409).
5. Generar `codigoReserva` y guardar de nuevo.

**`ReservasController`**: `createReserva`/`updateReserva` delegan en
`ReservaService`. Se elimina la llamada previa a `findSolapadas`/
`validarSinSolapamiento` — la constraint la sustituye. Si `findSolapadas`
no se usa en ningún otro sitio, se borra también de `ReservaRepository`.

**`getDisponibilidadDia`**: añade filtro `AND r.estado = CONFIRMADA`
al mapeo de franjas. El contrato de `FranjaDTO` no cambia.

**`ReservaRepository`**: añadir
`findByUsuarioAndFechaAndEstado(Usuario, LocalDate, EstadoReserva)`
para la consulta del límite diario.

### Frontend

**`lib/franjas.ts`**: igual que en el prompt anterior (conversión
hora↔minutos, `franjasDeReserva`, `sumarMinutos`). La migración a
`LocalTime` en el backend no afecta al frontend — JSON sigue siendo `"HH:mm"`.

**`CuadriculaDisponibilidad.tsx`**: `HORAS` en pasos de 30 min (06:00 a
22:30). `resolverSlot` con ventana de 30 min. Cada celda de una misma
reserva repite el handler de clic independientemente.

**`ReservasPage.tsx`**: selector de duración con tres opciones (60, 90 por
defecto, 120). Calcula `horaFin = sumarMinutos(horaInicio, duracion)` antes
de enviar. Muestra minutos restantes del día (dato devuelto por el backend
en el 400 si se supera, o calculable en cliente con los datos de las
reservas ya cargadas del usuario).

## Decisiones y alternativas descartadas

- **Bloqueo pesimista sin tabla de franjas**: descartado — con rangos
  variables y tres duraciones posibles, el índice único simple
  `(pista, fecha, horaInicio)` no detecta solapamientos parciales. La tabla
  de franjas atómicas con constraint única lo resuelve sin espera
  bloqueante. `ponytail:` techo conocido — si en el futuro MySQL añade
  constraint de exclusión de rangos (como Postgres `EXCLUDE USING gist`),
  se puede eliminar la tabla y sustituir por esa constraint nativa.
- **TIMESTAMPDIFF en query JPQL para el límite diario**: descartado —
  JPQL no lo soporta nativamente y requiere `@Query` nativa. Con N máximo
  de 2 reservas por día, fetch + cálculo en Java es más limpio y suficiente.
- **`ConfiguracionClub` para hacer los límites configurables**: fuera de
  scope — va a spec 019. Los valores (60/90/120 min, límite de 120 min/día)
  se hardcodean en `ReservaService` con constantes nombradas, documentadas
  con `ponytail:` comment señalando que vendrán de `ConfiguracionClub`.
- **`IReservaService` + `ReservaServiceImpl`**: descartado — una sola
  clase concreta `@Service`. Ver Artículo 1 de la constitución.
- **`rowSpan` para fusionar celdas visualmente**: descartado para esta
  iteración — mejora visual futura, coste desproporcionado ahora.

## Impacto en seguridad
Las reglas de propietario/admin de las specs 001 y 010 no cambian. El
límite diario aplica a todos los usuarios por igual; el backend lo valida,
no el frontend (Artículo 5 de la constitución).