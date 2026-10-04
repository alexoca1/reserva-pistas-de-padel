# Prompt de implementación — spec 010

Implementa specs/010-titularidad-real-reserva-admin siguiendo spec.md,
plan.md y tasks.md (T01-T05, T06-T08 en tests). Sigue
.specify/memory/constitution.md — cambios mínimos, sin dependencias nuevas.

## T01 - Reemplaza padel-backend/src/main/java/com/padel/reservas/dto/CreateReservaDTO.java por:

\`\`\`java
package com.padel.reservas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateReservaDTO(
        @NotNull
        LocalDate fechaReserva,

        @NotBlank
        String horaInicio,

        @NotBlank
        String horaFin,

        @NotBlank
        String nombreJugador,

        @NotBlank
        String telefono,

        @NotNull
        Long pistaId,

        Long usuarioId
) {}
\`\`\`

## T02-T05 - En padel-backend/src/main/java/com/padel/reservas/controller/ReservasController.java

Añade este método privado, junto a `isAdmin`:

\`\`\`java
private Optional<Usuario> resolverTitular(CreateReservaDTO dto, Authentication authentication) {
    if (isAdmin(authentication) && dto.usuarioId() != null) {
        return usuarioRepository.findById(dto.usuarioId());
    }
    return usuarioRepository.findByEmail(authentication.getName());
}
\`\`\`

En `createReserva`, cambia:
\`\`\`java
Optional<Usuario> usuario = usuarioRepository.findByEmail(authentication.getName());
if (usuario.isEmpty()) {
    return ResponseEntity.badRequest().body("Usuario autenticado no encontrado");
}
\`\`\`
por:
\`\`\`java
Optional<Usuario> usuario = resolverTitular(dto, authentication);
if (usuario.isEmpty()) {
    return ResponseEntity.badRequest().body("Usuario titular de la reserva no encontrado");
}
\`\`\`

En `updateReserva`, aplica exactamente el mismo cambio (mismo bloque, misma
sustitución).

En `getDisponibilidadDia`, cambia:
\`\`\`java
.map(r -> new FranjaDTO(
        r.getHoraInicio(),
        r.getHoraFin(),
        r.getUsuario().getNombre() + " " + r.getUsuario().getApellidos(),
        r.getId(),
        r.getUsuario().getId()
))
\`\`\`
por:
\`\`\`java
.map(r -> new FranjaDTO(
        r.getHoraInicio(),
        r.getHoraFin(),
        r.getNombreJugador(),
        r.getId(),
        r.getUsuario().getId()
))
\`\`\`

## T06-T08 - Crear padel-backend/src/test/java/com/padel/reservas/controller/ReservasTitularidadTest.java

\`\`\`java
package com.padel.reservas.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.config.SecurityConfig;
import com.padel.reservas.entities.Pista;
import com.padel.reservas.entities.Reserva;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.repositories.PistaRepository;
import com.padel.reservas.repositories.ReservaRepository;
import com.padel.reservas.repositories.UsuarioRepository;
import com.padel.reservas.services.JwtService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReservasController.class)
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class})
@TestPropertySource(properties = "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=")
class ReservasTitularidadTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean(name = "jpaMappingContext")
    private JpaMetamodelMappingContext jpaMappingContext;

    @MockitoBean
    private ReservaRepository reservaRepository;

    @MockitoBean
    private PistaRepository pistaRepository;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    private final String cuerpoConUsuarioId = """
            {
              "fechaReserva": "2026-12-01",
              "horaInicio": "10:00",
              "horaFin": "11:00",
              "nombreJugador": "Ana García",
              "telefono": "600111222",
              "pistaId": 1,
              "usuarioId": 99
            }
            """;

    @Test
    void createReserva_adminConUsuarioId_asignaAlUsuarioSeleccionado() throws Exception {
        Usuario ana = new Usuario();
        ana.setId(99L);

        when(pistaRepository.findById(1L)).thenReturn(Optional.of(new Pista()));
        when(usuarioRepository.findById(99L)).thenReturn(Optional.of(ana));
        when(reservaRepository.findSolapadas(eq(1L), eq(LocalDate.of(2026, 12, 1)), eq("10:00"), eq("11:00"), eq(0L)))
                .thenReturn(List.of());
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(post("/reservas")
                        .with(jwt().jwt(j -> j.subject("admin@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpoConUsuarioId))
                .andExpect(status().isCreated());

        verify(usuarioRepository).findById(99L);
        verify(usuarioRepository, never()).findByEmail("admin@test.com");

        ArgumentCaptor<Reserva> captor = ArgumentCaptor.forClass(Reserva.class);
        verify(reservaRepository).save(captor.capture());
        assertEquals(99L, captor.getValue().getUsuario().getId());
    }

    @Test
    void createReserva_adminSinUsuarioId_mantieneComportamientoActual() throws Exception {
        String cuerpoSinUsuarioId = """
                {
                  "fechaReserva": "2026-12-01",
                  "horaInicio": "10:00",
                  "horaFin": "11:00",
                  "nombreJugador": "Admin",
                  "telefono": "600111222",
                  "pistaId": 1
                }
                """;

        Usuario admin = new Usuario();
        admin.setId(1L);

        when(pistaRepository.findById(1L)).thenReturn(Optional.of(new Pista()));
        when(usuarioRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(reservaRepository.findSolapadas(eq(1L), eq(LocalDate.of(2026, 12, 1)), eq("10:00"), eq("11:00"), eq(0L)))
                .thenReturn(List.of());
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(post("/reservas")
                        .with(jwt().jwt(j -> j.subject("admin@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpoSinUsuarioId))
                .andExpect(status().isCreated());

        verify(usuarioRepository).findByEmail("admin@test.com");
        verify(usuarioRepository, never()).findById(any());
    }

    @Test
    void createReserva_usuarioNoAdminConUsuarioId_seIgnoraYQuedaASuPropioNombre() throws Exception {
        Usuario usuarioNormal = new Usuario();
        usuarioNormal.setId(5L);

        when(pistaRepository.findById(1L)).thenReturn(Optional.of(new Pista()));
        when(usuarioRepository.findByEmail("usuario@test.com")).thenReturn(Optional.of(usuarioNormal));
        when(reservaRepository.findSolapadas(eq(1L), eq(LocalDate.of(2026, 12, 1)), eq("10:00"), eq("11:00"), eq(0L)))
                .thenReturn(List.of());
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(post("/reservas")
                        .with(jwt().jwt(j -> j.subject("usuario@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpoConUsuarioId))
                .andExpect(status().isCreated());

        verify(usuarioRepository, never()).findById(99L);
        verify(usuarioRepository).findByEmail("usuario@test.com");

        ArgumentCaptor<Reserva> captor = ArgumentCaptor.forClass(Reserva.class);
        verify(reservaRepository).save(captor.capture());
        assertEquals(5L, captor.getValue().getUsuario().getId());
    }
}
\`\`\`

No toques el frontend — ya envía `usuarioId` correctamente desde la spec 003.

Verificación: `./mvnw test`. Manual: como admin, crea una reserva
seleccionando a otro jugador del desplegable; confirma en la cuadrícula que
aparece su nombre, no el tuyo; inicia sesión como ese jugador y confirma que
ve la reserva como "Tu reserva" y puede editarla/eliminarla.