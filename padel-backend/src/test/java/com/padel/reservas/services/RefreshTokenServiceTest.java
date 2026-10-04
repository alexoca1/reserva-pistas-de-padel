package com.padel.reservas.services;

import com.padel.reservas.entities.RefreshToken;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.repositories.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = Usuario.builder()
                .id(1L)
                .email("test@padel.com")
                .nombre("Test")
                .apellidos("User")
                .roles("ROLE_USER")
                .enabled(true)
                .build();
    }

    @Test
    void testCreateRefreshToken() {
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RefreshToken token = refreshTokenService.createRefreshToken(usuario);

        assertNotNull(token);
        assertNotNull(token.getToken());
        assertEquals(usuario, token.getUsuario());
        assertFalse(token.isRevoked());
        assertTrue(token.getExpiryDate().isAfter(Instant.now()));
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    void testRotateRefreshTokenSuccess() {
        String tokenStr = "valid-token-123";
        RefreshToken existingToken = RefreshToken.builder()
                .id(10L)
                .token(tokenStr)
                .usuario(usuario)
                .expiryDate(Instant.now().plus(7, ChronoUnit.DAYS))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByToken(tokenStr)).thenReturn(Optional.of(existingToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RefreshToken newRotatedToken = refreshTokenService.rotateRefreshToken(tokenStr);

        assertNotNull(newRotatedToken);
        assertNotEquals(tokenStr, newRotatedToken.getToken());
        assertEquals(usuario, newRotatedToken.getUsuario());
        assertTrue(existingToken.isRevoked());
        verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
    }

    @Test
    void testRotateRefreshTokenReuseDetection() {
        String tokenStr = "stolen-reused-token";
        RefreshToken reusedToken = RefreshToken.builder()
                .id(10L)
                .token(tokenStr)
                .usuario(usuario)
                .expiryDate(Instant.now().plus(7, ChronoUnit.DAYS))
                .revoked(true) // Ya fue usado y revocado previamente
                .build();

        when(refreshTokenRepository.findByToken(tokenStr)).thenReturn(Optional.of(reusedToken));

        BadCredentialsException exception = assertThrows(BadCredentialsException.class, () -> {
            refreshTokenService.rotateRefreshToken(tokenStr);
        });

        assertTrue(exception.getMessage().contains("reutilización"));
        // Se deben invalidar/eliminar todos los tokens del usuario comprometido
        verify(refreshTokenRepository, times(1)).deleteByUsuario(usuario);
    }

    @Test
    void testRotateRefreshTokenExpired() {
        String tokenStr = "expired-token";
        RefreshToken expiredToken = RefreshToken.builder()
                .id(10L)
                .token(tokenStr)
                .usuario(usuario)
                .expiryDate(Instant.now().minus(1, ChronoUnit.DAYS))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByToken(tokenStr)).thenReturn(Optional.of(expiredToken));

        BadCredentialsException exception = assertThrows(BadCredentialsException.class, () -> {
            refreshTokenService.rotateRefreshToken(tokenStr);
        });

        assertTrue(exception.getMessage().contains("expirado"));
        verify(refreshTokenRepository, times(1)).delete(expiredToken);
    }

    @Test
    void limpiarExpirados_llamaAlRepositorioConInstanteActual() {
        Instant antes = Instant.now();
        refreshTokenService.limpiarExpirados();
        Instant despues = Instant.now();

        ArgumentCaptor<Instant> captor = ArgumentCaptor.forClass(Instant.class);
        verify(refreshTokenRepository)
                .deleteAllByExpiryDateBefore(captor.capture());

        Instant instanteUsado = captor.getValue();
        assertFalse(instanteUsado.isBefore(antes));
        assertFalse(instanteUsado.isAfter(despues));
    }
}
