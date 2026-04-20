// ARCHIVO: JwtService.java
package hernandez_ocampo_hernandez.demo.services;

import hernandez_ocampo_hernandez.demo.entities.Usuario;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JwtService {
    private final SecretKey secretKey;

    public JwtService() {
        this.secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    }

    public String generateToken(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();

        // CAMBIO: Crear una lista de roles en lugar de un string
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return Jwts.builder()
                .subject(usuario.getEmail())
                .issuer("gestion-centro-api")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))  // 24h
                .claim("roles", roles)  // Ahora es una lista
                .signWith(secretKey)
                .compact();
    }

    public SecretKey getSecretKey() {
        return secretKey;
    }
}