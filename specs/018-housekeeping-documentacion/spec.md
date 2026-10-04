# Spec: Housekeeping de documentación post-specs 015 y 017

**Estado:** Implementada

## Resumen
Tres archivos de documentación quedaron desincronizados con el código real
tras las specs 001, 012, 015 y 017. Esta spec los pone al día. Consolida
también la tarea T14 de la spec 017 (actualización de AGENTS.md del backend
con los artefactos de duración variable), de modo que dicha tarea puede
marcarse como cubierta por esta spec.

## Fuera de alcance
Cualquier cambio en código de producción o tests. Solo documentación.

## Tareas
- [x] T01 - `padel-backend/AGENTS.md`: añadir `PUT /auth/perfil` a la tabla
      de endpoints de `/auth`; corregir `/auth/register-admin` (marcado
      erróneamente como sin auth ni admin desde la spec 001); añadir
      `GET /auth/usuarios` si falta; añadir `UpdatePerfilDTO` a la sección
      de DTOs; añadir `FranjaReservada` a la lista de entidades;
      añadir `FranjaReservadaRepository` a la lista de repositorios;
      añadir `ReservaService` a la lista de servicios
- [x] T02 - `padel-frontend/AGENTS.md`: añadir `/perfil` a la lista de rutas
      protegidas; añadir `lib/franjas.ts` a las menciones de la carpeta `lib`
- [x] T03 - `README.md` (raíz): corregir `/auth/register-admin` en la tabla
      de endpoints; añadir `GET /auth/usuarios` y `PUT /auth/perfil`;
      actualizar la estructura de carpetas del frontend para reflejar
      el estado real tras las specs 008-017
- [x] T04 - Marcar T14 de `specs/017-reservas-duracion-variable/tasks.md`
      como cubierto por esta spec
- [x] T05 - Verificación: `git diff --stat` no debe mostrar ningún archivo
      `.java`, `.tsx` ni `.ts` — solo los tres `.md` listados arriba