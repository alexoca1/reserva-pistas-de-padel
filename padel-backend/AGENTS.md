# AGENTS.md - API REST de Reservas de Pistas de Pádel

## Descripción del Proyecto

API REST en Spring Boot para gestionar reservas de pistas de pádel con autenticación JWT robusta (Access Token de 15 min + Refresh Token HttpOnly rotativo).

- **Backend:** `http://localhost:8081`
- **Base de datos:** MySQL `padel_reservas` en `localhost:3306`
- **phpMyAdmin:** `http://localhost:8090`
- **Licencia:** [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) · Copyright (c) 2026 Alexander Ocampo Hernandez
- **Repositorio:** https://github.com/alexoca1/reserva-pistas-de-padel


## Tecnologías Usadas

- Java 25 / Spring Boot 4
- Spring Security + OAuth2 Resource Server (JWT)
- Spring Data JPA / Hibernate
- MySQL
- Lombok
- Jakarta Validation
- Maven
- JUnit 5 / Mockito

## Estructura de Paquetes Actual

```text
src/main/java/com/padel/reservas/
|- PadelReservasApplication.java
|- config/
|  |- JwtSecretKeyProvider.java
|  |- SecurityConfig.java
|  |- CloudinaryConfig.java
|  |- RateLimitFilter.java
|- controller/
|  |- AuthController.java
|  |- PistasController.java
|  |- ReservasController.java
|  |- AdminController.java
|  |- UploadController.java
|  |- FotoPistaController.java
|  |- SedeController.java
|- dto/
|  |- LoginRequest.java
|  |- RegisterRequest.java
|  |- CreateReservaDTO.java
|  |- UpdatePerfilDTO.java
|  |- UpdateConfiguracionDTO.java
|  |- FranjaOcupadaDTO.java
|  |- FranjaDTO.java
|  |- DisponibilidadDiaDTO.java
|  |- SubidaResult.java
|- entities/
|  |- Usuario.java
|  |- Pista.java
|  |- Reserva.java
|  |- RefreshToken.java
|  |- FranjaReservada.java
|  |- EstadoReserva.java
|  |- ConfiguracionClub.java
|  |- FotoPista.java
|  |- FotoSede.java
|- repositories/
|  |- UsuarioRepository.java
|  |- PistaRepository.java
|  |- ReservaRepository.java
|  |- RefreshTokenRepository.java
|  |- FranjaReservadaRepository.java
|  |- ConfiguracionClubRepository.java
|  |- FotoPistaRepository.java
|  |- FotoSedeRepository.java
|- services/
|  |- CustomUserDetailsService.java
|  |- JwtService.java
|  |- RefreshTokenService.java
|  |- ReservaService.java
|  |- ConfiguracionClubService.java
|  |- CloudinaryService.java
|  |- SecurityAuditService.java
|- exception/
   |- GlobalExceptionHandler.java
   |- ReservaSolapadaException.java
```

## Entidades y Campos Reales

### `Pista`

- `id: Long`
- `numeroPista: Integer`
- `tieneIluminacion: boolean`
- `comentarios: String`
- `imagenUrl: String`
- `fechaAlta: LocalDate` (`@CreationTimestamp`)
- `fechaModificacion: LocalDate` (`@UpdateTimestamp`)
- `reservas: List<Reserva>` (`@OneToMany(mappedBy = "pista")`)

### `Reserva`

- `id: Long`
- `fechaReserva: LocalDate`
- `horaInicio: LocalTime`
- `horaFin: LocalTime`
- `nombreJugador: String`
- `telefono: String`
- `estado: EstadoReserva` (enum `CONFIRMADA`, `CANCELADA`, `COMPLETADA`)
- `fechaCancelacion: LocalDateTime` (`fecha_cancelacion`, nullable; se asigna en soft-delete)
- `codigoReserva: String` (único, autogenerado `RES-YYYY-MMDD-NNN`)
- `pista: Pista` (`@ManyToOne`, `pista_id`, `NOT NULL`)
- `usuario: Usuario` (`@ManyToOne`, `usuario_id`, `NOT NULL`)
- `franjas: List<FranjaReservada>` (`@OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL, orphanRemoval = true)`)

### `FranjaReservada`

- `id: Long`
- `pista: Pista` (`@ManyToOne`, `pista_id`, `NOT NULL`)
- `fecha: LocalDate`
- `horaSlot: LocalTime` — slot atómico de 30 minutos
- `reserva: Reserva` (`@ManyToOne`, `reserva_id`, `NOT NULL`)
- Constraint única: `(pista_id, fecha, hora_slot)` — garantiza exclusión mutua atómica entre reservas concurrentes (ver `specs/017-reservas-duracion-variable`)

### `ConfiguracionClub`

- `id: Long` (ID fijo = 1)
- `horaApertura: LocalTime`
- `horaCierre: LocalTime`
- `duracionesPermitidas: String` (ej. "60,90,120")
- `maxMinutosReservaPorUsuarioDia: Integer`

### `Usuario`

- `id: Long`
- `email: String`
- `password: String`
- `roles: String`
- `enabled: Boolean`
- `nombre: String`
- `apellidos: String`
- `fechaRegistro: LocalDateTime`
- `avatarUrl: String`
- `avatarPublicId: String` (para borrado en Cloudinary)
- `tipoAdmin: TipoAdmin` (enum `ADMIN`, `DEMO_ADMIN`; nullable)
- `fechaBaja: LocalDateTime` (`fecha_baja`, nullable; se asigna al suprimir cuenta conforme a RGPD)

### `RefreshToken`

- `id: Long`
- `token: String` (único, 128 chars)
- `usuario: Usuario` (`@ManyToOne`, `usuario_id`, `NOT NULL`)
- `expiryDate: Instant` (expiración a 7 días)
- `revoked: boolean` (control de rotación y detección de reutilización)

### `FotoPista`

- `id: Long`
- `pista: Pista` (`@ManyToOne`, `pista_id`, `NOT NULL`)
- `url: String`
- `publicId: String` (para borrado en Cloudinary)
- `esPortada: boolean` (default false)
- `orden: Integer` (default 0)

### `FotoSede`

- `id: Long`
- `url: String`
- `publicId: String` (para borrado en Cloudinary)
- `orden: Integer` (default 0)

## DTO de Creación de Reserva

El backend usa `CreateReservaDTO` para crear/actualizar reservas:

- `fechaReserva: LocalDate`
- `horaInicio: String`
- `horaFin: String`
- `nombreJugador: String`
- `telefono: String`
- `pistaId: Long` (wrapper, no primitivo)
- `usuarioId: Long` (opcional; solo aplica si quien llama es `ROLE_ADMIN` — ver `specs/010-titularidad-real-reserva-admin`)

> 💡 **Validaciones de Duración y Horario:** `CreateReservaDTO` valida mediante `@AssertTrue` que la duración entre `horaInicio` y `horaFin` sea de 60, 90 o 120 minutos y que `horaFin` no supere el horario de cierre (23:00).

> ⚠️ **Nota para el Frontend:** Se debe enviar **solo** ese formato. No enviar objetos anidados como `pista: { id: ... }`.

## DTO de Actualización de Perfil

El backend usa `UpdatePerfilDTO` para `PUT /auth/perfil`:

- `nombre: String` (`@NotBlank`)
- `apellidos: String` (`@NotBlank`)
- `telefono: String` (sin validación de formato)
- `email: String` (`@Email`, opcional)
- `password: String` (opcional)
- `currentPassword: String` (opcional, requerida si se provee `password` y el usuario no es ADMIN actuando sobre otro)
- `usuarioId: Long` (opcional; solo aplica si quien llama es `ROLE_ADMIN` — mismo patrón que `CreateReservaDTO`, ver `specs/010-titularidad-real-reserva-admin`)

## DTO de Configuración del Club

El backend usa `UpdateConfiguracionDTO` para `PUT /admin/configuracion`:

- `horaApertura: LocalTime`
- `horaCierre: LocalTime`
- `duracionesPermitidas: String` ("60,90,120")
- `maxMinutosReservaPorUsuarioDia: Integer`

## Endpoints Actuales (Fuente de Verdad)

> Base URL: `http://localhost:8081`

### 1) Autenticación (`/auth`)

| Método | Ruta                   | Requiere autenticación | Requiere ROLE_ADMIN | Descripción                                                          |
| ------ | ---------------------- | ---------------------- | ------------------- | -------------------------------------------------------------------- |
| POST   | `/auth/login`          | No                     | No                  | Inicia sesión, devuelve access token y emite HttpOnly refresh cookie |
| POST   | `/auth/refresh`        | No (valida cookie)     | No                  | Rota refresh token, devuelve nuevo access token y perfil             |
| POST   | `/auth/logout`         | No                     | No                  | Revoca refresh token y expira la cookie HttpOnly                     |
| POST   | `/auth/register`       | No                     | No                  | Registra usuario estándar                                            |
| POST   | `/auth/register-admin` | **Sí**                 | **Sí**              | Registra usuario administrador (Solo Administrador)                  |
| GET    | `/auth/perfil`         | Sí                     | No                  | Devuelve datos del usuario autenticado                               |
| GET    | `/auth/test-roles`     | Sí                     | No                  | Endpoint técnico de prueba                                           |
| GET    | `/auth/usuarios`       | Sí                     | **Sí**              | Lista todos los usuarios sin contraseña — usado por selectores de admin |
| PUT    | `/auth/perfil`         | Sí                     | No                  | Actualiza nombre, apellidos y teléfono del usuario autenticado; admin puede pasar `usuarioId` para editar a otro |
| PUT    | `/auth/perfil/avatar`  | Sí                     | No                  | Sube o actualiza la foto de perfil en Cloudinary (máx 400px), borrando el avatar previo si existe |
| GET    | `/auth/mis-datos`      | Sí                     | No                  | RGPD Art. 20 (Portabilidad): exporta JSON con datos de perfil y reservas del usuario |
| DELETE | `/auth/cuenta`         | Sí                     | No                  | RGPD Art. 17 (Supresión): purga avatar, revoca sesiones y anonimiza usuario (409 si es único admin) |

### 2) Pistas (`/pistas`)

| Método | Ruta           | Requiere autenticación | Requiere ROLE_ADMIN | Descripción                              |
| ------ | -------------- | ---------------------- | ------------------- | ---------------------------------------- |
| GET    | `/pistas`      | **No**                 | No                  | Lista todas las pistas                   |
| GET    | `/pistas/{id}` | **No**                 | No                  | Obtiene una pista por id                 |
| POST   | `/pistas`      | **Sí**                 | **Sí**              | Crea una pista (Solo Administrador)      |
| PUT    | `/pistas/{id}` | **Sí**                 | **Sí**              | Actualiza una pista (Solo Administrador) |
| DELETE | `/pistas/{id}` | **Sí**                 | **Sí**              | Elimina una pista (Solo Administrador)   |

### 3) Reservas (`/reservas`)

| Método | Ruta                         | Requiere autenticación | Requiere ROLE_ADMIN | Descripción                                                             |
| ------ | ---------------------------- | ---------------------- | ------------------- | ----------------------------------------------------------------------- |
| GET    | `/reservas`                  | Sí                     | No                  | Lista todas las reservas                                                |
| GET    | `/reservas/disponibilidad`     | Sí                     | No                  | Devuelve franjas horarias ocupadas (FranjaOcupadaDTO) por pista y fecha |
| GET    | `/reservas/disponibilidad-dia` | Sí                     | No                  | Devuelve franjas ocupadas de todas las pistas para una fecha (DisponibilidadDiaDTO) |
| GET    | `/reservas/{id}`             | Sí                     | No                  | Usuario: solo su reserva; Admin: cualquier reserva                      |
| POST   | `/reservas`                  | Sí                     | No                  | Crea una reserva y asigna usuario desde JWT                             |
| PUT    | `/reservas/{id}`             | Sí                     | No                  | Usuario: actualiza su reserva; Admin: cualquier reserva                 |
| DELETE | `/reservas/{id}`             | Sí                     | No                  | Borrado lógico (soft-delete): marca estado CANCELADA y timestamp fechaCancelacion |
| DELETE | `/reservas`                  | Sí                     | Sí                  | Elimina todas las reservas (`@PreAuthorize("hasRole('ADMIN')")`)        |

### 4) Configuración del Club (`/admin/configuracion` y `/configuracion`)

| Método | Ruta                      | Requiere autenticación | Requiere ROLE_ADMIN | Descripción                                                  |
| ------ | ------------------------- | ---------------------- | ------------------- | ------------------------------------------------------------ |
| GET    | `/admin/configuracion`    | **Sí**                 | **Sí**              | Obtiene la configuración del club (Admin)                    |
| PUT    | `/admin/configuracion`    | **Sí**                 | **Sí**              | Actualiza la configuración del club (Admin)                  |
| GET    | `/configuracion/duraciones`| **No**                | No                  | Obtiene duraciones permitidas (público para selector frontend)|

### 5) Subida de archivos

| Método | Ruta      | Requiere autenticación | Requiere ROLE_ADMIN | Descripción                                                |
| ------ | --------- | ---------------------- | ------------------- | ---------------------------------------------------------- |
| POST   | `/upload` | Sí                     | No                  | Sube imagen a Cloudinary, devuelve url y publicId en WebP  |

### 6) Galería de fotos de pistas (`/pistas/{id}/fotos`)

| Método | Ruta                                      | Requiere autenticación | Requiere ROLE_ADMIN | Descripción                                                        |
| ------ | ----------------------------------------- | ---------------------- | ------------------- | ------------------------------------------------------------------ |
| GET    | `/pistas/{pistaId}/fotos`                 | **No**                 | No                  | Lista fotos de una pista ordenadas por orden (Público)              |
| POST   | `/pistas/{pistaId}/fotos`                 | **Sí**                 | **Sí**              | Sube y asocia foto a una pista (máx 5 fotos, sincroniza portada)   |
| DELETE | `/pistas/{pistaId}/fotos/{fotoId}`        | **Sí**                 | **Sí**              | Elimina foto de Cloudinary y BD (promueve nueva portada si aplica) |
| PUT    | `/pistas/{pistaId}/fotos/{fotoId}/portada`| **Sí**                 | **Sí**              | Establece la foto como portada y actualiza imagenUrl de la pista   |

### 7) Galería de fotos de la sede (`/sede/fotos`)

| Método | Ruta               | Requiere autenticación | Requiere ROLE_ADMIN | Descripción                                                        |
| ------ | ------------------ | ---------------------- | ------------------- | ------------------------------------------------------------------ |
| GET    | `/sede/fotos`      | **No**                 | No                  | Lista fotos de la sede ordenadas por orden (Público)                |
| POST   | `/sede/fotos`      | **Sí**                 | **Sí**              | Sube foto de la sede a Cloudinary en carpeta `sede` (máx 10 fotos)  |
| DELETE | `/sede/fotos/{id}` | **Sí**                 | **Sí**              | Elimina foto de Cloudinary y BD por id                             |

## Convenciones de Código

- Mantener nombres en español para entidades y campos del dominio (`Usuario`, `Pista`, `Reserva`).
- Usar `ResponseEntity` en controladores.
- Usar DTOs para payloads de entrada cuando exista lógica de mapeo.
- Validar entradas con Jakarta Validation (`@NotNull`, `@NotBlank`, etc.).
- Mantener seguridad JWT en endpoints no públicos.
- Aplicar `@PreAuthorize` solo cuando realmente haya restricción por rol.
- Los endpoints que permiten a un admin actuar en nombre de otro usuario
  (ver `specs/010-titularidad-real-reserva-admin`) deben comprobar el rol
  explícitamente antes de usar cualquier identificador de usuario recibido
  en el payload — nunca confiar en un `usuarioId` del cliente sin validar
  `hasRole('ADMIN')` primero.

### Reglas Ponytail Backend

- Usar `@RequiredArgsConstructor` de Lombok para inyección de dependencias por constructor. Prohibido `@Autowired` en atributos.
- Utilizar librerías nativas de Java (Java 17/21) como `Objects.requireNonNull()`, `String.isBlank()`, `List.of()` antes de agregar dependencias externas.
- En endpoints CRUD básicos, omitir interfaces/clases de implementación abstractas (`ServiceImpl`) a menos que haya múltiples reglas de negocio complejas.
- Toda lógica nueva no trivial debe incluir una prueba JUnit ejecutable mediante `./mvnw test`.

## Filtros de Seguridad

- **`RateLimitFilter`** (`com.padel.reservas.config`): Filtro in-memory basado en token-bucket (`Bucket4j`) registrado antes de `BearerTokenAuthenticationFilter`.
  - Límites por IP (`METHOD:PATH`):
    - `POST /auth/login`: 5 peticiones / minuto
    - `POST /auth/register`: 3 peticiones / minuto
    - `POST /auth/refresh`: 20 peticiones / minuto
    - `PUT /auth/perfil`: 10 peticiones / minuto
  - Comportamiento al exceder límite: responde HTTP 429 con cabecera `Retry-After: 60`, JSON `{ "error": "Demasiadas peticiones. Intenta de nuevo en un minuto." }`, y registra auditoría WARN vía `SecurityAuditService.rateLimitSuperado`.
  - Endpoints no listados: no se ven afectados por el filtro.

## CORS (Estado Actual)

Configurado globalmente en `SecurityConfig` para `/**` con:

- **Origin permitido:** `http://localhost:5173` (Vite Frontend)
- **Métodos:** `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- **Headers:** `Authorization`, `Content-Type`
- `allowCredentials = true`

## Registro de Cambios Relevantes

- Migración a arquitectura de tokens seguros: Access Token (15 min) en memoria + Refresh Token (7 días) en cookie `HttpOnly` con rotación continua y detección de reutilización.
- Incorporación de `RefreshTokenService`, entidad `RefreshToken` y repositorio JPA `RefreshTokenRepository`.
- Endpoints `/auth/refresh` y `/auth/logout` añadidos a `AuthController`.
- Migración de rutas de dominio a `pistas` y `reservas`.
- Adopción de `CreateReservaDTO` con `pistaId: Long`.
- Vinculación obligatoria de `Reserva` con `Usuario` autenticado (`usuario_id NOT NULL`).
- Restricción administrativa explícita en `DELETE /reservas`.
- **Autorización de Pistas**: `GET /pistas` y `GET /pistas/{id}` son de acceso público sin necesidad de estar autenticado. Se configuró un `BearerTokenResolver` personalizado en `SecurityConfig` para omitir la resolución/validación de token JWT en las consultas `GET` de pistas (evitando errores 401 por tokens caducados), mientras que `POST`, `PUT` y `DELETE` se mantienen restringidos a `ROLE_ADMIN`.
- **Campo `imagenUrl` en entidad `Pista`**: Adición del atributo `imagenUrl` para almacenar la URL de la imagen representativa de cada pista.
- **Persistencia de clave JWT**: Carga de la clave secreta desde `JWT_SECRET` (Base64) en `JwtSecretKeyProvider` con fallback por defecto en `application.properties` para evitar fallos de inicio de servidor en entorno local.
- **Pruebas unitarias de seguridad**: Incorporación de `ReservasControllerSecurityTest` y `AuthControllerSecurityTest`, junto con la gestión explícita de `AccessDeniedException` (HTTP 403) en `GlobalExceptionHandler`.
- **Spec 017 — Reservas de duración variable**: Migración de `horaInicio`/`horaFin` a `LocalTime`, incorporación de entidad `FranjaReservada` con constraint única `(pista_id, fecha, hora_slot)`, enum `EstadoReserva` (`CONFIRMADA`, `CANCELADA`, `COMPLETADA`), `codigoReserva` autogenerado (`RES-YYYY-MMDD-NNN`) y servicio `@Service` `ReservaService` para transacciones atómicas y límite de 120 min/día.
- **Integración Cloudinary (spec 022)**: imágenes almacenadas en Cloudinary (carpeta base `padel-calatrava/`), nunca como BLOB en MySQL. Variables de entorno: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET. CloudinaryService.eliminar() debe llamarse SIEMPRE antes de borrar cualquier fila con publicId (RGPD).
- **Galería de fotos por pista (spec 023)**: entidad `FotoPista` vinculada a `Pista` con límite de 5 fotos en Cloudinary, sincronización automática de `imagenUrl` de portada, borrado en Cloudinary (RGPD) en cascada al borrar fotos o pistas, y `GET /pistas/{id}/fotos` de acceso público.
- **Galería de fotos de la sede (spec 024)**: entidad `FotoSede`, repositorio `FotoSedeRepository` y `SedeController` con límite de 10 fotos en Cloudinary (carpeta `sede`), borrado RGPD y `GET /sede/fotos` de acceso público sin autenticación.
- **Avatar de usuario (spec 025)**: campos `avatarUrl` y `avatarPublicId` en entidad `Usuario`, endpoint `PUT /auth/perfil/avatar` con subida a Cloudinary (carpeta `avatares`, redimensionado 400px), y borrado del avatar previo (RGPD).
- **Limpieza de refresh tokens expirados (spec 027)**: `@EnableScheduling` en `PadelReservasApplication`, método `@Scheduled(cron = "0 0 3 * * *")` en `RefreshTokenService` y método de eliminación en cascada `deleteAllByExpiryDateBefore(Instant)` en `RefreshTokenRepository` para mantener la base de datos limpia de tokens caducados protegiendo la ventana de 7 días para detección de reuso.

- **Seguridad: cabeceras HTTP y logging de auditoría (spec 029)**: añadidas 5 cabeceras de seguridad HTTP en `SecurityConfig` via Spring Security 6 (`Content-Security-Policy: default-src 'self'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(), camera=(), microphone()`). Creado `SecurityAuditService` con logging SLF4J de 6 eventos sensibles (login exitoso/fallido, logout, cambio de password/email, actualización de avatar) inyectado en `AuthController`.

- **Rate limiting por IP (spec 030)**: filtro `RateLimitFilter` (Bucket4j in-memory, token-bucket) registrado antes del filtro JWT en `SecurityConfig`. Límites: `POST /auth/login` 5/min, `POST /auth/register` 3/min, `POST /auth/refresh` 20/min, `PUT /auth/perfil` 10/min. Respuesta 429 con `Retry-After: 60`. Auditoría WARN vía `SecurityAuditService.rateLimitSuperado`.

- **RGPD: Supresión y Portabilidad (spec 036)**: Endpoints `GET /auth/mis-datos` (descarga JSON de perfil y reservas) y `DELETE /auth/cuenta` (eliminación de avatar en Cloudinary, revocación de refresh tokens, anonimización irreversible y salvaguarda de único administrador con HTTP 409).

- **Soft-delete en Reservas (spec 037)**: Borrado lógico en `DELETE /reservas/{id}` marcando `estado = CANCELADA` y `fechaCancelacion = LocalDateTime.now()`, preservando histórico en BD y liberando disponibilidad horaria.

- **Rol DEMO_ADMIN y protección AOP (spec 038)**: Incorporación de enum `TipoAdmin` (`ADMIN`, `DEMO_ADMIN`), anotación `@NoDemoAdmin` y aspecto Spring AOP `DemoAdminAspect` bloqueando con HTTP 403 (`AccessDeniedException`) operaciones destructivas de pistas, reservas, configuración y alta de administradores para el usuario demo (`demo@padelreservas.es`).

- **Validación robusta de contraseña en registro (spec 039)**: En `RegisterRequest.java`, restricción de complejidad mediante `@Size(min = 8, max = 100)` y `@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$")` (mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número). Errores mapeados a HTTP 400 por `GlobalExceptionHandler`.

- **Preparación del backend para producción (spec 040)**: `Dockerfile` multi-etapa (build con Temurin 21 JDK y runtime ligero con Temurin 21 JRE, usuario no-root `appuser`, JVM flags optimizados para serverless Cloud Run: `-XX:MaxRAMPercentage=75.0 -XX:+UseSerialGC -XX:TieredStopAtLevel=1`), `.dockerignore`, perfil `application-prod.properties` (externalización estricta por env vars, pool HikariCP = 5 para Aiven, SSL, `server.forward-headers-strategy=framework` para resolución de IP real en Rate Limiting tras proxy inverso y `app.cookie.secure=true` en cookies del refresh token).

> **Nota para futuras implementaciones:** Actualizar este archivo al finalizar cada cambio funcional relevante.


