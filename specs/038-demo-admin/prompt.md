# Prompt de implementación — Spec 038: Rol DEMO_ADMIN

Implementa la spec 038 siguiendo `spec.md`, `plan.md` y `tasks.md`.

---

## 1. Backend (`padel-backend`)

### Paso 1: Dependencia AOP en `pom.xml`
Añadir dentro de `<dependencies>`:
```xml
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-aop</artifactId>
		</dependency>
```

### Paso 2: Enum `TipoAdmin.java` y entidad `Usuario.java`
Crear `padel-backend/src/main/java/com/padel/reservas/entities/TipoAdmin.java`:
```java
package com.padel.reservas.entities;

public enum TipoAdmin {
    ADMIN,
    DEMO_ADMIN
}
```

En `padel-backend/src/main/java/com/padel/reservas/entities/Usuario.java`:
```java
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_admin", nullable = true)
    private TipoAdmin tipoAdmin;
```

### Paso 3: Anotación y Aspecto de Seguridad AOP
Crear `padel-backend/src/main/java/com/padel/reservas/config/NoDemoAdmin.java`:
```java
package com.padel.reservas.config;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface NoDemoAdmin {
}
```

Crear `padel-backend/src/main/java/com/padel/reservas/config/DemoAdminAspect.java`:
```java
package com.padel.reservas.config;

import com.padel.reservas.entities.TipoAdmin;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Aspect
@Component
@RequiredArgsConstructor
public class DemoAdminAspect {

    private final UsuarioRepository usuarioRepository;

    @Before("@annotation(com.padel.reservas.config.NoDemoAdmin)")
    public void verificarNoEsDemoAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return;
        }

        String email = authentication.getName();
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isPresent() && usuarioOpt.get().getTipoAdmin() == TipoAdmin.DEMO_ADMIN) {
            throw new AccessDeniedException("Acción no disponible en modo demostración.");
        }
    }
}
```

### Paso 4: Anotar métodos en controladores con `@NoDemoAdmin`
Añadir `@NoDemoAdmin` exclusivamente a:
1. `PistasController.java`:
   - `@PostMapping("/pistas")` (`createPista`)
   - `@PutMapping("/pistas/{id}")` (`updatePista`)
   - `@DeleteMapping("/pistas/{id}")` (`deletePista`)
2. `ReservasController.java`:
   - `@DeleteMapping("/reservas/{id}")` (`deleteReserva`)
3. `AdminController.java`:
   - `@PutMapping("/admin/configuracion")` (`actualizarConfiguracion`)
4. `AuthController.java`:
   - `@PostMapping("/register-admin")` (`registerAdmin`)

### Paso 5: Semilla Demo en `DataInitializer.java` y respuestas de `AuthController.java`
En `padel-backend/src/main/java/com/padel/reservas/config/DataInitializer.java`:
```java
        String demoAdminEmail = "demo@padelreservas.es";
        var demoExistente = usuarioRepository.findByEmail(demoAdminEmail);
        if (demoExistente.isEmpty()) {
            Usuario demoAdmin = new Usuario();
            demoAdmin.setEmail(demoAdminEmail);
            demoAdmin.setPassword(passwordEncoder.encode("Demo2026!"));
            demoAdmin.setNombre("Admin");
            demoAdmin.setApellidos("Demo");
            demoAdmin.setRoles("ROLE_ADMIN");
            demoAdmin.setEnabled(true);
            demoAdmin.setTelefono("600123123");
            demoAdmin.setTipoAdmin(com.padel.reservas.entities.TipoAdmin.DEMO_ADMIN);
            usuarioRepository.save(demoAdmin);
            System.out.println("[DataInitializer] Demo Admin user created: " + demoAdminEmail);
        }
```

En `padel-backend/src/main/java/com/padel/reservas/controller/AuthController.java`:
- En `login`: `userMap.put("tipoAdmin", usuario.getTipoAdmin());`
- En `refresh`: `refreshUserMap.put("tipoAdmin", usuario.getTipoAdmin());`
- En `getPerfil`: `perfil.put("tipoAdmin", usuario.getTipoAdmin());`
- En `updatePerfil`: `responseBody.put("tipoAdmin", saved.getTipoAdmin());`

---

## 2. Tests Backend

Crear prueba en `padel-backend/src/test/java/com/padel/reservas/controller/DemoAdminAspectTest.java` o similar:
- `POST /pistas` con usuario `DEMO_ADMIN` → `403 Forbidden`.
- `DELETE /pistas/{id}` con usuario `DEMO_ADMIN` → `403 Forbidden`.
- `POST /pistas` con usuario `ADMIN` normal (`tipoAdmin == null` o `ADMIN`) → `201 Created`.

Ejecutar `./mvnw test` y comprobar que pasen todos los tests.

---

## 3. Frontend (`padel-frontend`)

### Paso 1: Tipos (`src/types/index.ts`)
```typescript
export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  roles?: string | string[];
  tipoAdmin?: "ADMIN" | "DEMO_ADMIN" | null;
  enabled?: boolean;
  fechaRegistro?: string;
  fechaBaja?: string;
  avatarUrl?: string;
}
```

### Paso 2: `AuthContext.tsx`
En `AuthContextValue`, añadir `isDemoAdmin: boolean;`.
En el cuerpo del hook:
```typescript
  const isDemoAdmin = user?.tipoAdmin === "DEMO_ADMIN";
```
Y exportarlo en el valor del contexto.

### Paso 3: Componentes UI
1. **`TarjetaReserva.tsx`**:
   Si `isDemoAdmin` es `true`, renderizar en lugar del botón "Eliminar":
   ```tsx
   <span className="flex-1 py-1.5 text-center text-xs italic text-muted-foreground">
     No disponible en demo
   </span>
   ```
2. **`PistasPage.tsx`**:
   En la vista de tabla y tarjetas móviles para administradores, si `isDemoAdmin` es `true`, sustituir los botones "Editar" y "Eliminar" por:
   ```tsx
   <span className="text-xs italic text-muted-foreground">
     No disponible en demo
   </span>
   ```
   (El botón de subir fotos de la pista y definir portada permanecen activos).
3. **`DashboardPage.tsx` / `ReservasPage.tsx`**:
   Aplicar la misma lógica para cualquier acción de borrado o cambio estructural restringido.

---

## 4. `README.md` en la raíz

Añadir una nueva sección `## Acceso de demostración`:
```markdown
## Acceso de demostración

Para evaluar la plataforma como administrador sin necesidad de registro previo:

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Administrador demo** | `demo@padelreservas.es` | `Demo2026!` |

> [!NOTE]
> El administrador de demostración puede explorar el panel completo, consultar usuarios y configuración, crear y editar reservas y pistas, y gestionar galerías de imágenes. Las acciones destructivas (eliminación de pistas y reservas, registro de nuevos admins y modificación de la configuración general del club) están bloqueadas en el backend mediante Spring AOP.
```

---

## 5. Documentación

- Actualizar `padel-backend/AGENTS.md` con `TipoAdmin`, `DemoAdminAspect`, `@NoDemoAdmin` y la inicialización del usuario demo.
- Actualizar `padel-frontend/AGENTS.md` con `isDemoAdmin` en `AuthContext`.

---

## 6. Verificación manual

1. **Inicio de sesión demo:** Iniciar sesión con `demo@padelreservas.es` / `Demo2026!`.
2. **Navegación:** Comprobar acceso al Dashboard, Pistas, Reservas y Perfil.
3. **Comprobación visual de UX:** Verificar que en Pistas y Reservas los botones de eliminación muestran *"No disponible en demo"*.
4. **Prueba funcional permitida:** Crear una reserva con el usuario demo y comprobar que se guarda correctamente.
5. **Prueba de seguridad backend:** Ejecutar una llamada cURL directa con el token del demo admin hacia `DELETE /pistas/1` y verificar que el backend devuelve `403 Forbidden` con el mensaje *"Acción no disponible en modo demostración."*.
