# Spec 030 — Rate Limiting por IP en endpoints sensibles

**Estado:** implementada  
**Fecha:** 2026-10-02  
**Afecta:** solo backend (`pom.xml`, nuevo `RateLimitFilter.java`, `SecurityConfig.java`, `SecurityAuditService.java` — ya existe)

---

## Contexto

Los endpoints de autenticación (`/auth/login`, `/auth/register`, `/auth/refresh`) y
modificación de perfil (`PUT /auth/perfil`) son susceptibles de ataques de fuerza bruta y
abuso automatizado. Sin un mecanismo de rate limiting, un atacante puede probar contraseñas
indefinidamente o registrar cuentas masivamente desde la misma IP.

Bucket4j es una librería de token-bucket ligera y sin dependencias de almacenamiento
externo (solo en memoria) adecuada para esta escala del proyecto.

---

## Requisitos funcionales

| Endpoint | Límite |
|---|---|
| `POST /auth/login` | 5 peticiones / minuto / IP |
| `POST /auth/register` | 3 peticiones / minuto / IP |
| `POST /auth/refresh` | 20 peticiones / minuto / IP |
| `PUT /auth/perfil` | 10 peticiones / minuto / IP |
| Resto | Sin límite |

### Respuesta al superar el límite

- **HTTP 429 Too Many Requests**
- **Body:** `{ "error": "Demasiadas peticiones. Intenta de nuevo en un minuto." }`
- **Header:** `Retry-After: 60`

### Auditoría

Llamar a `SecurityAuditService` (nivel WARN) cuando una IP supere el límite,
registrando IP y endpoint afectado.

### Integración con Spring Security

El filtro se registra **antes** del filtro de validación JWT en `SecurityConfig`.

---

## Tareas

- **T01** — `pom.xml`: añadir dependencia `bucket4j-core:8.10.1`.
- **T02** — Crear `RateLimitFilter.java` en `com.padel.reservas.config`.
- **T03** — `SecurityConfig.java`: registrar el filtro antes del `BearerTokenAuthenticationFilter`.
- **T04** — Crear `RateLimitFilterTest.java` (petición dentro del límite → normal; supera → 429 con `Retry-After`).
- **T05** — Actualizar `padel-backend/AGENTS.md`.
