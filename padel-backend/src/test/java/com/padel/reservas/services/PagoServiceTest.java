package com.padel.reservas.services;

import com.padel.reservas.entities.*;
import com.padel.reservas.repositories.PagoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PagoServiceTest {

    @Mock
    private PagoRepository pagoRepository;

    @Mock
    private ConfiguracionClubService configuracionClubService;

    @InjectMocks
    private PagoService pagoService;

    private Reserva reserva;
    private ConfiguracionClub config;

    @BeforeEach
    void setUp() {
        Pista pista = new Pista();
        pista.setPrecioHora(new BigDecimal("10.00"));
        pista.setNumeroPista(1);

        reserva = new Reserva();
        reserva.setId(1L);
        reserva.setPista(pista);
        reserva.setHoraInicio(LocalTime.of(10, 0));
        reserva.setHoraFin(LocalTime.of(11, 30)); // 90 mins -> 15.00
        reserva.setFechaReserva(LocalDate.now().plusDays(2));
        reserva.setCodigoReserva("RES-TEST-001");
        reserva.setUsuario(new Usuario());

        config = new ConfiguracionClub();
        config.setHorasCancelacionGratuita(24);
    }

    @Test
    void testRegistrarCobro() {
        when(pagoRepository.save(any(Pago.class))).thenAnswer(i -> i.getArguments()[0]);

        Pago pago = pagoService.registrarCobro(reserva, MetodoPago.TARJETA_SIMULADA);

        assertNotNull(pago);
        assertEquals(TipoPago.COBRO, pago.getTipo());
        assertEquals(new BigDecimal("15.00"), pago.getImporte());
        assertEquals(MetodoPago.TARJETA_SIMULADA, pago.getMetodo());
    }

    @Test
    void testCalcularImporteReembolso_SinCobro() {
        when(pagoRepository.findByReservaId(reserva.getId())).thenReturn(Collections.emptyList());

        BigDecimal importe = pagoService.calcularImporteReembolso(reserva, false, true);
        assertEquals(BigDecimal.ZERO, importe);
    }

    @Test
    void testCalcularImporteReembolso_Mas24h_100() {
        Pago cobro = Pago.builder().tipo(TipoPago.COBRO).importe(new BigDecimal("15.00")).build();
        when(pagoRepository.findByReservaId(reserva.getId())).thenReturn(List.of(cobro));
        when(configuracionClubService.getConfiguracion()).thenReturn(config);

        // Reserva es en 2 días, por lo que antelación es > 24h
        BigDecimal importe = pagoService.calcularImporteReembolso(reserva, false, true);
        assertEquals(new BigDecimal("15.00"), importe);
    }

    @Test
    void testCalcularImporteReembolso_Menos24h_Mas6h_50() {
        Pago cobro = Pago.builder().tipo(TipoPago.COBRO).importe(new BigDecimal("20.00")).build();
        when(pagoRepository.findByReservaId(reserva.getId())).thenReturn(List.of(cobro));
        when(configuracionClubService.getConfiguracion()).thenReturn(config);

        LocalDateTime inicio = LocalDateTime.now().plusHours(10); // 10 horas de antelación -> Tramo 50%
        reserva.setFechaReserva(inicio.toLocalDate());
        reserva.setHoraInicio(inicio.toLocalTime()); 

        BigDecimal importe = pagoService.calcularImporteReembolso(reserva, false, true);
        assertEquals(new BigDecimal("10.0000"), importe);
    }

    @Test
    void testCalcularImporteReembolso_AdminNoTramos() {
        Pago cobro = Pago.builder().tipo(TipoPago.COBRO).importe(new BigDecimal("20.00")).build();
        when(pagoRepository.findByReservaId(reserva.getId())).thenReturn(List.of(cobro));

        // Reserva para dentro de 1 hora, pero admin no aplica tramos -> 100%
        reserva.setFechaReserva(LocalDate.now());
        reserva.setHoraInicio(LocalTime.now().plusHours(1));

        BigDecimal importe = pagoService.calcularImporteReembolso(reserva, true, false);
        assertEquals(new BigDecimal("20.00"), importe);
    }

    @Test
    void testRegistrarAjusteEdicion_Mayor() {
        when(pagoRepository.findByReservaId(reserva.getId())).thenReturn(Collections.emptyList());

        BigDecimal costeNuevo = new BigDecimal("25.00"); // costeAntes era 15.00
        pagoService.registrarAjusteEdicion(reserva, costeNuevo);

        verify(pagoRepository).save(argThat(p -> 
            p.getTipo() == TipoPago.COBRO && p.getImporte().compareTo(new BigDecimal("10.00")) == 0
        ));
    }

    @Test
    void testRegistrarAjusteEdicion_Menor() {
        when(pagoRepository.findByReservaId(reserva.getId())).thenReturn(Collections.emptyList());

        BigDecimal costeNuevo = new BigDecimal("5.00"); // costeAntes era 15.00
        pagoService.registrarAjusteEdicion(reserva, costeNuevo);

        verify(pagoRepository).save(argThat(p -> 
            p.getTipo() == TipoPago.REEMBOLSO && p.getImporte().compareTo(new BigDecimal("10.00")) == 0
        ));
    }
}
