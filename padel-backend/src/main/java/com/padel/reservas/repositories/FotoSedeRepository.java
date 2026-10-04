package com.padel.reservas.repositories;

import com.padel.reservas.entities.FotoSede;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FotoSedeRepository extends JpaRepository<FotoSede, Long> {
    List<FotoSede> findAllByOrderByOrden();
}
