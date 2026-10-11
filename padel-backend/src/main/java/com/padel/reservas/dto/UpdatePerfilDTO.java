package com.padel.reservas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdatePerfilDTO(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotBlank(message = "Los apellidos son obligatorios")
        String apellidos,

        String telefono,

        @Email(message = "El correo electrónico debe ser válido")
        String email,

        @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
        )
        String password,

        String currentPassword,

        Long usuarioId
) {
    public UpdatePerfilDTO(String nombre, String apellidos, String telefono, Long usuarioId) {
        this(nombre, apellidos, telefono, null, null, null, usuarioId);
    }
}
