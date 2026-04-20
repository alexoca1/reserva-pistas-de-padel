package hernandez_ocampo_hernandez.demo.controller;

import hernandez_ocampo_hernandez.demo.dto.CreateReservaDTO;
import hernandez_ocampo_hernandez.demo.entities.Pista;
import hernandez_ocampo_hernandez.demo.entities.Reserva;
import hernandez_ocampo_hernandez.demo.entities.Usuario;
import hernandez_ocampo_hernandez.demo.repositories.PistaRepository;
import hernandez_ocampo_hernandez.demo.repositories.ReservaRepository;
import hernandez_ocampo_hernandez.demo.repositories.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/reservas")
    public ResponseEntity<List<Reserva>> findAllReservas(Authentication authentication) {
        return ResponseEntity.ok(reservaRepository.findAll());
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
        // Buscar la pista por ID
        Optional<Pista> pista = pistaRepository.findById(dto.pistaId());
        if (pista.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Pista con ID " + dto.pistaId() + " no encontrada");
        }

        Optional<Usuario> usuario = usuarioRepository.findByEmail(authentication.getName());
        if (usuario.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuario autenticado no encontrado");
        }

        // Crear la reserva a partir del DTO
        Reserva reserva = new Reserva();
        reserva.setFechaReserva(dto.fechaReserva());
        reserva.setHoraInicio(dto.horaInicio());
        reserva.setHoraFin(dto.horaFin());
        reserva.setNombreJugador(dto.nombreJugador());
        reserva.setTelefono(dto.telefono());
        reserva.setPista(pista.get());
        reserva.setUsuario(usuario.get());

        Reserva savedReserva = reservaRepository.save(reserva);
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

        // Buscar la pista
        Optional<Pista> pista = pistaRepository.findById(dto.pistaId());
        if (pista.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Pista con ID " + dto.pistaId() + " no encontrada");
        }

        Optional<Usuario> usuario = usuarioRepository.findByEmail(authentication.getName());
        if (usuario.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuario autenticado no encontrado");
        }

        // Actualizar campos
        reserva.get().setFechaReserva(dto.fechaReserva());
        reserva.get().setHoraInicio(dto.horaInicio());
        reserva.get().setHoraFin(dto.horaFin());
        reserva.get().setNombreJugador(dto.nombreJugador());
        reserva.get().setTelefono(dto.telefono());
        reserva.get().setPista(pista.get());
        reserva.get().setUsuario(usuario.get());

        reservaRepository.save(reserva.get());
        return ResponseEntity.ok(reserva.get());
    }

    @DeleteMapping("/reservas/{id}")
    public ResponseEntity<Object> deleteReserva(@PathVariable Long id, Authentication authentication) {
        Optional<Reserva> reserva = isAdmin(authentication)
                ? reservaRepository.findById(id)
                : reservaRepository.findByIdAndUsuarioEmail(id, authentication.getName());

        return reserva
                .map(r -> {
                    reservaRepository.deleteById(id);
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

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
