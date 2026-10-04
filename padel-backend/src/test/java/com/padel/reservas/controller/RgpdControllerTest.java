package com.padel.reservas.controller;

import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.config.SecurityConfig;
import com.padel.reservas.entities.EstadoReserva;
import com.padel.reservas.entities.Pista;
import com.padel.reservas.entities.Reserva;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.repositories.RefreshTokenRepository;
import com.padel.reservas.repositories.ReservaRepository;
import com.padel.reservas.repositories.UsuarioRepository;
import com.padel.reservas.services.CloudinaryService;
import com.padel.reservas.services.JwtService;
import com.padel.reservas.services.RefreshTokenService;
import com.padel.reservas.services.SecurityAuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class})
@TestPropertySource(properties = "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=")
class RgpdControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean(name = "jpaMappingContext")
    private JpaMetamodelMappingContext jpaMappingContext;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private RefreshTokenService refreshTokenService;

    @MockitoBean
    private RefreshTokenRepository refreshTokenRepository;

    @MockitoBean
    private ReservaRepository reservaRepository;

    @MockitoBean
    private CloudinaryService cloudinaryService;

    @MockitoBean
    private SecurityAuditService securityAuditService;

    private Usuario usuarioUser;
    private Usuario adminUnico;

    @BeforeEach
    void setUp() {
        usuarioUser = new Usuario();
        usuarioUser.setId(10L);
        usuarioUser.setEmail("usuario@test.com");
        usuarioUser.setNombre("Carlos");
        usuarioUser.setApellidos("Gómez");
        usuarioUser.setTelefono("600111222");
        usuarioUser.setRoles("ROLE_USER");
        usuarioUser.setEnabled(true);
        usuarioUser.setAvatarPublicId("avatares/avatar123");

        adminUnico = new Usuario();
        adminUnico.setId(1L);
        adminUnico.setEmail("admin@test.com");
        adminUnico.setNombre("Admin");
        adminUnico.setApellidos("Principal");
        adminUnico.setRoles("ROLE_ADMIN");
        adminUnico.setEnabled(true);
    }

    @Test
    void getMisDatos_sinAutenticar_devuelve401() throws Exception {
        mockMvc.perform(get("/auth/mis-datos"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getMisDatos_autenticado_devuelvePerfilYReservas() throws Exception {
        when(usuarioRepository.findByEmail("usuario@test.com")).thenReturn(Optional.of(usuarioUser));

        Pista pista = new Pista();
        pista.setId(1L);
        pista.setNumeroPista(1);

        Reserva reserva = new Reserva();
        reserva.setId(101L);
        reserva.setCodigoReserva("RES-2026-1201-101");
        reserva.setFechaReserva(LocalDate.of(2026, 12, 1));
        reserva.setHoraInicio(LocalTime.of(10, 0));
        reserva.setHoraFin(LocalTime.of(11, 0));
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        reserva.setNombreJugador("Carlos");
        reserva.setTelefono("600111222");
        reserva.setPista(pista);

        when(reservaRepository.findByUsuarioEmail("usuario@test.com")).thenReturn(List.of(reserva));

        mockMvc.perform(get("/auth/mis-datos")
                        .with(jwt().jwt(j -> j.claim("sub", "usuario@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfil.id").value(10))
                .andExpect(jsonPath("$.perfil.nombre").value("Carlos"))
                .andExpect(jsonPath("$.reservas.length()").value(1))
                .andExpect(jsonPath("$.reservas[0].codigoReserva").value("RES-2026-1201-101"))
                .andExpect(jsonPath("$.fechaExportacion").isNotEmpty());
    }

    @Test
    void eliminarCuenta_sinAutenticar_devuelve401() throws Exception {
        mockMvc.perform(delete("/auth/cuenta"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void eliminarCuenta_usuarioEstandar_anonimizaDatosYRevocaTokens() throws Exception {
        when(usuarioRepository.findByEmail("usuario@test.com")).thenReturn(Optional.of(usuarioUser));

        mockMvc.perform(delete("/auth/cuenta")
                        .with(jwt().jwt(j -> j.claim("sub", "usuario@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isNoContent());

        verify(cloudinaryService).eliminar("avatares/avatar123");
        verify(refreshTokenRepository).deleteByUsuario(usuarioUser);

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());

        Usuario guardado = captor.getValue();
        assertThat(guardado.getNombre()).isEqualTo("Usuario eliminado");
        assertThat(guardado.getApellidos()).isEmpty();
        assertThat(guardado.getTelefono()).isNull();
        assertThat(guardado.getAvatarUrl()).isNull();
        assertThat(guardado.getAvatarPublicId()).isNull();
        assertThat(guardado.getEnabled()).isFalse();
        assertThat(guardado.getFechaBaja()).isNotNull();
        assertThat(guardado.getEmail()).startsWith("deleted_10_");
    }

    @Test
    void eliminarCuenta_unicoAdmin_devuelve409Conflict() throws Exception {
        when(usuarioRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUnico));
        when(usuarioRepository.countByRolesContaining("ROLE_ADMIN")).thenReturn(1L);

        mockMvc.perform(delete("/auth/cuenta")
                        .with(jwt().jwt(j -> j.claim("sub", "admin@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("No puedes eliminar la única cuenta de administrador"));

        verify(usuarioRepository, never()).save(any());
        verify(refreshTokenRepository, never()).deleteByUsuario(any());
    }
}
