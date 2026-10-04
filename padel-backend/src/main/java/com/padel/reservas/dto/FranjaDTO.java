package com.padel.reservas.dto;

public record FranjaDTO(
        String horaInicio,
        String horaFin,
        String nombreJugador,
        Long reservaId,
        Long usuarioId
) {}
