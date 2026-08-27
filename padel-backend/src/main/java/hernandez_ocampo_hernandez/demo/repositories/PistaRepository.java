package hernandez_ocampo_hernandez.demo.repositories;

import hernandez_ocampo_hernandez.demo.entities.Pista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PistaRepository extends JpaRepository<Pista, Long> {

}
