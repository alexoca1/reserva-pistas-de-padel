## PROMPTS.md - Registro de prompts clave (Backend Spring Boot + Frontend React)

Este archivo documenta los prompts mas importantes usados en el desarrollo de la app de reservas de padel.

**Regla de deduplicacion:** cada prompt se registra una sola vez en "Catalogo de prompts" con un ID. En cada seccion se referencian esos IDs para no reescribir prompts repetidos.

---

## Catalogo de prompts (sin duplicados)

### [P01] Contexto general del proyecto
"Lee todos los archivos del proyecto actual. Este proyecto Spring Boot va a ser adaptado para una aplicacion de reserva de pistas de padel. El backend ya tiene autenticacion JWT funcionando."

### [P02] Documentacion AGENTS.md inicial
"Genera el contenido de un archivo AGENTS.md para la raiz de este proyecto Spring Boot... Incluye tecnologias, estructura, endpoints, convenciones y nombres en espanol."

### [P03] Renombrado Aula -> Pista
"Renombra completamente la entidad Aula por Pista en todo el proyecto... tabla JPA de 'aulas' a 'pistas'... numeroAula -> numeroPista, esAulaOrdenadores -> tieneIluminacion."

### [P04] Renombrado Centro -> Reserva
"Renombra completamente la entidad Centro por Reserva... tabla JPA de 'centros' a 'reservas'... campos de Reserva: fechaReserva, horaInicio, horaFin, nombreJugador, telefono y ManyToOne con Pista."

### [P05] Controllers y rutas
"Renombra AulasController a PistasController y CentrosController a ReservasController. Actualiza rutas: /aulas -> /pistas y /centros -> /reservas. Mantener CRUD completo en ReservasController."

### [P06] CORS para frontend React (Vite)
"Anade configuracion CORS a SecurityConfig para permitir peticiones desde http://localhost:5173, metodos GET/POST/PUT/DELETE/OPTIONS, headers Authorization y Content-Type, credentials true, en /**."

### [P07] DTO de creacion de reserva
"En el request de crear reserva usa un DTO claro: fechaReserva, horaInicio, horaFin, nombreJugador, telefono, pistaId (Long o Integer wrapper). No uses int primitivo."

### [P08] Logica de servicio para reserva
"En service: buscar pista por pistaId, setear reserva.setPista(pista), guardar reserva."

### [P09] Reserva ligada al usuario autenticado
"Todas las reservas deben tener el id del usuario logeado en su sesion... modifica tablas y agrega columnas necesarias."

### [P10] Ajuste de documentacion de endpoints reales
"Actualiza AGENTS.md para reflejar endpoints reales tras cambios: /pistas y /reservas, con metodo HTTP, ruta, autenticacion y ROLE_ADMIN."

---

## Configuracion inicial

- Prompts usados: **[P01]**, **[P02]**.

## Autenticacion

- Prompts usados: **[P01]**, **[P09]**, **[P10]**.
- Nota: aqui entran JWT, sesion/autenticacion del usuario y reglas por rol (`ROLE_ADMIN`).

## Base de datos

- Prompts usados: **[P04]**, **[P09]**.
- Nota: cambios de tablas, relaciones y columnas (incluyendo `usuario_id` en reservas).

## Tablas principales

- Prompts usados: **[P03]**, **[P04]**.
- Nota: definicion de entidades principales (`Pista`, `Reserva`) y sus campos.

## CRUD

- Prompts usados: **[P05]**, **[P07]**, **[P08]**.
- Nota: operaciones crear/listar/editar/eliminar y flujo de creacion de reservas con `pistaId`.

## Funcionalidades

- Prompts usados: **[P06]**, **[P09]**, **[P10]**.
- Nota: CORS para React, vinculacion de reserva con usuario autenticado y documentacion de seguridad/endpoints.

## Los controller

- Prompts usados: **[P05]**, **[P07]**, **[P10]**.
- Nota: cambios directos en `AuthController`, `PistasController`, `ReservasController` y sus rutas.

---

## Plantilla para futuros prompts

Cuando agregues nuevos prompts, usa este formato para mantener deduplicacion:

```markdown
### [PXX] Titulo corto
"Texto del prompt"

Secciones donde aplica: Configuracion inicial | Autenticacion | Base de datos | Tablas principales | CRUD | Funcionalidades | Los controller
```

