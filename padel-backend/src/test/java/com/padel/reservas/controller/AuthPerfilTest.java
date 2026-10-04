package com.padel.reservas.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.config.SecurityConfig;
import com.padel.reservas.dto.UpdatePerfilDTO;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.repositories.UsuarioRepository;
import com.padel.reservas.services.JwtService;
import com.padel.reservas.services.SecurityAuditService;
import com.padel.reservas.services.RefreshTokenService;
import com.padel.reservas.services.SecurityAuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class})
@TestPropertySource(properties = "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=")
class AuthPerfilTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

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
    private com.padel.reservas.repositories.RefreshTokenRepository refreshTokenRepository;

    @MockitoBean
    private com.padel.reservas.repositories.ReservaRepository reservaRepository;

    @MockitoBean
    private com.padel.reservas.services.CloudinaryService cloudinaryService;

    @MockitoBean
    private SecurityAuditService securityAuditService;

    private Usuario usuarioNormal;
    private Usuario usuarioOtro;

    @BeforeEach
    void setUp() {
        usuarioNormal = new Usuario();
        usuarioNormal.setId(1L);
        usuarioNormal.setEmail("user@test.com");
        usuarioNormal.setNombre("Original");
        usuarioNormal.setApellidos("User");
        usuarioNormal.setTelefono("600111222");
        usuarioNormal.setRoles("ROLE_USER");

        usuarioOtro = new Usuario();
        usuarioOtro.setId(2L);
        usuarioOtro.setEmail("otro@test.com");
        usuarioOtro.setNombre("Otro");
        usuarioOtro.setApellidos("Usuario");
        usuarioOtro.setTelefono("600333444");
        usuarioOtro.setRoles("ROLE_USER");
    }

    @Test
    void T04_usuarioEditaSusPropiosDatos() throws Exception {
        when(usuarioRepository.findByEmail("user@test.com")).thenReturn(Optional.of(usuarioNormal));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));

        UpdatePerfilDTO dto = new UpdatePerfilDTO("NuevoNombre", "NuevosApellidos", "611223344", null);

        mockMvc.perform(put("/auth/perfil")
                        .with(jwt().jwt(j -> j.claim("sub", "user@test.com")).authorities(new SimpleGrantedAuthority("ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nombre").value("NuevoNombre"))
                .andExpect(jsonPath("$.apellidos").value("NuevosApellidos"))
                .andExpect(jsonPath("$.telefono").value("611223344"));

        verify(usuarioRepository).save(usuarioNormal);
    }

    @Test
    void T05_adminEditaUsuarioDeOtro() throws Exception {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuarioOtro));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));

        UpdatePerfilDTO dto = new UpdatePerfilDTO("NombreEditado", "ApellidosEditados", "699887766", 2L);

        mockMvc.perform(put("/auth/perfil")
                        .with(jwt().jwt(j -> j.claim("sub", "admin@test.com")).authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.nombre").value("NombreEditado"))
                .andExpect(jsonPath("$.apellidos").value("ApellidosEditados"))
                .andExpect(jsonPath("$.telefono").value("699887766"));

        verify(usuarioRepository).save(usuarioOtro);
    }

    @Test
    void T06_usuarioNoAdminEnvioUsuarioId_seIgnoraYEditaPropio() throws Exception {
        when(usuarioRepository.findByEmail("user@test.com")).thenReturn(Optional.of(usuarioNormal));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));

        UpdatePerfilDTO dto = new UpdatePerfilDTO("MiNombre", "MisApellidos", "655443322", 2L);

        mockMvc.perform(put("/auth/perfil")
                        .with(jwt().jwt(j -> j.claim("sub", "user@test.com")).authorities(new SimpleGrantedAuthority("ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nombre").value("MiNombre"));

        verify(usuarioRepository).save(usuarioNormal);
    }

    @Test
    void T07_usuarioIdInexistente_devuelve400() throws Exception {
        when(usuarioRepository.findById(999L)).thenReturn(Optional.empty());

        UpdatePerfilDTO dto = new UpdatePerfilDTO("Nombre", "Apellidos", "600000000", 999L);

        mockMvc.perform(put("/auth/perfil")
                        .with(jwt().jwt(j -> j.claim("sub", "admin@test.com")).authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Usuario con ID 999 no encontrado"));
    }
}
