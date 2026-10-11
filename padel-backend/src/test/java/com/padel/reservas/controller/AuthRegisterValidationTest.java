package com.padel.reservas.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.config.SecurityConfig;
import com.padel.reservas.dto.RegisterRequest;
import com.padel.reservas.dto.UpdatePerfilDTO;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.repositories.RefreshTokenRepository;
import com.padel.reservas.repositories.ReservaRepository;
import com.padel.reservas.repositories.UsuarioRepository;
import com.padel.reservas.services.CloudinaryService;
import com.padel.reservas.services.JwtService;
import com.padel.reservas.services.RefreshTokenService;
import com.padel.reservas.services.SecurityAuditService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class})
@TestPropertySource(properties = "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=")
class AuthRegisterValidationTest {

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
    private RefreshTokenRepository refreshTokenRepository;

    @MockitoBean
    private ReservaRepository reservaRepository;

    @MockitoBean
    private com.padel.reservas.repositories.PagoRepository pagoRepository;

    @MockitoBean
    private CloudinaryService cloudinaryService;

    @MockitoBean
    private SecurityAuditService securityAuditService;

    @MockitoBean
    private com.padel.reservas.config.RateLimitFilter rateLimitFilter;

    @org.junit.jupiter.api.BeforeEach
    void setUp() throws Exception {
        org.mockito.Mockito.doAnswer(inv -> {
            jakarta.servlet.FilterChain chain = inv.getArgument(2);
            chain.doFilter(inv.getArgument(0), inv.getArgument(1));
            return null;
        }).when(rateLimitFilter).doFilter(any(), any(), any());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "a",             // Muy corta
            "abcdefg",       // 7 caracteres
            "abcdefgh",      // 8 caracteres, sin mayúscula ni número
            "Abcdefgh",      // 8 caracteres, sin número
            "abcdefg1",      // 8 caracteres, sin mayúscula
            "ABCDEFG1"       // 8 caracteres, sin minúscula
    })
    @DisplayName("POST /auth/register con contraseña débil retorna 400 y mensaje de error en campo password")
    void register_passwordDebil_retorna400ConError(String passwordDebil) throws Exception {
        RegisterRequest request = new RegisterRequest(
                "nuevo@test.com",
                passwordDebil,
                "Juan",
                "Pérez",
                "600123456"
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    @DisplayName("POST /auth/register con contraseña válida (8+ caracteres, mayúscula, minúscula y número) retorna 201")
    void register_passwordValida_retorna201() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "valido@test.com",
                "Password123",
                "Juan",
                "Pérez",
                "600123456"
        );

        when(usuarioRepository.findByEmail("valido@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        
        Usuario usuarioGuardado = new Usuario();
        usuarioGuardado.setId(1L);
        usuarioGuardado.setEmail("valido@test.com");
        usuarioGuardado.setNombre("Juan");
        usuarioGuardado.setApellidos("Pérez");
        usuarioGuardado.setRoles("ROLE_USER");
        usuarioGuardado.setEnabled(true);
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioGuardado);

        com.padel.reservas.entities.RefreshToken refreshToken = new com.padel.reservas.entities.RefreshToken();
        refreshToken.setToken("mock-refresh-token");
        when(refreshTokenService.createRefreshToken(any(Usuario.class))).thenReturn(refreshToken);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Usuario registrado correctamente"));
    }

    @Test
    @DisplayName("PUT /auth/perfil con password 'weak' retorna 400")
    void perfil_passwordWeak_retorna400() throws Exception {
        UpdatePerfilDTO dto = new UpdatePerfilDTO(
                "Juan", "Pérez", "600123456",
                "valido@test.com",
                "weak",
                "OldPassword123",
                null
        );

        mockMvc.perform(put("/auth/perfil")
                        .with(jwt().jwt(j -> j.claim("sub", "valido@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    @DisplayName("PUT /auth/perfil con password 'sinmayuscula1' retorna 400")
    void perfil_passwordSinMayuscula_retorna400() throws Exception {
        UpdatePerfilDTO dto = new UpdatePerfilDTO(
                "Juan", "Pérez", "600123456",
                "valido@test.com",
                "sinmayuscula1",
                "OldPassword123",
                null
        );

        mockMvc.perform(put("/auth/perfil")
                        .with(jwt().jwt(j -> j.claim("sub", "valido@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    @DisplayName("PUT /auth/perfil con password 'SinNumero!' retorna 400")
    void perfil_passwordSinNumero_retorna400() throws Exception {
        UpdatePerfilDTO dto = new UpdatePerfilDTO(
                "Juan", "Pérez", "600123456",
                "valido@test.com",
                "SinNumero!",
                "OldPassword123",
                null
        );

        mockMvc.perform(put("/auth/perfil")
                        .with(jwt().jwt(j -> j.claim("sub", "valido@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    @DisplayName("PUT /auth/perfil con password 'Valida123' retorna 200")
    void perfil_passwordValida_retorna200() throws Exception {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmail("valido@test.com");
        usuario.setNombre("Juan");
        usuario.setApellidos("Pérez");
        usuario.setTelefono("600123456");
        usuario.setPassword("encodedOldPassword");
        usuario.setRoles("ROLE_USER");

        when(usuarioRepository.findByEmail("valido@test.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("OldPassword123", "encodedOldPassword")).thenReturn(true);
        when(passwordEncoder.encode("Valida123")).thenReturn("encodedNewPassword");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));

        UpdatePerfilDTO dto = new UpdatePerfilDTO(
                "Juan", "Pérez", "600123456",
                "valido@test.com",
                "Valida123",
                "OldPassword123",
                null
        );

        mockMvc.perform(put("/auth/perfil")
                        .with(jwt().jwt(j -> j.claim("sub", "valido@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }
}
