package com.padel.reservas.dto;

import java.math.BigDecimal;

public record ValidacionQRDTO(
    Long reservaId,
    String codigoReserva,
    String nombreJugador,
    String telefono,
    String fechaReserva,
    String horaInicio,
    String horaFin,
    Integer numeroPista,
    String estado,
    BigDecimal costeEstimado
) {}
