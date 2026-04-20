package hernandez_ocampo_hernandez.demo.repositories;


import hernandez_ocampo_hernandez.demo.entities.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
	List<Reserva> findByUsuarioEmail(String email);

	Optional<Reserva> findByIdAndUsuarioEmail(Long id, String email);

}
