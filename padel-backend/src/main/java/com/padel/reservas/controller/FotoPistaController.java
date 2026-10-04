package com.padel.reservas.controller;

import com.padel.reservas.dto.SubidaResult;
import com.padel.reservas.entities.FotoPista;
import com.padel.reservas.entities.Pista;
import com.padel.reservas.repositories.FotoPistaRepository;
import com.padel.reservas.repositories.PistaRepository;
import com.padel.reservas.services.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class FotoPistaController {

    private static final int MAX_FOTOS = 5;

    private final FotoPistaRepository fotoPistaRepository;
    private final PistaRepository pistaRepository;
    private final CloudinaryService cloudinaryService;

    @GetMapping("/pistas/{pistaId}/fotos")
    public ResponseEntity<List<FotoPista>> getFotos(@PathVariable Long pistaId) {
        return ResponseEntity.ok(
            fotoPistaRepository.findByPistaIdOrderByOrden(pistaId));
    }

    @PostMapping("/pistas/{pistaId}/fotos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> subirFoto(
            @PathVariable Long pistaId,
            @RequestParam("file") MultipartFile file) throws Exception {

        if (fotoPistaRepository.countByPistaId(pistaId) >= MAX_FOTOS) {
            return ResponseEntity.badRequest()
                .body("La pista ya tiene el máximo de " + MAX_FOTOS + " fotos");
        }

        Pista pista = pistaRepository.findById(pistaId)
            .orElseThrow(() -> new RuntimeException("Pista no encontrada"));

        SubidaResult resultado = cloudinaryService.subir(
            file, "pistas", 1920);

        long totalFotos = fotoPistaRepository.countByPistaId(pistaId);
        boolean esLaPrimera = totalFotos == 0;

        FotoPista foto = new FotoPista();
        foto.setPista(pista);
        foto.setUrl(resultado.url());
        foto.setPublicId(resultado.publicId());
        foto.setEsPortada(esLaPrimera);
        foto.setOrden((int) totalFotos);

        FotoPista guardada = fotoPistaRepository.save(foto);

        // Si es la primera foto, sincroniza imagenUrl en Pista
        if (esLaPrimera) {
            pista.setImagenUrl(resultado.url());
            pistaRepository.save(pista);
        }

        return ResponseEntity.status(201).body(guardada);
    }

    @DeleteMapping("/pistas/{pistaId}/fotos/{fotoId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarFoto(
            @PathVariable Long pistaId,
            @PathVariable Long fotoId) throws Exception {

        FotoPista foto = fotoPistaRepository.findById(fotoId)
            .orElseThrow(() -> new RuntimeException("Foto no encontrada"));

        boolean eraPortada = foto.isEsPortada();
        String publicId = foto.getPublicId();

        // 1. Borrar de Cloudinary primero (RGPD)
        cloudinaryService.eliminar(publicId);
        // 2. Borrar de BD
        fotoPistaRepository.delete(foto);

        // Si era portada, promover la siguiente foto
        if (eraPortada) {
            List<FotoPista> restantes =
                fotoPistaRepository.findByPistaIdOrderByOrden(pistaId);
            if (!restantes.isEmpty()) {
                FotoPista nueva = restantes.get(0);
                nueva.setEsPortada(true);
                fotoPistaRepository.save(nueva);

                pistaRepository.findById(pistaId).ifPresent(p -> {
                    p.setImagenUrl(nueva.getUrl());
                    pistaRepository.save(p);
                });
            } else {
                // No quedan fotos — limpiar imagenUrl
                pistaRepository.findById(pistaId).ifPresent(p -> {
                    p.setImagenUrl(null);
                    pistaRepository.save(p);
                });
            }
        }

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/pistas/{pistaId}/fotos/{fotoId}/portada")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> setPortada(
            @PathVariable Long pistaId,
            @PathVariable Long fotoId) {

        List<FotoPista> fotos =
            fotoPistaRepository.findByPistaIdOrderByOrden(pistaId);

        fotos.forEach(f -> {
            f.setEsPortada(f.getId().equals(fotoId));
        });
        fotoPistaRepository.saveAll(fotos);

        fotos.stream()
            .filter(f -> f.getId().equals(fotoId))
            .findFirst()
            .ifPresent(nueva -> pistaRepository.findById(pistaId).ifPresent(p -> {
                p.setImagenUrl(nueva.getUrl());
                pistaRepository.save(p);
            }));

        return ResponseEntity.ok(Map.of("ok", true));
    }
}
