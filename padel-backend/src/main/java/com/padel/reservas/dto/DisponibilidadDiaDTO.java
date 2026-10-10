package com.padel.reservas.dto;

import java.math.BigDecimal;
import java.util.List;

public record DisponibilidadDiaDTO(
        Long pistaId,
        Integer numeroPista,
        List<FranjaDTO> franjas,
        BigDecimal precioHora,
        String estado
) {}
