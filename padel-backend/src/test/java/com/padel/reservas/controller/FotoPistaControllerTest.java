package com.padel.reservas.controller;

import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.config.SecurityConfig;
import com.padel.reservas.entities.FotoPista;
import com.padel.reservas.entities.Pista;
import com.padel.reservas.repositories.FotoPistaRepository;
import com.padel.reservas.repositories.PistaRepository;
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
import java.util.Optional;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FotoPistaController.class)
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class})
@TestPropertySource(properties = {
    "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=",
    "cloudinary.cloud-name=test",
    "cloudinary.api-key=test",
    "cloudinary.api-secret=test"
})
class FotoPistaControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean FotoPistaRepository fotoPistaRepository;
    @MockitoBean PistaRepository pistaRepository;
    @MockitoBean CloudinaryService cloudinaryService;
    @MockitoBean(name = "jpaMappingContext") JpaMetamodelMappingContext jpaMappingContext;

    @Test
    void subirFoto_sexta_devuelve400() throws Exception {
        when(fotoPistaRepository.countByPistaId(1L)).thenReturn(5L);

        MockMultipartFile file = new MockMultipartFile(
            "file", "foto6.jpg", MediaType.IMAGE_JPEG_VALUE, new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/pistas/1/fotos").file(file)
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
            .andExpect(status().isBadRequest());
    }

    @Test
    void subirFoto_sinAdmin_devuelve403() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file", "foto.jpg", MediaType.IMAGE_JPEG_VALUE, new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/pistas/1/fotos").file(file)
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
            .andExpect(status().isForbidden());
    }

    @Test
    void getFotos_sinAutenticacion_devuelve200() throws Exception {
        when(fotoPistaRepository.findByPistaIdOrderByOrden(1L)).thenReturn(List.of());

        mockMvc.perform(get("/pistas/1/fotos"))
            .andExpect(status().isOk());
    }

    @Test
    void eliminarFoto_eraPortada_promueveNueva() throws Exception {
        FotoPista fotoEliminar = new FotoPista();
        fotoEliminar.setId(10L);
        fotoEliminar.setEsPortada(true);
        fotoEliminar.setPublicId("padel-calatrava/pistas/foto10");

        Pista pista = new Pista();
        pista.setId(1L);
        pista.setImagenUrl("https://cloudinary.com/foto10.webp");
        fotoEliminar.setPista(pista);

        FotoPista fotoSiguiente = new FotoPista();
        fotoSiguiente.setId(11L);
        fotoSiguiente.setUrl("https://cloudinary.com/foto11.webp");
        fotoSiguiente.setPublicId("padel-calatrava/pistas/foto11");
        fotoSiguiente.setEsPortada(false);

        when(fotoPistaRepository.findById(10L)).thenReturn(Optional.of(fotoEliminar));
        when(fotoPistaRepository.findByPistaIdOrderByOrden(1L)).thenReturn(List.of(fotoSiguiente));
        when(pistaRepository.findById(1L)).thenReturn(Optional.of(pista));

        mockMvc.perform(delete("/pistas/1/fotos/10")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
            .andExpect(status().isNoContent());

        verify(cloudinaryService).eliminar("padel-calatrava/pistas/foto10");
        verify(fotoPistaRepository).delete(fotoEliminar);
        verify(fotoPistaRepository).save(argThat(FotoPista::isEsPortada));
        verify(pistaRepository).save(argThat(p -> "https://cloudinary.com/foto11.webp".equals(p.getImagenUrl())));
    }
}
