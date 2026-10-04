# Prompt de implementación — spec 017

Implementa specs/017-reservas-duracion-variable siguiendo spec.md, plan.md
y tasks.md (T01-T21). Sigue .specify/memory/constitution.md — cambios
mínimos, sin dependencias nuevas.

Las reservas existentes en base de datos pueden borrarse — el proyecto está
en fase de pruebas. `spring.jpa.hibernate.ddl-auto=update` crea columnas y
tablas nuevas automáticamente; las columnas de tipo cambiadas (String →
LocalTime) pueden requerir borrar y recrear la tabla `reservas` si `update`
no lo resuelve solo.

---

## T01 — Crear EstadoReserva.java

```java
package com.padel.reservas.entities;

public enum EstadoReserva {
    CONFIRMADA,
    CANCELADA,
    COMPLETADA
}
```

## T02 — Actualizar Reserva.java

Añade/modifica estos campos (mantén los demás sin cambios):

```java
@Column(nullable = false)
private LocalTime horaInicio;

@Column(nullable = false)
private LocalTime horaFin;

@Enumerated(EnumType.STRING)
@Column(nullable = false)
private EstadoReserva estado = EstadoReserva.CONFIRMADA;

@Column(unique = true)
private String codigoReserva;

@OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL, orphanRemoval = true)
private List<FranjaReservada> franjas = new ArrayList<>();
```

## T03 — Serialización de LocalTime como "HH:mm"

En `application.properties`, añade:

```properties
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.time-zone=Europe/Madrid
```

Si `JavaTimeModule` no está ya registrado como bean, añade también:

```properties
spring.jackson.deserialization.adjust-dates-to-context-time-zone=false
```

Con esto `LocalTime` serializa como `"18:00"` y deserializa desde `"18:00"`.

## T04 — Crear FranjaReservada.java

```java
package com.padel.reservas.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(
    name = "franjas_reservadas",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_pista_fecha_slot",
        columnNames = {"pista_id", "fecha", "hora_slot"}
    )
)
@Getter
@Setter
@NoArgsConstructor
public class FranjaReservada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pista_id", nullable = false)
    private Pista pista;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_slot", nullable = false)
    private LocalTime horaSlot;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reserva_id", nullable = false)
    private Reserva reserva;
}
```

## T05 — Crear FranjaReservadaRepository.java

```java
package com.padel.reservas.repositories;

import com.padel.reservas.entities.FranjaReservada;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FranjaReservadaRepository extends JpaRepository<FranjaReservada, Long> {
}
```

## T06 — Actualizar ReservaRepository.java

Añade este método al repositorio existente:

```java
List<Reserva> findByUsuarioAndFechaAndEstado(
    Usuario usuario, LocalDate fecha, EstadoReserva estado);
```

## T07 — Crear ReservaService.java

```java
package com.padel.reservas.services;

import com.padel.reservas.dto.CreateReservaDTO;
import com.padel.reservas.entities.*;
import com.padel.reservas.exception.ReservaSolapadaException;
import com.padel.reservas.repositories.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ReservaService {

    // ponytail: estos límites vendrán de ConfiguracionClub (spec 019)
    private static final Set<Integer> DURACIONES_VALIDAS = Set.of(60, 90, 120);
    private static final int MAXIMO_MINUTOS_DIA = 120;
    private static final int MINUTOS_POR_FRANJA = 30;
    private static final LocalTime CIERRE = LocalTime.of(23, 0);

    private final ReservaRepository reservaRepository;

    @Transactional
    public Reserva crear(CreateReservaDTO dto, Pista pista, Usuario titular) {
        LocalTime inicio = LocalTime.parse(dto.horaInicio());
        LocalTime fin = LocalTime.parse(dto.horaFin());

        validarDuracion(inicio, fin);
        validarCierre(fin);
        validarLimiteDiario(titular, dto.fechaReserva(), inicio, fin, null);

        Reserva reserva = new Reserva();
        reserva.setFechaReserva(dto.fechaReserva());
        reserva.setHoraInicio(inicio);
        reserva.setHoraFin(fin);
        reserva.setNombreJugador(dto.nombreJugador());
        reserva.setTelefono(dto.telefono());
        reserva.setPista(pista);
        reserva.setUsuario(titular);
        reserva.setEstado(EstadoReserva.CONFIRMADA);

        aplicarFranjas(reserva, pista, inicio, fin);
        Reserva guardada = guardarConTraduccionDeConflicto(reserva);
        guardada.setCodigoReserva(generarCodigo(guardada));
        return reservaRepository.save(guardada);
    }

    @Transactional
    public Reserva actualizar(Reserva reserva, CreateReservaDTO dto, Pista pista) {
        LocalTime inicio = LocalTime.parse(dto.horaInicio());
        LocalTime fin = LocalTime.parse(dto.horaFin());

        validarDuracion(inicio, fin);
        validarCierre(fin);
        validarLimiteDiario(reserva.getUsuario(), dto.fechaReserva(), inicio, fin, reserva.getId());

        reserva.setFechaReserva(dto.fechaReserva());
        reserva.setHoraInicio(inicio);
        reserva.setHoraFin(fin);
        reserva.setNombreJugador(dto.nombreJugador());
        reserva.setTelefono(dto.telefono());
        reserva.setPista(pista);

        reserva.getFranjas().clear();
        aplicarFranjas(reserva, pista, inicio, fin);
        return guardarConTraduccionDeConflicto(reserva);
    }

    private void validarDuracion(LocalTime inicio, LocalTime fin) {
        int minutos = (int) Duration.between(inicio, fin).toMinutes();
        if (!DURACIONES_VALIDAS.contains(minutos)) {
            throw new IllegalArgumentException(
                "La duración debe ser 60, 90 o 120 minutos");
        }
    }

    private void validarCierre(LocalTime fin) {
        if (fin.isAfter(CIERRE)) {
            throw new IllegalArgumentException(
                "La reserva no cabe en el horario de cierre (23:00)");
        }
    }

    private void validarLimiteDiario(Usuario usuario, java.time.LocalDate fecha,
                                      LocalTime inicio, LocalTime fin, Long excludeId) {
        int duracionNueva = (int) Duration.between(inicio, fin).toMinutes();
        int minutosYa = reservaRepository
            .findByUsuarioAndFechaAndEstado(usuario, fecha, EstadoReserva.CONFIRMADA)
            .stream()
            .filter(r -> !r.getId().equals(excludeId))
            .mapToInt(r -> (int) Duration.between(r.getHoraInicio(), r.getHoraFin()).toMinutes())
            .sum();
        if (minutosYa + duracionNueva > MAXIMO_MINUTOS_DIA) {
            throw new IllegalArgumentException(
                "Has superado el límite de 2 horas de reserva por día. " +
                "Tiempo ya reservado: " + minutosYa + " minutos.");
        }
    }

    private void aplicarFranjas(Reserva reserva, Pista pista,
                                 LocalTime inicio, LocalTime fin) {
        List<FranjaReservada> franjas = new ArrayList<>();
        for (LocalTime slot = inicio; slot.isBefore(fin);
             slot = slot.plusMinutes(MINUTOS_POR_FRANJA)) {
            FranjaReservada franja = new FranjaReservada();
            franja.setPista(pista);
            franja.setFecha(reserva.getFechaReserva());
            franja.setHoraSlot(slot);
            franja.setReserva(reserva);
            franjas.add(franja);
        }
        reserva.getFranjas().addAll(franjas);
    }

    private Reserva guardarConTraduccionDeConflicto(Reserva reserva) {
        try {
            return reservaRepository.saveAndFlush(reserva);
        } catch (DataIntegrityViolationException e) {
            throw new ReservaSolapadaException(
                "La pista ya tiene una reserva que se solapa con ese horario");
        }
    }

    private String generarCodigo(Reserva reserva) {
        String fecha = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MMdd"));
        return String.format("RES-%s-%03d", fecha, reserva.getId());
    }
}
```

## T08 — ReservasController.java (descrito, no diff literal)

- Inyecta `ReservaService` via `@RequiredArgsConstructor`.
- `createReserva`: sustituye el bloque que arma `Reserva` a mano y llama
  a `reservaRepository.save(...)` por `reservaService.crear(dto, pista, titular)`.
- `updateReserva`: mismo cambio con `reservaService.actualizar(...)`.
- Elimina la llamada a `validarSinSolapamiento`/`findSolapadas` en ambos
  métodos. Si `findSolapadas` no se usa en ningún otro sitio del
  repositorio, bórralo también de `ReservaRepository`.
- Captura `IllegalArgumentException` → `ResponseEntity.badRequest().body(e.getMessage())`.
  Si ya hay un handler para esta excepción en `GlobalExceptionHandler`,
  úsalo ahí en vez de en el controller.

## T09 — getDisponibilidadDia en ReservasController.java

Localiza el stream que mapea reservas a `FranjaDTO` y añade el filtro:

```java
.filter(r -> r.getEstado() == EstadoReserva.CONFIRMADA)
```

antes del `.map(...)` existente.

## T10-T15 — Crear ReservaServiceTest.java

```java
package com.padel.reservas.services;

import com.padel.reservas.dto.CreateReservaDTO;
import com.padel.reservas.entities.*;
import com.padel.reservas.exception.ReservaSolapadaException;
import com.padel.reservas.repositories.ReservaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ReservaServiceTest {

    @Mock private ReservaRepository reservaRepository;
    private ReservaService service;
    private final Pista pista = new Pista();
    private final Usuario usuario = new Usuario();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new ReservaService(reservaRepository);
        when(reservaRepository.saveAndFlush(any())).thenAnswer(i -> {
            Reserva r = i.getArgument(0);
            r.setId(1L);
            return r;
        });
        when(reservaRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(reservaRepository.findByUsuarioAndFechaAndEstado(any(), any(), any()))
            .thenReturn(List.of());
    }

    @Test
    void crear_90min_generaTresFranjas() {
        CreateReservaDTO dto = dto("10:00", "11:30");
        Reserva r = service.crear(dto, pista, usuario);
        assertEquals(3, r.getFranjas().size());
        assertEquals("10:00", r.getFranjas().get(0).getHoraSlot().toString());
        assertEquals("10:30", r.getFranjas().get(1).getHoraSlot().toString());
        assertEquals("11:00", r.getFranjas().get(2).getHoraSlot().toString());
    }

    @Test
    void crear_conflictoDeConstraint_lanza409() {
        when(reservaRepository.saveAndFlush(any()))
            .thenThrow(new DataIntegrityViolationException("uk_pista_fecha_slot"));
        assertThrows(ReservaSolapadaException.class,
            () -> service.crear(dto("10:00", "11:00"), pista, usuario));
    }

    @Test
    void crear_120minDesde21h30_lanzaErrorDeCierre() {
        // 21:30 + 120 min = 23:30 > 23:00
        assertThrows(IllegalArgumentException.class,
            () -> service.crear(dto("21:30", "23:30"), pista, usuario));
    }

    @Test
    void crear_superaLimiteDiario_lanzaError() {
        // usuario ya tiene 60 min reservados hoy
        Reserva existente = new Reserva();
        existente.setHoraInicio(java.time.LocalTime.of(9, 0));
        existente.setHoraFin(java.time.LocalTime.of(10, 0));
        when(reservaRepository.findByUsuarioAndFechaAndEstado(any(), any(), any()))
            .thenReturn(List.of(existente));
        // intenta añadir 90 min → total 150 > 120
        assertThrows(IllegalArgumentException.class,
            () -> service.crear(dto("18:00", "19:30"), pista, usuario));
    }

    @Test
    void crear_duracionInvalida_lanzaError() {
        // 45 min no está en {60, 90, 120}
        assertThrows(IllegalArgumentException.class,
            () -> service.crear(dto("10:00", "10:45"), pista, usuario));
    }

    private CreateReservaDTO dto(String inicio, String fin) {
        return new CreateReservaDTO(LocalDate.of(2026, 12, 1),
            inicio, fin, "Ana", "600111222", 1L, null);
    }
}
```

## T16 — Crear padel-frontend/src/lib/franjas.ts

```ts
const MINUTOS_POR_FRANJA = 30;

export function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function minutosAHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function franjasDeReserva(horaInicio: string, horaFin: string): string[] {
  const franjas: string[] = [];
  const fin = horaAMinutos(horaFin);
  for (let m = horaAMinutos(horaInicio); m < fin; m += MINUTOS_POR_FRANJA) {
    franjas.push(minutosAHora(m));
  }
  return franjas;
}

export function sumarMinutos(hora: string, minutos: number): string {
  return minutosAHora(horaAMinutos(hora) + minutos);
}
```

## T17 — CuadriculaDisponibilidad.tsx (descrito)

- `HORAS`: generar en pasos de 30 min de 06:00 a 22:30 usando
  `minutosAHora` de `lib/franjas.ts`.
- `resolverSlot`/`calcularHoraFin`: ventana de comparación de 30 min
  (`sumarMinutos(hora, 30)`) en vez de 1h.
- Handler de clic en celdas "tu reserva" y "ocupada-admin": registrarlo
  igual en cada celda que comparta el mismo `reservaId` — una reserva de
  90 min ocupa 3 celdas, todas deben abrir la misma edición al hacer clic.

## T18 — ReservasPage.tsx (descrito)

- Formulario: añade `<Select>` de duración (60 / 90 por defecto / 120)
  con `<Label>`. Mismo patrón de `Select`+`Label` ya usado en la página.
- Antes de enviar: `horaFin = sumarMinutos(form.horaInicio, duracionSeleccionada)`.
  El campo `horaFin` del formulario deja de ser editable manualmente.
- Muestra minutos restantes del día: calcula en cliente sumando duración
  de las reservas del usuario con estado CONFIRMADA ya cargadas en el
  estado local de la página.

## T19 — types/index.ts

Añade `codigoReserva?: string` y `estado?: string` al tipo `Reserva`
si no estaban ya. No es necesario tipificar `estado` como enum en el
cliente — string es suficiente y más flexible.

## T21 — Verificación

No toques SecurityConfig, GlobalExceptionHandler (salvo añadir handler
de IllegalArgumentException si no existe), ni las reglas de
propietario/admin de las specs 001 y 010.

Verificación manual: crear reservas de 60, 90 y 120 min confirmando
franjas apiladas en la cuadrícula; confirmar rechazo al superar 120 min/día
con mensaje claro; confirmar rechazo si la duración no cabe antes de las
23:00; abrir dos pestañas y reservar la misma franja — solo una lo
consigue; editar una reserva cambiando duración y confirmar que las franjas
antiguas desaparecen; cancelar una reserva y confirmar que sus franjas
dejan de bloquear ese hueco; comprobar que el JSON de la API devuelve
`horaInicio`/`horaFin` como `"HH:mm"` y no como array.