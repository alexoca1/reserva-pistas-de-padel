# Spec 036 — RGPD: Derechos de Supresión y Portabilidad (Borrado y Exportación de Cuenta)

**Estado:** Implementada  
**Fecha:** 2026-10-04  
**Afecta:** `padel-backend` (`Usuario.java`, `UsuarioRepository.java`, `AuthController.java`, tests de seguridad y controladores), `padel-frontend` (`types/index.ts`, `services/api.ts`, `PerfilPage.tsx`), documentación (`padel-backend/AGENTS.md`, `padel-frontend/AGENTS.md`)

---

## Resumen

Esta especificación cubre dos derechos fundamentales garantizados por el Reglamento General de Protección de Datos (RGPD / GDPR) y la LOPD-GDD española:
1. **Derecho a la portabilidad de los datos (Art. 20 RGPD)**: Permite al usuario descargar una copia estructurada, de uso común y legible por máquina (formato JSON) de todos sus datos personales y el historial de sus reservas.
2. **Derecho de supresión / derecho al olvido (Art. 17 RGPD)**: Permite al usuario solicitar la eliminación de su cuenta. Se ejecuta mediante anonimización técnica irreversible de los datos personales (email, nombre, apellidos, teléfono, avatar), eliminación de credenciales activas (tokens) y activos multimedia en Cloudinary, preservando la integridad referencial de las reservas del club sin conservar datos identificativos.

Ambas funcionalidades se gestionan desde un punto único en la interfaz de usuario: la sección *"Privacidad y datos"* en `PerfilPage.tsx`.

---

## Escenarios

- **Como usuario registrado**, quiero descargar todos los datos que el club conserva sobre mi perfil y mis reservas en un archivo JSON descargable directamente desde mi navegador.
- **Como usuario registrado**, quiero poder eliminar mi cuenta de forma definitiva. Al confirmar la acción escribiendo "ELIMINAR", mis datos personales son anonimizados, mi avatar eliminado del almacenamiento externo, mis sesiones revocadas y soy redirigido a la página de inicio.
- **Como administrador único del sistema**, si intento eliminar mi cuenta, el sistema me lo impide devolviendo un conflicto (409) con un mensaje claro explicándome que no se puede eliminar la única cuenta de administrador existente.
- **Como administrador en un sistema con múltiples administradores**, puedo eliminar mi propia cuenta siguiendo el flujo normal de supresión.

---

## Requisitos funcionales

### Backend (`padel-backend`)

#### RF-01 — Modelo `Usuario` y campo `fechaBaja`
- Añadir el campo `private LocalDateTime fechaBaja;` en la entidad `Usuario.java`.
- Inicialmente `null` para usuarios activos; se establece con `LocalDateTime.now()` en el proceso de supresión.

#### RF-02 — Exportación de datos (`GET /auth/mis-datos`)
- **Ruta:** `GET /auth/mis-datos`
- **Control de acceso:** Requiere autenticación (`anyRequest().authenticated()`), cualquier rol (`ROLE_USER` o `ROLE_ADMIN`).
- **Respuesta (200 OK):** Objeto JSON que recopila:
  - Datos de perfil: `id`, `nombre`, `apellidos`, `email`, `telefono`, `avatarUrl`, `roles`, `fechaRegistro`.
  - Lista de reservas propias (`reservas`), conteniendo: `id`, `codigoReserva`, `fechaReserva`, `horaInicio`, `horaFin`, `estado`, información de la pista (`pistaId`, `numeroPista`) y `nombreJugador`/`telefono` de la reserva.
- No expone `password`, tokens ni datos de otros usuarios del club.

#### RF-03 — Supresión y anonimización de cuenta (`DELETE /auth/cuenta`)
- **Ruta:** `DELETE /auth/cuenta`
- **Control de acceso:** Requiere autenticación, cualquier rol.
- **Lógica de negocio transaccional (`@Transactional`):**
  1. **Guarda de último administrador:** Comprobar si el usuario tiene `ROLE_ADMIN` y si el número total de administradores en el sistema es igual a 1. En caso afirmativo, abortar devolviendo `409 Conflict` con cuerpo `{ "error": "No puedes eliminar la única cuenta de administrador" }`.
  2. **Limpieza de Cloudinary (RGPD):** Si el usuario tiene `avatarPublicId != null && !avatarPublicId.isBlank()`, invocar `cloudinaryService.eliminar(avatarPublicId)` para purgar la imagen de la CDN.
  3. **Revocación de sesiones activas:** Invocar `refreshTokenRepository.deleteByUsuario(usuario)` para revocar todos los refresh tokens asociados.
  4. **Anonimización irreversible:**
     - `email` → `deleted_[id]_[timestamp]@removed.invalid`
     - `nombre` → `"Usuario eliminado"`
     - `apellidos` → `""`
     - `telefono` → `null`
     - `avatarUrl` → `null`
     - `avatarPublicId` → `null`
     - `enabled` → `false`
     - `fechaBaja` → `LocalDateTime.now()`
  5. **Persistencia:** Guardar el usuario anonimizado con `usuarioRepository.save(usuario)`. No se ejecuta un `DELETE` físico SQL sobre la tabla `usuario`.
  6. **Respuesta:** `204 No Content`. Las reservas asociadas permanecen intactas en la base de datos (con usuario anonimizado).

#### RF-04 — Tests de seguridad y controladores
- `GET /auth/mis-datos` no autenticado → `401 Unauthorized`.
- `GET /auth/mis-datos` autenticado → `200 OK` con datos correctos.
- `DELETE /auth/cuenta` no autenticado → `401 Unauthorized`.
- `DELETE /auth/cuenta` usuario estándar → `204 No Content` y verificar mediante `ArgumentCaptor` la anonimización de datos y fecha de baja.
- `DELETE /auth/cuenta` único admin → `409 Conflict`.

---

### Frontend (`padel-frontend`)

#### RF-05 — Tipos y servicio API
- En `types/index.ts`: añadir `fechaBaja?: string;` a la interfaz `Usuario`.
- En `services/api.ts`:
  - `perfilService.getMisDatos(): Promise<Record<string, unknown>>` → llamada a `GET /auth/mis-datos`.
  - `perfilService.eliminarCuenta(): Promise<void>` → llamada a `DELETE /auth/cuenta`.

#### RF-06 — UI en `PerfilPage.tsx` (Sección "Privacidad y datos")
- Añadir sección "Privacidad y datos" al final de la vista de perfil propio, visualmente separada con borde y tarjetas acordes al sistema de diseño (`Card`).
- **Acción 1 (Portabilidad):**
  - Botón *"Descargar mis datos"*.
  - Muestra spinner / estado de carga mientras se procesa la solicitud.
  - Genera y dispara la descarga en el navegador del archivo `mis-datos-padel-reservas.json` usando `Blob` y `URL.createObjectURL`.
- **Acción 2 (Supresión):**
  - Botón *"Eliminar mi cuenta"* con `variant="destructive"`.
  - Abre un modal con `Dialog` que advierte de las consecuencias irreversibles.
  - Solicita al usuario teclear exactamente la palabra `"ELIMINAR"` en un campo de texto para habilitar el botón final de confirmación.
  - Al confirmar:
    - Ejecuta `perfilService.eliminarCuenta()`.
    - Si la respuesta es `204`: llama a `logout()` de `AuthContext` y redirige a `/` con notificación toast.
    - Si la respuesta es `409 Conflict`: muestra el mensaje de error inline dentro del diálogo sin cerrarlo y rehabilita los controles.
