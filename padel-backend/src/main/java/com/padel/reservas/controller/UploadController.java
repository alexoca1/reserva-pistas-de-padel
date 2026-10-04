package com.padel.reservas.controller;

import com.padel.reservas.dto.SubidaResult;
import com.padel.reservas.services.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class UploadController {

    private static final long MAX_BYTES = 10L * 1024 * 1024; // 10 MB

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<?> subir(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("El archivo está vacío");
        }
        if (file.getSize() > MAX_BYTES) {
            return ResponseEntity.badRequest()
                .body("El archivo supera el tamaño máximo permitido de 10 MB");
        }

        try {
            SubidaResult resultado = cloudinaryService.subir(file, "general", 1920);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error al subir la imagen: " + e.getMessage());
        }
    }
}
