package com.padel.reservas.dto;

import java.time.LocalTime;

public record UpdateConfiguracionDTO(
    Integer duracionMinimaMinutos,
    String duracionesPermitidasMinutos,
    Integer duracionPorDefectoMinutos,
    Integer maximoMinutosPorDia,
    LocalTime horaApertura,
    LocalTime horaCierre,
    Integer diasAntelacionMaxima
) {}
