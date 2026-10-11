# Plan técnico: Pagos Simulados
**Spec relacionada:** spec.md

## Diseño
- **Entidades/tablas afectadas:**
  - `TipoPago` (Enum: COBRO, REEMBOLSO)
  - `MetodoPago` (Enum: TARJETA_SIMULADA, BIZUM_SIMULADO)
  - `Pago` (Entidad: id, reserva, usuario, tipo, metodo, importe, fechaPago, concepto)
  - Modificar `Reserva` añadiendo `@OneToMany List<Pago> pagos`.
- **Endpoints o componentes afectados:**
  - `ReservasController` (modificar `@Autowired` a `@RequiredArgsConstructor`).
  - Añadir endpoint `GET /reservas/{id}/pagos`.
  - DTOs afectados: `CreateReservaDTO` (añadir metodoPago), `CancelReservaDTO` (nueva).
- **Servicios:**
  - `PagoService`: Lógica principal para `registrarCobro`, `calcularImporteReembolso`, `registrarReembolso`, `registrarAjusteEdicion`.
  - `ReservaService`: Actualizar `crear`, `actualizar`, y mover la cancelación del controlador a este servicio creando el método `cancelar`.
- **Seeder:**
  - Añadir lógica de pagos en `DemoDataSeeder`.

## Decisiones y alternativas descartadas
- Se ha descartado crear un sistema de monedero (wallet). El pago se asocia directamente a la reserva.
- Se mantiene el esquema de cancelación inline en el controlador actual pero se traslada a `ReservaService` para mayor cohesión y reusabilidad.
- Los tramos de cancelación están hardcodeados como constantes (6 horas), aunque con un comentario para considerarlos como configuración de club futura.

## Impacto en seguridad
- Endpoint de pagos validará que sea administrador o el propietario de la reserva.
- Endpoints de creación y cancelación seguirán la política vigente pero ahora gestionarán los estados de pago.
