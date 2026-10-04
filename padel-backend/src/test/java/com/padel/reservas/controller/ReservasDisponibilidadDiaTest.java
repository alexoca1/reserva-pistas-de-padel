package com.padel.reservas.controller;

import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.config.SecurityConfig;
import com.padel.reservas.entities.EstadoReserva;
import com.padel.reservas.entities.Pista;
import com.padel.reservas.entities.Reserva;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.repositories.PistaRepository;
import com.padel.reservas.repositories.ReservaRepository;
import com.padel.reservas.repositories.UsuarioRepository;
import com.padel.reservas.services.JwtService;
import com.padel.reservas.services.ReservaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReservasController.class)
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class})
@TestPropertySource(properties = "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=")
class ReservasDisponibilidadDiaTest {

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

    @Test
    void disponibilidadDia_sinAutenticacion_devuelve401() throws Exception {
        mockMvc.perform(get("/reservas/disponibilidad-dia").param("fecha", "2026-12-01"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void disponibilidadDia_sinFecha_devuelve400() throws Exception {
        mockMvc.perform(get("/reservas/disponibilidad-dia")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void disponibilidadDia_conFecha_devuelveListaPorPista() throws Exception {
        Pista pista1 = new Pista();
        pista1.setId(1L);
        pista1.setNumeroPista(1);

        Pista pista2 = new Pista();
        pista2.setId(2L);
        pista2.setNumeroPista(2);

        Usuario usuario = new Usuario();
        usuario.setId(10L);
        usuario.setNombre("Ana");
        usuario.setApellidos("García");

        Reserva reserva = new Reserva();
        reserva.setId(100L);
        reserva.setHoraInicio(LocalTime.of(10, 0));
        reserva.setHoraFin(LocalTime.of(11, 0));
        reserva.setNombreJugador("Ana García");
        reserva.setUsuario(usuario);
        reserva.setEstado(EstadoReserva.CONFIRMADA);

        when(pistaRepository.findAll()).thenReturn(List.of(pista1, pista2));
        when(reservaRepository.findByPistaIdAndFechaReserva(1L, LocalDate.of(2026, 12, 1)))
                .thenReturn(List.of(reserva));
        when(reservaRepository.findByPistaIdAndFechaReserva(2L, LocalDate.of(2026, 12, 1)))
                .thenReturn(List.of());

        mockMvc.perform(get("/reservas/disponibilidad-dia")
                        .param("fecha", "2026-12-01")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].pistaId").value(1))
                .andExpect(jsonPath("$[0].franjas.length()").value(1))
                .andExpect(jsonPath("$[0].franjas[0].horaInicio").value("10:00"))
                .andExpect(jsonPath("$[1].franjas.length()").value(0));
    }

    @Test
    void disponibilidadDia_excluyeReservasCanceladas() throws Exception {
        Pista pista1 = new Pista();
        pista1.setId(1L);
        pista1.setNumeroPista(1);

        Usuario usuario = new Usuario();
        usuario.setId(10L);

        Reserva reservaCancelada = new Reserva();
        reservaCancelada.setId(101L);
        reservaCancelada.setHoraInicio(LocalTime.of(10, 0));
        reservaCancelada.setHoraFin(LocalTime.of(11, 0));
        reservaCancelada.setNombreJugador("Ana García");
        reservaCancelada.setUsuario(usuario);
        reservaCancelada.setEstado(EstadoReserva.CANCELADA);

        when(pistaRepository.findAll()).thenReturn(List.of(pista1));
        when(reservaRepository.findByPistaIdAndFechaReserva(1L, LocalDate.of(2026, 12, 1)))
                .thenReturn(List.of(reservaCancelada));

        mockMvc.perform(get("/reservas/disponibilidad-dia")
                        .param("fecha", "2026-12-01")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].franjas.length()").value(0));
    }
}
