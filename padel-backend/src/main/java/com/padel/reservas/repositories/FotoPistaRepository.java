package com.padel.reservas.repositories;

import com.padel.reservas.entities.FotoPista;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FotoPistaRepository extends JpaRepository<FotoPista, Long> {
    List<FotoPista> findByPistaIdOrderByOrden(Long pistaId);
    long countByPistaId(Long pistaId);
}
