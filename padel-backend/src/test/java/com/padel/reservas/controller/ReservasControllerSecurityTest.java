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
import java.util.Optional;
import com.padel.reservas.entities.Usuario;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReservasController.class)
@EnableAspectJAutoProxy
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class, com.padel.reservas.config.DemoAdminAspect.class})
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

    @MockitoBean
    private com.padel.reservas.repositories.PagoRepository pagoRepository;

    @MockitoBean
    private com.padel.reservas.services.PagoService pagoService;

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

    @Test
    void postReservas_demoAdmin_lanza403() throws Exception {
        Usuario demoAdmin = new Usuario();
        demoAdmin.setId(100L);
        demoAdmin.setEmail("demo@test.com");
        demoAdmin.setRoles("ROLE_DEMO_ADMIN");
        demoAdmin.setTipoAdmin(com.padel.reservas.entities.TipoAdmin.DEMO_ADMIN);

        when(usuarioRepository.findByEmail("demo@test.com")).thenReturn(Optional.of(demoAdmin));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/reservas")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content("{\"fechaReserva\":\"2026-12-01\",\"horaInicio\":\"10:00\",\"horaFin\":\"11:30\",\"nombreJugador\":\"Ana\",\"telefono\":\"600111222\",\"pistaId\":1}")
                        .with(jwt()
                                .jwt(jwtBuilder -> jwtBuilder.subject("demo@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_DEMO_ADMIN"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void validarQR_sinToken_lanza401() throws Exception {
        mockMvc.perform(get("/reservas/validar-qr")
                        .param("codigo", "RES-TEST"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void validarQR_rolUser_lanza403() throws Exception {
        mockMvc.perform(get("/reservas/validar-qr")
                        .param("codigo", "RES-TEST")
                        .with(jwt()
                                .jwt(jwtBuilder -> jwtBuilder.subject("user@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void validarQR_inexistente_rolAdmin_devuelve404() throws Exception {
        when(reservaRepository.findByCodigoReserva("INEXISTENTE")).thenReturn(Optional.empty());

        mockMvc.perform(get("/reservas/validar-qr")
                        .param("codigo", "INEXISTENTE")
                        .with(jwt()
                                .jwt(jwtBuilder -> jwtBuilder.subject("admin@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void validarQR_existente_rolAdmin_devuelve200() throws Exception {
        com.padel.reservas.entities.Pista pista = new com.padel.reservas.entities.Pista();
        pista.setNumeroPista(2);
        pista.setPrecioHora(java.math.BigDecimal.valueOf(20.0));

        Reserva reserva = new Reserva();
        reserva.setId(10L);
        reserva.setCodigoReserva("EXISTENTE");
        reserva.setNombreJugador("Carlos");
        reserva.setTelefono("600123456");
        reserva.setFechaReserva(java.time.LocalDate.of(2026, 10, 15));
        reserva.setHoraInicio(java.time.LocalTime.of(10, 0));
        reserva.setHoraFin(java.time.LocalTime.of(11, 30));
        reserva.setPista(pista);
        reserva.setEstado(com.padel.reservas.entities.EstadoReserva.CONFIRMADA);

        when(reservaRepository.findByCodigoReserva("EXISTENTE")).thenReturn(Optional.of(reserva));

        mockMvc.perform(get("/reservas/validar-qr")
                        .param("codigo", "EXISTENTE")
                        .with(jwt()
                                .jwt(jwtBuilder -> jwtBuilder.subject("admin@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reservaId").value(10))
                .andExpect(jsonPath("$.codigoReserva").value("EXISTENTE"))
                .andExpect(jsonPath("$.nombreJugador").value("Carlos"))
                .andExpect(jsonPath("$.telefono").value("600123456"))
                .andExpect(jsonPath("$.numeroPista").value(2))
                .andExpect(jsonPath("$.estado").value("CONFIRMADA"));
    }
}
