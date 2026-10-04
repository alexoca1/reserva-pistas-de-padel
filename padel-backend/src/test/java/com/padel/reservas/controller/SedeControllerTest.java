package com.padel.reservas.controller;

import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.config.SecurityConfig;
import com.padel.reservas.repositories.FotoSedeRepository;
import com.padel.reservas.services.CloudinaryService;
import com.padel.reservas.services.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SedeController.class)
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class})
@TestPropertySource(properties = {
    "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=",
    "cloudinary.cloud-name=test",
    "cloudinary.api-key=test",
    "cloudinary.api-secret=test"
})
class SedeControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean FotoSedeRepository fotoSedeRepository;
    @MockitoBean CloudinaryService cloudinaryService;
    @MockitoBean(name = "jpaMappingContext") JpaMetamodelMappingContext jpaMappingContext;

    @Test
    void subirFoto_undecima_devuelve400() throws Exception {
        when(fotoSedeRepository.count()).thenReturn(10L);

        MockMultipartFile file = new MockMultipartFile(
            "file", "foto11.jpg", MediaType.IMAGE_JPEG_VALUE, new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/sede/fotos").file(file)
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
            .andExpect(status().isBadRequest());
    }

    @Test
    void subirFoto_sinAdmin_devuelve403() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file", "foto.jpg", MediaType.IMAGE_JPEG_VALUE, new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/sede/fotos").file(file)
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
            .andExpect(status().isForbidden());
    }

    @Test
    void getFotos_sinAutenticacion_devuelve200() throws Exception {
        when(fotoSedeRepository.findAllByOrderByOrden()).thenReturn(List.of());

        mockMvc.perform(get("/sede/fotos"))
            .andExpect(status().isOk());
    }
}
