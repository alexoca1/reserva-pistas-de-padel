package com.padel.reservas.dto;

import java.math.BigDecimal;

public record EstadisticasUsuarioDTO(
    long partidosJugados,
    double horasEnPista,
    BigDecimal gastoNeto,
    Integer pistaMasFrecuente
) {}
