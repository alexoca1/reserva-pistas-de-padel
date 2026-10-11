package com.padel.reservas.dto;

import java.math.BigDecimal;

public record PagoDTO(
    Long id,
    String tipo,
    String metodo,
    BigDecimal importe,
    String fechaPago,
    String concepto
) {}
