# Plan técnico: Spec 038 — Rol DEMO_ADMIN

**Spec relacionada:** `../spec.md`

---

## Diseño técnico

### 1. Modelo de Datos y Autenticación (RF-01, RF-04, RF-05)
- Se crea el enum `TipoAdmin { ADMIN, DEMO_ADMIN }`.
- Se añade el campo `tipoAdmin` en la entidad `Usuario`. Para usuarios regulares (`ROLE_USER`) este campo permanece como `null`.
- En `DataInitializer.java`, se asegura la existencia del usuario semilla `demo@padelreservas.es` con contraseña `Demo2026!` y `tipoAdmin = TipoAdmin.DEMO_ADMIN`.
- En `AuthController.java`, los payloads de respuesta en `/auth/login`, `/auth/refresh` y `/auth/perfil` incluyen `"tipoAdmin": usuario.getTipoAdmin()`.

### 2. Aspecto de Seguridad AOP (RF-02, RF-03)
- Se añade la dependencia estándar de Spring AOP:
  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-aop</artifactId>
  </dependency>
  ```
- Se define la anotación `@NoDemoAdmin`.
- El aspecto `DemoAdminAspect` intercepta la ejecución de los métodos anotados antes de que comience su lógica de negocio (`@Before`).
- Obtiene la identidad del llamador desde `SecurityContextHolder` y consulta `usuarioRepository.findByEmail(email)`. Si `tipoAdmin == TipoAdmin.DEMO_ADMIN`, corta la ejecución lanzando `AccessDeniedException` (que Spring Security traduce automáticamente a `403 Forbidden`).

### 3. Integración en Frontend (RF-07, RF-08)
- `AuthContext.tsx` computa `isDemoAdmin = user?.tipoAdmin === "DEMO_ADMIN"`.
- Los componentes visuales ([DashboardPage.tsx](file:///d:/guithub%20proyectos/reserva-pistas-de-padel/padel-frontend/src/pages/DashboardPage.tsx), [PistasPage.tsx](file:///d:/guithub%20proyectos/reserva-pistas-de-padel/padel-frontend/src/pages/PistasPage.tsx), [ReservasPage.tsx](file:///d:/guithub%20proyectos/reserva-pistas-de-padel/padel-frontend/src/pages/ReservasPage.tsx)) consultan `isDemoAdmin` y sustituyen los botones destructivos por el texto no interactivo `"No disponible en demo"`.

---

## Decisiones de diseño y justificación

### 1. Spring AOP en Backend vs. Condicionales en Frontend
- **Seguridad en la frontera real de confianza (Artículo 5 de la Constitución):** Ocultar botones en la UI es exclusivamente una mejora de experiencia de usuario (UX). Un reclutador técnico o evaluador puede inspeccionar peticiones de red, usar cURL o Postman e intentar ejecutar un `DELETE` directo contra la API. El aspecto AOP garantiza que el backend sea el guardián inviolable de las restricciones de demo.
- **Mantenibilidad y código limpio (DRY):** En lugar de ensuciar los controladores con comprobaciones manuales (`if (usuario.getTipoAdmin() == ...)`), una simple anotación declarativa `@NoDemoAdmin` aplica la regla transversalmente.

### 2. `ROLE_ADMIN` + `tipoAdmin` vs. Rol Spring Security independiente (`ROLE_DEMO_ADMIN`)
- **Evitar duplicación y fragilidad en `SecurityConfig`:** Todos los endpoints y reglas `@PreAuthorize("hasRole('ADMIN')")` existentes permiten el acceso a los recursos del club. Si se creara un rol de seguridad separado, habría que modificar cada `@PreAuthorize` del sistema (`hasAnyRole('ADMIN', 'DEMO_ADMIN')`) y las reglas de ruta de Spring Security, aumentando drásticamente la superficie de error y regresiones.
- El atributo `tipoAdmin` actúa como una capa de política granular sobre el rol administrativo general.

### 3. Permisos de Creación/Edición vs. Bloqueo de Borrado
- **Experiencia de evaluación integral:** Un evaluador necesita probar la creación de reservas con duraciones variables (Spec 017), verificar la asignación de pistas y editar reservas existentes para comprobar que la lógica de negocio funciona de extremo a extremo.
- **Protección de datos demo:** El borrado de pistas, de reservas ajenas o la alteración de la configuración general del club no aportan valor de evaluación técnica al reclutador y dejarían el entorno sin datos para los siguientes evaluadores.

---

## Impacto en tests
- Pruebas `@WebMvcTest` con `DemoAdminAspect` activo verificando el rechazo con código 403 a peticiones destructivas de `DEMO_ADMIN` y la ejecución exitosa de peticiones equivalentes emitidas por `ADMIN` regular.
