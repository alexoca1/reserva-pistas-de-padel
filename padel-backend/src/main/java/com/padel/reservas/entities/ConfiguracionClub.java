package com.padel.reservas.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "configuracion_club")
@Getter
@Setter
public class ConfiguracionClub {

    @Id
    private Long id = 1L;

    @Column(nullable = false)
    private Integer duracionMinimaMinutos = 60;

    @Column(nullable = false)
    private String duracionesPermitidasMinutos = "60,90,120";

    @Column(nullable = false)
    private Integer duracionPorDefectoMinutos = 90;

    @Column(nullable = false)
    private Integer maximoMinutosPorDia = 120;

    @Column(nullable = false)
    private LocalTime horaApertura = LocalTime.of(9, 0);

    @Column(nullable = false)
    private LocalTime horaCierre = LocalTime.of(23, 0);

    @Column(nullable = false)
    private Integer diasAntelacionMaxima = 7;

    @Transient
    public Set<Integer> getDuracionesPermitidas() {
        return Arrays.stream(duracionesPermitidasMinutos.split(","))
            .map(String::trim)
            .map(Integer::parseInt)
            .collect(Collectors.toSet());
    }
}
