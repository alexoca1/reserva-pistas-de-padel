package com.padel.reservas.controller;

import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.config.SecurityConfig;
import com.padel.reservas.dto.SubidaResult;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.repositories.UsuarioRepository;
import com.padel.reservas.services.CloudinaryService;
import com.padel.reservas.services.SecurityAuditService;
import com.padel.reservas.services.JwtService;
import com.padel.reservas.services.RefreshTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class})
@TestPropertySource(properties = "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=")
class AuthPerfilAvatarTest {

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
    private CloudinaryService cloudinaryService;

    @MockitoBean
    private SecurityAuditService securityAuditService;

    @MockitoBean
    private com.padel.reservas.repositories.RefreshTokenRepository refreshTokenRepository;

    @MockitoBean
    private com.padel.reservas.repositories.ReservaRepository reservaRepository;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmail("user@test.com");
        usuario.setNombre("Test");
        usuario.setApellidos("User");
        usuario.setTelefono("600111222");
        usuario.setRoles("ROLE_USER");
    }

    @Test
    void subirAvatar_devuelveUrlCloudinary() throws Exception {
        when(usuarioRepository.findByEmail("user@test.com")).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));
        when(cloudinaryService.subir(any(), eq("avatares"), eq(400)))
                .thenReturn(new SubidaResult("https://res.cloudinary.com/test/avatar.webp", "avatares/avatar123"));

        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.jpg", "image/jpeg", "fake-image".getBytes()
        );

        mockMvc.perform(multipart("/auth/perfil/avatar")
                        .file(file)
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        })
                        .with(jwt().jwt(j -> j.claim("sub", "user@test.com")).authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").value("https://res.cloudinary.com/test/avatar.webp"));

        verify(cloudinaryService).subir(any(), eq("avatares"), eq(400));
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void subirAvatar_conAvatarPrevio_eliminaElAnterior() throws Exception {
        usuario.setAvatarUrl("https://res.cloudinary.com/test/old.webp");
        usuario.setAvatarPublicId("avatares/old_public_id");

        when(usuarioRepository.findByEmail("user@test.com")).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));
        when(cloudinaryService.subir(any(), eq("avatares"), eq(400)))
                .thenReturn(new SubidaResult("https://res.cloudinary.com/test/new.webp", "avatares/new_public_id"));

        MockMultipartFile file = new MockMultipartFile(
                "file", "new.jpg", "image/jpeg", "fake-image".getBytes()
        );

        mockMvc.perform(multipart("/auth/perfil/avatar")
                        .file(file)
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        })
                        .with(jwt().jwt(j -> j.claim("sub", "user@test.com")).authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").value("https://res.cloudinary.com/test/new.webp"));

        verify(cloudinaryService).eliminar("avatares/old_public_id");
        verify(cloudinaryService).subir(any(), eq("avatares"), eq(400));
    }

    @Test
    void subirAvatar_sinAutenticacion_devuelve401() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.jpg", "image/jpeg", "fake-image".getBytes()
        );

        mockMvc.perform(multipart("/auth/perfil/avatar")
                        .file(file)
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andExpect(status().isUnauthorized());
    }
}
