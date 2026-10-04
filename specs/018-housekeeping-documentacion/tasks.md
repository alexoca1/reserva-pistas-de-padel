# Tareas: Housekeeping de documentación post-specs 015, 017, 019

## padel-backend/AGENTS.md
- [x] T01 - Corregir `/auth/register-admin`: cambiar "No auth / No admin"
      por "Sí / Sí" en la tabla de endpoints
- [x] T02 - Añadir `GET /auth/usuarios` a la tabla de endpoints de `/auth`
- [x] T03 - Añadir `PUT /auth/perfil` a la tabla de endpoints de `/auth`
- [x] T04 - Añadir sección "DTO de Actualización de Perfil" con campos
      de `UpdatePerfilDTO`
- [x] T05 - Añadir `FranjaReservada.java` a la estructura de paquetes
      (`entities/`)
- [x] T06 - Añadir `EstadoReserva.java` a la estructura de paquetes
      (`entities/`)
- [x] T07 - Añadir `FranjaReservadaRepository.java` a la estructura de
      paquetes (`repositories/`)
- [x] T08 - Añadir `ReservaService.java` a la estructura de paquetes
      (`services/`)
- [x] T09 - Añadir `UpdatePerfilDTO.java` a la estructura de paquetes
      (`dto/`) si no está ya
- [x] T10 - Añadir descripción de entidad `FranjaReservada` en la sección
      de entidades (campos + nota sobre constraint única)
- [x] T11 - Actualizar descripción de entidad `Reserva`: cambiar
      `horaInicio`/`horaFin` de `String` a `LocalTime`; añadir `estado`
      y `codigoReserva`
- [x] T12 - Añadir entrada en "Registro de Cambios Relevantes" sobre
      spec 017 (LocalTime, FranjaReservada, EstadoReserva, codigoReserva,
      ReservaService)
- [x] T13 - Añadir `ConfiguracionClub.java` a la estructura de paquetes
      (`entities/`)
- [x] T14 - Añadir `ConfiguracionClubRepository.java` a la estructura de
      paquetes (`repositories/`)
- [x] T15 - Añadir `ConfiguracionClubService.java` a la estructura de
      paquetes (`services/`)
- [x] T16 - Añadir `AdminController.java` a la estructura de paquetes
      (`controller/`)
- [x] T17 - Añadir `UpdateConfiguracionDTO.java` a la estructura de
      paquetes (`dto/`)
- [x] T18 - Añadir sección de endpoints `/admin/configuracion` y
      `/configuracion/duraciones`

## padel-frontend/AGENTS.md
- [x] T19 - Añadir `/perfil` a la lista de rutas protegidas
- [x] T20 - Añadir nota sobre `src/lib/franjas.ts` junto a la de
      `src/lib/fechas.ts`

## README.md (raíz)
- [x] T21 - Corregir `/auth/register-admin` en la tabla de endpoints
- [x] T22 - Añadir `GET /auth/usuarios` y `PUT /auth/perfil` a la tabla
- [x] T23 - Actualizar estructura de carpetas del frontend al estado real
      post-spec 017 (incluye `PerfilPage.tsx`, `ToastContext.tsx`,
      `TiltCard.tsx`, `HeroScene.tsx`, `CuadriculaDisponibilidad.tsx`,
      `icons.tsx`, `lib/fechas.ts`, `lib/franjas.ts`, `lib/motion.ts`,
      `types/index.ts`)

## Referencias cruzadas
- [x] T24 - Marcar T14 de `specs/017-reservas-duracion-variable/tasks.md`
      como cubierto por esta spec
- [x] T25 - Marcar T13 de `specs/019-configuracion-club/tasks.md`
      como cubierto por esta spec

## Verificación
- [x] T26 - `git diff --stat` no debe mostrar ningún archivo `.java`,
      `.tsx` ni `.ts` — solo los tres `.md` de documentación y los dos
      `tasks.md` de specs referenciadas