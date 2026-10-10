package com.padel.reservas.entities;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

class ReservaTest {

    @Test
    void getCosteEstimado_pistaConPrecio20Y90Minutos_devuelve30() {
        Pista pista = new Pista();
        pista.setPrecioHora(new BigDecimal("20.00"));

        Reserva reserva = new Reserva();
        reserva.setPista(pista);
        reserva.setHoraInicio(LocalTime.of(10, 0));
        reserva.setHoraFin(LocalTime.of(11, 30)); // 90 min

        assertEquals(new BigDecimal("30.00"), reserva.getCosteEstimado());
    }

    @Test
    void getCosteEstimado_pistaConPrecio25Y60Minutos_devuelve25() {
        Pista pista = new Pista();
        pista.setPrecioHora(new BigDecimal("25.00"));

        Reserva reserva = new Reserva();
        reserva.setPista(pista);
        reserva.setHoraInicio(LocalTime.of(18, 0));
        reserva.setHoraFin(LocalTime.of(19, 0)); // 60 min

        assertEquals(new BigDecimal("25.00"), reserva.getCosteEstimado());
    }

    @Test
    void getCosteEstimado_pistaConPrecio20Y120Minutos_devuelve40() {
        Pista pista = new Pista();
        pista.setPrecioHora(new BigDecimal("20.00"));

        Reserva reserva = new Reserva();
        reserva.setPista(pista);
        reserva.setHoraInicio(LocalTime.of(18, 0));
        reserva.setHoraFin(LocalTime.of(20, 0)); // 120 min

        assertEquals(new BigDecimal("40.00"), reserva.getCosteEstimado());
    }

    @Test
    void getCosteEstimado_pistaSinPrecio_devuelveNull() {
        Pista pista = new Pista();
        pista.setPrecioHora(null);

        Reserva reserva = new Reserva();
        reserva.setPista(pista);
        reserva.setHoraInicio(LocalTime.of(10, 0));
        reserva.setHoraFin(LocalTime.of(11, 30));

        assertNull(reserva.getCosteEstimado());
    }

    @Test
    void getCosteEstimado_sinPistaOHoras_devuelveNull() {
        Reserva reserva = new Reserva();
        assertNull(reserva.getCosteEstimado());
    }

    @Test
    void esJugada_confirmadaYFechaFinPasada_devuelveTrue() {
        Reserva reserva = new Reserva();
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        reserva.setFechaReserva(LocalDate.of(2026, 10, 8));
        reserva.setHoraInicio(LocalTime.of(10, 0));
        reserva.setHoraFin(LocalTime.of(11, 30));

        LocalDateTime ahora = LocalDateTime.of(2026, 10, 8, 12, 0);
        assertTrue(reserva.esJugada(ahora));
    }

    @Test
    void esJugada_confirmadaEnFuturo_devuelveFalse() {
        Reserva reserva = new Reserva();
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        reserva.setFechaReserva(LocalDate.of(2026, 10, 10));
        reserva.setHoraInicio(LocalTime.of(18, 0));
        reserva.setHoraFin(LocalTime.of(19, 30));

        LocalDateTime ahora = LocalDateTime.of(2026, 10, 10, 12, 0);
        assertFalse(reserva.esJugada(ahora));
    }

    @Test
    void esJugada_confirmadaEnCurso_devuelveFalse() {
        Reserva reserva = new Reserva();
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        reserva.setFechaReserva(LocalDate.of(2026, 10, 10));
        reserva.setHoraInicio(LocalTime.of(18, 0));
        reserva.setHoraFin(LocalTime.of(19, 30));

        LocalDateTime ahora = LocalDateTime.of(2026, 10, 10, 18, 30);
        assertFalse(reserva.esJugada(ahora));
    }

    @Test
    void esJugada_canceladaPasada_devuelveFalse() {
        Reserva reserva = new Reserva();
        reserva.setEstado(EstadoReserva.CANCELADA);
        reserva.setFechaReserva(LocalDate.of(2026, 10, 8));
        reserva.setHoraInicio(LocalTime.of(10, 0));
        reserva.setHoraFin(LocalTime.of(11, 30));

        LocalDateTime ahora = LocalDateTime.of(2026, 10, 8, 12, 0);
        assertFalse(reserva.esJugada(ahora), "Una reserva cancelada nunca debe considerarse jugada");
    }
}
