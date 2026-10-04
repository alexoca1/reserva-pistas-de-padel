package com.padel.reservas.controller;

import com.padel.reservas.config.DemoAdminAspect;
import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.config.SecurityConfig;
import com.padel.reservas.entities.*;
import com.padel.reservas.repositories.*;
import com.padel.reservas.services.CloudinaryService;
import com.padel.reservas.services.ConfiguracionClubService;
import com.padel.reservas.services.JwtService;
import com.padel.reservas.services.ReservaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({PistasController.class, ReservasController.class, AdminController.class, AuthController.class})
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class, DemoAdminAspect.class})
@EnableAspectJAutoProxy
@TestPropertySource(properties = "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=")
class DemoAdminSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean(name = "jpaMappingContext")
    private JpaMetamodelMappingContext jpaMappingContext;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @MockitoBean
    private PistaRepository pistaRepository;

    @MockitoBean
    private FotoPistaRepository fotoPistaRepository;

    @MockitoBean
    private CloudinaryService cloudinaryService;

    @MockitoBean
    private ReservaRepository reservaRepository;

    @MockitoBean
    private ReservaService reservaService;

    @MockitoBean
    private ConfiguracionClubService configuracionClubService;

    @MockitoBean
    private org.springframework.security.authentication.AuthenticationManager authenticationManager;

    @MockitoBean
    private com.padel.reservas.services.RefreshTokenService refreshTokenService;

    @MockitoBean
    private com.padel.reservas.repositories.RefreshTokenRepository refreshTokenRepository;

    @MockitoBean
    private com.padel.reservas.services.SecurityAuditService securityAuditService;

    @MockitoBean
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private Usuario demoAdmin;
    private Usuario realAdmin;

    @BeforeEach
    void setUp() {
        demoAdmin = new Usuario();
        demoAdmin.setId(100L);
        demoAdmin.setEmail("demo@padelreservas.es");
        demoAdmin.setRoles("ROLE_ADMIN");
        demoAdmin.setTipoAdmin(TipoAdmin.DEMO_ADMIN);

        realAdmin = new Usuario();
        realAdmin.setId(1L);
        realAdmin.setEmail("admin@test.com");
        realAdmin.setRoles("ROLE_ADMIN");
        realAdmin.setTipoAdmin(TipoAdmin.ADMIN);

        when(usuarioRepository.findByEmail("demo@padelreservas.es")).thenReturn(Optional.of(demoAdmin));
        when(usuarioRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(realAdmin));
    }

    @Test
    void postPistas_demoAdmin_bloqueadoCon403() throws Exception {
        mockMvc.perform(post("/pistas")
                        .with(jwt().jwt(j -> j.claim("sub", "demo@padelreservas.es"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"numeroPista\": 9, \"tieneIluminacion\": true, \"comentarios\": \"pista test\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Acción no disponible en modo demostración."));
    }

    @Test
    void deletePistas_demoAdmin_bloqueadoCon403() throws Exception {
        mockMvc.perform(delete("/pistas/1")
                        .with(jwt().jwt(j -> j.claim("sub", "demo@padelreservas.es"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Acción no disponible en modo demostración."));
    }

    @Test
    void deleteReserva_demoAdmin_bloqueadoCon403() throws Exception {
        mockMvc.perform(delete("/reservas/1")
                        .with(jwt().jwt(j -> j.claim("sub", "demo@padelreservas.es"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Acción no disponible en modo demostración."));
    }

    @Test
    void putConfiguracion_demoAdmin_bloqueadoCon403() throws Exception {
        mockMvc.perform(put("/admin/configuracion")
                        .with(jwt().jwt(j -> j.claim("sub", "demo@padelreservas.es"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"duracionesPermitidas\": \"60,90\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Acción no disponible en modo demostración."));
    }

    @Test
    void postPistas_adminReal_permitido() throws Exception {
        Pista saved = new Pista();
        saved.setId(5L);
        saved.setNumeroPista(9);
        when(pistaRepository.save(any())).thenReturn(saved);

        mockMvc.perform(post("/pistas")
                        .with(jwt().jwt(j -> j.claim("sub", "admin@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"numeroPista\": 9, \"tieneIluminacion\": true, \"comentarios\": \"pista real\"}"))
                .andExpect(status().isCreated());
    }
}
