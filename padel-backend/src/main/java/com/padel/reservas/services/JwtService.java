package com.padel.reservas.services;

import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.entities.Usuario;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JwtService {
    private static final long ACCESS_TOKEN_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutos
    private final JwtSecretKeyProvider jwtSecretKeyProvider;

    public String generateToken(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return generateToken(usuario);
    }

    public String generateToken(Usuario usuario) {
        List<String> roles = usuario.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .toList();

        return Jwts.builder()
                .subject(usuario.getEmail())
                .issuer("gestion-centro-api")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION_MS))
                .claim("roles", roles)
                .signWith(getSecretKey(), Jwts.SIG.HS256)
                .compact();
    }

    public SecretKey getSecretKey() {
        return jwtSecretKeyProvider.getSecretKey();
    }
}