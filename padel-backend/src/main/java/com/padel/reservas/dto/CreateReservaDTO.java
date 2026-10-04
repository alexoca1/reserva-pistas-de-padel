package com.padel.reservas.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Duration;
import java.time.LocalTime;
import java.util.Set;

public record CreateReservaDTO(
        @NotNull
        java.time.LocalDate fechaReserva,

        @NotBlank
        String horaInicio,

        @NotBlank
        String horaFin,

        @NotBlank
        String nombreJugador,

        @NotBlank
        String telefono,

        @NotNull
        Long pistaId,

        Long usuarioId
) {
    private static final Set<Integer> DURACIONES_VALIDAS_MINUTOS = Set.of(60, 90, 120);
    private static final LocalTime CIERRE = LocalTime.of(23, 0);

    @AssertTrue(message = "La duración de la reserva debe ser de 60, 90 o 120 minutos")
    public boolean isDuracionValida() {
        if (horaInicio == null || horaFin == null) return true;
        try {
            long minutos = Duration.between(LocalTime.parse(horaInicio), LocalTime.parse(horaFin)).toMinutes();
            return DURACIONES_VALIDAS_MINUTOS.contains((int) minutos);
        } catch (Exception e) {
            return true;
        }
    }

    @AssertTrue(message = "La reserva no cabe en el horario de apertura (hasta las 23:00)")
    public boolean isDentroDeHorarioCierre() {
        if (horaFin == null) return true;
        try {
            return !LocalTime.parse(horaFin).isAfter(CIERRE);
        } catch (Exception e) {
            return true;
        }
    }
}
