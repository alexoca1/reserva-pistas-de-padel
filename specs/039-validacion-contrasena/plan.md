# Plan técnico: Spec 039 — Validación Robusta de Contraseña en Registro

**Spec relacionada:** `../spec.md`

---

## Diseño técnico

### 1. Validación Declarativa con Jakarta Validation (RF-01)
En `RegisterRequest.java`, se actualiza la definición del campo `password` en el record:
```java
@NotBlank(message = "La contraseña es obligatoria")
@Size(min = 8, max = 100, message = "La contraseña debe tener al menos 8 caracteres")
@Pattern(
    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
    message = "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
)
String password
```

### 2. Flujo de Error y Respuesta HTTP (RF-02)
- Spring MVC intercepta la petición en `@Valid @RequestBody RegisterRequest registerRequest` antes de invocar el cuerpo de `AuthController.register`.
- Ante un fallo de validación, lanza `MethodArgumentNotValidException`.
- `GlobalExceptionHandler.handleValidationExceptions` procesa los `FieldError` y responde automáticamente:
  ```json
  {
    "password": "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
  }
  ```
  con código de estado `400 Bad Request`.

---

## Decisiones de diseño y justificación

### 1. Validación exclusiva en Backend vs. Duplicación en Frontend
- **Cumplimiento del Artículo 5 de la Constitución:** El backend es el único punto de aplicación de reglas y fronteras de seguridad; la validación en el cliente es exclusivamente una ayuda de UX.
- **Evitar divergencia de expresiones regulares:** Mantener la regex centralizada en el backend evita desincronizaciones entre cliente y servidor. Si en el futuro se decide proporcionar feedback dinámico en tiempo real (`onChange` con barra de fortaleza), se incorporará como mejora de UX, pero no es necesario para garantizar la seguridad del sistema.

### 2. Alcance respecto a `UpdatePerfilDTO` (Spec 028)
- El cambio de contraseña para usuarios ya autenticados en el perfil (`PUT /auth/perfil`) requiere validar `currentPassword` contra el hash almacenado en base de datos.
- Modificar `UpdatePerfilDTO` queda fuera del alcance de esta spec para mantener los cambios atómicos y enfocados exclusivamente en la creación de nuevas cuentas en el registro. Si se requiere, se unificará en una mejora futura.

---

## Impacto en tests
- Se amplían los tests de controlador en `AuthControllerSecurityTest` o nuevo test `AuthRegisterValidationTest` para validar que contraseñas débiles devuelven `400 Bad Request` y contraseñas que cumplen el patrón devuelven `201 Created`.
