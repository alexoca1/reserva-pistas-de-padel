package com.padel.reservas.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "reservas")
@Entity
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private LocalDate fechaReserva;

    @NotNull
    @Column(nullable = false)
    @JsonFormat(pattern = "HH:mm")
    private LocalTime horaInicio;

    @NotNull
    @Column(nullable = false)
    @JsonFormat(pattern = "HH:mm")
    private LocalTime horaFin;

    @NotBlank
    @Column(nullable = false)
    private String nombreJugador;

    @NotBlank
    @Column(nullable = false)
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoReserva estado = EstadoReserva.CONFIRMADA;

    @Column(name = "fecha_cancelacion")
    private java.time.LocalDateTime fechaCancelacion;

    @Column(name = "codigo_reserva", unique = true)
    private String codigoReserva;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "pista_id", nullable = false)
    private Pista pista;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties({"password", "roles", "enabled", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "username"})
    private Usuario usuario;

    @OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FranjaReservada> franjas = new ArrayList<>();

    @Transient
    public BigDecimal getCosteEstimado() {
        if (pista == null || pista.getPrecioHora() == null || horaInicio == null || horaFin == null) {
            return null;
        }
        long minutos = Duration.between(horaInicio, horaFin).toMinutes();
        return pista.getPrecioHora()
                .multiply(BigDecimal.valueOf(minutos))
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }

    public boolean esJugada(LocalDateTime ahora) {
        if (this.estado != EstadoReserva.CONFIRMADA || this.fechaReserva == null || this.horaFin == null) {
            return false;
        }
        LocalDateTime finPartido = LocalDateTime.of(this.fechaReserva, this.horaFin);
        return finPartido.isBefore(ahora);
    }
}