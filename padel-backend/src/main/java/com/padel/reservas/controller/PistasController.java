package com.padel.reservas.controller;

import com.padel.reservas.entities.FotoPista;
import com.padel.reservas.entities.Pista;
import com.padel.reservas.repositories.FotoPistaRepository;
import com.padel.reservas.repositories.PistaRepository;
import com.padel.reservas.services.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class PistasController {

    private final PistaRepository pistaRepository;
    private final FotoPistaRepository fotoPistaRepository;
    private final CloudinaryService cloudinaryService;

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
    @PreAuthorize("hasRole('ADMIN')")
    @com.padel.reservas.config.NoDemoAdmin
    public ResponseEntity<Object> deletePista(@PathVariable Long id) {
        return pistaRepository.findById(id)
                .map(pista -> {
                    // Borrar fotos de Cloudinary antes de borrar la pista (RGPD)
                    List<FotoPista> fotos = fotoPistaRepository.findByPistaIdOrderByOrden(id);
                    for (FotoPista foto : fotos) {
                        try {
                            cloudinaryService.eliminar(foto.getPublicId());
                        } catch (Exception e) {
                            // ponytail: si falla el borrado de una foto en Cloudinary,
                            // continuamos — la fila de BD la borra el cascade de Pista.
                        }
                    }
                    pistaRepository.deleteById(id);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> {
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping("/pistas")
    @PreAuthorize("hasRole('ADMIN')")
    @com.padel.reservas.config.NoDemoAdmin
    public ResponseEntity<Pista> createPista(@RequestBody Pista pista) {
        Pista savedPista = pistaRepository.save(pista);
        return ResponseEntity.status(201).body(savedPista);
    }

    @PutMapping("/pistas/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @com.padel.reservas.config.NoDemoAdmin
    public ResponseEntity<Pista> updatePista(@RequestBody Pista pistaNueva, @PathVariable Long id) {
        Optional<Pista> pista = pistaRepository.findById(id);
        if (pista.isPresent()) {
            pista.get().setNumeroPista(pistaNueva.getNumeroPista());
            pista.get().setTieneIluminacion(pistaNueva.isTieneIluminacion());
            pista.get().setComentarios(pistaNueva.getComentarios());
            pista.get().setImagenUrl(pistaNueva.getImagenUrl());
            pista.get().setFechaModificacion(pistaNueva.getFechaModificacion());
            pistaRepository.save(pista.get());
            return ResponseEntity.ok(pista.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
