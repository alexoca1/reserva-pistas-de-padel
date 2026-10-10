# Plan técnico: Spec 043 — Pista (Precio, Estado) y Seed de Demo

**Spec relacionada:** `specs/043-pista-precio-estado-seed/spec.md`

---

## Diseño

### 1. Entidades y Tablas Afectadas

#### `Pista.java` y `EstadoPista.java` (Nuevo Enum)
- Se crea el enum `com.padel.reservas.entities.EstadoPista` con dos valores: `ACTIVA`, `MANTENIMIENTO`.
- En `Pista.java`:
  ```java
  @Column(precision = 10, scale = 2)
  private BigDecimal precioHora = new BigDecimal("20.00");

  @Enumerated(EnumType.STRING)
  @Column(length = 20)
  private EstadoPista estado = EstadoPista.ACTIVA;
  ```
- **DDL y Retrocompatibilidad:** Al correr con `spring.jpa.hibernate.ddl-auto=update` en producción sobre tablas con filas preexistentes:
  - Las columnas se configuran sin `nullable = false` para permitir la alteración inmediata de tabla de Hibernate sin errores de integridad.
  - Valores por defecto en Java (`precioHora = 20.00`, `estado = ACTIVA`) aseguran que nuevas instancias y lecturas con `null` tengan un fallback seguro.
  - Se genera el script de respaldo `padel-backend/migracion_pista_precio_estado.sql` con sentencias SQL DDL y DML para actualizar registros existentes.

#### `Reserva.java` y Regla de Negocio "Reserva Jugada"
- Añadir método de consulta a nivel de entidad:
  ```java
  public boolean esJugada(LocalDateTime ahora) {
      if (this.estado != EstadoReserva.CONFIRMADA) return false;
      LocalDateTime finPartido = LocalDateTime.of(this.fechaReserva, this.horaFin);
      return finPartido.isBefore(ahora);
  }

  public BigDecimal getCosteEstimado() {
      if (this.pista == null || this.pista.getPrecioHora() == null || this.horaInicio == null || this.horaFin == null) {
          return BigDecimal.ZERO;
      }
      long minutos = Duration.between(this.horaInicio, this.horaFin).toMinutes();
      return this.pista.getPrecioHora()
              .multiply(BigDecimal.valueOf(minutos))
              .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
  }
  ```
- En `ReservaRepository`:
  - Método para contar reservas activas en una pista posterior a una fecha/hora dada (útil cuando el admin consulta pistas en mantenimiento).
  - Consulta o método para recuperar reservas jugadas: `findByEstadoAndFechaReservaBefore(...)` o combinación fecha + hora.

### 2. Endpoints y Controladores Backend

- **`PistasController.java`:**
  - `createPista` y `updatePista`: Permiten persistir `precioHora` y `estado`.
  - Endpoint GET `/pistas/{id}/reservas-futuras-count`: (Admin) devuelve el conteo de reservas pendientes para informar si una pista en mantenimiento tiene compromisos adquiridos.
- **`ReservasController.java` y `ReservaService.java`:**
  - En `crear()` y `actualizar()`:
    ```java
    if (pista.getEstado() == EstadoPista.MANTENIMIENTO) {
        throw new ResponseStatusException(HttpStatus.CONFLICT,
            "La pista se encuentra actualmente en mantenimiento y no admite reservas");
    }
    ```
  - `DisponibilidadDiaDTO`: añadir el campo `String estado` (o `EstadoPista estado`) para que la cuadrícula sepa el estado de cada pista.

### 3. Arquitectura del Seeder de Demo

```
┌────────────────────────────────────────────────────────┐
│               DemoDataPlanGenerator (POJO)              │
│  - Random con semilla fija (L42)                       │
│  - Genera 30-60 usuarios (@seed.invalid)               │
│  - Genera 800-1500 reservas con franjas atómicas       │
│  - Distribución de horas pico (18:00 - 22:00)           │
│  - Validación de solapamientos en memoria              │
└───────────────────────────┬────────────────────────────┘
                            │ Plan validado en memoria
┌───────────────────────────▼────────────────────────────┐
│              DemoDataSeeder (CommandLineRunner)        │
│  - @ConditionalOnProperty("app.seed.demo", "true")     │
│  - Idempotencia: chequea si ya existen usuarios @seed  │
│  - Persistencia por lotes en Usuario y Reserva Repos   │
└────────────────────────────────────────────────────────┘
```

- **Idempotencia:** Si `usuarioRepository.countByEmailEndingWith("@seed.invalid") > 0`, se omite la ejecución emitiendo un log informativo.
- **Aislamiento:** No altera `admin@test.com`, `demo@padelreservas.es` ni `ConfiguracionClub` creados por `DataInitializer`.

### 4. Componentes Frontend Afectados

- **`padel-frontend/src/types/index.ts`:**
  - Actualizar `Pista` con `precioHora?: number` y `estado?: "ACTIVA" | "MANTENIMIENTO"`.
  - Actualizar `DisponibilidadDia` con `estado?: "ACTIVA" | "MANTENIMIENTO"`.
  - Actualizar `Reserva` con `costeEstimado?: number` y `precioHora?: number`.
- **`PistasPage.tsx`:**
  - Formulario de edición/creación: inputs para precio/hora y selector de estado.
  - Catálogo: visualización del precio y badge de estado.
- **`CuadriculaDisponibilidad.tsx`:**
  - Detección de pista en `MANTENIMIENTO`: cabecera con aviso, celdas atenuadas/bloqueadas e interactividad deshabilitada con cursor not-allowed.
- **Formularios de Reserva y `TarjetaReserva.tsx`:**
  - Visualización del importe calculado dinámicamente (`costeEstimado`).

---

## Decisiones y Alternativas Descartadas

1. **Descartado `@Scheduled` para transicionar `CONFIRMADA` a `COMPLETADA`:**
   - *Motivo:* El backend se ejecuta como contenedor serverless en Google Cloud Run configurado con `min-instances=0`. Cuando no hay tráfico entrante, Cloud Run congela la CPU y apaga las instancias, por lo que un `@Scheduled` periódico no se ejecutaría de forma fiable y consumiría CPU innecesaria.
   - *Solución:* Regla de negocio determinista `esJugada(ahora)` calculada bajo demanda.
2. **Descartado acoplar el generador a Spring y base de datos:**
   - *Motivo:* Generar miles de franjas pasando por validaciones transaccionales una a una en tests hace las pruebas lentas y frágiles.
   - *Solución:* Clase pura `DemoDataPlanGenerator` con pruebas unitarias ultra-rápidas (< 50 ms) que verifican la ausencia de solapamientos y la distribución matemática de reservas.
3. **Descartado migrar a Flyway inmediatamente:**
   - *Motivo:* Filosofía Ponytail (Artículo 1 de la Constitución). Introducir Flyway en una base de datos de producción existente en Aiven sin un plan de baseline puede interrumpir el despliegue actual. Se adoptan columnas seguras con defaults y script manual de respaldo.

---

## Impacto en Seguridad y Filosofía Ponytail

- **Validación en backend:** El bloqueo por `MANTENIMIENTO` se valida en `ReservaService` y devuelve `409 Conflict`, impidiendo cualquier elusión desde llamadas directas a la API.
- **Protección de datos demo:** Los usuarios ficticios usan dominios `@seed.invalid` y contraseñas cifradas aleatorias no utilizables para iniciar sesión sin reseteo.
- **Código mínimo y reutilizable:** Reutiliza las duraciones de `ConfiguracionClub` y las entidades existentes (`FranjaReservada`, `Pista`, `Usuario`, `Reserva`).
