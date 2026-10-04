package com.padel.reservas.controller;

import com.padel.reservas.dto.UpdateConfiguracionDTO;
import com.padel.reservas.entities.ConfiguracionClub;
import com.padel.reservas.services.ConfiguracionClubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AdminController {

    private final ConfiguracionClubService configuracionService;

    @GetMapping("/admin/configuracion")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracionClub> getConfiguracion() {
        return ResponseEntity.ok(configuracionService.getConfiguracion());
    }

    @PutMapping("/admin/configuracion")
    @PreAuthorize("hasRole('ADMIN')")
    @com.padel.reservas.config.NoDemoAdmin
    public ResponseEntity<ConfiguracionClub> actualizarConfiguracion(
            @RequestBody UpdateConfiguracionDTO dto) {
        return ResponseEntity.ok(configuracionService.actualizar(dto));
    }

    // Endpoint público — solo devuelve las duraciones para el formulario
    // de reserva del frontend, sin exponer el resto de la configuración
    @GetMapping("/configuracion/duraciones")
    public ResponseEntity<Map<String, Object>> getDuraciones() {
        ConfiguracionClub config = configuracionService.getConfiguracion();
        return ResponseEntity.ok(Map.of(
            "duracionesPermitidas", config.getDuracionesPermitidas(),
            "duracionPorDefecto", config.getDuracionPorDefectoMinutos()
        ));
    }
}
