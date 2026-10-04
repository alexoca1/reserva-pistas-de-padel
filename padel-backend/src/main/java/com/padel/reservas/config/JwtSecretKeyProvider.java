package com.padel.reservas.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;

/**
 * Proveedor de la clave secreta HMAC-SHA para firma y validación de tokens JWT.
 *
 * La clave debe suministrarse mediante la variable de entorno JWT_SECRET (o propiedad jwt.secret)
 * codificada en Base64 con una longitud mínima de 32 bytes (256 bits para HMAC-SHA-256).
 *
 * Para generar un valor seguro en Base64 ejecute en su terminal:
 *   openssl rand -base64 32
 */
@Component
public class JwtSecretKeyProvider {

    private final SecretKey secretKey;

    public JwtSecretKeyProvider(@Value("${jwt.secret}") String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("Falta la variable de entorno JWT_SECRET (o propiedad jwt.secret). " +
                    "Debe proporcionar una clave de al menos 32 bytes codificada en Base64 (ej: openssl rand -base64 32).");
        }

        try {
            byte[] keyBytes = Base64.getDecoder().decode(secret.trim());
            if (keyBytes.length < 32) {
                throw new IllegalStateException("La clave JWT_SECRET es demasiado corta. " +
                        "Debe tener al menos 256 bits (32 bytes decodificados de Base64).");
            }
            this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("La clave JWT_SECRET no tiene un formato Base64 válido.", e);
        }
    }

    public SecretKey getSecretKey() {
        return secretKey;
    }
}
