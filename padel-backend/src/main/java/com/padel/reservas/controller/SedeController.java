package com.padel.reservas.controller;

import com.padel.reservas.dto.SubidaResult;
import com.padel.reservas.entities.FotoSede;
import com.padel.reservas.repositories.FotoSedeRepository;
import com.padel.reservas.services.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SedeController {

    private static final int MAX_FOTOS_SEDE = 10;

    private final FotoSedeRepository fotoSedeRepository;
    private final CloudinaryService cloudinaryService;

    @GetMapping("/sede/fotos")
    public ResponseEntity<List<FotoSede>> getFotos() {
        return ResponseEntity.ok(fotoSedeRepository.findAllByOrderByOrden());
    }

    @PostMapping("/sede/fotos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> subirFoto(
            @RequestParam("file") MultipartFile file) throws Exception {

        if (fotoSedeRepository.count() >= MAX_FOTOS_SEDE) {
            return ResponseEntity.badRequest()
                .body("La sede ya tiene el máximo de "
                    + MAX_FOTOS_SEDE + " fotos");
        }

        SubidaResult resultado = cloudinaryService.subir(
            file, "sede", 1920);

        FotoSede foto = new FotoSede();
        foto.setUrl(resultado.url());
        foto.setPublicId(resultado.publicId());
        foto.setOrden((int) fotoSedeRepository.count());

        return ResponseEntity.status(201)
            .body(fotoSedeRepository.save(foto));
    }

    @DeleteMapping("/sede/fotos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarFoto(@PathVariable Long id)
            throws Exception {

        FotoSede foto = fotoSedeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Foto no encontrada"));

        cloudinaryService.eliminar(foto.getPublicId());
        fotoSedeRepository.delete(foto);
        return ResponseEntity.noContent().build();
    }
}
