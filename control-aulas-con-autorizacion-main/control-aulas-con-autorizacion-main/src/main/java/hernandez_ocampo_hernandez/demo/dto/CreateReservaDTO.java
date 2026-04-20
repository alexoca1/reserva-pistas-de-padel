package hernandez_ocampo_hernandez.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateReservaDTO(
        @NotNull
        LocalDate fechaReserva,

        @NotBlank
        String horaInicio,

        @NotBlank
        String horaFin,

        @NotBlank
        String nombreJugador,

        @NotBlank
        String telefono,

        @NotNull
        Long pistaId
) {}

