## T01g — padel-backend/AGENTS.md: EstadoReserva en la estructura de paquetes

En el bloque de estructura de paquetes, dentro de `entities/`, añade:

```diff
 |  |- FranjaReservada.java
+|  |- EstadoReserva.java
```

## T01h — padel-backend/AGENTS.md: codigoReserva y tipos en la entidad Reserva

En la sección `### Reserva`, actualiza los campos afectados:

```diff
-    - `horaInicio: String`
-    - `horaFin: String`
+    - `horaInicio: LocalTime`
+    - `horaFin: LocalTime`
     - `nombreJugador: String`
     - `telefono: String`
     - `pista: Pista`
     - `usuario: Usuario`
+    - `estado: EstadoReserva` (default CONFIRMADA)
+    - `codigoReserva: String` (único, formato `RES-YYYY-MMdd-NNN`,
+      generado tras el primer save)
```

## T01i — padel-backend/AGENTS.md: entrada en Registro de Cambios

Al final de la sección "Registro de Cambios Relevantes", añade:

```diff
+- **Reservas de duración variable (spec 017):** `horaInicio`/`horaFin`
+  migrados de `String` a `LocalTime` en la entidad `Reserva`. Nueva entidad
+  `FranjaReservada` (constraint única por pista+fecha+slot de 30 min) para
+  prevención atómica de solapamientos concurrentes. Nuevo campo `estado`
+  (`EstadoReserva`) y `codigoReserva` en `Reserva`. Nuevo `ReservaService`
+  con lógica de validación de duración, cierre y límite diario (120 min/usuario/día).
```