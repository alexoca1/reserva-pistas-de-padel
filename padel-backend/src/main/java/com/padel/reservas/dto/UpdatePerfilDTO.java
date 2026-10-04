package com.padel.reservas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdatePerfilDTO(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotBlank(message = "Los apellidos son obligatorios")
        String apellidos,

        String telefono,

        @Email(message = "El correo electrónico debe ser válido")
        String email,

        String password,

        String currentPassword,

        Long usuarioId
) {
    public UpdatePerfilDTO(String nombre, String apellidos, String telefono, Long usuarioId) {
        this(nombre, apellidos, telefono, null, null, null, usuarioId);
    }
}
