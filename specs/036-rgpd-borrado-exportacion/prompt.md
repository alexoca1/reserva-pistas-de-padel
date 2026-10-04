# Prompt de implementación — Spec 036: RGPD (Borrado y Exportación de Cuenta)

Implementa la spec 036 siguiendo `spec.md`, `plan.md` y `tasks.md`.

---

## 1. Backend (`padel-backend`)

### Paso 1: Campo `fechaBaja` en `Usuario.java`
En `padel-backend/src/main/java/com/padel/reservas/entities/Usuario.java`, añadir:
```java
@Column(name = "fecha_baja", nullable = true)
private LocalDateTime fechaBaja;
```

### Paso 2: Método en `UsuarioRepository.java`
En `padel-backend/src/main/java/com/padel/reservas/repositories/UsuarioRepository.java`, añadir:
```java
long countByRolesContaining(String role);
```

### Paso 3: Endpoints en `AuthController.java`
Inyectar `ReservaRepository` y `RefreshTokenRepository` (si no están ya inyectados vía `@RequiredArgsConstructor`) y crear:

1. `GET /auth/mis-datos`:
   - Obtener email del usuario autenticado (`authentication.getName()`).
   - Buscar usuario en `usuarioRepository.findByEmail(email)`. Si no existe, devolver 404/400.
   - Obtener sus reservas mediante `reservaRepository.findByUsuarioEmail(email)` (o `findByUsuario(usuario)`).
   - Ensamblar y devolver JSON con estructura:
     ```json
     {
       "id": 1,
       "nombre": "Juan",
       "apellidos": "Pérez",
       "email": "juan@example.com",
       "telefono": "600123456",
       "avatarUrl": "https://...",
       "roles": "ROLE_USER",
       "fechaRegistro": "2026-01-01T10:00:00",
       "reservas": [
         {
           "id": 10,
           "codigoReserva": "RES-12345",
           "fechaReserva": "2026-10-10",
           "horaInicio": "10:00",
           "horaFin": "11:30",
           "estado": "CONFIRMADA",
           "pistaId": 2,
           "numeroPista": 2,
           "nombreJugador": "Juan Pérez",
           "telefono": "600123456"
         }
       ]
     }
     ```

2. `DELETE /auth/cuenta`:
   - Ejecutar con `@Transactional`.
   - Obtener email del usuario autenticado y cargar la entidad `Usuario`.
   - **Guarda de administrador:** Si el usuario contiene el rol `"ROLE_ADMIN"` (o `usuario.getRoles().contains("ROLE_ADMIN")`), comprobar si `usuarioRepository.countByRolesContaining("ROLE_ADMIN") <= 1`. Si es así, devolver `ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "No puedes eliminar la única cuenta de administrador"))`.
   - **Eliminar avatar de Cloudinary:** Si `usuario.getAvatarPublicId() != null && !usuario.getAvatarPublicId().isBlank()`, llamar a `cloudinaryService.eliminar(usuario.getAvatarPublicId())`.
   - **Eliminar refresh tokens:** `refreshTokenRepository.deleteByUsuario(usuario)`.
   - **Anonimizar usuario:**
     ```java
     long timestamp = System.currentTimeMillis();
     usuario.setEmail("deleted_" + usuario.getId() + "_" + timestamp + "@removed.invalid");
     usuario.setNombre("Usuario eliminado");
     usuario.setApellidos("");
     usuario.setTelefono(null);
     usuario.setAvatarUrl(null);
     usuario.setAvatarPublicId(null);
     usuario.setEnabled(false);
     usuario.setFechaBaja(LocalDateTime.now());
     usuarioRepository.save(usuario);
     ```
   - Registrar evento en auditoría (opcional/recomendado) y devolver `ResponseEntity.noContent().build()` (204).

---

## 2. Tests Backend (`padel-backend`)

Añadir pruebas en `padel-backend/src/test/java/com/padel/reservas/controller/` (ej. `AuthRgpdTest.java` o ampliar `AuthPerfilTest.java` / `AuthControllerSecurityTest.java`):
- `GET /auth/mis-datos` sin token → 401.
- `GET /auth/mis-datos` con JWT autenticado → 200 con JSON de datos y lista de reservas.
- `DELETE /auth/cuenta` sin token → 401.
- `DELETE /auth/cuenta` con usuario normal → 204 y verificar con `ArgumentCaptor<Usuario>` que el email fue cambiado a `@removed.invalid` y `fechaBaja` no es null.
- `DELETE /auth/cuenta` con el único admin (`count == 1`) → 409 Conflict con mensaje adecuado.

Ejecutar `./mvnw test` y comprobar que todos los tests pasen.

---

## 3. Frontend (`padel-frontend`)

### Paso 1: Servicios API (`services/api.ts`)
En `padel-frontend/src/services/api.ts`, añadir a `perfilService`:
```typescript
getMisDatos: () => fetchAPI<Record<string, unknown>>("/auth/mis-datos"),
eliminarCuenta: () => fetchAPI<void>("/auth/cuenta", { method: "DELETE" }),
```

### Paso 2: Tipos (`types/index.ts`)
En `padel-frontend/src/types/index.ts`, actualizar `Usuario`:
```typescript
export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  roles?: string | string[];
  enabled?: boolean;
  fechaRegistro?: string;
  fechaBaja?: string;
  avatarUrl?: string;
}
```

### Paso 3: UI en `PerfilPage.tsx`
Añadir al final de la sección del perfil propio (o como una nueva tarjeta `Card`):
1. **Sección "Privacidad y datos"**:
   - Título: *"Privacidad y control de datos"*
   - Descripción: *"Ejerce tus derechos de portabilidad y supresión de datos conforme al RGPD."*
2. **Botón "Descargar mis datos"**:
   - Llama a `perfilService.getMisDatos()`.
   - Crea un `Blob` de tipo `application/json` con los datos formateados.
   - Crea un enlace `<a>` con `URL.createObjectURL(blob)`, le asigna `download="mis-datos-padel-reservas.json"`, simula el clic y revoca la URL.
   - Muestra feedback de carga y toast de éxito.
3. **Botón "Eliminar mi cuenta"**:
   - Estilo destructivo (`variant="destructive"`).
   - Abre un modal `Dialog`.
   - Texto de advertencia sobre la irreversibilidad de la anonimización.
   - Input donde el usuario debe escribir exactamente `"ELIMINAR"`.
   - Botón de confirmación deshabilitado hasta que coincida `"ELIMINAR"`.
   - Al confirmar:
     - Llama a `perfilService.eliminarCuenta()`.
     - Si es 204: llama a `logout()`, redirige a `/` y muestra toast.
     - Si es 409: captura el error y muestra el mensaje inline en el diálogo sin cerrarlo.

---

## 4. Documentación

- Actualizar `padel-backend/AGENTS.md` con los dos nuevos endpoints en la tabla de `/auth` y el nuevo campo `fechaBaja` en `Usuario`.
- Actualizar `padel-frontend/AGENTS.md` mencionando la nueva sección de privacidad en `PerfilPage`.

---

## 5. Verificación manual

1. **Portabilidad:** Iniciar sesión con un usuario que tenga reservas. Ir a Perfil > Privacidad y datos > pulsar *"Descargar mis datos"*. Verificar que se descarga `mis-datos-padel-reservas.json` y que contiene sus datos y el listado de reservas.
2. **Supresión (Usuario normal):** Pulsar *"Eliminar mi cuenta"*, escribir `"ELIMINAR"` y confirmar. Verificar que la sesión se cierra, se redirige a `/` y al intentar hacer login con el email anterior se rechazan las credenciales.
3. **Guarda de administrador único:** Iniciar sesión con el único admin. Pulsar *"Eliminar mi cuenta"*, escribir `"ELIMINAR"` y confirmar. Verificar que se muestra el error 409 *"No puedes eliminar la única cuenta de administrador"*.
4. **Administrador no único:** Con dos admins registrados, verificar que el segundo admin puede eliminar su cuenta normalmente.
