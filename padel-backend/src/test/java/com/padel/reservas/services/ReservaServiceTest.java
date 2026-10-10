package com.padel.reservas.services;

import com.padel.reservas.dto.CreateReservaDTO;
import com.padel.reservas.entities.ConfiguracionClub;
import com.padel.reservas.entities.EstadoReserva;
import com.padel.reservas.entities.Pista;
import com.padel.reservas.entities.Reserva;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.exception.ReservaSolapadaException;
import com.padel.reservas.repositories.ReservaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ReservaServiceTest {

    @Mock private ReservaRepository reservaRepository;
    @Mock private ConfiguracionClubService configuracionClubService;
    private ReservaService reservaService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ConfiguracionClub config = new ConfiguracionClub();
        when(configuracionClubService.getConfiguracion()).thenReturn(config);
        reservaService = new ReservaService(reservaRepository, configuracionClubService);
    }

    @Test
    void crear_reservaDe90Minutos_generaTresFranjas() {
        when(reservaRepository.saveAndFlush(any(Reserva.class))).thenAnswer(inv -> {
            Reserva r = inv.getArgument(0);
            if (r.getId() == null) r.setId(1L);
            return r;
        });
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateReservaDTO dto = new CreateReservaDTO(
                LocalDate.of(2026, 12, 1), "10:00", "11:30", "Ana", "600111222", 1L, null);
        Reserva resultado = reservaService.crear(dto, new Pista(), new Usuario());

        assertEquals(3, resultado.getFranjas().size());
        assertEquals(LocalTime.of(10, 0), resultado.getFranjas().get(0).getHoraSlot());
        assertEquals(LocalTime.of(10, 30), resultado.getFranjas().get(1).getHoraSlot());
        assertEquals(LocalTime.of(11, 0), resultado.getFranjas().get(2).getHoraSlot());
        assertNotNull(resultado.getCodigoReserva());
        assertTrue(resultado.getCodigoReserva().startsWith("RES-2026-1201-"));
    }

    @Test
    void crear_conflictoDeFranja_seTraduceA409() {
        when(reservaRepository.saveAndFlush(any(Reserva.class)))
                .thenThrow(new DataIntegrityViolationException("uk_pista_fecha_slot"));

        CreateReservaDTO dto = new CreateReservaDTO(
                LocalDate.of(2026, 12, 1), "10:00", "11:00", "Ana", "600111222", 1L, null);

        assertThrows(ReservaSolapadaException.class,
                () -> reservaService.crear(dto, new Pista(), new Usuario()));
    }

    @Test
    void crear_reserva120MinutosEmpezandoDemasiadoTarde_esRechazada() {
        CreateReservaDTO dto = new CreateReservaDTO(
                LocalDate.of(2026, 12, 1), "21:30", "23:30", "Ana", "600111222", 1L, null);

        assertThrows(IllegalArgumentException.class,
                () -> reservaService.crear(dto, new Pista(), new Usuario()));
    }

    @Test
    void crear_superaLimiteDiario120Minutos_esRechazada() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        LocalDate fecha = LocalDate.of(2026, 12, 1);

        Reserva previa = new Reserva();
        previa.setId(10L);
        previa.setHoraInicio(LocalTime.of(10, 0));
        previa.setHoraFin(LocalTime.of(11, 0)); // 60 min
        previa.setEstado(EstadoReserva.CONFIRMADA);

        when(reservaRepository.findByUsuarioAndFechaReservaAndEstado(usuario, fecha, EstadoReserva.CONFIRMADA))
                .thenReturn(List.of(previa));

        CreateReservaDTO dto90 = new CreateReservaDTO(
                fecha, "14:00", "15:30", "Ana", "600111222", 1L, null); // 90 min -> total 150 min > 120 min

        assertThrows(IllegalArgumentException.class,
                () -> reservaService.crear(dto90, new Pista(), usuario));
    }

    @Test
    void crear_mismoUsuarioMismaFranjaOtraPista_esRechazada() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        LocalDate fecha = LocalDate.of(2026, 12, 1);

        Reserva previa = new Reserva();
        previa.setId(10L);
        previa.setHoraInicio(LocalTime.of(18, 0));
        previa.setHoraFin(LocalTime.of(19, 0)); // 60 min en Pista 1
        previa.setEstado(EstadoReserva.CONFIRMADA);

        when(reservaRepository.findByUsuarioAndFechaReservaAndEstado(usuario, fecha, EstadoReserva.CONFIRMADA))
                .thenReturn(List.of(previa));

        CreateReservaDTO dtoMismaFranja = new CreateReservaDTO(
                fecha, "18:00", "19:00", "Ana", "600111222", 2L, null); // Intentar 60 min en Pista 2 mismo horario

        assertThrows(ReservaSolapadaException.class,
                () -> reservaService.crear(dtoMismaFranja, new Pista(), usuario));
    }

    @Test
    void crear_duracionNoEnConfiguracion_lanzaError() {
        ConfiguracionClub configRestrictiva = new ConfiguracionClub();
        configRestrictiva.setDuracionesPermitidasMinutos("60"); // solo 60 min
        when(configuracionClubService.getConfiguracion()).thenReturn(configRestrictiva);

        CreateReservaDTO dto90 = new CreateReservaDTO(
                LocalDate.of(2026, 12, 1), "10:00", "11:30", "Ana", "600111222", 1L, null);

        assertThrows(IllegalArgumentException.class,
                () -> reservaService.crear(dto90, new Pista(), new Usuario()));
    }

    @Test
    void crear_fueraDeCierre_segunConfiguracion_lanzaError() {
        ConfiguracionClub configTemprana = new ConfiguracionClub();
        configTemprana.setHoraCierre(LocalTime.of(22, 0));
        when(configuracionClubService.getConfiguracion()).thenReturn(configTemprana);

        CreateReservaDTO dto = new CreateReservaDTO(
                LocalDate.of(2026, 12, 1), "21:30", "22:30", "Ana", "600111222", 1L, null);

        assertThrows(IllegalArgumentException.class,
                () -> reservaService.crear(dto, new Pista(), new Usuario()));
    }

    @Test
    void actualizar_cambioDuracion_liberaAntiguasYReclamaNuevas() {
        when(reservaRepository.saveAndFlush(any(Reserva.class))).thenAnswer(inv -> inv.getArgument(0));

        Pista pista = new Pista();
        Usuario usuario = new Usuario();
        usuario.setId(1L);

        Reserva reservaExistente = new Reserva();
        reservaExistente.setId(1L);
        reservaExistente.setFechaReserva(LocalDate.of(2026, 12, 1));
        reservaExistente.setHoraInicio(LocalTime.of(10, 0));
        reservaExistente.setHoraFin(LocalTime.of(11, 0));
        reservaExistente.setUsuario(usuario);
        reservaExistente.setPista(pista);

        CreateReservaDTO dtoActualizado = new CreateReservaDTO(
                LocalDate.of(2026, 12, 1), "10:00", "11:30", "Ana", "600111222", 1L, null); // 90 min

        Reserva resultado = reservaService.actualizar(reservaExistente, dtoActualizado, pista);

        assertEquals(3, resultado.getFranjas().size());
        assertEquals(LocalTime.of(10, 0), resultado.getHoraInicio());
        assertEquals(LocalTime.of(11, 30), resultado.getHoraFin());
    }

    @Test
    void crear_pistaEnMantenimiento_lanzaPistaEnMantenimientoException() {
        Pista pistaMantenimiento = new Pista();
        pistaMantenimiento.setId(2L);
        pistaMantenimiento.setEstado(com.padel.reservas.entities.EstadoPista.MANTENIMIENTO);

        CreateReservaDTO dto = new CreateReservaDTO(
                LocalDate.of(2026, 12, 1), "10:00", "11:30", "Ana", "600111222", 2L, null);

        assertThrows(com.padel.reservas.exception.PistaEnMantenimientoException.class,
                () -> reservaService.crear(dto, pistaMantenimiento, new Usuario()));
    }

    @Test
    void actualizar_pistaEnMantenimiento_lanzaPistaEnMantenimientoException() {
        Pista pistaMantenimiento = new Pista();
        pistaMantenimiento.setId(2L);
        pistaMantenimiento.setEstado(com.padel.reservas.entities.EstadoPista.MANTENIMIENTO);

        Reserva reservaExistente = new Reserva();
        reservaExistente.setId(1L);

        CreateReservaDTO dto = new CreateReservaDTO(
                LocalDate.of(2026, 12, 1), "10:00", "11:30", "Ana", "600111222", 2L, null);

        assertThrows(com.padel.reservas.exception.PistaEnMantenimientoException.class,
                () -> reservaService.actualizar(reservaExistente, dto, pistaMantenimiento));
    }
}
