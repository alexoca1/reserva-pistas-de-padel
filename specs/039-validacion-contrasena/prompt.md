# Prompt de implementación — Spec 039: Validación Robusta de Contraseña en Registro

Implementa la spec 039 siguiendo `spec.md`, `plan.md` y `tasks.md`.

---

## 1. Backend (`padel-backend`)

### Paso 1: Modificar `RegisterRequest.java`
En `padel-backend/src/main/java/com/padel/reservas/dto/RegisterRequest.java`:
Añadir las anotaciones `@Size` y `@Pattern` con los imports correspondientes de `jakarta.validation.constraints.*`:

```java
package com.padel.reservas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email debe ser válido")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 100, message = "La contraseña debe tener al menos 8 caracteres")
        @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
            message = "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
        )
        String password,

        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotBlank(message = "Los apellidos son obligatorios")
        String apellidos,

        String telefono
) {}
```

### Paso 2: Verificar `GlobalExceptionHandler.java`
Comprobar que `GlobalExceptionHandler.java` ya contiene el método `handleValidationExceptions` que mapea los `FieldError` a `{ "campo": "mensaje" }` con código `400 Bad Request`.

---

## 2. Tests Backend

Añadir pruebas unitarias/de controlador en `padel-backend/src/test/java/com/padel/reservas/controller/` (ej. `AuthRegisterValidationTest.java` o en `AuthControllerSecurityTest.java`):
- `POST /auth/register` con contraseña no válida (ej. `"abc"`) → `400 Bad Request` y comprobar que el cuerpo contiene `password`.
- `POST /auth/register` con contraseña válida (ej. `"Abcdef12"`) → `201 Created`.

Ejecutar `./mvnw test` y comprobar que pasen todos los tests.

---

## 3. Frontend (`padel-frontend`)

### Paso 1: Ajustar captura de errores en `RegisterPage.tsx`
En `padel-frontend/src/pages/RegisterPage.tsx`, asegurar que al recibir un error HTTP 400, el mensaje devuelto en el mapa de errores por campo del backend sea extraído y mostrado al usuario:

```typescript
      if (!respuesta.ok) {
        let mensaje = "Error al registrarse";
        try {
          const datos = (await respuesta.json()) as Record<string, string>;
          if (datos?.password) {
            mensaje = datos.password;
          } else if (datos?.email) {
            mensaje = datos.email;
          } else if (datos?.error) {
            mensaje = datos.error;
          } else if (datos?.message) {
            mensaje = datos.message;
          } else {
            const primerError = Object.values(datos)[0];
            if (primerError) mensaje = primerError;
          }
        } catch {
          // Ignorar si la respuesta no es JSON
        }
        throw new Error(mensaje);
      }
```

---

## 4. Documentación

- Actualizar `padel-backend/AGENTS.md` añadiendo en la descripción del DTO `RegisterRequest` la regla de validación de contraseña (mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número).

---

## 5. Verificación manual

1. **Intento con contraseña débil:**
   - Navegar a `/register`.
   - Rellenar los campos e introducir contraseña `"password123"` (falta mayúscula) o `"12345678"` (faltan letras).
   - Pulsar *"Crear cuenta"*.
   - Verificar que aparece el mensaje de error: *"La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"*.
2. **Registro exitoso:**
   - Introducir una contraseña válida como `"Padel2026!"` o `"Abcdef12"`.
   - Pulsar *"Crear cuenta"*.
   - Verificar que el registro se procesa con éxito y redirige a `/login`.
