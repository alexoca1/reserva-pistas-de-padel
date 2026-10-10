package com.padel.reservas.services;

import com.padel.reservas.dto.CreateReservaDTO;
import com.padel.reservas.entities.ConfiguracionClub;
import com.padel.reservas.entities.EstadoPista;
import com.padel.reservas.entities.EstadoReserva;
import com.padel.reservas.entities.FranjaReservada;
import com.padel.reservas.entities.Pista;
import com.padel.reservas.entities.Reserva;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.exception.PistaEnMantenimientoException;
import com.padel.reservas.exception.ReservaSolapadaException;
import com.padel.reservas.repositories.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private static final int MINUTOS_POR_FRANJA = 30;

    private final ReservaRepository reservaRepository;
    private final ConfiguracionClubService configuracionClubService;

    /** Crea una reserva y sus franjas atómicas en una única transacción. */
    @Transactional
    public Reserva crear(CreateReservaDTO dto, Pista pista, Usuario titular) {
        validarEstadoPista(pista);
        LocalTime inicio = LocalTime.parse(dto.horaInicio());
        LocalTime fin = LocalTime.parse(dto.horaFin());

        validarDuracionYHorario(inicio, fin);
        validarLimitesYSolapamientoUsuario(titular, dto.fechaReserva(), null, inicio, fin);

        Reserva reserva = new Reserva();
        reserva.setFechaReserva(dto.fechaReserva());
        reserva.setHoraInicio(inicio);
        reserva.setHoraFin(fin);
        reserva.setNombreJugador(dto.nombreJugador());
        reserva.setTelefono(dto.telefono());
        reserva.setPista(pista);
        reserva.setUsuario(titular);
        reserva.setEstado(EstadoReserva.CONFIRMADA);

        aplicarFranjas(reserva, pista);
        Reserva guardada = guardarConTraduccionDeConflicto(reserva);

        if (guardada.getCodigoReserva() == null) {
            String codigo = String.format("RES-%s-%03d",
                    guardada.getFechaReserva().format(DateTimeFormatter.ofPattern("yyyy-MMdd")),
                    guardada.getId());
            guardada.setCodigoReserva(codigo);
            guardada = reservaRepository.save(guardada);
        }

        return guardada;
    }

    /** Actualiza una reserva existente, liberando sus franjas antiguas y reclamando las nuevas. */
    @Transactional
    public Reserva actualizar(Reserva reserva, CreateReservaDTO dto, Pista pista) {
        validarEstadoPista(pista);
        LocalTime inicio = LocalTime.parse(dto.horaInicio());
        LocalTime fin = LocalTime.parse(dto.horaFin());

        validarDuracionYHorario(inicio, fin);
        validarLimitesYSolapamientoUsuario(reserva.getUsuario(), dto.fechaReserva(), reserva.getId(), inicio, fin);

        reserva.setFechaReserva(dto.fechaReserva());
        reserva.setHoraInicio(inicio);
        reserva.setHoraFin(fin);
        reserva.setNombreJugador(dto.nombreJugador());
        reserva.setTelefono(dto.telefono());
        reserva.setPista(pista);

        reserva.getFranjas().clear(); // orphanRemoval marca las antiguas para borrado
        aplicarFranjas(reserva, pista);
        return guardarConTraduccionDeConflicto(reserva);
    }

    private void validarEstadoPista(Pista pista) {
        if (pista != null && pista.getEstado() == EstadoPista.MANTENIMIENTO) {
            throw new PistaEnMantenimientoException("La pista se encuentra actualmente en mantenimiento y no admite reservas");
        }
    }

    private void validarDuracionYHorario(LocalTime inicio, LocalTime fin) {
        ConfiguracionClub config = configuracionClubService.getConfiguracion();
        long duracionMinutos = Duration.between(inicio, fin).toMinutes();
        if (!config.getDuracionesPermitidas().contains((int) duracionMinutos)) {
            throw new IllegalArgumentException("La duración de la reserva no está permitida por la configuración del club.");
        }
        if (fin.isAfter(config.getHoraCierre())) {
            throw new IllegalArgumentException("La reserva no cabe en el horario de apertura (hasta las " + config.getHoraCierre() + ").");
        }
    }

    private void validarLimitesYSolapamientoUsuario(Usuario usuario, java.time.LocalDate fecha, Long reservaIdActual, LocalTime inicio, LocalTime fin) {
        ConfiguracionClub config = configuracionClubService.getConfiguracion();
        List<Reserva> confirmadas = reservaRepository.findByUsuarioAndFechaReservaAndEstado(usuario, fecha, EstadoReserva.CONFIRMADA);
        List<Reserva> otrasReservas = confirmadas.stream()
                .filter(r -> reservaIdActual == null || !r.getId().equals(reservaIdActual))
                .toList();

        // 1. Validar solapamiento de horario para el mismo usuario en cualquier pista
        for (Reserva r : otrasReservas) {
            if (r.getHoraInicio().isBefore(fin) && r.getHoraFin().isAfter(inicio)) {
                throw new ReservaSolapadaException(
                        String.format("El usuario ya tiene otra reserva en esa misma franja horaria (%s - %s).",
                                r.getHoraInicio(), r.getHoraFin())
                );
            }
        }

        // 2. Validar límite diario de minutos (máximo 2 horas por día = 120 minutos)
        long minutosExistentes = otrasReservas.stream()
                .mapToLong(r -> Duration.between(r.getHoraInicio(), r.getHoraFin()).toMinutes())
                .sum();

        long duracionNueva = Duration.between(inicio, fin).toMinutes();
        if (minutosExistentes + duracionNueva > config.getMaximoMinutosPorDia()) {
            long maxHoras = config.getMaximoMinutosPorDia() / 60;
            throw new IllegalArgumentException(
                    "Límite diario superado: solo se permite reservar un máximo de " + maxHoras + " horas (" + config.getMaximoMinutosPorDia() + " minutos) por día."
            );
        }
    }

    private void aplicarFranjas(Reserva reserva, Pista pista) {
        List<FranjaReservada> franjas = new ArrayList<>();
        LocalTime inicio = reserva.getHoraInicio();
        LocalTime fin = reserva.getHoraFin();

        for (LocalTime hora = inicio; hora.isBefore(fin); hora = hora.plusMinutes(MINUTOS_POR_FRANJA)) {
            FranjaReservada franja = new FranjaReservada();
            franja.setPista(pista);
            franja.setFecha(reserva.getFechaReserva());
            franja.setHoraSlot(hora);
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
}
