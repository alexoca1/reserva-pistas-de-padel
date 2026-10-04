package com.padel.reservas.repositories;

import com.padel.reservas.entities.EstadoReserva;
import com.padel.reservas.entities.Reserva;
import com.padel.reservas.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
	List<Reserva> findByUsuarioEmail(String email);

	Optional<Reserva> findByIdAndUsuarioEmail(Long id, String email);

	List<Reserva> findByPistaIdAndFechaReserva(Long pistaId, LocalDate fechaReserva);

	List<Reserva> findByUsuarioAndFechaReservaAndEstado(Usuario usuario, LocalDate fechaReserva, EstadoReserva estado);
}
