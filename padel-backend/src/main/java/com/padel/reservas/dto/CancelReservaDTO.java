package com.padel.reservas.dto;

import com.padel.reservas.entities.MetodoPago;

public record CancelReservaDTO(
    MetodoPago metodoPago,
    boolean aplicarTramos
) {}
