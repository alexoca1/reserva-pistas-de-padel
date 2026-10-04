# Monorepo Reserva Pistas de Pádel

## Estructura del Proyecto
- **`/padel-backend`**: API REST en Java / Spring Boot (Puerto `8081`).
- **`/padel-frontend`**: SPA en React / Vite / Tailwind CSS (Puerto `5173`).

## Reglas de Navegación para Agentes
- Para cambios en la base de datos, API REST o seguridad, consultar las reglas en `padel-backend/AGENTS.md`.
- Para cambios de interfaz, rutas React o estado visual, consultar las reglas en `padel-frontend/AGENTS.md`.
- Antes de crear nuevos endpoints o componentes, verificar si la funcionalidad ya existe en la otra capa.
- Mantener la mentalidad Ponytail: cambios mínimos, borrado sobre adición y uso de librerías nativas.
- **Antes de implementar una feature nueva, revisar `.specify/memory/constitution.md` y buscar en `specs/` si ya existe una spec relacionada.** Si no existe, crear `specs/00X-nombre/` con `spec.md`, `plan.md` y `tasks.md` a partir de las plantillas en `.specify/templates/` antes de escribir código.