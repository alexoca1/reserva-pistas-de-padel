package com.padel.reservas.dto;

import java.util.List;

public record DisponibilidadDiaDTO(
        Long pistaId,
        Integer numeroPista,
        List<FranjaDTO> franjas
) {}
