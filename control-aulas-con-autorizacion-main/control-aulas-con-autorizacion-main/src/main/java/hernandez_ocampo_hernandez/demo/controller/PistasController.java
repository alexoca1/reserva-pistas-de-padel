package hernandez_ocampo_hernandez.demo.controller;

import hernandez_ocampo_hernandez.demo.entities.Pista;
import hernandez_ocampo_hernandez.demo.repositories.PistaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class PistasController {

    @Autowired
    PistaRepository pistaRepository;

    @GetMapping("/pistas")
    public ResponseEntity<List<Pista>> findAllPistas() {
        return ResponseEntity.ok(pistaRepository.findAll());
    }

    @GetMapping("/pistas/{id}")
    public ResponseEntity<Pista> findPista(@PathVariable Long id) {
        return pistaRepository.findById(id)
                .map(pista -> ResponseEntity.ok(pista))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/pistas/{id}")
    public ResponseEntity<Object> deletePista(@PathVariable Long id) {
        return pistaRepository.findById(id)
                .map(pista -> {
                    pistaRepository.deleteById(id);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> {
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping("/pistas")
    public ResponseEntity<Pista> createPista(@RequestBody Pista pista) {
        Pista savedPista = pistaRepository.save(pista);
        return ResponseEntity.status(201).body(savedPista);
    }

    @PutMapping("/pistas/{id}")
    public ResponseEntity<Pista> updatePista(@RequestBody Pista pistaNueva, @PathVariable Long id) {
        Optional<Pista> pista = pistaRepository.findById(id);
        if (pista.isPresent()) {
            pista.get().setNumeroPista(pistaNueva.getNumeroPista());
            pista.get().setTieneIluminacion(pistaNueva.isTieneIluminacion());
            pista.get().setComentarios(pistaNueva.getComentarios());
            pista.get().setFechaModificacion(pistaNueva.getFechaModificacion());
            pistaRepository.save(pista.get());
            return ResponseEntity.ok(pista.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }


}
