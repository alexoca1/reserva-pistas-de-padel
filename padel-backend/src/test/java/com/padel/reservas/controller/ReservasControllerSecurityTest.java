package com.padel.reservas.controller;

import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.config.SecurityConfig;
import com.padel.reservas.entities.Reserva;
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

import java.util.List;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReservasController.class)
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class})
@TestPropertySource(properties = "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=")
class ReservasControllerSecurityTest {

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
    void getReservas_usuarioNormal_soloDevuelveLasSuyas() throws Exception {
        Reserva reservaPropia = new Reserva();
        reservaPropia.setId(1L);
        reservaPropia.setNombreJugador("Ana");

        when(reservaRepository.findByUsuarioEmail("ana@test.com"))
                .thenReturn(List.of(reservaPropia));

        mockMvc.perform(get("/reservas")
                        .with(jwt()
                                .jwt(jwtBuilder -> jwtBuilder.subject("ana@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nombreJugador").value("Ana"));

        verify(reservaRepository, never()).findAll();
    }

    @Test
    void getReservas_admin_devuelveTodas() throws Exception {
        when(reservaRepository.findAll()).thenReturn(List.of(new Reserva(), new Reserva()));

        mockMvc.perform(get("/reservas")
                        .with(jwt()
                                .jwt(jwtBuilder -> jwtBuilder.subject("admin@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        verify(reservaRepository, never()).findByUsuarioEmail("admin@test.com");
    }
}
