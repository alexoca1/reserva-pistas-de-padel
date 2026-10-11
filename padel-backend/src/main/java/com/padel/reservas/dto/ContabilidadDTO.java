package com.padel.reservas.dto;

import java.math.BigDecimal;

public record ContabilidadDTO(
    BigDecimal ingresosBrutos,
    BigDecimal reembolsosEmitidos,
    BigDecimal ingresosNetos,
    long reservasConfirmadas,
    long reservasCanceladas,
    double tasaCancelacion
) {}
