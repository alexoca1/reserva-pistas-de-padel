# Spec 038 — Rol DEMO_ADMIN (Modo Demostración Protegido con Spring AOP)

**Estado:** Implementada  
**Fecha:** 2026-10-04  
**Afecta:** `padel-backend` (`pom.xml`, `TipoAdmin.java`, `Usuario.java`, `NoDemoAdmin.java`, `DemoAdminAspect.java`, `PistasController.java`, `ReservasController.java`, `AdminController.java`, `AuthController.java`, `DataInitializer.java`, tests de seguridad), `padel-frontend` (`types/index.ts`, `AuthContext.tsx`, `DashboardPage.tsx`, `PistasPage.tsx`, `ReservasPage.tsx`, `TarjetaReserva.tsx`), raíz (`README.md`), documentación (`padel-backend/AGENTS.md`, `padel-frontend/AGENTS.md`)

---

## Resumen

Esta especificación introduce un usuario y rol de demostración (**`DEMO_ADMIN`**) diseñado para que reclutadores y evaluadores técnicos puedan explorar la totalidad del panel de administración del Club Pádel Calatrava de forma inmediata sin necesidad de solicitar credenciales privadas ni riesgo de corrupción de datos.

La protección frente a acciones destructivas y de reconfiguración se implementa en el backend mediante **Spring AOP** (Programación Orientada a Aspectos) con la anotación `@NoDemoAdmin`, garantizando que tanto la interfaz web como las llamadas directas vía API REST queden protegidas de manera hermética y centralizada.

El administrador demo:
- **PUEDE:** Navegar por todo el panel de administración, ver la lista de usuarios, consultar configuración, crear reservas, editar reservas, subir fotos de pistas/sede y definir fotos de portada.
- **NO PUEDE:** Borrar pistas, crear/editar pistas existentes, borrar reservas, modificar la configuración del club ni registrar nuevos administradores.

---

## Escenarios

- **Como reclutador o evaluador técnico**, inicio sesión con las credenciales públicas de demo (`demo@padelreservas.es` / `Demo2026!`). Accedo a todas las pantallas de administración, creo una reserva de prueba y experimento el funcionamiento completo sin restricciones de lectura.
- **Como reclutador**, intento borrar una pista o eliminar una reserva desde la interfaz web y visualizo el indicador *"No disponible en demo"* en lugar del botón destructivo.
- **Como evaluador técnico avanzado**, envío una petición directa `DELETE /pistas/1` o `PUT /admin/configuracion` con el token JWT de `DEMO_ADMIN` y el backend responde con un `403 Forbidden` (`"Acción no disponible en modo demostración."`).
- **Como administrador real**, realizo cualquier operación de administración habitual (crear pistas, editar configuración, borrar registros) sin interferencia alguna del aspecto AOP.

---

## Requisitos funcionales

### Backend (`padel-backend`)

#### RF-01 — Enum `TipoAdmin` y campo en `Usuario`
- Crear el enum `com.padel.reservas.entities.TipoAdmin` con valores `ADMIN` y `DEMO_ADMIN`.
- En `Usuario.java`, añadir el campo:
  ```java
  @Enumerated(EnumType.STRING)
  @Column(name = "tipo_admin", nullable = true)
  private TipoAdmin tipoAdmin;
  ```

#### RF-02 — Dependencia y configuración Spring AOP
- Añadir la dependencia `spring-boot-starter-aop` a `pom.xml`.
- Crear la anotación `com.padel.reservas.config.NoDemoAdmin`:
  ```java
  @Target(ElementType.METHOD)
  @Retention(RetentionPolicy.RUNTIME)
  public @interface NoDemoAdmin {}
  ```
- Crear el aspecto `com.padel.reservas.config.DemoAdminAspect`:
  - Intercepta con `@Before("@annotation(com.padel.reservas.config.NoDemoAdmin)")`.
  - Extrae el usuario autenticado desde `SecurityContextHolder.getContext().getAuthentication()`.
  - Si `usuario.getTipoAdmin() == TipoAdmin.DEMO_ADMIN`, lanza `org.springframework.security.access.AccessDeniedException("Acción no disponible en modo demostración.")`.

#### RF-03 — Métodos protegidos con `@NoDemoAdmin`
Aplicar `@NoDemoAdmin` estrictamente a:
1. `PistasController.createPista`
2. `PistasController.updatePista`
3. `PistasController.deletePista`
4. `ReservasController.deleteReserva`
5. `AdminController.actualizarConfiguracion`
6. `AuthController.registerAdmin`

#### RF-04 — Semilla de usuario Demo (`DataInitializer.java`)
Crear el usuario de demostración si no existe:
- `email`: `demo@padelreservas.es`
- `password`: `Demo2026!` (hasheado con `passwordEncoder`)
- `nombre`: `"Admin"`, `apellidos`: `"Demo"`
- `roles`: `"ROLE_ADMIN"`
- `enabled`: `true`
- `telefono`: `"600123123"`
- `tipoAdmin`: `TipoAdmin.DEMO_ADMIN`

#### RF-05 — Exposición de `tipoAdmin` en respuestas de autenticación
- En `AuthController.java`, incluir `tipoAdmin` en el mapa del usuario de `POST /auth/login`, `POST /auth/refresh` y `GET /auth/perfil`.

#### RF-06 — Tests automatizados
- Test con `@WebMvcTest` e importación del aspecto AOP:
  - `POST /pistas` con `DEMO_ADMIN` → `403 Forbidden`.
  - `DELETE /pistas/{id}` con `DEMO_ADMIN` → `403 Forbidden`.
  - `DELETE /reservas/{id}` con `DEMO_ADMIN` → `403 Forbidden`.
  - `PUT /admin/configuracion` con `DEMO_ADMIN` → `403 Forbidden`.
  - `POST /pistas` con `ADMIN` estándar → `201 Created` (sin regresión).

---

### Frontend (`padel-frontend`)

#### RF-07 — Tipos y `AuthContext`
- En `types/index.ts`: añadir `tipoAdmin?: "ADMIN" | "DEMO_ADMIN" | null;` a `Usuario`.
- En `AuthContext.tsx`: añadir `isDemoAdmin: boolean` a `AuthContextValue`, derivado como `user?.tipoAdmin === "DEMO_ADMIN"`, y exponerlo en el contexto.

#### RF-08 — Adaptación de interfaz para modo demo
- **`DashboardPage.tsx` / `TarjetaReserva.tsx`:** En próximas reservas, el botón "Eliminar" se sustituye por `<span className="text-xs italic text-muted-foreground">No disponible en demo</span>` cuando `isDemoAdmin` es `true`. El botón "Editar" permanece activo.
- **`PistasPage.tsx`:** Los botones de administración "Editar pista" y "Eliminar pista" se sustituyen por `<span className="text-xs italic text-muted-foreground">No disponible en demo</span>` cuando `isDemoAdmin` es `true`. El botón de subir fotos y establecer portada permanecen activos.
- **`ReservasPage.tsx`:** Acciones destructivas bloqueadas visualmente con el texto correspondiente.

---

### Documentación (`README.md` y `AGENTS.md`)

#### RF-09 — Sección en `README.md`
Añadir sección `## Acceso de demostración` con tabla de credenciales para reclutadores (`demo@padelreservas.es` / `Demo2026!`) y nota explicativa sobre la protección AOP en backend.
