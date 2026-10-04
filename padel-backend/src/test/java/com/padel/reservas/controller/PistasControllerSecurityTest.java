package com.padel.reservas.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.config.SecurityConfig;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PistasController.class)
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class})
@TestPropertySource(properties = "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=")
class PistasControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean(name = "jpaMappingContext")
    private JpaMetamodelMappingContext jpaMappingContext;

    @MockitoBean
    private PistaRepository pistaRepository;

    @MockitoBean
    private FotoPistaRepository fotoPistaRepository;

    @MockitoBean
    private CloudinaryService cloudinaryService;

    @Test
    void getPistas_unauthenticated_returns200() throws Exception {
        when(pistaRepository.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/pistas"))
                .andExpect(status().isOk());
    }

    @Test
    void getPistas_authenticatedUser_returns200() throws Exception {
        when(pistaRepository.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/pistas")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isOk());
    }

    @Test
    void createPista_authenticatedUserWithoutAdminRole_returns403() throws Exception {
        Pista nuevaPista = new Pista();
        nuevaPista.setNumeroPista(1);
        nuevaPista.setTieneIluminacion(true);

        mockMvc.perform(post("/pistas")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nuevaPista)))
                .andExpect(status().isForbidden());
    }

    @Test
    void createPista_authenticatedAdminRole_returns201() throws Exception {
        Pista nuevaPista = new Pista();
        nuevaPista.setId(1L);
        nuevaPista.setNumeroPista(1);
        nuevaPista.setTieneIluminacion(true);

        when(pistaRepository.save(any(Pista.class))).thenReturn(nuevaPista);

        mockMvc.perform(post("/pistas")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nuevaPista)))
                .andExpect(status().isCreated());
    }

    @Test
    void updatePista_authenticatedUserWithoutAdminRole_returns403() throws Exception {
        Pista pistaModificada = new Pista();
        pistaModificada.setNumeroPista(2);

        mockMvc.perform(put("/pistas/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pistaModificada)))
                .andExpect(status().isForbidden());
    }

    @Test
    void deletePista_authenticatedUserWithoutAdminRole_returns403() throws Exception {
        mockMvc.perform(delete("/pistas/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isForbidden());
    }
}

