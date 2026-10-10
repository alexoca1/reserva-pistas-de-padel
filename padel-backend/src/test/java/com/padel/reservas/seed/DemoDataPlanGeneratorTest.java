package com.padel.reservas.seed;

import com.padel.reservas.entities.EstadoPista;
import com.padel.reservas.entities.EstadoReserva;
import com.padel.reservas.entities.FranjaReservada;
import com.padel.reservas.entities.Pista;
import com.padel.reservas.entities.Reserva;
import com.padel.reservas.entities.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class DemoDataPlanGeneratorTest {

    private List<Pista> pistas;
    private final LocalDate fechaReferencia = LocalDate.of(2026, 10, 10);

    @BeforeEach
    void setUp() {
        Pista p1 = new Pista();
        p1.setId(1L);
        p1.setNumeroPista(1);
        p1.setPrecioHora(new BigDecimal("20.00"));
        p1.setEstado(EstadoPista.ACTIVA);

        Pista p2 = new Pista();
        p2.setId(2L);
        p2.setNumeroPista(2);
        p2.setPrecioHora(new BigDecimal("20.00"));
        p2.setEstado(EstadoPista.ACTIVA);

        Pista p3 = new Pista();
        p3.setId(3L);
        p3.setNumeroPista(3);
        p3.setPrecioHora(new BigDecimal("25.00"));
        p3.setEstado(EstadoPista.ACTIVA);

        Pista p4 = new Pista();
        p4.setId(4L);
        p4.setNumeroPista(4);
        p4.setPrecioHora(new BigDecimal("20.00"));
        p4.setEstado(EstadoPista.MANTENIMIENTO);

        pistas = List.of(p1, p2, p3, p4);
    }

    @Test
    void generate_determinismoSemilla_produceMismosDatos() {
        DemoDataPlanGenerator.DemoDataPlan plan1 = DemoDataPlanGenerator.generate(pistas, fechaReferencia, 42L, "hash");
        DemoDataPlanGenerator.DemoDataPlan plan2 = DemoDataPlanGenerator.generate(pistas, fechaReferencia, 42L, "hash");

        assertEquals(plan1.usuarios().size(), plan2.usuarios().size());
        assertEquals(plan1.reservas().size(), plan2.reservas().size());

        for (int i = 0; i < plan1.usuarios().size(); i++) {
            Usuario u1 = plan1.usuarios().get(i);
            Usuario u2 = plan2.usuarios().get(i);
            assertEquals(u1.getEmail(), u2.getEmail());
            assertEquals(u1.getNombre(), u2.getNombre());
        }

        for (int i = 0; i < plan1.reservas().size(); i++) {
            Reserva r1 = plan1.reservas().get(i);
            Reserva r2 = plan2.reservas().get(i);
            assertEquals(r1.getCodigoReserva(), r2.getCodigoReserva());
            assertEquals(r1.getFechaReserva(), r2.getFechaReserva());
            assertEquals(r1.getHoraInicio(), r2.getHoraInicio());
            assertEquals(r1.getHoraFin(), r2.getHoraFin());
            assertEquals(r1.getEstado(), r2.getEstado());
        }
    }

    @Test
    void generate_usuariosValidosYSeguros() {
        DemoDataPlanGenerator.DemoDataPlan plan = DemoDataPlanGenerator.generate(pistas, fechaReferencia, 42L, "hash");

        assertTrue(plan.usuarios().size() >= 30 && plan.usuarios().size() <= 60,
                "Debe generar entre 30 y 60 usuarios");

        for (Usuario u : plan.usuarios()) {
            assertNotNull(u.getEmail());
            assertTrue(u.getEmail().endsWith("@seed.invalid"), "El email debe usar el dominio RFC 6761 @seed.invalid");
            assertEquals("ROLE_USER", u.getRoles());
            assertTrue(u.getEnabled());
            assertNotNull(u.getNombre());
            assertNotNull(u.getApellidos());
            assertNotNull(u.getTelefono());
        }
    }

    @Test
    void generate_volumenYDistribucionReservas() {
        DemoDataPlanGenerator.DemoDataPlan plan = DemoDataPlanGenerator.generate(pistas, fechaReferencia, 42L, "hash");

        assertTrue(plan.reservas().size() >= 800 && plan.reservas().size() <= 1500,
                "El volumen de reservas debe estar entre 800 y 1500 (actual: " + plan.reservas().size() + ")");

        long confirmadas = plan.reservas().stream().filter(r -> r.getEstado() == EstadoReserva.CONFIRMADA).count();
        long canceladas = plan.reservas().stream().filter(r -> r.getEstado() == EstadoReserva.CANCELADA).count();

        assertTrue(confirmadas > 0);
        assertTrue(canceladas > 0);
        double ratioCanceladas = (double) canceladas / plan.reservas().size();
        assertTrue(ratioCanceladas >= 0.03 && ratioCanceladas <= 0.15,
                "El ratio de canceladas debe rondar entre 3% y 15% (actual: " + ratioCanceladas + ")");

        // Validar que las canceladas tienen fechaCancelacion y no tienen franjas
        for (Reserva r : plan.reservas()) {
            if (r.getEstado() == EstadoReserva.CANCELADA) {
                assertNotNull(r.getFechaCancelacion(), "Reserva cancelada debe tener fechaCancelacion");
                assertTrue(r.getFranjas().isEmpty(), "Reserva cancelada no debe tener franjas activas");
            } else {
                assertFalse(r.getFranjas().isEmpty(), "Reserva confirmada debe tener franjas");
            }
        }

        // Pista 4 está en mantenimiento: 0 reservas asociadas
        boolean pistaMantenimientoTieneReservas = plan.reservas().stream()
                .anyMatch(r -> r.getPista().getId().equals(4L));
        assertFalse(pistaMantenimientoTieneReservas, "Pistas en mantenimiento no deben recibir reservas");
    }

    @Test
    void generate_ausenciaTotalDeSolapamientosEnPistas() {
        DemoDataPlanGenerator.DemoDataPlan plan = DemoDataPlanGenerator.generate(pistas, fechaReferencia, 42L, "hash");

        Set<String> slots = new HashSet<>();
        for (Reserva r : plan.reservas()) {
            if (r.getEstado() == EstadoReserva.CONFIRMADA) {
                for (FranjaReservada franja : r.getFranjas()) {
                    String slotKey = franja.getPista().getId() + "#" + franja.getFecha() + "#" + franja.getHoraSlot();
                    boolean added = slots.add(slotKey);
                    assertTrue(added, "Solapamiento detectado en pista: " + slotKey);
                }
            }
        }
    }

    @Test
    void generate_limitesYNoSolapamientoPorUsuario() {
        DemoDataPlanGenerator.DemoDataPlan plan = DemoDataPlanGenerator.generate(pistas, fechaReferencia, 42L, "hash");

        // Agrupar reservas confirmadas por usuario y fecha
        Map<String, List<Reserva>> porUsuarioYFecha = new HashMap<>();
        for (Reserva r : plan.reservas()) {
            if (r.getEstado() == EstadoReserva.CONFIRMADA) {
                String key = r.getUsuario().getEmail() + "#" + r.getFechaReserva();
                porUsuarioYFecha.computeIfAbsent(key, k -> new ArrayList<>()).add(r);
            }
        }

        for (Map.Entry<String, List<Reserva>> entry : porUsuarioYFecha.entrySet()) {
            List<Reserva> lista = entry.getValue();
            long minutosTotales = 0;

            for (int i = 0; i < lista.size(); i++) {
                Reserva r1 = lista.get(i);
                long mins = java.time.Duration.between(r1.getHoraInicio(), r1.getHoraFin()).toMinutes();
                minutosTotales += mins;

                for (int j = i + 1; j < lista.size(); j++) {
                    Reserva r2 = lista.get(j);
                    boolean seSolapan = r1.getHoraInicio().isBefore(r2.getHoraFin()) &&
                            r1.getHoraFin().isAfter(r2.getHoraInicio());
                    assertFalse(seSolapan, "El usuario tiene reservas solapadas en la misma franja: " + entry.getKey());
                }
            }

            assertTrue(minutosTotales <= 120, "El usuario supera los 120 minutos en el mismo día: " + entry.getKey());
        }
    }

    @Test
    void generate_concentracionEnHorasPico() {
        DemoDataPlanGenerator.DemoDataPlan plan = DemoDataPlanGenerator.generate(pistas, fechaReferencia, 42L, "hash");

        long enHorasPico = plan.reservas().stream()
                .filter(r -> !r.getHoraInicio().isBefore(LocalTime.of(18, 0)) &&
                        !r.getHoraInicio().isAfter(LocalTime.of(21, 0)))
                .count();

        double ratioPico = (double) enHorasPico / plan.reservas().size();
        assertTrue(ratioPico >= 0.40,
                "Al menos el 40% de las reservas deben concentrarse en horario pico 18:00-21:00 (actual: " + ratioPico + ")");
    }
}
