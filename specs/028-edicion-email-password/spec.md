# Spec: Edición de email y contraseña en perfil

**Estado:** Implementada

## Resumen
La spec 015 dejó fuera de alcance la edición del email y la contraseña. Sin embargo, los usuarios y administradores necesitan poder actualizar estos datos de acceso (email) y credenciales (password) de forma segura desde la interfaz del perfil. Se añade esta capacidad al frontend y al DTO de backend.

## Escenarios
- Como usuario, quiero poder cambiar mi correo electrónico en caso de que pierda acceso al antiguo o prefiera usar otro.
- Como usuario, quiero poder cambiar mi contraseña introduciendo mi contraseña actual por motivos de seguridad.
- Como administrador, quiero poder editar el email o resetear la contraseña de un usuario en caso de que este lo solicite.

## Requisitos funcionales
- RF-01: El formulario de edición de "Mis datos" en `/perfil` incluye campos para `email`, `currentPassword`, y `password` (nueva contraseña) además de los ya existentes (`nombre`, `apellidos`, `telefono`).
- RF-02: El formulario de edición de "Editar datos de un jugador" (solo admin) incluye el campo para modificar el `email` de ese jugador, e incluye un campo para asinarle una nueva `password` (sin requerir la `currentPassword` del jugador).
- RF-03: `UpdatePerfilDTO` soporta los campos `email` (validado con `@Email`), `password`, y `currentPassword`.
- RF-04: La lógica de backend (`PUT /auth/perfil`) valida correctamente la `currentPassword` si el usuario intenta cambiar su propia contraseña, y permite la actualización de email verificando que no existan duplicados (manejo del constraint de base de datos).
- RF-05: El frontend maneja estos campos en el mismo payload existente de `UpdatePerfilDTO` y muestra un mensaje en caso de error.

## Fuera de alcance
- Recuperación de contraseña por email (flujo de "olvidé mi contraseña").
- Enviar email de confirmación tras el cambio de correo electrónico.

## Preguntas abiertas
Ninguna.
