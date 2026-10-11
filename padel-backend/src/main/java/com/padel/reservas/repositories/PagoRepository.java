package com.padel.reservas.repositories;

import com.padel.reservas.entities.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByReservaId(Long reservaId);
    List<Pago> findByUsuarioId(Long usuarioId);
}
