# AGENTS.md - API REST de Reservas de Pistas de Padel

## Descripcion del Proyecto

API REST en Spring Boot para gestionar reservas de pistas de padel con autenticacion JWT.

- Backend: `http://localhost:8080`
- Base de datos: MySQL `padel_reservas`

## Tecnologias Usadas

- Spring Boot
- Spring Security + JWT
- Spring Data JPA / Hibernate
- MySQL
- Lombok
- Jakarta Validation
- Maven

## Estructura de Paquetes Actual

```
src/main/java/hernandez_ocampo_hernandez/demo/
|- Tarea2Application.java
|- config/
|  |- JwtSecretKeyProvider.java
|  |- SecurityConfig.java
|- controller/
|  |- AuthController.java
|  |- PistasController.java
|  |- ReservasController.java
|- dto/
|  |- LoginRequest.java
|  |- RegisterRequest.java
|  |- CreateReservaDTO.java
|- entities/
|  |- Usuario.java
|  |- Pista.java
|  |- Reserva.java
|- repositories/
|  |- UsuarioRepository.java
|  |- PistaRepository.java
|  |- ReservaRepository.java
|- services/
|  |- CustomUserDetailsService.java
|  |- JwtService.java
```

## Entidades y Campos Reales

### `Pista`
- `id: Long`
- `numeroPista: Integer`
- `tieneIluminacion: boolean`
- `comentarios: String`
- `fechaAlta: LocalDate` (`@CreationTimestamp`)
- `fechaModificacion: LocalDate` (`@UpdateTimestamp`)
- `reservas: List<Reserva>` (`@OneToMany(mappedBy = "pista")`)

### `Reserva`
- `id: Long`
- `fechaReserva: LocalDate`
- `horaInicio: String`
- `horaFin: String`
- `nombreJugador: String`
- `telefono: String`
- `pista: Pista` (`@ManyToOne`, `pista_id`, `NOT NULL`)
- `usuario: Usuario` (`@ManyToOne`, `usuario_id`, `NOT NULL`)

### `Usuario`
- `id: Long`
- `email: String`
- `password: String`
- `roles: String`
- `enabled: Boolean`
- `nombre: String`
- `apellidos: String`
- `fechaRegistro: LocalDateTime`

## DTO de Creacion de Reserva

El backend usa `CreateReservaDTO` para crear/actualizar reservas:

- `fechaReserva: LocalDate`
- `horaInicio: String`
- `horaFin: String`
- `nombreJugador: String`
- `telefono: String`
- `pistaId: Long` (wrapper, no primitivo)

El frontend debe enviar **solo** ese formato. No enviar `pista: { id: ... }`.

## Endpoints Actuales (Fuente de Verdad)

> Base URL: `http://localhost:8080`

### 1) Autenticacion (`/auth`)

| Metodo | Ruta | Requiere autenticacion | Requiere ROLE_ADMIN | Descripcion |
|---|---|---|---|---|
| POST | `/auth/login` | No | No | Inicia sesion y devuelve JWT |
| POST | `/auth/register` | No | No | Registra usuario estandar |
| POST | `/auth/register-admin` | No | No | Registra usuario administrador |
| GET | `/auth/perfil` | Si | No | Devuelve datos del usuario autenticado |
| GET | `/auth/test-roles` | Si | No | Endpoint tecnico de prueba |

### 2) Pistas (`/pistas`)

| Metodo | Ruta | Requiere autenticacion | Requiere ROLE_ADMIN | Descripcion |
|---|---|---|---|---|
| GET | `/pistas` | Si | No | Lista todas las pistas |
| GET | `/pistas/{id}` | Si | No | Obtiene una pista por id |
| POST | `/pistas` | Si | No | Crea una pista |
| PUT | `/pistas/{id}` | Si | No | Actualiza una pista |
| DELETE | `/pistas/{id}` | Si | No | Elimina una pista |

### 3) Reservas (`/reservas`)

| Metodo | Ruta | Requiere autenticacion | Requiere ROLE_ADMIN | Descripcion |
|---|---|---|---|---|
| GET | `/reservas` | Si | No | Lista todas las reservas |
| GET | `/reservas/{id}` | Si | No | Usuario: solo su reserva; Admin: cualquier reserva |
| POST | `/reservas` | Si | No | Crea una reserva y asigna usuario desde JWT |
| PUT | `/reservas/{id}` | Si | No | Usuario: actualiza su reserva; Admin: cualquier reserva |
| DELETE | `/reservas/{id}` | Si | No | Usuario: elimina su reserva; Admin: cualquier reserva |
| DELETE | `/reservas` | Si | Si | Elimina todas las reservas (`@PreAuthorize("hasRole('ADMIN')")`) |

## Convenciones de Codigo

- Mantener nombres en espanol para entidades y campos del dominio (`Usuario`, `Pista`, `Reserva`).
- Usar `ResponseEntity` en controladores.
- Usar DTOs para payloads de entrada cuando exista logica de mapeo.
- Validar entradas con Jakarta Validation (`@NotNull`, `@NotBlank`, etc.).
- Mantener seguridad JWT en endpoints no publicos.
- Aplicar `@PreAuthorize` solo cuando realmente haya restriccion por rol.

## CORS (Estado Actual)

Configurado globalmente en `SecurityConfig` para `/**` con:

- Origin permitido: `http://localhost:5173`
- Metodos: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- Headers: `Authorization`, `Content-Type`
- `allowCredentials = true`

## Registro de Cambios Relevantes

- Migracion de rutas de dominio a `pistas` y `reservas`.
- Adopcion de `CreateReservaDTO` con `pistaId: Long`.
- Vinculacion obligatoria de `Reserva` con `Usuario` autenticado (`usuario_id NOT NULL`).
- Restriccion administrativa explicita en `DELETE /reservas`.

> Nota para futuras implementaciones: actualizar este archivo al finalizar cada cambio funcional relevante.
