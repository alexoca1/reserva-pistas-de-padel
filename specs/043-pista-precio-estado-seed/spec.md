# Spec 043: Pista (Precio y Estado) y Seed de Datos de Demo

**Estado:** Borrador  
**Fecha:** 2026-10-07  
**Afecta:** Backend (`Pista.java`, `EstadoPista.java`, `Reserva.java`, `ReservaService.java`, `ReservasController.java`, `PistasController.java`, nuevo `DemoDataPlanGenerator.java`, nuevo `DemoDataSeeder.java`), Base de Datos (migración SQL de compatibilidad), Frontend (`Pista`, `Reserva`, `PistasPage.tsx`, `CuadriculaDisponibilidad.tsx`, `TarjetaReserva.tsx`, formularios de reserva).

---

## Resumen

Esta especificación cubre dos necesidades fundamentales para la evolución comercial y analítica de la plataforma:
1. **Pista con modelo tarifario y ciclo operativo:** Añade a cada pista un precio por hora (`precioHora`) y un estado operativo (`EstadoPista`: `ACTIVA` o `MANTENIMIENTO`). El coste estimado de cada reserva se calcula de forma centralizada en el backend en función de la duración (60, 90 o 120 minutos) y el precio de la pista. Las pistas en mantenimiento rechazan nuevas reservas o modificaciones con código HTTP 409, manteniéndose visibles pero deshabilitadas en la cuadrícula. Asimismo, se unifica en un único lugar la regla de negocio para identificar **"reservas jugadas"** (reservas confirmadas cuya hora de finalización ya ha pasado).
2. **Generador y Seeder de datos ficticios de demostración:** Implementa un mecanismo desacoplado e idempotente activado por configuración (`app.seed.demo=true` / `APP_SEED_DEMO=true`) que puebla la base de datos con un historial verosímil (30 a 60 usuarios con dominio seguro `@seed.invalid` y entre 800 y 1.500 reservas históricas y futuras con patrones reales de afluencia vespertina), sirviendo como base indispensable para futuras métricas, KPIs, paneles de ocupación y exportación analítica en CSV.

---

## Revisión Previa de Entidades Existentes

Conforme a la regla de verificar antes de duplicar:
- **`Pista.java`:** Dispone de `id`, `numeroPista`, `tieneIluminacion`, `comentarios`, `imagenUrl`, `fechaAlta`, `fechaModificacion`, `reservas` y `fotos`. **No existe ningún campo de precio, tarifa, estado, tipo ni activa.** Se añaden `precioHora` y `estado`.
- **`Usuario.java`:** Ya posee `roles`, `enabled` y `tipoAdmin`. Los usuarios sembrados reutilizan la entidad estándar con `roles = "ROLE_USER"`, `enabled = true` y emails identificables bajo el dominio seguro `@seed.invalid`.
- **`DataInitializer.java`:** Permanece como responsable exclusivo de inicializar el usuario administrador principal (`admin@test.com`), el administrador de demostración (`demo@padelreservas.es`), la configuración inicial del club (`ConfiguracionClub`) y la sincronización de fotos de portada. **El nuevo seeder no interfiere con `DataInitializer`.**

---

## Escenarios

- **Como administrador del club**, quiero asignar un precio por hora a cada pista para que los jugadores conozcan el coste exacto antes de reservar.
- **Como administrador**, quiero poner una pista temporalmente en mantenimiento (por reparación de cristales, red o césped) para impedir que se reserven huecos mientras dure la avería, viendo cuántas reservas preexistentes quedan pendientes en ella sin cancelarlas abruptamente.
- **Como jugador**, quiero ver el importe estimado del alquiler al seleccionar la pista, fecha y duración (ej. 1,5 h × 20 €/h = 30,00 €) tanto en el formulario como en mi tarjeta de reserva.
- **Como usuario**, si intento reservar o mover una cita a una pista en mantenimiento, recibo un mensaje de conflicto claro (409) informando de la indisponibilidad de la pista.
- **Como evaluador o stakeholder de la demo**, quiero disponer de un entorno poblado con cientos de partidos históricos realistas para apreciar el rendimiento de la cuadrícula y permitir que las futuras funciones de estadísticas e ingresos muestren gráficas representativas.

---

## Requisitos Funcionales

### PARTE A — Modelo de Pista, Coste Estimado y Ciclo Operativo

- **RF-01 (Campos de Pista):**
  - `precioHora` (`BigDecimal`, escala 2, moneda euros/hora). Obligatorio lógicamente pero `nullable = true` a nivel DDL con valor por defecto de negocio (ej. `20.00` €).
  - `estado` (`@Enumerated(EnumType.STRING)` con valores `ACTIVA` y `MANTENIMIENTO`). Por defecto `EstadoPista.ACTIVA`.
- **RF-02 (Compatibilidad DDL y Script SQL de Respaldo):**
  - Dado que producción en Google Cloud Run y Aiven MySQL opera con `ddl-auto=update` sin Flyway, las nuevas columnas deben ser declaradas de forma compatible (nullable o con cláusula `columnDefinition = "..."` con DEFAULT) para no fallar sobre filas ya existentes.
  - Se proporciona un script SQL manual de respaldo idempotente en `padel-backend/migracion_pista_precio_estado.sql` (`ALTER TABLE pistas ADD COLUMN IF NOT EXISTS...` y `UPDATE pistas SET estado = 'ACTIVA', precioHora = 20.00 WHERE ...`).
- **RF-03 (Bloqueo Operativo por MANTENIMIENTO):**
  - Cualquier intento de creación (`POST /reservas`) o modificación (`PUT /reservas/{id}`) sobre una pista con `estado == EstadoPista.MANTENIMIENTO` debe ser rechazado inmediatamente por el backend con código HTTP **409 Conflict** y mensaje explicativo: *"La pista se encuentra actualmente en mantenimiento y no admite reservas"*.
  - Las reservas futuras que ya existieran previamente en esa pista **NO se cancelan automáticamente** (el club gestiona la recolocación o aviso personal con los socios).
  - En el panel de administración, el admin puede consultar cuántas reservas futuras activas existen en una pista en mantenimiento.
- **RF-04 (Cuadrícula de Disponibilidad):**
  - `DisponibilidadDiaDTO` expone el estado de la pista (`estado: ACTIVA | MANTENIMIENTO`).
  - En el frontend (`CuadriculaDisponibilidad.tsx`), las columnas o pistas en `MANTENIMIENTO` se muestran visualmente deshabilitadas (fondo atenuado, indicador/badge de mantenimiento y sin permitir clics para iniciar nuevas reservas en slots libres).
- **RF-05 (Cálculo del Coste Estimado de Reserva):**
  - Fórmula centralizada en backend:
    $$\text{costeEstimado} = \text{precioHora} \times \frac{\text{duracionMinutos}}{60}$$
  - Calculado con redondeo estándar a 2 decimales (`RoundingMode.HALF_UP`).
  - Si una pista antigua tuviese `precioHora == null`, se aplica fallback seguro a `0.00`.
  - El DTO de respuesta de `Reserva` expone `costeEstimado` (y `precioHora` de la pista asociada).
  - En el frontend, el coste estimado se visualiza en el diálogo/formulario de reserva al seleccionar o cambiar la duración, y en `TarjetaReserva` del Dashboard.
- **RF-06 (Gestión en `PistasPage`):**
  - El formulario modal de creación y edición de pistas para administradores incluye los campos numéricos de `precioHora` y selector de `estado`.
  - La tarjeta/fila de la pista en el catálogo muestra el badge de estado (`Activa` en verde, `Mantenimiento` en ámbar/destructivo) y la tarifa por hora.
  - Las operaciones de mutación (`POST`, `PUT`, `DELETE /pistas`) mantienen la anotación `@NoDemoAdmin`.
- **RF-07 (Regla Unificada de "Reserva Jugada"):**
  - Como el backend corre en Cloud Run con escalado a cero instancias mínimas (`min-instances=0`), no se emplean tareas programadas en memoria (`@Scheduled`) para transicionar estados a `COMPLETADA`.
  - Se define en un único punto canónico (método de entidad `Reserva.esJugada(LocalDateTime ahora)` y especificación/query en `ReservaRepository`) que una reserva es "jugada" si y solo si:
    $$\text{estado} == \text{CONFIRMADA} \quad \wedge \quad (\text{fechaReserva} + \text{horaFin}) < \text{ahora}$$
  - Esta definición queda preparada como estándar único para futuras consultas de KPIs, ocupación y exportaciones CSV.

---

### PARTE B — Seeder de Datos de Demostración (`DemoDataSeeder`)

- **RF-08 (Activación Condicional e Idempotencia):**
  - El componente `DemoDataSeeder` está **desactivado por defecto** (`@ConditionalOnProperty(name = "app.seed.demo", havingValue = "true")`).
  - Se activa configurando `app.seed.demo=true` o la variable de entorno `APP_SEED_DEMO=true`.
  - Es estrictamente **idempotente**: si ya detecta usuarios sembrados con sufijo `@seed.invalid`, no duplica datos ni vuelve a ejecutar la siembra.
- **RF-09 (Arquitectura Desacoplada: Generador Puro vs. Persistencia):**
  - Se separa la lógica en dos piezas con responsabilidades limpias:
    1. `DemoDataPlanGenerator` (clase pura Java POJO): genera en memoria la colección de usuarios ficticios y el plan de reservas y franjas horarias, validando la ausencia total de solapamientos entre franjas de la misma pista y respetando el límite por usuario. Determinista y testeable en milisegundos sin levantar contexto de Spring ni base de datos.
    2. `DemoDataSeeder` (Spring Runner / Service transaccional): invoca el generador e inserta eficientemente mediante los repositorios JPA (`UsuarioRepository`, `ReservaRepository`).
- **RF-10 (Usuarios Ficticios Seguros):**
  - Genera entre 30 y 60 usuarios con nombres y apellidos verosímiles en español.
  - Emails con dominio reservado RFC 6761: `usuarioXXX@seed.invalid` (garantiza que jamás se envíen correos reales ni colisionen con usuarios reales).
  - Contraseñas con hash aleatorio BCrypt no divulgable (`ROLE_USER`, `enabled = true`).
  - Teléfonos ficticios y avatares aleatorios (colores deterministas).
- **RF-11 (Volumen y Distribución de Reservas Realista):**
  - Entre 800 y 1.500 reservas repartidas en una ventana de **60 a 90 días hacia el pasado** y **7 días hacia el futuro**.
  - **Distribución de demanda:** Mayor densidad de reservas en franjas pico de tarde/noche (18:00 a 22:00) y fines de semana; menor densidad en mañanas de días laborables.
  - **Duraciones:** Utiliza estrictamente las duraciones configuradas en `ConfiguracionClub` (60, 90 y 120 minutos, con predominio de 90 min).
  - **Estados:**
    - La inmensa mayoría con estado `CONFIRMADA` (las pasadas constituyen el histórico de partidos jugados).
    - Un porcentaje menor (~5-10%) con estado `CANCELADA` y con su `fechaCancelacion` debidamente informada.
- **RF-12 (Integridad de Franjas Horarias sin Solapamientos):**
  - Para cada reserva confirmada, se crean y asocian sus correspondientes entidades `FranjaReservada` de 30 minutos respetando la restricción de unicidad `(pista_id, fecha, hora_slot)`.
  - Las reservas canceladas no generan franjas ocupadas.
  - La generación se realiza directamente sobre el plan sin pasar por las validaciones de antelación máxima de usuario (`ReservaService`), pero garantizando solidez matemática contra solapamientos.
- **RF-13 (Determinismo y Limpieza):**
  - Generador basado en `Random` con semilla fija (ej. `seed = 42L`) para producir exactamente los mismos datos reproducibles en cualquier entorno.
  - Todos los datos generados son fácilmente identificables y purgables en base de datos mediante una única consulta SQL:
    ```sql
    DELETE FROM reservas WHERE usuario_id IN (SELECT id FROM usuario WHERE email LIKE '%@seed.invalid');
    DELETE FROM usuario WHERE email LIKE '%@seed.invalid';
    ```

---

## Fuera de Alcance

- Pasarela de pagos online o integración con Stripe/Redsys (el precio y coste estimado tienen fin presupuestario e informativo en la demo).
- Migración forzosa a Flyway o Liquibase en esta spec (se deja propuesto en la sección de mejoras pendientes del README).
- Tarea programada `@Scheduled` para transicionar estados a `COMPLETADA` (inviable con escalado a cero instancias en Cloud Run; resuelto con la regla dinámica `esJugada`).
- Modificación del comportamiento de `DataInitializer` sobre las cuentas admin y demo existentes.

---

## Preguntas Abiertas

Ninguna. Requisitos y casos borde completamente especificados.
