# Spec 039 — Validación Robusta de Contraseña en Registro

**Estado:** Planificada  
**Fecha:** 2026-10-04  
**Afecta:** `padel-backend` (`RegisterRequest.java`, tests de registro), `padel-frontend` (`RegisterPage.tsx`), documentación (`padel-backend/AGENTS.md`)

---

## Resumen

Esta especificación refuerza los requisitos mínimos de complejidad para la contraseña durante el registro de nuevos usuarios en la plataforma (`POST /auth/register` y `POST /auth/register-admin`).

Actualmente, el DTO `RegisterRequest` únicamente requiere un mínimo de 6 caracteres sin restricciones de composición de caracteres. Con esta spec se establece una política de contraseñas robusta y estándar:
- Longitud mínima de 8 caracteres y máxima de 100.
- Al menos una letra mayúscula (`A-Z`).
- Al menos una letra minúscula (`a-z`).
- Al menos un dígito numérico (`0-9`).

La validación se aplica de forma estricta en el backend mediante anotaciones de Jakarta Bean Validation (`@Size` y `@Pattern`), aprovechando el `GlobalExceptionHandler` existente para retornar un `400 Bad Request` con el mensaje exacto de validación por campo.

---

## Escenarios

- **Como usuario que se registra con una contraseña débil (ej. "abc" o "abcdefgh")**, recibo una respuesta HTTP 400 indicando claramente: *"La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"*, y el formulario en el frontend muestra el error correspondiente.
- **Como usuario que se registra con una contraseña válida (ej. "Abcdef12")**, el registro se completa con éxito devolviendo HTTP 201 y permitiendo el inicio de sesión.
- **Como administrador registrado**, las cuentas creadas mediante `/auth/register-admin` cumplen con el mismo estándar de seguridad.

---

## Requisitos funcionales

### Backend (`padel-backend`)

#### RF-01 — Validación en `RegisterRequest.java`
- Añadir anotaciones de Bean Validation al campo `password`:
  - `@Size(min = 8, max = 100, message = "La contraseña debe tener al menos 8 caracteres")`
  - `@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", message = "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número")`
- Mantener `@NotBlank(message = "La contraseña es obligatoria")`.

#### RF-02 — Manejo de errores de validación
- Verificar que `GlobalExceptionHandler.java` captura `MethodArgumentNotValidException` y serializa el mapa campo → mensaje con HTTP 400 (ya implementado en Spec 001).

#### RF-03 — Tests automatizados
- Test con `@WebMvcTest(AuthController.class)`:
  - `POST /auth/register` con contraseña que no cumple los requisitos (ej. `"abc"`) → `400 Bad Request` con mensaje de validación en el campo `password`.
  - `POST /auth/register` con contraseña válida (ej. `"Abcdef12"`) → `201 Created`.

---

### Frontend (`padel-frontend`)

#### RF-04 — Presentación de errores en `RegisterPage.tsx`
- Asegurar que al recibir un error 400 del backend con el mapa de errores `{ "password": "..." }`, el mensaje se extraiga adecuadamente de la respuesta JSON y se visualice en la interfaz para informar con precisión al usuario.
- No duplicar la expresión regular en el cliente para mantener el backend como única fuente de verdad (Constitución Art. 5).

---

## Fuera de alcance
- Modificación de `UpdatePerfilDTO` (el cambio de contraseña desde el perfil requiere `currentPassword` y mantiene su validación actual de la spec 028).
- Complejidad adicional con caracteres especiales obligatorios (se mantiene en mayúscula + minúscula + número + 8 caracteres).
