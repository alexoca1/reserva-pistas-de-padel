# Tareas: Spec 038 — Rol DEMO_ADMIN

- [x] **T01** — Añadir `spring-aspects` al `pom.xml` de `padel-backend`.
- [x] **T02** — Crear enum `TipoAdmin.java` y añadir el atributo `tipoAdmin: TipoAdmin` a la entidad `Usuario.java`.
- [x] **T03** — Crear la anotación `@NoDemoAdmin` y el aspecto `DemoAdminAspect` en `com.padel.reservas.config`.
- [x] **T04** — Añadir la anotación `@NoDemoAdmin` a los métodos de controlador: `PistasController.createPista`, `updatePista`, `deletePista`; `ReservasController.deleteReserva`; `AdminController.actualizarConfiguracion`; `AuthController.registerAdmin`.
- [x] **T05** — Configurar el usuario demo en `DataInitializer.java` (`demo@padelreservas.es` / `Demo2026!`) e incluir `tipoAdmin` en las respuestas de login/refresh/perfil en `AuthController.java`.
- [x] **T06** — Crear tests de seguridad (@WebMvcTest) verificando que `DEMO_ADMIN` recibe 403 al intentar operaciones protegidas y que `ADMIN` opera normalmente.
- [x] **T07** — Añadir `tipoAdmin` a `Usuario` en `types/index.ts` y exponer `isDemoAdmin` en `AuthContext.tsx`.
- [x] **T08** — Adaptar las vistas de frontend (`DashboardPage.tsx`, `TarjetaReserva.tsx`, `PistasPage.tsx`, `ReservasPage.tsx`) mostrando *"No disponible en demo"* en lugar de botones destructivos cuando `isDemoAdmin` esté activo.
- [x] **T09** — Añadir la sección `## Acceso de demostración` en `README.md` con la tabla de credenciales y la explicación del modo demo.
- [x] **T10** — Actualizar documentación en `padel-backend/AGENTS.md` y `padel-frontend/AGENTS.md`.
