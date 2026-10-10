# Prompt para Spec 043 — Pista: Precio, Estado y Seed de Demo

Crea la spec `specs/043-pista-precio-estado-seed/` (spec.md, plan.md, tasks.md, prompt.md) siguiendo `.specify/memory/constitution.md` (filosofía Ponytail), `.specify/templates/` y el formato de las specs 017 y 019. NO implementes todavía: al terminar los cuatro documentos, detente y muéstrame un resumen.

ANTES de escribir nada, revisa `Pista.java`, `Usuario.java` y `DataInitializer.java`. Si ya existe algún campo equivalente a precio, estado, tipo o activa, reutilízalo en lugar de duplicarlo e indícame qué has encontrado. `DataInitializer` sigue siendo responsable del admin, el demo y la configuración; el seeder nuevo no los toca.

Objetivo: dar a cada pista un precio y un estado, y poder poblar la BD de demo con datos ficticios, como base de KPIs, estadísticas y CSV.

PARTE A, Pista
- `precioHora` (BigDecimal, euros por hora) y `estado` (enum `EstadoPista`: ACTIVA, MANTENIMIENTO; por defecto ACTIVA).
- Producción usa ddl-auto=update sin Flyway y la tabla ya tiene filas: columnas nullable o con DEFAULT, nunca NOT NULL sin default. Aporta también un script SQL de respaldo como el precedente `migracion_reservas_usuario.sql`.
- Pista en MANTENIMIENTO: no se pueden crear ni editar reservas sobre ella (409 con mensaje claro). Las reservas futuras existentes NO se cancelan; el admin ve cuántas hay. La cuadrícula la muestra deshabilitada.
- Coste estimado = precioHora × minutos / 60, calculado en backend y expuesto en el DTO; se muestra en el formulario de reserva y en `TarjetaReserva`.
- `PistasPage`: campos de precio y estado para admin y badge de estado. Create/update/delete de pista ya llevan `@NoDemoAdmin`.
- Regla "reserva jugada": `EstadoReserva.COMPLETADA` no se asigna en ningún sitio y NO vamos a añadir un @Scheduled (Cloud Run con min-instances=0). Define en UN solo lugar (método de repositorio o de `Reserva`) que una reserva jugada es una CONFIRMADA cuya fecha+horaFin es anterior a ahora, para que la reutilicen las specs futuras de KPIs, CSV y estadísticas.

PARTE B, seed de demo
- `DemoDataSeeder` desactivado por defecto; se activa con `app.seed.demo=true` (variable `APP_SEED_DEMO`). Idempotente.
- Separa la generación (clase pura que produce el plan de reservas y comprueba solapamientos en memoria) de la persistencia (capa fina con los repositorios).
- 30 a 60 usuarios ficticios (emails `@seed.invalid`, contraseña aleatoria con hash BCrypt que nadie conoce) y 800 a 1.500 reservas en los últimos 60 a 90 días, más algunas en los próximos 7 días. Picos de 18:00 a 22:00, duraciones tomadas de la configuración. Las pasadas con estado CONFIRMADA (como las reales) y alguna CANCELADA con `fechaCancelacion`.
- Crea las `FranjaReservada` de cada reserva respetando la restricción única, sin pasar por las validaciones de antelación y cancelación de `ReservaService`. Sin solapamientos.
- Random con semilla fija. Usuarios sembrados identificables y borrables por el dominio del email.

Tests (la suite usa MockMvc y Mockito, sin BD): MANTENIMIENTO bloquea POST/PUT de reserva con 409; cálculo del coste; el generador es determinista y no produce solapamientos; la regla "reserva jugada".
Docs: AGENTS.md de backend y frontend, README (seed con datos ficticios; en "mejoras por implementar", Flyway y la limpieza de tokens en Cloud Run).
Rama `spec/043-pista-precio-estado-seed`. Commits: feat(pistas), feat(seed), test, docs.
