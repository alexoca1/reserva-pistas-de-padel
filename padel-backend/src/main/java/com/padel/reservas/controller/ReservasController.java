package com.padel.reservas.controller;

import com.padel.reservas.dto.CreateReservaDTO;
import com.padel.reservas.dto.DisponibilidadDiaDTO;
import com.padel.reservas.dto.FranjaDTO;
import com.padel.reservas.dto.FranjaOcupadaDTO;
import com.padel.reservas.entities.EstadoReserva;
import com.padel.reservas.entities.Pista;
import com.padel.reservas.entities.Reserva;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.repositories.PistaRepository;
import com.padel.reservas.repositories.ReservaRepository;
import com.padel.reservas.repositories.UsuarioRepository;
import com.padel.reservas.services.ReservaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
public class ReservasController {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private PistaRepository pistaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ReservaService reservaService;

    @GetMapping("/reservas")
    public ResponseEntity<List<Reserva>> findAllReservas(Authentication authentication) {
        List<Reserva> reservas = isAdmin(authentication)
                ? reservaRepository.findAll()
                : reservaRepository.findByUsuarioEmail(authentication.getName());
        return ResponseEntity.ok(reservas);
    }

    @GetMapping("/reservas/disponibilidad")
    public ResponseEntity<List<FranjaOcupadaDTO>> getDisponibilidad(
            @RequestParam Long pistaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        List<FranjaOcupadaDTO> franjas = reservaRepository.findByPistaIdAndFechaReserva(pistaId, fecha).stream()
                .filter(r -> r.getEstado() == EstadoReserva.CONFIRMADA)
                .map(r -> new FranjaOcupadaDTO(r.getHoraInicio().toString(), r.getHoraFin().toString()))
                .toList();
        return ResponseEntity.ok(franjas);
    }

    @GetMapping("/reservas/disponibilidad-dia")
    public ResponseEntity<List<DisponibilidadDiaDTO>> getDisponibilidadDia(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {

        List<DisponibilidadDiaDTO> resultado = pistaRepository.findAll().stream()
                .map(pista -> {
                    List<FranjaDTO> franjas = reservaRepository
                            .findByPistaIdAndFechaReserva(pista.getId(), fecha)
                            .stream()
                            .filter(r -> r.getEstado() == EstadoReserva.CONFIRMADA)
                            .map(r -> new FranjaDTO(
                                    r.getHoraInicio().toString(),
                                    r.getHoraFin().toString(),
                                    r.getNombreJugador(),
                                    r.getId(),
                                    r.getUsuario().getId()
                            ))
                            .toList();
                    return new DisponibilidadDiaDTO(pista.getId(), pista.getNumeroPista(), franjas);
                })
                .toList();

        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/reservas/{id}")
    public ResponseEntity<Reserva> findReserva(@PathVariable Long id, Authentication authentication) {
        Optional<Reserva> reserva = isAdmin(authentication)
                ? reservaRepository.findById(id)
                : reservaRepository.findByIdAndUsuarioEmail(id, authentication.getName());

        return reserva
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/reservas")
    public ResponseEntity<?> createReserva(@Valid @RequestBody CreateReservaDTO dto, Authentication authentication) {
        Optional<Pista> pista = pistaRepository.findById(dto.pistaId());
        if (pista.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Pista con ID " + dto.pistaId() + " no encontrada");
        }

        Optional<Usuario> usuario = resolverTitular(dto, authentication);
        if (usuario.isEmpty()) {
            String mensaje = (isAdmin(authentication) && dto.usuarioId() != null)
                    ? "Usuario con ID " + dto.usuarioId() + " no encontrado"
                    : "Usuario autenticado no encontrado";
            return ResponseEntity.badRequest().body(mensaje);
        }

        Reserva savedReserva = reservaService.crear(dto, pista.get(), usuario.get());
        return ResponseEntity.status(201).body(savedReserva);
    }

    @PutMapping("/reservas/{id}")
    public ResponseEntity<?> updateReserva(@Valid @RequestBody CreateReservaDTO dto, @PathVariable Long id, Authentication authentication) {
        Optional<Reserva> reserva = isAdmin(authentication)
                ? reservaRepository.findById(id)
                : reservaRepository.findByIdAndUsuarioEmail(id, authentication.getName());
        if (reserva.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Pista> pista = pistaRepository.findById(dto.pistaId());
        if (pista.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Pista con ID " + dto.pistaId() + " no encontrada");
        }

        Optional<Usuario> usuario = resolverTitular(dto, authentication);
        if (usuario.isEmpty()) {
            String mensaje = (isAdmin(authentication) && dto.usuarioId() != null)
                    ? "Usuario con ID " + dto.usuarioId() + " no encontrado"
                    : "Usuario autenticado no encontrado";
            return ResponseEntity.badRequest().body(mensaje);
        }

        Reserva updatedReserva = reservaService.actualizar(reserva.get(), dto, pista.get());
        return ResponseEntity.ok(updatedReserva);
    }

    @DeleteMapping("/reservas/{id}")
    @com.padel.reservas.config.NoDemoAdmin
    public ResponseEntity<Object> deleteReserva(@PathVariable Long id, Authentication authentication) {
        Optional<Reserva> reserva = isAdmin(authentication)
                ? reservaRepository.findById(id)
                : reservaRepository.findByIdAndUsuarioEmail(id, authentication.getName());

        return reserva
                .map(r -> {
                    r.setEstado(EstadoReserva.CANCELADA);
                    r.setFechaCancelacion(java.time.LocalDateTime.now());
                    reservaRepository.save(r);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/reservas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteAllReservas() {
        long count = reservaRepository.count();
        reservaRepository.deleteAll();
        return ResponseEntity.ok("Se eliminaron " + count + " reservas correctamente");
    }

    private Optional<Usuario> resolverTitular(CreateReservaDTO dto, Authentication authentication) {
        if (isAdmin(authentication) && dto.usuarioId() != null) {
            return usuarioRepository.findById(dto.usuarioId());
        }
        return usuarioRepository.findByEmail(authentication.getName());
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
