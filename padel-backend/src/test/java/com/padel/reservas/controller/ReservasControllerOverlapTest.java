package com.padel.reservas.controller;

import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.config.SecurityConfig;
import com.padel.reservas.entities.Pista;
import com.padel.reservas.entities.Reserva;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.exception.ReservaSolapadaException;
import com.padel.reservas.repositories.PistaRepository;
import com.padel.reservas.repositories.ReservaRepository;
import com.padel.reservas.repositories.UsuarioRepository;
import com.padel.reservas.services.JwtService;
import com.padel.reservas.services.ReservaService;
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

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReservasController.class)
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class})
@TestPropertySource(properties = "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=")
class ReservasControllerOverlapTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean(name = "jpaMappingContext")
    private JpaMetamodelMappingContext jpaMappingContext;

    @MockitoBean
    private ReservaRepository reservaRepository;

    @MockitoBean
    private PistaRepository pistaRepository;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @MockitoBean
    private ReservaService reservaService;

    private final String cuerpoReserva = """
            {
              "fechaReserva": "2026-12-01",
              "horaInicio": "14:00",
              "horaFin": "15:00",
              "nombreJugador": "Ana",
              "telefono": "600123123",
              "pistaId": 1
            }
            """;

    @Test
    void createReserva_horarioLibre_devuelve201() throws Exception {
        when(pistaRepository.findById(1L)).thenReturn(Optional.of(new Pista()));
        when(usuarioRepository.findByEmail("ana@test.com")).thenReturn(Optional.of(new Usuario()));
        when(reservaService.crear(any(), any(), any())).thenReturn(new Reserva());

        mockMvc.perform(post("/reservas")
                        .with(jwt().jwt(j -> j.subject("ana@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpoReserva))
                .andExpect(status().isCreated());
    }

    @Test
    void createReserva_horarioOcupado_devuelve409() throws Exception {
        when(pistaRepository.findById(1L)).thenReturn(Optional.of(new Pista()));
        when(usuarioRepository.findByEmail("ana@test.com")).thenReturn(Optional.of(new Usuario()));
        when(reservaService.crear(any(), any(), any()))
                .thenThrow(new ReservaSolapadaException("La pista ya tiene una reserva que se solapa con ese horario"));

        mockMvc.perform(post("/reservas")
                        .with(jwt().jwt(j -> j.subject("ana@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpoReserva))
                .andExpect(status().isConflict());
    }

    @Test
    void getDisponibilidad_devuelveFranjasOcupadas() throws Exception {
        Reserva r1 = new Reserva();
        r1.setHoraInicio(java.time.LocalTime.of(10, 0));
        r1.setHoraFin(java.time.LocalTime.of(11, 30));

        when(reservaRepository.findByPistaIdAndFechaReserva(1L, LocalDate.of(2026, 12, 1)))
                .thenReturn(List.of(r1));

        mockMvc.perform(get("/reservas/disponibilidad")
                        .param("pistaId", "1")
                        .param("fecha", "2026-12-01")
                        .with(jwt().jwt(j -> j.subject("ana@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].horaInicio").value("10:00"))
                .andExpect(jsonPath("$[0].horaFin").value("11:30"));
    }
}
