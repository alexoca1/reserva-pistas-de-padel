package com.padel.reservas.config;

import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class JwtSecretKeyProviderTest {

    // 32 bytes en Base64: "dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY="
    private static final String VALID_SECRET_BASE64 = Base64.getEncoder().encodeToString(
            "12345678901234567890123456789012".getBytes() // 32 bytes
    );

    @Test
    void constructor_withValidBase64Secret_initializesSecretKey() {
        JwtSecretKeyProvider provider = new JwtSecretKeyProvider(VALID_SECRET_BASE64);

        SecretKey secretKey = provider.getSecretKey();
        assertNotNull(secretKey);
        assertEquals("HmacSHA256", secretKey.getAlgorithm());
    }

    @Test
    void constructor_withNullOrBlankSecret_throwsIllegalStateException() {
        IllegalStateException exNull = assertThrows(
                IllegalStateException.class,
                () -> new JwtSecretKeyProvider(null)
        );
        assertTrue(exNull.getMessage().contains("Falta la variable de entorno JWT_SECRET"));

        IllegalStateException exEmpty = assertThrows(
                IllegalStateException.class,
                () -> new JwtSecretKeyProvider("")
        );
        assertTrue(exEmpty.getMessage().contains("Falta la variable de entorno JWT_SECRET"));

        IllegalStateException exBlank = assertThrows(
                IllegalStateException.class,
                () -> new JwtSecretKeyProvider("   ")
        );
        assertTrue(exBlank.getMessage().contains("Falta la variable de entorno JWT_SECRET"));
    }

    @Test
    void constructor_withTooShortSecret_throwsIllegalStateException() {
        // Clave de solo 16 bytes codificada en Base64 (menos de 256 bits)
        String shortSecretBase64 = Base64.getEncoder().encodeToString("1234567890123456".getBytes());

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> new JwtSecretKeyProvider(shortSecretBase64)
        );
        assertTrue(ex.getMessage().contains("demasiado corta"));
    }

    @Test
    void constructor_withInvalidBase64Format_throwsIllegalStateException() {
        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> new JwtSecretKeyProvider("not-a-valid-base64-string!@#$")
        );
        assertTrue(ex.getMessage().contains("no tiene un formato Base64 válido"));
    }
}

