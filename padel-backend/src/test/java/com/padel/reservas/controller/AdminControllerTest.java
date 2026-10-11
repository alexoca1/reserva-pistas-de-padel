package com.padel.reservas.controller;

import com.padel.reservas.config.DemoAdminAspect;
import com.padel.reservas.config.JwtSecretKeyProvider;
import com.padel.reservas.config.SecurityConfig;
import com.padel.reservas.entities.EstadoReserva;
import com.padel.reservas.entities.Pago;
import com.padel.reservas.entities.Pista;
import com.padel.reservas.entities.Reserva;
import com.padel.reservas.entities.TipoPago;
import com.padel.reservas.entities.MetodoPago;
import com.padel.reservas.repositories.PagoRepository;
import com.padel.reservas.repositories.ReservaRepository;
import com.padel.reservas.services.ConfiguracionClubService;
import com.padel.reservas.services.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@EnableAspectJAutoProxy
@Import({SecurityConfig.class, JwtService.class, JwtSecretKeyProvider.class, DemoAdminAspect.class})
@TestPropertySource(properties = "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTAxMjM0NTY=")
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean(name = "jpaMappingContext")
    private JpaMetamodelMappingContext jpaMappingContext;

    @MockitoBean
    private com.padel.reservas.repositories.UsuarioRepository usuarioRepository;

    @MockitoBean
    private ConfiguracionClubService configuracionService;

    @MockitoBean
    private PagoRepository pagoRepository;

    @MockitoBean
    private ReservaRepository reservaRepository;

    @Test
    void getContabilidad_sinToken_lanza401() throws Exception {
        mockMvc.perform(get("/admin/contabilidad"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getContabilidad_rolUser_lanza403() throws Exception {
        mockMvc.perform(get("/admin/contabilidad")
                        .with(jwt()
                                .jwt(jwtBuilder -> jwtBuilder.subject("user@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getContabilidad_rolAdmin_devuelve200ConIngresosNetos() throws Exception {
        when(pagoRepository.sumImporteByTipoAndPeriodo(eq(TipoPago.COBRO), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(BigDecimal.valueOf(100.0));
        when(pagoRepository.sumImporteByTipoAndPeriodo(eq(TipoPago.REEMBOLSO), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(BigDecimal.valueOf(20.0));
        when(reservaRepository.countByEstadoAndFechaReservaBetween(eq(EstadoReserva.CONFIRMADA), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(4L);
        when(reservaRepository.countByEstadoAndFechaReservaBetween(eq(EstadoReserva.CANCELADA), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(1L);

        mockMvc.perform(get("/admin/contabilidad")
                        .with(jwt()
                                .jwt(jwtBuilder -> jwtBuilder.subject("admin@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ingresosBrutos").value(100.0))
                .andExpect(jsonPath("$.reembolsosEmitidos").value(20.0))
                .andExpect(jsonPath("$.ingresosNetos").value(80.0))
                .andExpect(jsonPath("$.reservasConfirmadas").value(4))
                .andExpect(jsonPath("$.reservasCanceladas").value(1))
                .andExpect(jsonPath("$.tasaCancelacion").value(20.0));
    }

    @Test
    void getContabilidadCsv_rolAdmin_devuelve200YTextCsv() throws Exception {
        Pista pista = new Pista();
        pista.setNumeroPista(1);

        Reserva reserva = new Reserva();
        reserva.setCodigoReserva("RES-20261010-001");
        reserva.setPista(pista);

        Pago pago = new Pago();
        pago.setId(1L);
        pago.setTipo(TipoPago.COBRO);
        pago.setMetodo(MetodoPago.TARJETA_SIMULADA);
        pago.setImporte(BigDecimal.valueOf(25.0));
        pago.setFechaPago(LocalDateTime.of(2026, 10, 10, 10, 0));
        pago.setConcepto("Cobro reserva");
        pago.setReserva(reserva);

        when(pagoRepository.findAllConReservaYPistaEnPeriodo(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(pago));

        mockMvc.perform(get("/admin/contabilidad/csv")
                        .with(jwt()
                                .jwt(jwtBuilder -> jwtBuilder.subject("admin@test.com"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", org.hamcrest.Matchers.containsString("text/csv")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("RES-20261010-001")));
    }

    @Test
    void getContabilidadCsv_sinToken_lanza401() throws Exception {
        mockMvc.perform(get("/admin/contabilidad/csv"))
                .andExpect(status().isUnauthorized());
    }
}
