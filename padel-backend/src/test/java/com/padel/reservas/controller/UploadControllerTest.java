package com.padel.reservas.controller;

import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.config.SecurityConfig;
import com.padel.reservas.dto.SubidaResult;
import com.padel.reservas.services.CloudinaryService;
import com.padel.reservas.services.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UploadController.class)
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class})
@TestPropertySource(properties = {
    "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=",
    "cloudinary.cloud-name=test",
    "cloudinary.api-key=test",
    "cloudinary.api-secret=test"
})
class UploadControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean CloudinaryService cloudinaryService;
    @MockitoBean(name = "jpaMappingContext")
    JpaMetamodelMappingContext jpaMappingContext;

    @Test
    void upload_archivoGrande_devuelve400() throws Exception {
        byte[] contenidoGrande = new byte[11 * 1024 * 1024]; // 11 MB
        MockMultipartFile file = new MockMultipartFile(
            "file", "foto.jpg", MediaType.IMAGE_JPEG_VALUE, contenidoGrande);

        mockMvc.perform(multipart("/upload").file(file)
                .with(jwt()))
            .andExpect(status().isBadRequest());
    }

    @Test
    void upload_sinAutenticacion_devuelve401() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file", "foto.jpg", MediaType.IMAGE_JPEG_VALUE, new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/upload").file(file))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void upload_archivoValido_devuelve200() throws Exception {
        when(cloudinaryService.subir(any(), anyString(), anyInt()))
            .thenReturn(new SubidaResult("https://res.cloudinary.com/test.webp", "padel-calatrava/general/abc123"));

        MockMultipartFile file = new MockMultipartFile(
            "file", "foto.jpg", MediaType.IMAGE_JPEG_VALUE, new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/upload").file(file)
                .with(jwt()))
            .andExpect(status().isOk());
    }
}
