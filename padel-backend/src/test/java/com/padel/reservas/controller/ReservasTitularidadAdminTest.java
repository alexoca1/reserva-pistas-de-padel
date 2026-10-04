package com.padel.reservas.controller;

import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.config.SecurityConfig;
import com.padel.reservas.dto.CreateReservaDTO;
import com.padel.reservas.entities.Pista;
import com.padel.reservas.entities.Reserva;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.repositories.PistaRepository;
import com.padel.reservas.repositories.ReservaRepository;
import com.padel.reservas.repositories.UsuarioRepository;
import com.padel.reservas.services.JwtService;
import com.padel.reservas.services.ReservaService;
import org.junit.jupiter.api.BeforeEach;
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

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import com.padel.reservas.entities.EstadoReserva;
import static org.mockito.Mockito.never;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReservasController.class)
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class})
@TestPropertySource(properties = "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=")
class ReservasTitularidadAdminTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean(name = "jpaMappingContext")
    private JpaMetamodelMappingContext jpaMappingContext;

    @MockitoBean
    private ReservaRepository reservaRepository;

    @MockitoBean
    private PistaRepository pistaRepository;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @MockitoBean
    private ReservaService reservaService;

    private Pista pista;
    private Usuario admin;
    private Usuario jugadorAna;

    @BeforeEach
    void setUp() {
        pista = new Pista();
        pista.setId(1L);
        pista.setNumeroPista(1);

        admin = new Usuario();
        admin.setId(1L);
        admin.setEmail("admin@padel.com");
        admin.setNombre("Admin");
        admin.setRoles("ROLE_ADMIN");

        jugadorAna = new Usuario();
        jugadorAna.setId(5L);
        jugadorAna.setEmail("ana@jugador.com");
        jugadorAna.setNombre("Ana");
        jugadorAna.setRoles("ROLE_USER");

        when(pistaRepository.findById(1L)).thenReturn(Optional.of(pista));
        when(usuarioRepository.findByEmail("admin@padel.com")).thenReturn(Optional.of(admin));
        when(usuarioRepository.findByEmail("ana@jugador.com")).thenReturn(Optional.of(jugadorAna));
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(jugadorAna));

        when(reservaService.crear(any(), any(), any())).thenAnswer(invocation -> {
            CreateReservaDTO dto = invocation.getArgument(0);
            Pista p = invocation.getArgument(1);
            Usuario u = invocation.getArgument(2);
            Reserva r = new Reserva();
            r.setFechaReserva(dto.fechaReserva());
            r.setHoraInicio(java.time.LocalTime.parse(dto.horaInicio()));
            r.setHoraFin(java.time.LocalTime.parse(dto.horaFin()));
            r.setNombreJugador(dto.nombreJugador());
            r.setTelefono(dto.telefono());
            r.setPista(p);
            r.setUsuario(u);
            return r;
        });
    }

    @Test
    void t06_adminCreaReservaConUsuarioId_asignaTitularCorrectoNoElAdmin() throws Exception {
        String payload = """
                {
                  "fechaReserva": "2026-12-01",
                  "horaInicio": "10:00",
                  "horaFin": "11:00",
                  "nombreJugador": "Ana García",
                  "telefono": "600111222",
                  "pistaId": 1,
                  "usuarioId": 5
                }
                """;

        mockMvc.perform(post("/reservas")
                        .with(jwt().jwt(j -> j.claim("sub", "admin@padel.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated());

        ArgumentCaptor<Usuario> captorUsuario = ArgumentCaptor.forClass(Usuario.class);
        ArgumentCaptor<CreateReservaDTO> captorDTO = ArgumentCaptor.forClass(CreateReservaDTO.class);
        verify(reservaService).crear(captorDTO.capture(), any(), captorUsuario.capture());

        assertThat(captorUsuario.getValue().getId()).isEqualTo(5L);
        assertThat(captorUsuario.getValue().getEmail()).isEqualTo("ana@jugador.com");
        assertThat(captorDTO.getValue().nombreJugador()).isEqualTo("Ana García");
    }

    @Test
    void t07_adminCreaReservaSinUsuarioId_asignaAlAdmin() throws Exception {
        String payload = """
                {
                  "fechaReserva": "2026-12-01",
                  "horaInicio": "10:00",
                  "horaFin": "11:00",
                  "nombreJugador": "Admin Padel",
                  "telefono": "600000000",
                  "pistaId": 1
                }
                """;

        mockMvc.perform(post("/reservas")
                        .with(jwt().jwt(j -> j.claim("sub", "admin@padel.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated());

        ArgumentCaptor<Usuario> captorUsuario = ArgumentCaptor.forClass(Usuario.class);
        verify(reservaService).crear(any(), any(), captorUsuario.capture());

        assertThat(captorUsuario.getValue().getId()).isEqualTo(1L);
        assertThat(captorUsuario.getValue().getEmail()).isEqualTo("admin@padel.com");
    }

    @Test
    void t08_usuarioNoAdminEnviaUsuarioIdDeOtro_seIgnoraYQuedaASuPropioNombre() throws Exception {
        String payload = """
                {
                  "fechaReserva": "2026-12-01",
                  "horaInicio": "10:00",
                  "horaFin": "11:00",
                  "nombreJugador": "Ana García",
                  "telefono": "600111222",
                  "pistaId": 1,
                  "usuarioId": 999
                }
                """;

        mockMvc.perform(post("/reservas")
                        .with(jwt().jwt(j -> j.claim("sub", "ana@jugador.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated());

        ArgumentCaptor<Usuario> captorUsuario = ArgumentCaptor.forClass(Usuario.class);
        verify(reservaService).crear(any(), any(), captorUsuario.capture());

        assertThat(captorUsuario.getValue().getId()).isEqualTo(5L);
        assertThat(captorUsuario.getValue().getEmail()).isEqualTo("ana@jugador.com");
    }

    @Test
    void adminCreaReservaConUsuarioIdInexistente_devuelve400() throws Exception {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        String payload = """
                {
                  "fechaReserva": "2026-12-01",
                  "horaInicio": "10:00",
                  "horaFin": "11:00",
                  "nombreJugador": "Fantasma",
                  "telefono": "600111222",
                  "pistaId": 1,
                  "usuarioId": 99
                }
                """;

        mockMvc.perform(post("/reservas")
                        .with(jwt().jwt(j -> j.claim("sub", "admin@padel.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteReserva_usuarioPropio_marcaComoCanceladaConFechaYGuarda() throws Exception {
        Reserva reserva = new Reserva();
        reserva.setId(10L);
        reserva.setUsuario(jugadorAna);
        reserva.setEstado(EstadoReserva.CONFIRMADA);

        when(reservaRepository.findByIdAndUsuarioEmail(10L, "ana@jugador.com"))
                .thenReturn(Optional.of(reserva));

        mockMvc.perform(delete("/reservas/10")
                        .with(jwt().jwt(j -> j.claim("sub", "ana@jugador.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isNoContent());

        ArgumentCaptor<Reserva> captor = ArgumentCaptor.forClass(Reserva.class);
        verify(reservaRepository).save(captor.capture());
        verify(reservaRepository, never()).deleteById(any());
        verify(reservaRepository, never()).delete(any());

        assertThat(captor.getValue().getEstado()).isEqualTo(EstadoReserva.CANCELADA);
        assertThat(captor.getValue().getFechaCancelacion()).isNotNull();
    }

    @Test
    void deleteReserva_admin_marcaComoCanceladaConFechaYGuarda() throws Exception {
        Reserva reserva = new Reserva();
        reserva.setId(20L);
        reserva.setUsuario(jugadorAna);
        reserva.setEstado(EstadoReserva.CONFIRMADA);

        when(reservaRepository.findById(20L)).thenReturn(Optional.of(reserva));

        mockMvc.perform(delete("/reservas/20")
                        .with(jwt().jwt(j -> j.claim("sub", "admin@padel.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isNoContent());

        ArgumentCaptor<Reserva> captor = ArgumentCaptor.forClass(Reserva.class);
        verify(reservaRepository).save(captor.capture());
        verify(reservaRepository, never()).deleteById(any());
        verify(reservaRepository, never()).delete(any());

        assertThat(captor.getValue().getEstado()).isEqualTo(EstadoReserva.CANCELADA);
        assertThat(captor.getValue().getFechaCancelacion()).isNotNull();
    }
}
