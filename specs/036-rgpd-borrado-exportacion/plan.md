# Plan técnico: Spec 036 — RGPD: Derechos de Supresión y Portabilidad

**Spec relacionada:** `../spec.md`

---

## Diseño técnico

### 1. Arquitectura de Supresión y Anonimización (RF-01, RF-03)
En lugar de ejecutar un `DELETE` físico (`usuarioRepository.delete(usuario)`), se implementa un proceso de **anonimización técnica irreversible** en `DELETE /auth/cuenta`:
- La entidad `Usuario` pasa a tener:
  - `email`: `deleted_[id]_[timestamp]@removed.invalid` (el dominio `.invalid` es un TLD reservado por IETF RFC 2606 garantizando que nunca enviará correos reales y preservando la restricción UNIQUE de la columna en BD).
  - `nombre`: `"Usuario eliminado"`
  - `apellidos`: `""`
  - `telefono`: `null`
  - `avatarUrl`: `null`
  - `avatarPublicId`: `null`
  - `enabled`: `false`
  - `fechaBaja`: `LocalDateTime.now()`
- **Limpieza de activos y tokens**:
  - Si `avatarPublicId != null`, se invoca `cloudinaryService.eliminar(avatarPublicId)` para purgar la imagen de la CDN de Cloudinary.
  - Se eliminan todos los refresh tokens activos del usuario mediante `refreshTokenRepository.deleteByUsuario(usuario)`.
  - Todo se ejecuta en `@Transactional`.

### 2. Justificación de decisiones de diseño

#### A. Anonimización vs. Borrado físico (DELETE SQL)
- **Integridad referencial y trazabilidad:** La tabla `reservas` tiene una clave foránea `usuario_id NOT NULL` con la tabla `usuario`. Un borrado en cascada (`ON DELETE CASCADE`) destruiría el histórico de ocupación de pistas, estadísticas de uso del club y registros contables/operativos de las franjas horarias ocupadas en el pasado.
- **Cumplimiento RGPD (Art. 17 y Considerando 26 RGPD):** El RGPD establece que los principios de protección de datos no son aplicables a la información anónima, es decir, información que no guarda relación con una persona física identificada o identificable. Al eliminar irreversiblemente todo identificador personal directo e indirecto (nombre, apellidos, teléfono, correo real, imagen) y deshabilitar la cuenta, el registro deja de constituir un dato de carácter personal conforme a derecho, permitiendo al club conservar la coherencia contable y de ocupación de pistas.

#### B. Guarda de seguridad: Último Administrador del Sistema
- **Prevención de bloqueo del sistema (Denial of Administration):** Si se permite que el único administrador de la plataforma elimine su cuenta, el sistema quedaría sin ningún usuario con permisos `ROLE_ADMIN`, imposibilitando la gestión de pistas, configuración o altas de nuevos administradores.
- Se implementa una consulta `countByRolesContaining("ROLE_ADMIN")` (o consulta JPQL similar) en `UsuarioRepository`. Si el usuario solicitante posee `ROLE_ADMIN` y el conteo es `<= 1`, se rechaza la petición de forma atómica con `409 Conflict` y mensaje explicativo.

### 3. Endpoint de Portabilidad (RF-02)
- `GET /auth/mis-datos` extrae el usuario autenticado desde el `Authentication` context / JWT subject (`authentication.getName()`).
- Recupera las reservas del usuario mediante `reservaRepository.findByUsuarioEmail(email)` (o por usuario).
- Ensambla una respuesta JSON estructurada sin exponer contraseñas, hashes, ni tokens internos.

### 4. Implementación Frontend (RF-05, RF-06)
- **Portabilidad (Descarga JSON sin dependencias):**
  1. Solicita los datos a `perfilService.getMisDatos()`.
  2. Crea un `Blob` tipo `application/json` con `JSON.stringify(data, null, 2)`.
  3. Crea un object URL con `window.URL.createObjectURL(blob)`.
  4. Dispara la descarga mediante un elemento `<a>` temporal con `download="mis-datos-padel-reservas.json"`.
  5. Libera la memoria con `window.URL.revokeObjectURL(url)`.
- **Supresión (Confirmación destructiva):**
  1. Se utiliza el componente existente `Dialog` (`DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`).
  2. El botón de confirmación requiere que el input coincida exactamente con `"ELIMINAR"`.
  3. Si la respuesta es `204`, se cierra la sesión en el cliente (`logout()`) y se redirige a `/`.
  4. Si la respuesta es `409`, se muestra el mensaje de error inline en el diálogo sin cerrarlo.

---

## Impacto en seguridad y tests

- **Seguridad:** Los endpoints no requieren `@PreAuthorize` adicional porque cualquier usuario autenticado tiene derecho a sus propios datos y a borrar su propia cuenta (`anyRequest().authenticated()`). Se verifica rigurosamente en backend que cada usuario solo accede/modifica sus propios datos basados en el `Authentication` emitido por el JWT.
- **Tests unitarios y de integración (`@WebMvcTest`):**
  - Validación de 401 en accesos anónimos.
  - Validación de 200 en descarga de datos.
  - Validación de 204 y captura con `ArgumentCaptor<Usuario>` para verificar anonimización correcta de campos.
  - Validación de 409 cuando se intenta borrar al único administrador.
